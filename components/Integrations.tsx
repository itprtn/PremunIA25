import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { Copy, CheckCircle2, Link2, Globe, Save, Rocket, FlaskConical } from 'lucide-react'
import { supabase, supabaseUrl } from '../lib/supabase'

interface SettingKV { key: string; value: string }

const WEBHOOK_BASE = `${supabaseUrl.replace('.supabase.co', '.functions.supabase.co')}`

export default function Integrations() {
  const [loading, setLoading] = useState(false)
  const [meta, setMeta] = useState({ appId: '', appSecret: '', pageAccessToken: '', verifyToken: '' })
  const [tiktok, setTiktok] = useState({ appId: '', appSecret: '', accessToken: '' })
  const [email, setEmail] = useState({ provider: 'brevo', apiKey: '' })
  const [copied, setCopied] = useState<string>('')
  const [testing, setTesting] = useState<string>('')

  const metaWebhookUrl = `${WEBHOOK_BASE}/meta-lead`
  const tiktokWebhookUrl = `${WEBHOOK_BASE}/tiktok-lead`

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(''), 1500)
    } catch (error) {
      // Fallback pour les navigateurs qui ne supportent pas l'API clipboard
      console.warn('Impossible de copier dans le presse-papiers:', error)
    }
  }

  const loadSettings = async () => {
    const { data, error } = await supabase.from('settings').select('key,value').in('key', [
      'meta_app_id','meta_app_secret','meta_page_access_token','meta_verify_token',
      'tiktok_app_id','tiktok_app_secret','tiktok_access_token',
      'email_provider','email_api_key'
    ])
    if (error) return
    const map = new Map<string, string>((data as SettingKV[] | null)?.map(s => [s.key, s.value]) || [])
    setMeta({
      appId: map.get('meta_app_id') || '',
      appSecret: map.get('meta_app_secret') || '',
      pageAccessToken: map.get('meta_page_access_token') || '',
      verifyToken: map.get('meta_verify_token') || ''
    })
    setTiktok({
      appId: map.get('tiktok_app_id') || '',
      appSecret: map.get('tiktok_app_secret') || '',
      accessToken: map.get('tiktok_access_token') || ''
    })
    setEmail({
      provider: map.get('email_provider') || 'brevo',
      apiKey: map.get('email_api_key') || ''
    })
  }

  useEffect(() => { loadSettings() }, [])

  const saveSettings = async () => {
    setLoading(true)
    try {
      const payload: SettingKV[] = [
        { key: 'meta_app_id', value: meta.appId },
        { key: 'meta_app_secret', value: meta.appSecret },
        { key: 'meta_page_access_token', value: meta.pageAccessToken },
        { key: 'meta_verify_token', value: meta.verifyToken },
        { key: 'tiktok_app_id', value: tiktok.appId },
        { key: 'tiktok_app_secret', value: tiktok.appSecret },
        { key: 'tiktok_access_token', value: tiktok.accessToken },
        { key: 'email_provider', value: email.provider },
        { key: 'email_api_key', value: email.apiKey },
      ]
      const { error } = await supabase.from('settings').upsert(payload, { onConflict: 'key' })
      if (error) throw error
    } finally {
      setLoading(false)
    }
  }

  const seedDefaults = async () => {
    setLoading(true)
    try {
      setMeta({ appId: 'META_APP_ID', appSecret: 'META_APP_SECRET', pageAccessToken: 'META_PAGE_TOKEN', verifyToken: 'verify_token_demo' })
      setTiktok({ appId: 'TT_APP_ID', appSecret: 'TT_APP_SECRET', accessToken: 'TT_ACCESS_TOKEN' })
      setEmail({ provider: 'brevo', apiKey: 'xkeysib-xxxx-demo' })
      await saveSettings()
    } finally {
      setLoading(false)
    }
  }

  const sendMetaTest = async () => {
    setTesting('meta')
    try {
      await fetch(metaWebhookUrl + '?test=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object: 'page',
          entry: [{
            changes: [{
              field: 'leadgen',
              value: {
                leadgen_id: 'TEST_META_' + Date.now(),
                form_id: 'FORM_TEST',
                page_id: meta.appId || 'PAGE_TEST',
                created_time: Math.floor(Date.now()/1000),
                adgroup_id: 'adset_test',
                ad_id: 'ad_test',
                campaign_id: 'camp_test'
              }
            }]
          }]
        })
      })
    } finally {
      setTesting('')
    }
  }

  const sendTiktokTest = async () => {
    setTesting('tiktok')
    try {
      await fetch(tiktokWebhookUrl + '?test=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'lead.form.submit',
          data: {
            lead_id: 'TEST_TT_' + Date.now(),
            form_id: 'FORM_TEST_TT',
            ad_id: 'ad_test',
            adgroup_id: 'adset_test',
            campaign_id: 'camp_test'
          }
        })
      })
    } finally {
      setTesting('')
    }
  }

  const TestButtons = () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={() => copy(metaWebhookUrl, 'meta')}>{copied==='meta'?<CheckCircle2 className="w-4 h-4 mr-2"/>:<Copy className="w-4 h-4 mr-2"/>}Copier Webhook Meta</Button>
      <Button variant="outline" onClick={() => copy(tiktokWebhookUrl, 'tiktok')}>{copied==='tiktok'?<CheckCircle2 className="w-4 h-4 mr-2"/>:<Copy className="w-4 h-4 mr-2"/>}Copier Webhook TikTok</Button>
      <Button variant="outline" onClick={sendMetaTest} disabled={testing==='meta'}>
        <FlaskConical className="w-4 h-4 mr-2" />{testing==='meta' ? 'Test en cours...' : 'Envoyer lead test Meta'}
      </Button>
      <Button variant="outline" onClick={sendTiktokTest} disabled={testing==='tiktok'}>
        <FlaskConical className="w-4 h-4 mr-2" />{testing==='tiktok' ? 'Test en cours...' : 'Envoyer lead test TikTok'}
      </Button>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Intégrations</h1>
          <p className="text-gray-600">Connectez Meta, TikTok et Email. Aucun Google Ads n'est requis.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={seedDefaults} disabled={loading}>Préremplir valeurs démo</Button>
          <Button onClick={saveSettings} disabled={loading}>
            <Save className="w-4 h-4 mr-2"/>{loading? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center"><Globe className="w-5 h-5 mr-2"/>Meta Lead Ads</span>
            <Badge variant="secondary">Webhook</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>App ID</Label>
              <Input value={meta.appId} onChange={e=>setMeta({...meta, appId: e.target.value})} placeholder="123456789" />
            </div>
            <div>
              <Label>App Secret</Label>
              <Input value={meta.appSecret} onChange={e=>setMeta({...meta, appSecret: e.target.value})} placeholder="••••••" />
            </div>
            <div>
              <Label>Page Access Token</Label>
              <Input value={meta.pageAccessToken} onChange={e=>setMeta({...meta, pageAccessToken: e.target.value})} placeholder="EAAB..." />
            </div>
            <div>
              <Label>Verify Token</Label>
              <Input value={meta.verifyToken} onChange={e=>setMeta({...meta, verifyToken: e.target.value})} placeholder="mon-token-verif" />
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>URL Webhook à coller dans Meta (Subscription - Leadgen):</Label>
            <div className="flex items-center gap-2">
              <Input readOnly value={metaWebhookUrl} />
              <Button variant="outline" onClick={()=>copy(metaWebhookUrl, 'meta')}>{copied==='meta'?<CheckCircle2 className="w-4 h-4"/>:<Copy className="w-4 h-4"/>}</Button>
            </div>
            <p className="text-sm text-gray-500">Assurez-vous d'ajouter le champ "verify_token" avec la valeur fournie ci-dessus.</p>
          </div>
          <TestButtons />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center"><Link2 className="w-5 h-5 mr-2"/>TikTok Lead Gen</span>
            <Badge variant="secondary">Webhook</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>App ID</Label>
              <Input value={tiktok.appId} onChange={e=>setTiktok({...tiktok, appId: e.target.value})} placeholder="tik_tok_app_id" />
            </div>
            <div>
              <Label>App Secret</Label>
              <Input value={tiktok.appSecret} onChange={e=>setTiktok({...tiktok, appSecret: e.target.value})} placeholder="••••••" />
            </div>
            <div className="md:col-span-2">
              <Label>Access Token</Label>
              <Input value={tiktok.accessToken} onChange={e=>setTiktok({...tiktok, accessToken: e.target.value})} placeholder="tt_live_access_token" />
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>URL Webhook à coller dans TikTok Leads (Event Subscription):</Label>
            <div className="flex items-center gap-2">
              <Input readOnly value={tiktokWebhookUrl} />
              <Button variant="outline" onClick={()=>copy(tiktokWebhookUrl, 'tiktok')}>{copied==='tiktok'?<CheckCircle2 className="w-4 h-4"/>:<Copy className="w-4 h-4"/>}</Button>
            </div>
            <p className="text-sm text-gray-500">Configurez la signature si nécessaire dans votre application TikTok for Business.</p>
          </div>
          <TestButtons />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email (Brevo/SMTP)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Provider</Label>
              <Input value={email.provider} onChange={e=>setEmail({...email, provider: e.target.value})} placeholder="brevo" />
            </div>
            <div>
              <Label>API Key / SMTP Password</Label>
              <Input value={email.apiKey} onChange={e=>setEmail({...email, apiKey: e.target.value})} placeholder="xkeysib-..." />
            </div>
          </div>
          <div className="text-sm text-gray-600">L'envoi d'emails utilisera les fonctions Edge existantes (send-email / process-email-queue).</div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end">
        <Button onClick={saveSettings}><Rocket className="w-4 h-4 mr-2"/>Activer les intégrations</Button>
      </div>
    </div>
  )
}