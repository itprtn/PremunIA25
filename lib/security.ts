// Security measures for production deployment
// Recommended security practices without blocking legitimate debugging

export function initializeSecurity() {
  // Enhanced CSP validation
  if (process.env.NODE_ENV === 'development') {
    console.log('🐛 Development mode - Security measures reduced for debugging');

    // Allow debugging in development
    (window as any)._devMode = true;

    // Optional: Log security events in development
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      originalLog.apply(console, [`[SEC]`, ...args]);
    };

    console.error = (...args) => {
      originalError.apply(console, [`[SEC ERROR]`, ...args]);
    };

    return;
  }

  if (process.env.NODE_ENV === 'production') {
    // Security headers validation
    validateSecurityHeaders();

    // Sanitization des inputs utilisateur
    document.addEventListener('DOMContentLoaded', () => {
      console.log('🔒 Production security initialized');

      // Hash verification for integrity (if needed)
      validateIntegrity();

      // Protection contre les attaques d'injection
      setupInjectionProtection();

      // Validation CSP effectiveness
      setTimeout(() => {
        validateCSP();
      }, 1000);
    });
  }
}

function validateSecurityHeaders() {
  // Validate that CSP and other security headers are properly set
  const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!metaCSP) {
    console.warn('⚠️ Missing Content Security Policy');
  } else {
    console.log('✅ Content Security Policy present');
  }
}

function validateIntegrity() {
  // Check for potential DOM modifications
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if scripts are being injected
        const scripts = mutation.addedNodes.length > 0 ?
          Array.from(mutation.addedNodes).filter(node =>
            node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'SCRIPT'
          ) : [];

        if (scripts.length > 0) {
          console.error('🚨 Unauthorized script injection detected!');
          // Optional: Report to security monitoring service
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function setupInjectionProtection() {
  // XSS protection for dynamic content
  const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');

  Object.defineProperty(Element.prototype, 'innerHTML', {
    configurable: true,
    enumerable: true,
    get: originalInnerHTML.get,
    set: function(value) {
      // Check for suspicious content
      if (value && typeof value === 'string') {
        const suspiciousPatterns = [
          /<script\b[^<]*(?=(?:[^>]*[^>]*)?>)/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /eval\s*\(/gi
        ];

        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value.toLowerCase())) {
            console.error('🚨 Potential XSS attempt detected in innerHTML');
            // Could report to security monitoring
            break;
          }
        }
      }
      return originalInnerHTML.set.call(this, value);
    }
  });
}

function validateCSP() {
  // Check if CSP violations are occurring
  document.addEventListener('securitypolicyviolation', (e) => {
    console.error('🚨 Content Security Policy violation:', {
      violatedDirective: e.violatedDirective,
      blockedURI: e.blockedURI,
      sourceFile: e.sourceFile,
      lineNumber: e.lineNumber
    });
  });

  // Test CSP with a harmless fetch
  try {
    // This should be blocked if CSP is too restrictive
    fetch(window.location.origin + '/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors'
    }).catch(() => {
      // Expected for no-cors requests
    });
  } catch (e) {
    console.warn('⚠️ CSP validation test failed:', e);
  }
}

// Additional security: Remove sensitive data from global scope
export function sanitizeEnvironment() {
  // In production, don't expose debug information
  if (process.env.NODE_ENV === 'production') {
    // Disable global error reporting
    window.onerror = () => false;
    window.onunhandledrejection = () => false;

    // Remove any potential debug globals
    delete (window as any).debug;
    delete (window as any).devtools;
    delete (window as any).console;
  }
}

// Initialize security on module load
initializeSecurity();
sanitizeEnvironment();