import express from "express";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folders to exclude from downloads
const EXCLUDED_FOLDERS = ['node_modules', '.git', 'dist', 'build', '.cache', '.upm', '.config', '.npm', '.replit'];
const EXCLUDED_FILES = ['.DS_Store', 'Thumbs.db', '.env', '*.log'];

// Get all files recursively
function getAllFiles(dirPath: string, arrayOfFiles: any[] = [], basePath: string = ''): any[] {
  try {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      const relativePath = path.join(basePath, file);
      
      // Skip excluded folders
      if (EXCLUDED_FOLDERS.includes(file)) {
        return;
      }

      try {
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          getAllFiles(fullPath, arrayOfFiles, relativePath);
        } else {
          // Skip excluded file patterns
          const shouldExclude = EXCLUDED_FILES.some(pattern => {
            if (pattern.startsWith('*')) {
              return file.endsWith(pattern.slice(1));
            }
            return file === pattern;
          });
          
          if (!shouldExclude) {
            arrayOfFiles.push({
              path: relativePath,
              size: stat.size,
              modified: stat.mtime
            });
          }
        }
      } catch (err) {
        // Skip files that can't be accessed
      }
    });
  } catch (err) {
    // Skip directories that can't be accessed
  }

  return arrayOfFiles;
}

// Format file size
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get total size
function getTotalSize(files: any[]): number {
  return files.reduce((acc, file) => acc + file.size, 0);
}

