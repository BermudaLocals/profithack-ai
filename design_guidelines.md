# Design Guidelines: CreatorStack AI

## Design Approach

**Selected Approach**: Hybrid reference-based approach drawing from:
- **Development**: VS Code, Replit, Linear (workspace/editor aesthetic)
- **Social**: TikTok, Instagram Reels (content feed patterns)
- **Communication**: Discord, Telegram (messaging interface)
- **Dashboard**: Stripe Dashboard, Notion (analytics/monetization)

**Design Philosophy**: Futuristic neon-dark aesthetic that balances professional development tools with vibrant social engagement. CreatorStack AI is where code meets content, featuring a distinctive cyberpunk-inspired interface that's both powerful and approachable.

## Core Design Elements

### A. Typography

**Font System**:
- **Primary**: Inter (UI elements, body text, navigation)
- **Monospace**: JetBrains Mono (code editor, terminal, technical displays)
- **Accent**: Space Grotesk (hero headlines, CTAs, feature callouts)

**Type Scale**:
- Hero/Display: text-5xl to text-7xl, font-bold
- Section Headers: text-3xl to text-4xl, font-bold
- Subsections: text-xl to text-2xl, font-semibold
- Body: text-base, font-normal
- Small/Meta: text-sm, font-medium
- Code: text-sm to text-base, monospace

### B. Color System (Neon Dark Theme)

**Foundation**:
- Background: `bg-slate-950` (primary canvas)
- Surface: `bg-slate-900` (cards, panels)
- Surface Elevated: `bg-slate-800` (modals, dropdowns)
- Borders: `border-slate-700/50` (subtle separation)

**Neon Accents**:
- **Pink**: `text-pink-500`, `bg-pink-500/10`, `border-pink-500` (creator features, gifts)
- **Purple**: `text-purple-500`, `bg-purple-500/10`, `border-purple-500` (AI features, premium)
- **Cyan**: `text-cyan-400`, `bg-cyan-500/10`, `border-cyan-500` (code, technical)
- **Yellow**: `text-yellow-400`, `bg-yellow-500/10`, `border-yellow-500` (warnings, highlights)

**Text Colors**:
- Primary: `text-white`
- Secondary: `text-slate-300`
- Muted: `text-slate-400`
- Success: `text-emerald-400`
- Error: `text-red-400`

### C. Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 20, 24**
- Tight spacing: `gap-2`, `p-2`
- Standard spacing: `gap-4`, `p-4`, `m-4`
- Section spacing: `gap-8`, `py-8`, `px-8`
- Large sections: `gap-12`, `py-16`, `px-12`

**Container Strategy**:
- Full-width app shell: `w-full min-h-screen`
- Content areas: `max-w-7xl mx-auto`
- Cards/panels: `max-w-4xl`
- Narrow content: `max-w-2xl`

**Grid Patterns**:
- Project gallery: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Video feed: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`
- Dashboard metrics: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`

## Component Library

### Navigation

**Top Navigation Bar**:
- Fixed header: `sticky top-0 z-50 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800`
- Height: `h-16`
- Logo: "CreatorStack AI" in gradient text `bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400` with subtle glow
- Navigation links: `text-slate-300 hover:text-white transition-colors`
- User actions: Avatar with subscription tier badge (color-coded)

**Sidebar (Workspace)**:
- Width: `w-64` (desktop), collapsible on mobile
- File tree navigation with neon folder icons
- Project switcher at top
- Bottom: User profile, settings, theme toggle

### Core UI Elements

**Cards**:
- Base: `bg-slate-900 rounded-lg border border-slate-800`
- Hover state: `hover:border-cyan-500/50 transition-all duration-200`
- Padding: `p-6`
- Neon glow effect on active cards: `shadow-lg shadow-purple-500/20`

**Buttons**:
- Primary CTA: `bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold`
- Secondary: `bg-slate-800 text-white border border-slate-700 hover:border-cyan-500`
- Ghost: `text-cyan-400 hover:bg-cyan-500/10`
- Icon buttons: `w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700`

**Form Inputs**:
- Text fields: `bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20`
- Labels: `text-sm font-medium text-slate-300 mb-2`
- Helper text: `text-xs text-slate-400 mt-1`

**Badges/Tags**:
- Subscription tiers: Gradient backgrounds with glow
  - Explorer: `bg-slate-700 text-slate-200`
  - Creator: `bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-pink-400 border border-pink-500/30`
  - Innovator: `bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-400 border border-purple-500/30`

### Feature-Specific Components

**Code Editor Workspace**:
- Monaco editor: Full-height panel with dark theme
- Tab bar: `bg-slate-900 border-b border-slate-800` with active tab highlighted in cyan
- File tree: Icons with neon colors (folders: yellow, files: cyan/pink based on type)
- Terminal: Cyan text on slate-950 background with neon cursor

