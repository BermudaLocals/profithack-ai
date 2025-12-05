import { marked } from 'marked';

interface PDFGeneratorOptions {
  title: string;
  content: string;
  author?: string;
  isMarkdown?: boolean;
  headerText?: string;
  footerText?: string;
  styles?: string;
}

export class PDFGenerator {
  static generatePrintableHTML(options: PDFGeneratorOptions): string {
    const {
      title,
      content,
      author = 'PROFITHACK AI',
      isMarkdown = false,
      headerText,
      footerText = '© 2025-2026 PROFITHACK AI',
      styles = ''
    } = options;

    const htmlContent = isMarkdown ? marked.parse(content) : content;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${this.escapeHtml(title)}</title>
  <style>
    @media print {
      @page { 
        size: A4; 
        margin: 1.5cm;
      }
      body { margin: 0; }
      .no-print { display: none !important; }
      .page-break { page-break-after: always; }
      h1, h2, h3 { page-break-after: avoid; }
      table { page-break-inside: avoid; }
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 20px;
      background: white;
    }
    
    .header {
      text-align: center;
      margin-bottom: 50px;
      padding: 30px;
      background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
      border-radius: 15px;
      border: 3px solid #f59e0b;
    }
    
    .header h1 {
      color: #f59e0b;
      font-size: 36px;
      margin: 0 0 15px 0;
      border: none;
    }
    
    .header p {
      margin: 5px 0;
      color: #666;
    }
    
    .print-button {
      text-align: center;
      margin: 30px 0;
      padding: 20px;
      background: #f59e0b;
      border-radius: 10px;
    }
    
    .print-button button {
      background: white;
      color: #f59e0b;
      border: none;
      padding: 15px 40px;
      font-size: 18px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }
    
    .print-button button:hover {
      background: #fef3c7;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.15);
    }
    
    h1 {
      color: #f59e0b;
      border-bottom: 3px solid #f59e0b;
      padding-bottom: 12px;
      font-size: 28px;
      margin-top: 50px;
    }
    
    h2 {
      color: #ea580c;
      border-bottom: 2px solid #ea580c;
      padding-bottom: 10px;
      margin-top: 40px;
      font-size: 24px;
    }
    
    h3 {
      color: #d97706;
      margin-top: 25px;
      font-size: 20px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
      font-size: 14px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 14px;
      text-align: left;
    }
    
    th {
      background-color: #f59e0b;
      color: white;
      font-weight: bold;
    }
    
    tr:nth-child(even) {
      background-color: #fef3c7;
    }
    
    tr:hover {
      background-color: #fed7aa;
    }
    
    code {
      background-color: #fef3c7;
      padding: 3px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: #d97706;
    }
    
    pre {
      background-color: #1a1a1a;
      color: #f3f4f6;
      padding: 15px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 13px;
    }
    
    pre code {
      background: none;
      color: #f3f4f6;
    }
    
    ul, ol {
      margin-left: 30px;
    }
    
    li {
      margin: 10px 0;
    }
    
    blockquote {
      border-left: 5px solid #f59e0b;
      margin: 25px 0;
      padding: 15px 20px;
      background: #fef3c7;
      border-radius: 5px;
    }
    
    .footer {
      text-align: center;
      margin-top: 60px;
      padding: 25px;
      font-size: 14px;
      color: #666;
      border-top: 3px solid #f59e0b;
      background: #fef3c7;
      border-radius: 10px;
    }
    
    hr {
      border: none;
      border-top: 2px solid #f59e0b;
      margin: 40px 0;
    }
    
    ${styles}
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 ${this.escapeHtml(title)}</h1>
    ${headerText ? `<p style="font-size: 18px; font-weight: bold;">${this.escapeHtml(headerText)}</p>` : ''}
    <p>Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}</p>
    ${author ? `<p style="font-size: 14px;">Created by: ${this.escapeHtml(author)}</p>` : ''}
  </div>

  <div class="print-button no-print">
    <button onclick="window.print()">🖨️ PRINT TO PDF / SAVE AS PDF</button>
    <p style="color: white; margin: 15px 0 0 0; font-size: 14px;">
      Click "Print" then choose "Save as PDF" from the destination dropdown
    </p>
  </div>

  <div class="content">
    ${htmlContent}
  </div>

  <div class="footer">
    <p>${this.escapeHtml(footerText)}</p>
    <p style="margin-top: 10px; font-size: 12px;">
      Document generated via PROFITHACK AI PDF Generator
    </p>
  </div>

  <script>
    // Enhance emoji visibility
    document.body.innerHTML = document.body.innerHTML
      .replace(/✅/g, '<span style="color: #10b981;">✅</span>')
      .replace(/⚠️/g, '<span style="color: #f59e0b;">⚠️</span>')
      .replace(/❌/g, '<span style="color: #ef4444;">❌</span>')
      .replace(/🚀/g, '<span style="color: #3b82f6;">🚀</span>')
      .replace(/🏆/g, '<span style="color: #f59e0b;">🏆</span>')
      .replace(/💎/g, '<span style="color: #8b5cf6;">💎</span>')
      .replace(/📊/g, '<span style="color: #3b82f6;">📊</span>')
      .replace(/💰/g, '<span style="color: #10b981;">💰</span>');
  </script>
</body>
</html>`;
  }

  private static escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
