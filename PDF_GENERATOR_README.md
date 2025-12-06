# 📄 PROFITHACK AI - PDF Generator

## Overview

Professional PDF generation tool for creating print-ready documents from Markdown or HTML content. Built-in to the PROFITHACK AI platform for all users.

---

## ✨ Features

- **Markdown Support** - Write in Markdown, generate beautiful PDFs
- **HTML Support** - Advanced users can use custom HTML
- **Professional Styling** - PROFITHACK AI branded templates
- **Print Optimized** - A4 format, proper page breaks
- **Easy Export** - One-click print-to-PDF in browser
- **API Access** - Programmatic PDF generation

---

## 🎯 Access

### Web UI

1. Navigate to `/pdf-generator` or `/pdf` in your browser
2. Enter title, author, and content
3. Click "Generate PDF"
4. Print to PDF in the new window

### API Endpoints

#### POST `/api/pdf/generate`

Generate PDF from content.

**Request Body:**
```json
{
  "title": "Monthly Sales Report",
  "content": "# Heading\n\nYour content here...",
  "isMarkdown": true,
  "author": "John Doe",
  "headerText": "Optional header",
  "footerText": "© 2025 Company Name"
}
```

**Response:**  
Returns printable HTML document ready for PDF conversion.

---

#### POST `/api/pdf/generate-from-file`

Generate PDF from existing file.

**Request Body:**
```json
{
  "filePath": "SYSTEM_AUDIT_TIKTOK_COMPARISON.md",
  "title": "System Audit Report",
  "author": "PROFITHACK AI"
}
```

**Response:**  
Returns printable HTML document.

---

## 💻 Usage Examples

### JavaScript/TypeScript

```typescript
const response = await fetch('/api/pdf/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Q4 Revenue Report',
    content: `
# Executive Summary

Revenue increased by **200%** in Q4 2025.

## Key Metrics

| Metric | Value | Change |
|--------|-------|--------|
| Revenue | $500K | +200% |
| Users | 10K | +150% |
| Videos | 50K | +300% |
    `,
    isMarkdown: true,
    author: 'Finance Team'
  })
});

const html = await response.text();

// Open in new window for printing
const blob = new Blob([html], { type: 'text/html' });
const url = URL.createObjectURL(blob);
window.open(url, '_blank');
```

### Python

```python
import requests

response = requests.post('https://profithackai.com/api/pdf/generate', json={
    'title': 'Analytics Report',
    'content': '# Data Analysis\n\nYour analysis here...',
    'isMarkdown': True,
    'author': 'Data Team'
})

with open('report.html', 'w') as f:
    f.write(response.text)
```

### cURL

```bash
curl -X POST https://profithackai.com/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Report",
    "content": "# Hello World",
    "isMarkdown": true
  }' > report.html
```

---

## 🎨 Styling

The PDF generator uses PROFITHACK AI's brand colors:

- **Primary**: #f59e0b (Golden Orange)
- **Secondary**: #ea580c (Deep Orange)
- **Accent**: #d97706 (Amber)

All PDFs include:
- Professional header with title and date
- Branded color scheme
- Responsive tables
- Code highlighting
- Emoji support
- Page numbers in footer

---

## 📋 Supported Content

### Markdown Features

- ✅ Headings (H1-H6)
- ✅ Bold, Italic, Code
- ✅ Tables
- ✅ Lists (ordered/unordered)
- ✅ Blockquotes
- ✅ Links
- ✅ Horizontal rules
- ✅ Emojis

### Custom Styling

Pass custom CSS via the `styles` parameter:

```json
{
  "title": "Custom Report",
  "content": "Your content",
  "styles": "h1 { color: #0066cc; }"
}
```

---

## 🖨️ Print to PDF

After generating the HTML:

1. Browser opens new window with document
2. Click **"🖨️ PRINT TO PDF / SAVE AS PDF"** button
3. In print dialog:
   - Choose **"Save as PDF"** as destination
   - Select **"A4"** paper size
   - Enable **"Background graphics"**
4. Click **"Save"**
5. Done!

**Keyboard Shortcut:**  
`Ctrl+P` (Windows) or `Cmd+P` (Mac)

---

## 🔧 Technical Details

### Server-Side

- **Technology**: Node.js + Express
- **Library**: `marked` for Markdown parsing
- **Location**: `server/services/pdf-generator.ts`
- **Routes**: `server/routes-pdf.ts`

### Client-Side

- **UI Framework**: React + Shadcn UI
- **Page**: `client/src/pages/pdf-generator.tsx`
- **Routes**: `/pdf-generator`, `/pdf`

---

## 🚀 Use Cases

### Business Reports

Generate monthly/quarterly reports with data tables and charts.

### Documentation

Convert Markdown docs to professional PDFs for distribution.

### Invoices & Receipts

Create branded invoices for customers.

### Marketing Materials

Generate one-pagers, case studies, whitepapers.

### System Audits

Export technical audits and compliance reports (like this document!).

---

## 🎯 Best Practices

1. **Keep titles concise** - 50 characters or less
2. **Use headings hierarchy** - H1 → H2 → H3
3. **Tables under 6 columns** - Better fit on A4
4. **Images under 500KB** - Faster loading
5. **Test print preview** - Before final PDF

---

## 🔒 Security

- ✅ Input sanitization (HTML escaping)
- ✅ File path validation
- ✅ Content-Type enforcement
- ✅ No external resource loading
- ✅ Authenticated API endpoints

---

## 📞 Support

Need help? Contact:
- **Email**: kwadz4u@yahoo.com (Founder)
- **Platform**: Support bot in app

---

**Built with ❤️ by PROFITHACK AI**  
© 2025-2026 PROFITHACK AI. All rights reserved.