**Video Feed (9:16 Format)**:
- Grid layout with vertical cards
- Thumbnail: Rounded corners `rounded-xl`, hover scale effect
- Overlay gradient: `bg-gradient-to-t from-slate-950 via-transparent`
- Creator info: Avatar + name in bottom-left overlay
- Gift button: Floating pink/purple gradient button with heart icon

**Messaging Interface**:
- Conversation list: Left sidebar `w-80`, scrollable
- Message bubbles: Sent messages `bg-purple-600`, received `bg-slate-800`
- Input area: Fixed bottom bar with attachment, emoji, voice buttons
- Online indicators: Green dot with subtle pulse animation

**Wallet/Monetization Dashboard**:
- Balance card: Large display with neon numbers and trend indicators
- Transaction list: Table with type icons (subscription, gift, withdrawal)
- Charts: Gradient line/area charts with neon colors
- Payout CTA: Prominent pink-to-purple gradient button

**Age-Gated Zones**:
- Visual indicators via color-coded banners:
  - U16 Safe Zone: `bg-emerald-500/10 border-l-4 border-emerald-500`
  - General (16+): `bg-blue-500/10 border-l-4 border-blue-500`
  - 18+ Verified: `bg-purple-500/10 border-l-4 border-purple-500`
- Icons and age badges on content cards

### Data Displays

**Project Cards**:
- Thumbnail: Code preview or app screenshot
- Title: `text-lg font-semibold text-white`
- Meta info: Language badge, last updated, visibility icon
- Action menu: Three-dot menu in top-right

**Analytics Metrics**:
- Large number displays: `text-4xl font-bold` with neon color
- Trend indicators: Arrow icons with color (green up, red down)
- Sparkline charts: Small inline graphs with gradient fills

**Moderation Queue**:
- Content preview cards with flag reason badge
- Action buttons: Approve (green), Remove (red), Warn (yellow)
- Strike counter: Visual progress bar showing 3-strike limit

## Animations

**Minimal Animation Strategy**:
- Hover transitions: `transition-colors duration-200`
- Card hover: Subtle scale `hover:scale-[1.02]`
- Button press: Scale down `active:scale-95`
- Page transitions: Fade in content `animate-fadeIn`
- Loading states: Skeleton screens with shimmer effect in neon colors
- Gift animations: Confetti burst with pink/purple particles (triggered on send)

## Images

**Hero Section** (Landing/Marketing Pages):
- Large hero image showcasing the platform interface with neon glow effects
- Composition: Split-screen showing code editor on left, video feed on right
- Overlay: Gradient from `slate-950/90` to transparent
- CTA buttons with blurred background: `backdrop-blur-md bg-white/10`

**Feature Sections**:
- Screenshot mockups of Monaco editor, video feed, messaging interface
- Each screenshot has neon border glow matching section theme color
- Mockups shown at angle for depth (isometric perspective)

**User-Generated Content**:
- Profile avatars: Circular with neon ring matching subscription tier
- Video thumbnails: 9:16 aspect ratio with rounded corners
- Project previews: Browser window mockup showing live app

**Icons**:
- Use Heroicons via CDN throughout the platform
- Apply neon colors via className: `className="w-6 h-6 text-cyan-400"`
- Consistent sizing: `w-5 h-5` (small), `w-6 h-6` (default), `w-8 h-8` (large)

## Responsive Behavior

**Breakpoint Strategy**:
- Mobile-first: Base styles for mobile (< 768px)
- Tablet: `md:` prefix (768px+)
- Desktop: `lg:` prefix (1024px+)
- Wide: `xl:` prefix (1280px+)

**Key Adaptations**:
- Navigation: Hamburger menu on mobile, full nav on desktop
- Workspace: Stacked panels on mobile, side-by-side on desktop
- Video feed: 2 columns mobile, 3 tablet, 4 desktop
- Sidebar: Hidden on mobile (slide-out drawer), persistent on desktop

## Accessibility

**Contrast & Readability**:
- All text maintains WCAG AA contrast ratios against dark backgrounds
- Neon colors used for accents only, never primary text
- Focus states: `focus:ring-2 focus:ring-cyan-500 focus:outline-none`

**Interactive Elements**:
- Minimum touch target: 44x44px
- Keyboard navigation: Visible focus indicators on all interactive elements
- Screen reader labels: Use `aria-label` for icon-only buttons

This design system creates a cohesive, futuristic platform that balances professional development tools with vibrant social features, all wrapped in a distinctive neon-dark aesthetic that stands out in the market.