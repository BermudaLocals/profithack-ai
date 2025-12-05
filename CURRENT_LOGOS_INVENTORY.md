# 📸 PROFITHACK AI - Current Logo Inventory

## Logos Currently in Use

### 1. **Primary Logos** (public folder)
Located in `/public/` - These are actively used in the app:

- `logo.png` (82 KB) - Masonic eye logo
- `logo-masonic.png` (82 KB) - Masonic eye logo (duplicate)
- `logo-spiral-head.svg` (3.3 KB) - Spiral head vector logo
- `logo-spiral-head-simple.svg` (1.1 KB) - Simple spiral head vector
- `favicon.ico` (1.6 MB) - Browser tab icon
- `favicon.png` - PNG version

### 2. **App Icons** (PWA)
Located in `/attached_assets/generated_images/`:

- `PROFITHACK_AI_app_icon_192_05842f96.png` - 192x192 PWA icon
- `PROFITHACK_AI_app_icon_512_6f0916ba.png` - 512x512 PWA icon

### 3. **Concept Logos** (Generated Images)
Located in `/attached_assets/generated_images/`:

**Spiral Head Variations:**
- `profithack_ai_multi-head_spiral_logo.png`
- `cyan/pink_spiral_heads_logo_v1.png`
- `cyan/pink_geometric_multi-head_logo_v4.png`
- `neon_cyan/pink_triangle_heads_logo_v2.png`
- `cyan-to-pink_gradient_vertical_heads_logo_v3.png`

**Masonic/Illuminati Style:**
- `masonic_eye_of_providence_ai_logo.png`
- `pyramid_masonic_ai_heads_logo.png`
- `subtle_hidden_masonic_ai_heads_logo_v1.png`
- `hidden_masonic_pyramid_arrangement_logo_v3.png`
- `hidden_masonic_geometry_tech_logo_v2.png`

**Original Uploads:**
- `profithackai_logo_500kb_1762344195041.png`
- `profithackai.com-logo_1762344265954.png`

---

## Where Logos Are Used

### In Code References:

1. **RotatingMasonicLogo.tsx** - Animated masonic logo component
2. **FounderBadge.tsx** - Golden founder badge with masonic seal
3. **app-sidebar.tsx** - Sidebar branding
4. **landing-page.tsx** - Hero section branding
5. **email templates** (server/email-service.ts) - Email branding

### Logo Usage Patterns:

```typescript
// Masonic logo (SVG inline in RotatingMasonicLogo.tsx)
<svg viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="90" fill="url(#gold)"/>
  <path d="M 100 30 L 170 170 L 30 170 Z"/>
  <circle cx="100" cy="100" r="25" fill="url(#gold)"/>
</svg>

// Spiral head logo
import logoUrl from '@/public/logo-spiral-head.svg'

// App icons (PWA manifest)
{
  "icons": [
    { "src": "/attached_assets/generated_images/PROFITHACK_AI_app_icon_192_05842f96.png", "sizes": "192x192" },
    { "src": "/attached_assets/generated_images/PROFITHACK_AI_app_icon_512_6f0916ba.png", "sizes": "512x512" }
  ]
}
```

---

## 📥 How to Download Current Logos

### Method 1: File Explorer
1. Navigate to `/public/` folder
2. Right-click each logo file
3. Select "Download"

### Method 2: Bulk Download (Terminal)
```bash
# Create logo package
mkdir -p logo_package
cp public/logo*.{png,svg} logo_package/
cp public/favicon.* logo_package/
cp attached_assets/generated_images/*logo*.png logo_package/
tar -czf profithack_logos_current.tar.gz logo_package/
```

### Method 3: Individual Files

**Primary Logos:**
- `/public/logo.png`
- `/public/logo-spiral-head.svg`

**Concept Variations:**
- `/attached_assets/generated_images/` (all PNG files with "logo" in name)

---

## 🎨 Logo Specifications

### Current Dimensions:
- **Masonic PNG**: 82 KB (unknown px dimensions)
- **Spiral SVG**: Vector (scalable)
- **Favicon**: 1.6 MB (probably 512x512 or larger)
- **PWA Icons**: 192x192, 512x512

### Color Scheme:
- **Primary**: #f59e0b (Golden Orange)
- **Accent**: #ea580c (Deep Orange)
- **Secondary**: #d97706 (Amber)
- **Neon Pink**: #ec4899
- **Neon Cyan**: #06b6d4

---

## 🔄 Replacing Logos

To replace logos:

1. **Upload your new logo files** to `/public/` folder
2. **Name them exactly** as shown above (or update references)
3. **Update manifest.json** if changing PWA icons
4. **Restart the app** for changes to take effect

**Critical files to update:**
- `/public/logo.png` - Main masonic logo
- `/public/logo-spiral-head.svg` - Spiral head logo
- `/public/favicon.ico` - Browser icon
- `/client/public/manifest.json` - PWA icons

---

## 📝 Notes

- All logos are currently **masonic/illuminati** themed (eye of providence, pyramid)
- Spiral head logos represent multiple AI heads/personalities
- Color scheme is **golden/orange** (PROFITHACK AI brand)
- Logos are used in: sidebar, emails, PWA, landing page, founder badges

**Ready for replacement!** Upload your preferred logos and I'll update all references.
