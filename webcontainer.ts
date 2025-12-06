import { WebContainer, type FileSystemTree } from '@webcontainer/api';

let webcontainerInstance: WebContainer | null = null;

export async function getWebContainer(): Promise<WebContainer> {
  if (!webcontainerInstance) {
    try {
      webcontainerInstance = await WebContainer.boot();
    } catch (error) {
      console.error('Failed to boot WebContainer:', error);
      throw new Error('WebContainer not supported in this environment. Cross-origin isolation may be required.');
    }
  }
  return webcontainerInstance;
}

interface FileNode {
  name: string;
  path: string;
  content: string;
  language: string;
}

// Convert flat file list to nested directory structure
export function buildFileSystemTree(files: FileNode[]): FileSystemTree {
  const tree: FileSystemTree = {};
  
  files.forEach(file => {
    const parts = file.path.split('/');
    let current = tree;
    
    // Navigate/create directory structure
    for (let i = 0; i < parts.length - 1; i++) {
      const dirName = parts[i];
      if (!current[dirName]) {
        current[dirName] = {
          directory: {},
        };
      }
      current = (current[dirName] as any).directory;
    }
    
    // Add file at final location
    const fileName = parts[parts.length - 1];
    current[fileName] = {
      file: {
        contents: file.content,
      },
    };
  });
  
  return tree;
}

export async function mountFiles(files: FileNode[]) {
  try {
    const container = await getWebContainer();
    const fileTree = buildFileSystemTree(files);
    await container.mount(fileTree);
  } catch (error) {
    console.error('Failed to mount files:', error);
    throw new Error('Could not mount files to WebContainer');
  }
}

export async function runCommand(
  command: string,
  args: string[] = [],
  onOutput?: (data: string) => void
) {
  try {
    const container = await getWebContainer();
    const process = await container.spawn(command, args);
    
    if (onOutput) {
      process.output.pipeTo(
        new WritableStream({
          write(data: string) {
            onOutput(data);
          },
        })
      );
    }
    
    return process;
  } catch (error) {
    console.error(`Failed to run command: ${command}`, error);
    throw new Error(`Command execution failed: ${command}`);
  }
}

export async function installDependencies(onOutput?: (data: string) => void) {
  try {
    const container = await getWebContainer();
    const installProcess = await container.spawn('npm', ['install']);
    
    if (onOutput) {
      installProcess.output.pipeTo(
        new WritableStream({
          write(data: string) {
            onOutput(data);
          },
        })
      );
    }
    
    return await installProcess.exit;
  } catch (error) {
    console.error('Failed to install dependencies:', error);
    throw new Error('npm install failed');
  }
}

export async function startDevServer(
  onOutput?: (data: string) => void,
  onServerReady?: (port: number, url: string) => void
) {
  try {
    const container = await getWebContainer();
    const serverProcess = await container.spawn('npm', ['run', 'dev']);
    
    if (onOutput) {
      serverProcess.output.pipeTo(
        new WritableStream({
          write(data: string) {
            onOutput(data);
          },
        })
      );
    }
    
    if (onServerReady) {
      container.on('server-ready', (port, url) => {
        onServerReady(port, url);
      });
    }
    
    return serverProcess;
  } catch (error) {
    console.error('Failed to start dev server:', error);
    throw new Error('Dev server failed to start');
  }
}

export async function writeFile(path: string, content: string) {
  try {
    const container = await getWebContainer();
    
    // Create directory if needed
    const parts = path.split('/');
    if (parts.length > 1) {
      const dirPath = parts.slice(0, -1).join('/');
      try {
        await container.fs.mkdir(dirPath, { recursive: true });
      } catch (e) {
        // Directory might already exist
      }
    }
    
    await container.fs.writeFile(path, content);
  } catch (error) {
    console.error(`Failed to write file: ${path}`, error);
    throw new Error(`Could not write file: ${path}`);
  }
}

export async function readFile(path: string): Promise<string> {
  try {
    const container = await getWebContainer();
    const content = await container.fs.readFile(path, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Failed to read file: ${path}`, error);
    throw new Error(`Could not read file: ${path}`);
  }
}

export async function teardown() {
  if (webcontainerInstance) {
    await webcontainerInstance.teardown();
    webcontainerInstance = null;
  }
}
