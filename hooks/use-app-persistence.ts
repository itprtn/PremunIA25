import { useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export function useAppPersistence() {
  const navigate = useNavigate()
  const location = useLocation()
  const isInitialized = useRef(false)
  const lastKnownPath = useRef<string>('/')
  const recoveryAttempts = useRef(0)
  const maxRecoveryAttempts = 3

  const saveState = useCallback(() => {
    try {
      const state = {
        path: location.pathname,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      }
      localStorage.setItem('crm-app-state', JSON.stringify(state))
      console.log('CRM state saved:', state)
    } catch (error) {
      console.warn('Failed to save CRM state:', error)
    }
  }, [location.pathname])

  const recoverState = useCallback(() => {
    if (recoveryAttempts.current >= maxRecoveryAttempts) {
      console.log('Max recovery attempts reached, skipping state recovery')
      return
    }

    try {
      const savedState = localStorage.getItem('crm-app-state')
      if (savedState) {
        const state = JSON.parse(savedState)
        const timeDiff = Date.now() - state.timestamp
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours

        if (timeDiff < maxAge && state.path && state.path !== location.pathname) {
          console.log('Recovering CRM state:', state)
          recoveryAttempts.current++
          navigate(state.path, { replace: true })
          return true
        }
      }
    } catch (error) {
      console.warn('Failed to recover CRM state:', error)
    }
    return false
  }, [navigate, location.pathname])

  useEffect(() => {
    // Only run this logic once on mount
    if (isInitialized.current) return
    isInitialized.current = true

    console.log('Initializing CRM app persistence')

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User returned to the tab - ensure we're on the right page
        console.log('User returned to CRM tab, current path:', location.pathname)

        // Try to recover previous state
        const recovered = recoverState()
        if (!recovered) {
          // If no state to recover, ensure we're on dashboard if at root
          if (location.pathname === '/' || location.pathname === '') {
            setTimeout(() => {
              if (window.location.pathname === '/' || window.location.pathname === '') {
                navigate('/', { replace: true })
              }
            }, 100)
          }
        }
      } else {
        // User is leaving the tab - save current state
        saveState()
      }
    }

    const handleBeforeUnload = () => {
      // Save current state before unloading
      saveState()
      console.log('CRM tab is being unloaded')
    }

    // Handle browser back/forward buttons
    const handlePopState = (event: PopStateEvent) => {
      console.log('Browser navigation detected:', window.location.pathname)
      lastKnownPath.current = window.location.pathname
    }

    // Listen for page focus/blur events
    const handleFocus = () => {
      console.log('CRM tab focused')
      // Small delay to ensure the page is fully loaded
      setTimeout(() => {
        if (location.pathname === '/' || location.pathname === '') {
          navigate('/', { replace: true })
        }
      }, 200)
    }

    // Initial state recovery on app load
    setTimeout(() => {
      recoverState()
    }, 500)

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('focus', handleFocus)
    }
  }, [navigate, location.pathname, saveState, recoverState])

  // Save state whenever path changes
  useEffect(() => {
    if (isInitialized.current && location.pathname !== lastKnownPath.current) {
      lastKnownPath.current = location.pathname
      saveState()
    }
  }, [location.pathname, saveState])

  return {
    currentPath: location.pathname,
    isInitialized: isInitialized.current,
    recoveryAttempts: recoveryAttempts.current
  }
}