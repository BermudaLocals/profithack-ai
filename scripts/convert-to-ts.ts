#!/usr/bin/env tsx
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

console.log("🔄 TypeScript Conversion Script");
console.log("================================\n");

interface ConversionStats {
  jsConverted: number;
  jsxConverted: number;
  errors: string[];
}

function findFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory() && item.name !== "node_modules" && item.name !== "dist") {
      files.push(...findFiles(fullPath, extensions));
    } else if (item.isFile()) {
      const ext = path.extname(item.name);
      if (extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

function addBasicTypes(content: string, isJsx: boolean): string {
  let result = content;
  
  result = result.replace(
    /function\s+(\w+)\s*\(([^)]*)\)\s*{/g,
    (match, name, params) => {
      if (params.trim() === "") {
        return match;
      }
      const typedParams = params
        .split(",")
        .map((p: string) => {
          const paramName = p.trim().split("=")[0].trim();
          if (paramName && !paramName.includes(":")) {
            return `${paramName}: any`;
          }
          return p;
        })
        .join(", ");
      return `function ${name}(${typedParams}) {`;
    }
  );
  
  result = result.replace(
    /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/g,
    (match, name, params) => {
      if (params.trim() === "") {
        return match;
      }
      const typedParams = params
        .split(",")
        .map((p: string) => {
          const paramName = p.trim().split("=")[0].trim();
          if (paramName && !paramName.includes(":")) {
            return `${paramName}: any`;
          }
          return p;
        })
        .join(", ");
      return `const ${name} = (${typedParams}) =>`;
    }
  );
  
  result = result.replace(
    /useState\s*\(\s*([^)]+)\s*\)/g,
    (match, initialValue) => {
      if (match.includes("<")) {
        return match;
      }
      return `useState<any>(${initialValue})`;
    }
  );
  
  return result;
}

function convertFile(filePath: string, stats: ConversionStats): void {
  try {
    const ext = path.extname(filePath);
    const content = fs.readFileSync(filePath, "utf-8");
    const isJsx = ext === ".jsx";
    
    const newExt = isJsx ? ".tsx" : ".ts";
    const newPath = filePath.replace(ext, newExt);
    
    const typedContent = addBasicTypes(content, isJsx);
    
    fs.writeFileSync(newPath, typedContent);
    
    if (newPath !== filePath) {
      fs.unlinkSync(filePath);
    }
    
    if (isJsx) {
      stats.jsxConverted++;
    } else {
      stats.jsConverted++;
    }
    
    console.log(`   ✓ ${path.relative(ROOT, filePath)} → ${path.relative(ROOT, newPath)}`);
  } catch (error: any) {
    stats.errors.push(`${filePath}: ${error.message}`);
    console.log(`   ✗ ${path.relative(ROOT, filePath)}: ${error.message}`);
  }
}

function createTypesDeclaration(): void {
  const typesPath = path.join(ROOT, "types.d.ts");
  
  if (!fs.existsSync(typesPath)) {
    const typesContent = `
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.json" {
  const content: any;
  export default content;
}

declare namespace Express {
  interface Request {
    user?: any;
  }
  interface Session {
    userId?: number;
    isAdmin?: boolean;
  }
}
`;
    
    fs.writeFileSync(typesPath, typesContent.trim());
    console.log("   ✓ Created types.d.ts");
  }
}

async function main(): Promise<void> {
  const stats: ConversionStats = {
    jsConverted: 0,
    jsxConverted: 0,
    errors: [],
  };
  
  const dirsToConvert = [
    path.join(ROOT, "client", "src"),
    path.join(ROOT, "server"),
  ];
  
  for (const dir of dirsToConvert) {
    if (!fs.existsSync(dir)) {
      console.log(`⚠️ Directory not found: ${dir}`);
      continue;
    }
    
    console.log(`\n📁 Scanning: ${path.relative(ROOT, dir)}`);
    
    const jsFiles = findFiles(dir, [".js", ".jsx"]);
    
    if (jsFiles.length === 0) {
      console.log("   No .js/.jsx files found");
      continue;
    }
    
    console.log(`   Found ${jsFiles.length} file(s) to convert\n`);
    
    for (const file of jsFiles) {
      convertFile(file, stats);
    }
  }
  
  createTypesDeclaration();
  
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              TypeScript Conversion Complete                  ║
╠══════════════════════════════════════════════════════════════╣
║  .js files converted:  ${String(stats.jsConverted).padEnd(36)}║
║  .jsx files converted: ${String(stats.jsxConverted).padEnd(36)}║
║  Errors:               ${String(stats.errors.length).padEnd(36)}║
╚══════════════════════════════════════════════════════════════╝
`);
  
  if (stats.errors.length > 0) {
    console.log("\n❌ Errors encountered:");
    stats.errors.forEach((e) => console.log(`   - ${e}`));
  }
}

main().catch((error) => {
  console.error("❌ Conversion failed:", error);
  process.exit(1);
});