export function setupDownloadsRoute(app: express.Application) {
  const projectRoot = path.join(__dirname, '..');
  
  // Serve static download files from public/downloads directory
  app.use('/downloads', express.static(path.join(__dirname, '../public/downloads'), {
    setHeaders: (res, filepath) => {
      // Force download for tar.gz files
      if (filepath.endsWith('.tar.gz')) {
        res.setHeader('Content-Disposition', 'attachment; filename=' + path.basename(filepath));
        res.setHeader('Content-Type', 'application/gzip');
      }
      // Serve markdown files as downloadable
      if (filepath.endsWith('.md')) {
        res.setHeader('Content-Disposition', 'attachment; filename=' + path.basename(filepath));
        res.setHeader('Content-Type', 'text/markdown');
      }
    }
  }));
  
  // API: List all files
  app.get('/api/downloads/files', (_req, res) => {
    try {
      const files = getAllFiles(projectRoot);
      res.json({
        project: 'PROFITHACK AI',
        totalFiles: files.length,
        totalSize: getTotalSize(files),
        totalSizeFormatted: formatSize(getTotalSize(files)),
        excludedFolders: EXCLUDED_FOLDERS,
        files: files.sort((a, b) => a.path.localeCompare(b.path))
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to list files' });
    }
  });
  
  // Download as ZIP (without node_modules)
  app.get('/api/downloads/zip', (_req, res) => {
    try {
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      res.attachment('profithack-ai-source.zip');
      archive.pipe(res);
      
      // Add all files except excluded
      const addFiles = (dirPath: string, basePath: string = '') => {
        try {
          const files = fs.readdirSync(dirPath);
          files.forEach(file => {
            const fullPath = path.join(dirPath, file);
            const relativePath = path.join(basePath, file);
            
            if (EXCLUDED_FOLDERS.includes(file)) return;
            
            try {
              const stat = fs.statSync(fullPath);
              if (stat.isDirectory()) {
                addFiles(fullPath, relativePath);
              } else {
                const shouldExclude = EXCLUDED_FILES.some(pattern => {
                  if (pattern.startsWith('*')) return file.endsWith(pattern.slice(1));
                  return file === pattern;
                });
                if (!shouldExclude) {
                  archive.file(fullPath, { name: relativePath });
                }
              }
            } catch (err) {
              // Skip files that can't be accessed
            }
          });
        } catch (err) {
          // Skip directories that can't be accessed
        }
      };
      
      addFiles(projectRoot);
      archive.finalize();
    } catch (error) {
      res.status(500).json({ error: 'Failed to create ZIP' });
    }
  });

  // Download as ZIP FULL (with node_modules - 938 MB)
  app.get('/api/downloads/zip-full', (_req, res) => {
    try {
      const archive = archiver('zip', { zlib: { level: 6 } }); // Lower compression for speed
      
      res.attachment('profithack-ai-complete.zip');
      archive.pipe(res);
      
      // Add ALL files including node_modules
      const addAllFiles = (dirPath: string, basePath: string = '') => {
        try {
          const files = fs.readdirSync(dirPath);
          files.forEach(file => {
            const fullPath = path.join(dirPath, file);
            const relativePath = path.join(basePath, file);
            
            // Only exclude .git objects and .env files
            if (file === '.git' || file === '.env' || file === '.DS_Store') return;
            
            try {
              const stat = fs.statSync(fullPath);
              if (stat.isDirectory()) {
                addAllFiles(fullPath, relativePath);
              } else {
                archive.file(fullPath, { name: relativePath });
              }
            } catch (err) {
              // Skip files that can't be accessed
            }
          });
        } catch (err) {
          // Skip directories that can't be accessed
        }
      };
      
      addAllFiles(projectRoot);
      archive.finalize();
    } catch (error) {
      res.status(500).json({ error: 'Failed to create ZIP' });
    }
  });
  
  // Download as JSON bundle
  app.get('/api/downloads/json', (_req, res) => {
    try {
      const files = getAllFiles(projectRoot);
      const bundle: any = {
        project: 'PROFITHACK AI',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        fileCount: files.length,
        totalSize: formatSize(getTotalSize(files)),
        files: {}
      };
      
      files.forEach(file => {
        try {
          const fullPath = path.join(projectRoot, file.path);
          const content = fs.readFileSync(fullPath, 'utf8');
          bundle.files[file.path] = {
            content,
            size: file.size,
            modified: file.modified
          };
        } catch (err) {
          // Skip binary files or unreadable files
          bundle.files[file.path] = {
            content: '[BINARY FILE]',
            size: file.size,
            modified: file.modified
          };
        }
      });
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="profithack-ai-source.json"');
      res.send(JSON.stringify(bundle, null, 2));
    } catch (error) {
      res.status(500).json({ error: 'Failed to create JSON bundle' });
    }
  });
  
  // Download page with web interface
  app.get('/api/downloads/page', (_req, res) => {
    const files = getAllFiles(projectRoot);
    const totalSize = getTotalSize(files);
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PROFITHACK AI - Project Download</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%);
      min-height: 100vh;
      color: #fff;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 3rem; }
    .logo {
      font-size: 3rem;
      font-weight: 800;
      background: linear-gradient(135deg, #FF1493, #8B5CF6, #00D4FF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(255, 20, 147, 0.1));
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 16px;
      padding: 1.5rem;
      text-align: center;
    }
    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #FF1493, #8B5CF6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .stat-label { color: #aaa; font-size: 0.9rem; margin-top: 0.5rem; }
    .download-section {
      background: rgba(20, 20, 40, 0.8);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
    }
    .section-title { font-size: 1.5rem; margin-bottom: 1.5rem; }
    .download-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }
    .download-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1.25rem 2rem;
      border: none;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s ease;
      color: white;
    }
    .download-btn.zip { background: linear-gradient(135deg, #FF1493, #C71585); }
    .download-btn.json { background: linear-gradient(135deg, #8B5CF6, #6366F1); }
    .download-btn.api { background: linear-gradient(135deg, #00D4FF, #0099CC); }
    .download-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
    }
    .instructions {
      background: rgba(255, 20, 147, 0.1);
      border: 1px solid rgba(255, 20, 147, 0.3);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .instructions h3 { color: #FF1493; margin-bottom: 1rem; }
    .instructions ol { padding-left: 1.5rem; color: #ccc; line-height: 1.8; }
    .instructions code {
      background: rgba(139, 92, 246, 0.2);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-family: monospace;
      color: #8B5CF6;
    }
    .file-list {
      background: rgba(20, 20, 40, 0.8);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 20px;
      padding: 2rem;
      max-height: 400px;
      overflow-y: auto;
    }
    .file-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 1rem;
      border-bottom: 1px solid rgba(139, 92, 246, 0.1);
      font-family: monospace;
      font-size: 0.85rem;
    }
    .file-path { color: #ccc; }
    .file-size { color: #8B5CF6; }
    .footer { text-align: center; color: #666; margin-top: 2rem; }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="logo">PROFITHACK AI</h1>
      <p style="color: #888; margin-top: 0.5rem;">Project Download Server - Full Source Code Access</p>
    </header>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${files.length.toLocaleString()}</div>
        <div class="stat-label">Total Files</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${formatSize(totalSize)}</div>
        <div class="stat-label">Total Size</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${files.filter(f => f.path.endsWith('.ts') || f.path.endsWith('.tsx')).length}</div>
        <div class="stat-label">TypeScript Files</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">115,908</div>
        <div class="stat-label">Lines of Code</div>
      </div>
    </div>
    
    <section class="download-section">
      <h2 class="section-title">Download Options</h2>
      <div class="download-buttons">
        <a href="/api/downloads/zip" class="download-btn zip">ZIP Archive (${formatSize(totalSize)})</a>
        <a href="/api/downloads/json" class="download-btn json">JSON Bundle</a>
        <a href="/api/downloads/files" class="download-btn api" target="_blank">File List API</a>
      </div>
    </section>
    
    <section class="instructions">
      <h3>After Downloading</h3>
      <ol>
        <li>Extract the ZIP file to your preferred location</li>
        <li>Open terminal and navigate to the project folder</li>
        <li>Run <code>npm install</code> to install dependencies</li>
        <li>Copy <code>.env.example</code> to <code>.env</code> and add your API keys</li>
        <li>Run <code>npm run dev</code> to start the development server</li>
        <li>Open <code>http://localhost:5000</code> in your browser</li>
      </ol>
    </section>
    
    <section class="file-list">
      <h2 class="section-title">Project Files (${files.length})</h2>
      ${files.slice(0, 100).map(file => `
        <div class="file-item">
          <span class="file-path">${file.path}</span>
          <span class="file-size">${formatSize(file.size)}</span>
        </div>
      `).join('')}
      ${files.length > 100 ? `<p style="text-align: center; color: #888; padding: 1rem;">... and ${files.length - 100} more files</p>` : ''}
    </section>
    
    <footer class="footer">
      <p>PROFITHACK AI - 115,908 lines of production code</p>
    </footer>
  </div>
</body>
</html>
    `;
    
    res.send(html);
  });
  
  console.log("✅ Downloads route configured at /downloads");
  console.log("   - GET /api/downloads/page → Web interface");
  console.log("   - GET /api/downloads/zip  → Download as ZIP");
  console.log("   - GET /api/downloads/json → Download as JSON");
  console.log("   - GET /api/downloads/files → API file listing");
}
