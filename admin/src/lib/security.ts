/**
 * Security utilities for the admin panel
 * Blocks malicious content, APK downloads, and other security threats
 */

// Blocked file extensions
const BLOCKED_EXTENSIONS = [
    '.apk',
    '.exe',
    '.msi',
    '.bat',
    '.cmd',
    '.sh',
    '.ps1',
    '.vbs',
    '.jar',
    '.dmg',
    '.pkg',
    '.deb',
    '.rpm',
];

// Blocked URL patterns (malware, gambling, etc.)
const BLOCKED_URL_PATTERNS = [
    /rummy/i,
    /bunny.*rummy/i,
    /casino/i,
    /gambling/i,
    /bet365/i,
    /poker/i,
    /slots/i,
    /apk.*download/i,
    /download.*apk/i,
    /free.*download/i,
    /crack/i,
    /keygen/i,
    /warez/i,
];

// Blocked text patterns that might appear in injected content
const BLOCKED_TEXT_PATTERNS = [
    /download.*apk/i,
    /install.*app/i,
    /click.*here.*download/i,
    /free.*download/i,
    /win.*money/i,
    /earn.*cash/i,
    /bunny.*rummy/i,
];

/**
 * Check if a URL is potentially malicious
 */
export function isMaliciousUrl(url: string): boolean {
    // Check for blocked extensions
    const lowerUrl = url.toLowerCase();
    if (BLOCKED_EXTENSIONS.some(ext => lowerUrl.endsWith(ext))) {
        return true;
    }

    // Check for blocked patterns
    if (BLOCKED_URL_PATTERNS.some(pattern => pattern.test(url))) {
        return true;
    }

    return false;
}

/**
 * Check if text content contains potentially malicious patterns
 */
export function containsMaliciousContent(text: string): boolean {
    return BLOCKED_TEXT_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Sanitize and validate file upload
 */
export function isAllowedFileType(file: File): boolean {
    const fileName = file.name.toLowerCase();

    // Block dangerous file types
    if (BLOCKED_EXTENSIONS.some(ext => fileName.endsWith(ext))) {
        return false;
    }

    // For uploads, only allow specific safe types
    const ALLOWED_TYPES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'application/json',
        'text/csv',
        'text/plain',
    ];

    return ALLOWED_TYPES.includes(file.type);
}

/**
 * Initialize security protections
 * Call this once when the app loads
 */
export function initSecurityProtections(): void {
    // 1. Block navigation to malicious URLs
    const originalOpen = window.open;
    window.open = function (url?: string | URL, target?: string, features?: string) {
        if (url && typeof url === 'string' && isMaliciousUrl(url)) {
            console.warn('🛡️ Blocked navigation to suspicious URL:', url);
            return null;
        }
        return originalOpen.call(window, url, target, features);
    };

    // 2. Monitor and block suspicious link clicks
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const anchor = target.closest('a');

        if (anchor?.href && isMaliciousUrl(anchor.href)) {
            e.preventDefault();
            e.stopPropagation();
            console.warn('🛡️ Blocked click on suspicious link:', anchor.href);
            return false;
        }
    }, true);

    // 3. Monitor for injected scripts or iframes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as HTMLElement;

                    // Check for suspicious iframes
                    if (element.tagName === 'IFRAME') {
                        const src = element.getAttribute('src') || '';
                        if (isMaliciousUrl(src) || !src.startsWith(window.location.origin)) {
                            console.warn('🛡️ Removed suspicious iframe:', src);
                            element.remove();
                        }
                    }

                    // Check for suspicious scripts
                    if (element.tagName === 'SCRIPT') {
                        const src = element.getAttribute('src') || '';
                        if (src && isMaliciousUrl(src)) {
                            console.warn('🛡️ Removed suspicious script:', src);
                            element.remove();
                        }
                    }

                    // Check for suspicious text content (ads/malware)
                    const textContent = element.textContent || '';
                    if (containsMaliciousContent(textContent)) {
                        console.warn('🛡️ Detected suspicious content:', textContent.substring(0, 100));
                        // Don't remove, but log for monitoring
                    }
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    // 4. Block certain file downloads
    document.addEventListener('beforeunload', (e) => {
        // This is a passive protection - main protection is in click handler
    });

    console.log('🛡️ Security protections initialized');
}

/**
 * Content Security Policy helper
 * Returns recommended CSP headers for the admin panel
 */
export function getRecommendedCSP(): string {
    return [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https://*.cloudinary.com",
        "connect-src 'self' https://*.cloudinary.com https://api.cloudinary.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ].join('; ');
}
