# PWA (Progressive Web App) Complete Guide

This document explains all meta tags, manifest settings, and PWA requirements for making a website installable like a native app.

---

## 📁 Required Files

| File | Purpose |
|------|---------|
| `index.html` | Contains meta tags for PWA |
| `site.webmanifest` | JSON file with app configuration |
| `favicon.ico` | Browser tab icon |
| `favicon-16x16.png` | Small favicon |
| `favicon-32x32.png` | Standard favicon |
| `apple-touch-icon.png` | iOS home screen icon (180x180) |
| `android-chrome-192x192.png` | Android icon (192x192) |
| `android-chrome-512x512.png` | Android splash/install icon (512x512) |

---

## 🏷️ Meta Tags Explained

### Essential Meta Tags

```html
<meta charset="UTF-8" />
```
**Purpose:** Defines character encoding. UTF-8 supports all languages and special characters.

---

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```
**Purpose:** Makes website responsive on mobile devices.
- `width=device-width` - Page width matches device screen width
- `initial-scale=1.0` - No zoom on page load

---

```html
<title>Your App Name</title>
```
**Purpose:** Browser tab title and search engine result title.

---

```html
<meta name="description" content="Your app description" />
```
**Purpose:** Search engine result description. Keep it under 160 characters.

---

### PWA Meta Tags

```html
<meta name="theme-color" content="#ffffff" />
```
**Purpose:** Colors the browser's address bar and UI.
- **Android Chrome:** Colors the status bar and address bar
- **iOS Safari:** Colors the top status bar area
- **PWA:** Colors the title bar when opened as standalone app

**Values:** Any hex color code (`#ffffff` = white, `#000000` = black, `#8b5cf6` = purple)

---

```html
<meta name="mobile-web-app-capable" content="yes" />
```
**Purpose:** Tells Android that this website can run as a standalone app when added to home screen.

---

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
```
**Purpose:** Tells iOS Safari that this website can run fullscreen (no browser UI) when added to home screen.

---

```html
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```
**Purpose:** Controls iOS status bar appearance when running as PWA.

| Value | Behavior |
|-------|----------|
| `default` | White status bar with black text |
| `black` | Black status bar with white text |
| `black-translucent` | Transparent status bar, content extends behind it |

---

```html
<meta name="apple-mobile-web-app-title" content="AppName" />
```
**Purpose:** The name displayed under the app icon on iOS home screen. Keep it short (max 12 characters recommended).

---

### Favicon Links

```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
```
**Purpose:** Classic favicon for older browsers.

---

```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
```
**Purpose:** Modern PNG favicons for better quality.

---

```html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```
**Purpose:** Icon shown on iOS home screen when user adds the website.

---

```html
<link rel="manifest" href="/site.webmanifest" />
```
**Purpose:** Links to the Web App Manifest file containing PWA configuration.

---

### Open Graph Meta Tags (Social Media)

```html
<meta property="og:title" content="Your App Title" />
<meta property="og:description" content="Your app description" />
<meta property="og:type" content="website" />
<meta property="og:image" content="https://yoursite.com/og-image.png" />
<meta property="og:url" content="https://yoursite.com" />
```
**Purpose:** Controls how your website appears when shared on social media (Facebook, LinkedIn, WhatsApp, etc.)

---

## 📄 Web App Manifest (site.webmanifest)

The manifest is a JSON file that tells the browser about your PWA.

### Complete Example

```json
{
    "name": "My Awesome App - Full Name",
    "short_name": "MyApp",
    "description": "A brief description of your app",
    "icons": [
        {
            "src": "/android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/android-chrome-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    "theme_color": "#ffffff",
    "background_color": "#ffffff",
    "display": "standalone",
    "start_url": "/",
    "scope": "/"
}
```

### Properties Explained

| Property | Required | Description |
|----------|----------|-------------|
| `name` | ✅ Yes | Full app name (shown in install prompts) |
| `short_name` | ✅ Yes | Short name for home screen (max 12 chars) |
| `description` | Optional | App description for app stores |
| `icons` | ✅ Yes | Array of icon objects with src, sizes, type |
| `theme_color` | ✅ Yes | Browser UI color (same as meta theme-color) |
| `background_color` | ✅ Yes | Splash screen background when app launches |
| `display` | ✅ Yes | How app displays (see below) |
| `start_url` | ✅ Yes | URL to open when app launches |
| `scope` | Optional | Which URLs belong to the app |

### Display Modes

| Mode | Description |
|------|-------------|
| `standalone` | Looks like a native app (no browser UI) - **Recommended** |
| `fullscreen` | Takes entire screen (no status bar) |
| `minimal-ui` | Some browser controls visible |
| `browser` | Opens in normal browser tab |

---

## 🖼️ Icon Sizes Required

| Icon | Size | Purpose |
|------|------|---------|
| `favicon.ico` | 48x48 | Old browsers |
| `favicon-16x16.png` | 16x16 | Browser tab (small) |
| `favicon-32x32.png` | 32x32 | Browser tab (standard) |
| `apple-touch-icon.png` | 180x180 | iOS home screen |
| `android-chrome-192x192.png` | 192x192 | Android home screen |
| `android-chrome-512x512.png` | 512x512 | Android splash screen & install |

### How to Generate Icons

1. **Use a generator:** [realfavicongenerator.net](https://realfavicongenerator.net) or [favicon.io](https://favicon.io)
2. **Upload a 512x512 PNG** of your logo
3. **Download the generated package** with all sizes
4. **Place files in `/public` folder**

---

## ✅ PWA Checklist

### Minimum Requirements for Installable PWA

- [ ] Valid `site.webmanifest` with `name`, `icons`, `start_url`, `display`
- [ ] At least 192x192 PNG icon
- [ ] `<link rel="manifest">` in HTML
- [ ] `<meta name="theme-color">` in HTML
- [ ] Website served over HTTPS (or localhost)

### Recommended Additions

- [ ] 512x512 icon for splash screens
- [ ] Apple-specific meta tags for iOS
- [ ] Service Worker for offline functionality
- [ ] Maskable icon for Android adaptive icons

---

## 🔧 Testing Your PWA

### Chrome DevTools
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Manifest** - Check for errors
4. Click **Lighthouse** - Run PWA audit

### Mobile Testing
1. Deploy to a URL with HTTPS
2. Open in Chrome on Android
3. Look for "Add to Home Screen" prompt
4. Test that app opens correctly

---

## 📱 Platform-Specific Notes

### Android
- Uses `site.webmanifest` icons
- Shows install prompt automatically
- Supports all display modes

### iOS (Safari)
- Uses `apple-touch-icon` for home screen
- Requires meta tags in addition to manifest
- Limited PWA support (no push notifications)
- Status bar controlled by `apple-mobile-web-app-status-bar-style`

### Desktop (Chrome/Edge)
- Shows install icon in address bar
- Uses manifest icons
- Opens in separate window

---

## 🎨 Color Best Practices

| Property | Light Theme | Dark Theme |
|----------|-------------|------------|
| `theme-color` | `#ffffff` (white) | `#0f172a` (dark slate) |
| `background_color` | `#ffffff` (white) | `#0f172a` (dark slate) |

**Tip:** Match these colors with your website's header/background for a seamless look.

---

## 📚 Resources

- [MDN: Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [PWA Builder](https://www.pwabuilder.com/) - Test and improve your PWA
- [Favicon Generator](https://realfavicongenerator.net/)

---

*Last updated: December 2024*
