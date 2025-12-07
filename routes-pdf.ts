import { Router } from 'express';
import { PDFGenerator } from './services/pdf-generator';
import fs from 'fs';
import path from 'path';

const router = Router();

router.post('/api/pdf/generate', async (req, res) => {
  try {
    const { title, content, isMarkdown, author, headerText, footerText, styles } = req.body;

    if (!title || !content) {
      return res.status(400).json({ 
        error: 'Title and content are required' 
      });
    }

    const html = PDFGenerator.generatePrintableHTML({
      title,
      content,
      isMarkdown: isMarkdown ?? true,
      author,
      headerText,
      footerText,
      styles
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/api/pdf/generate-from-file', async (req, res) => {
  try {
    const { filePath, title, author } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const isMarkdown = filePath.endsWith('.md');
    const documentTitle = title || path.basename(filePath, path.extname(filePath));

    const html = PDFGenerator.generatePrintableHTML({
      title: documentTitle,
      content,
      isMarkdown,
      author
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('PDF generation from file error:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF from file',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
