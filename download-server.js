/**
 * PROFITHACK AI - Project Download Server
 * Serves all project files for download via web interface
 * Port: 3001
 * 
 * Run: node download-server.js
 */

const express = require('express');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Folders to exclude from downloads
const EXCLUDED_FOLDERS = ['node_modules', '.git', 'dist', 'build', '.cache', '.upm', '.config', '.npm'];
const EXCLUDED_FILES = ['.DS_Store', 'Thumbs.db', '.env', '*.log'];

// Get all files recursively
function getAllFiles(dirPath, arrayOfFiles = [], basePath = '') {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.join(basePath, file);
    
    // Skip excluded folders
    if (EXCLUDED_FOLDERS.includes(file)) {
      return;
    }

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
  });

  return arrayOfFiles;
}

// Format file size
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get total size
function getTotalSize(files) {
  return files.reduce((acc, file) => acc + file.size, 0);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'PROFITHACK AI Download Server', port: PORT });
});

// Homepage with beautiful UI
app.get('/', (req, res) => {
  const files = getAllFiles(process.cwd());
  const totalSize = getTotalSize(files);
  const replitUrl = process.env.REPLIT_DEV_DOMAIN || process.env.REPL_SLUG || 'localhost';
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PROFITHACK AI - Project Download</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%);
      min-height: 100vh;
      color: #ffffff;
      padding: 2rem;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .logo {
      font-size: 3rem;
      font-weight: 800;
      background: linear-gradient(135deg, #FF1493, #8B5CF6, #00D4FF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }
    
    .subtitle {
      color: #888;
      font-size: 1.1rem;
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
      background-clip: text;
    }
    
    .stat-label {
      color: #aaa;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }
    
    .download-section {
      background: rgba(20, 20, 40, 0.8);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
    }
    
    .section-title {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
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
    }
    
    .download-btn.zip {
      background: linear-gradient(135deg, #FF1493, #C71585);
      color: white;
    }
    
    .download-btn.json {
      background: linear-gradient(135deg, #8B5CF6, #6366F1);
      color: white;
    }
    
    .download-btn.api {
      background: linear-gradient(135deg, #00D4FF, #0099CC);
      color: white;
    }
    
    .download-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
    }
    
    .url-section {
      background: rgba(0, 212, 255, 0.1);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .url-label {
      color: #00D4FF;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
    
    .url-value {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 1.1rem;
      color: #fff;
      word-break: break-all;
    }
    
    .instructions {
      background: rgba(255, 20, 147, 0.1);
      border: 1px solid rgba(255, 20, 147, 0.3);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .instructions h3 {
      color: #FF1493;
      margin-bottom: 1rem;
    }
    
    .instructions ol {
      padding-left: 1.5rem;
      color: #ccc;
      line-height: 1.8;
    }
    
    .instructions code {
      background: rgba(139, 92, 246, 0.2);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', monospace;
      color: #8B5CF6;
    }
    
    .file-list {
      background: rgba(20, 20, 40, 0.8);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 20px;
      padding: 2rem;
      max-height: 500px;
      overflow-y: auto;
    }
    
    .file-list::-webkit-scrollbar {
      width: 8px;
    }
    
    .file-list::-webkit-scrollbar-track {
      background: rgba(139, 92, 246, 0.1);
      border-radius: 4px;
    }
    
    .file-list::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #FF1493, #8B5CF6);
      border-radius: 4px;
    }
    
    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(139, 92, 246, 0.1);
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.85rem;
    }
    
    .file-item:last-child {
      border-bottom: none;
    }
    
    .file-path {
      color: #ccc;
      word-break: break-all;
    }
    
    .file-size {
      color: #8B5CF6;
      white-space: nowrap;
      margin-left: 1rem;
    }
    
    .folder-icon { color: #FFD700; }
    .ts-icon { color: #3178C6; }
    .tsx-icon { color: #61DAFB; }
    .js-icon { color: #F7DF1E; }
    .json-icon { color: #8BC34A; }
    .css-icon { color: #264DE4; }
    .html-icon { color: #E34F26; }
    .md-icon { color: #083FA1; }
    
    .search-box {
      width: 100%;
      padding: 1rem;
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 12px;
      background: rgba(20, 20, 40, 0.8);
      color: #fff;
      font-size: 1rem;
      margin-bottom: 1rem;
    }
    
    .search-box::placeholder {
      color: #666;
    }
    
    .search-box:focus {
      outline: none;
      border-color: #8B5CF6;
    }
    
    .footer {
      text-align: center;
      color: #666;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(139, 92, 246, 0.2);
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="logo">PROFITHACK AI</h1>
      <p class="subtitle">Project Download Server - Full Source Code Access</p>
    </header>
    
    <div class="url-section">
      <div class="url-label">SERVER URL</div>
      <div class="url-value">http://localhost:${PORT}</div>
    </div>
    
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
        <a href="/download/zip" class="download-btn zip">
          <span>📦 ZIP Archive</span>
        </a>
        <a href="/download/json" class="download-btn json">
          <span>📄 JSON Bundle</span>
        </a>
        <a href="/files/list" class="download-btn api" target="_blank">
          <span>🔗 File List API</span>
        </a>
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
      <h2 class="section-title">Project Files (${files.length.toLocaleString()})</h2>
      <input type="text" class="search-box" placeholder="Search files..." id="searchInput" onkeyup="filterFiles()">
      <div id="fileList">
        ${files.sort((a, b) => a.path.localeCompare(b.path)).map(file => {
          const ext = path.extname(file.path).slice(1);
          let iconClass = '';
          switch(ext) {
            case 'ts': iconClass = 'ts-icon'; break;
            case 'tsx': iconClass = 'tsx-icon'; break;
            case 'js': iconClass = 'js-icon'; break;
            case 'json': iconClass = 'json-icon'; break;
            case 'css': iconClass = 'css-icon'; break;
            case 'html': iconClass = 'html-icon'; break;
            case 'md': iconClass = 'md-icon'; break;
          }
          return `<div class="file-item" data-path="${file.path.toLowerCase()}">
            <span class="file-path ${iconClass}">${file.path}</span>
            <span class="file-size">${formatSize(file.size)}</span>
          </div>`;
        }).join('')}
      </div>
    </section>
    
    <footer class="footer">
      <p>PROFITHACK AI &copy; 2025 - Enterprise Creator Platform</p>
      <p style="margin-top: 0.5rem; font-size: 0.8rem;">115,908 lines of production code</p>
    </footer>
  </div>
  
  <script>
    function filterFiles() {
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      const fileItems = document.querySelectorAll('.file-item');
      fileItems.forEach(item => {
        const path = item.getAttribute('data-path');
        item.style.display = path.includes(searchTerm) ? 'flex' : 'none';
      });
    }
  </script>
</body>
</html>
  `;
  
  res.send(html);
});

// Download as ZIP
app.get('/download/zip', (req, res) => {
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  res.attachment('profithack-ai-source.zip');
  archive.pipe(res);
  
  // Add all files except excluded
  const addFiles = (dirPath, basePath = '') => {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      const relativePath = path.join(basePath, file);
      
      if (EXCLUDED_FOLDERS.includes(file)) return;
      
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
    });
  };
  
  addFiles(process.cwd());
  archive.finalize();
});

// Download as JSON bundle
app.get('/download/json', (req, res) => {
  const files = getAllFiles(process.cwd());
  const bundle = {
    project: 'PROFITHACK AI',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    fileCount: files.length,
    files: {}
  };
  
  files.forEach(file => {
    try {
      const fullPath = path.join(process.cwd(), file.path);
      const content = fs.readFileSync(fullPath, 'utf8');
      bundle.files[file.path] = {
        content,
        size: file.size,
        modified: file.modified
      };
    } catch (err) {
      // Skip binary files
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
});

// API: List all files
app.get('/files/list', (req, res) => {
  const files = getAllFiles(process.cwd());
  res.json({
    project: 'PROFITHACK AI',
    totalFiles: files.length,
    totalSize: getTotalSize(files),
    totalSizeFormatted: formatSize(getTotalSize(files)),
    excludedFolders: EXCLUDED_FOLDERS,
    files: files.sort((a, b) => a.path.localeCompare(b.path))
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   PROFITHACK AI - Project Download Server');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   Network:  http://0.0.0.0:${PORT}`);
  console.log('');
  console.log('   Endpoints:');
  console.log(`   - GET /              → Web interface`);
  console.log(`   - GET /download/zip  → Download as ZIP`);
  console.log(`   - GET /download/json → Download as JSON bundle`);
  console.log(`   - GET /files/list    → API file listing`);
  console.log(`   - GET /health        → Health check`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
});
