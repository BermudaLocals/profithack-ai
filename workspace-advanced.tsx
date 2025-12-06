import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Terminal, type TerminalHandle } from "@/components/terminal";
import { 
  Play, 
  Square, 
  Save, 
  FolderOpen, 
  FileCode,
  Terminal as TerminalIcon,
  Globe,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";
import type { WebContainerProcess } from "@webcontainer/api";
import {
  getWebContainer,
  mountFiles,
  writeFile,
  runCommand,
  installDependencies,
  startDevServer,
} from "@/services/webcontainer";

interface FileNode {
  name: string;
  path: string;
  content: string;
  language: string;
}

export default function AdvancedWorkspace() {
  const { toast } = useToast();
  const terminalRef = useRef<TerminalHandle>(null);
  const runningProcessRef = useRef<WebContainerProcess | null>(null);
  const devServerProcessRef = useRef<WebContainerProcess | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [pendingProject, setPendingProject] = useState<Project | null>(null);
  const [currentFile, setCurrentFile] = useState<FileNode | null>(null);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [webcontainerReady, setWebcontainerReady] = useState(false);
  const [webcontainerError, setWebcontainerError] = useState<string>('');

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const writeTerminal = useCallback((text: string) => {
    terminalRef.current?.write(text);
  }, []);

  const writelnTerminal = useCallback((text: string) => {
    terminalRef.current?.writeln(text);
  }, []);

  // Initialize WebContainer
  useEffect(() => {
    getWebContainer()
      .then(() => {
        setWebcontainerReady(true);
        writelnTerminal('✓ WebContainer initialized');
        writelnTerminal('Ready to run Node.js applications\r\n');
      })
      .catch((error) => {
        console.error('Failed to initialize WebContainer:', error);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setWebcontainerError(errorMsg);
        writelnTerminal(`✗ Error: ${errorMsg}\r\n`);
        toast({
          variant: "destructive",
          title: "WebContainer Error",
          description: "Could not initialize code execution environment. Cross-origin isolation may be required.",
        });
      });
  }, [writelnTerminal, toast]);

  const loadProject = useCallback(
    async (project: Project) => {
      setSelectedProject(project);
      const projectFiles = (project.files as FileNode[]) || [];
      setFiles(projectFiles);
      if (projectFiles.length > 0) {
        setCurrentFile(projectFiles[0]);
      }

      if (webcontainerReady && projectFiles.length > 0) {
        try {
          writelnTerminal(`\r\nLoading project "${project.name}"...`);
          await mountFiles(projectFiles);
          writelnTerminal(`✓ Project loaded successfully\r\n`);
        } catch (error) {
          console.error('Failed to mount files:', error);
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          writelnTerminal(`✗ Error loading project: ${errorMsg}\r\n`);
        }
      }
    },
    [webcontainerReady, writelnTerminal]
  );

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (currentFile && value !== undefined) {
        const updatedFile = { ...currentFile, content: value };
        setCurrentFile(updatedFile);
        setFiles((files) =>
          files.map((f) => (f.path === currentFile.path ? updatedFile : f))
        );

        if (webcontainerReady) {
          writeFile(currentFile.path, value).catch((error) => {
            console.error('Failed to write file:', error);
          });
        }
      }
    },
    [currentFile, webcontainerReady]
  );

  const handleRunCode = async () => {
    if (!selectedProject || !webcontainerReady) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please load a project first",
      });
      return;
    }

    setIsRunning(true);
    writelnTerminal('\r\n▶ Running project...');

    try {
      const hasPackageJson = files.some((f) => f.path === 'package.json');

      if (hasPackageJson) {
        writelnTerminal('📦 Installing dependencies...\r\n');
        const exitCode = await installDependencies((data) => {
          writeTerminal(data);
        });

        if (exitCode !== 0) {
          writelnTerminal(`\r\n✗ npm install failed with code ${exitCode}\r\n`);
          setIsRunning(false);
          return;
        }
        writelnTerminal('\r\n✓ Dependencies installed\r\n');
      }

      const mainFile = currentFile?.path || 'index.js';
      writelnTerminal(`🚀 Executing ${mainFile}...\r\n`);

      const process = await runCommand('node', [mainFile], (data) => {
        writeTerminal(data);
      });

      const exitCode = await process.exit;
      writelnTerminal(`\r\n${exitCode === 0 ? '✓' : '✗'} Process exited with code ${exitCode}\r\n`);
    } catch (error) {
      console.error('Execution error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      writelnTerminal(`\r\n✗ Error: ${errorMsg}\r\n`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStartDevServer = async () => {
    if (!selectedProject || !webcontainerReady) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please load a project first",
      });
      return;
    }

    setIsRunning(true);
    writelnTerminal('\r\n🚀 Starting dev server...\r\n');

    try {
      const hasPackageJson = files.some((f) => f.path === 'package.json');
      if (!hasPackageJson) {
        writelnTerminal('✗ No package.json found\r\n');
        setIsRunning(false);
        return;
      }

      await startDevServer(
        (data) => {
          writeTerminal(data);
        },
        (port, url) => {
          setPreviewUrl(url);
          writelnTerminal(`\r\n✓ Dev server ready at ${url}\r\n`);
          toast({
            title: "Dev Server Ready",
            description: `Server running on port ${port}`,
          });
        }
      );
    } catch (error) {
      console.error('Dev server error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      writelnTerminal(`\r\n✗ Dev server error: ${errorMsg}\r\n`);
      setIsRunning(false);
    }
  };

  const handleStopCode = () => {
    setIsRunning(false);
    setPreviewUrl('');
    writelnTerminal('\r\n⏸ Execution stopped\r\n');
  };

  const saveProjectMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProject) throw new Error('No project selected');

      return await apiRequest(`/api/projects/${selectedProject.id}`, "PATCH", {
        files: files,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project saved",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save project. Please try again.",
      });
    },
  });

  const handleAIAssist = async () => {
    if (!currentFile) return;

    writelnTerminal('\r\n🤖 AI analyzing your code...\r\n');
    toast({
      title: "AI Assistant",
      description: "Code analysis coming soon! (Integrating OpenAI GPT-4)",
    });
  };

  const handleTerminalCommand = useCallback(
    async (cmd: string) => {
      if (!webcontainerReady) {
        writelnTerminal('✗ WebContainer not ready\r\n');
        return;
      }

      try {
        const [command, ...args] = cmd.split(' ');
        const process = await runCommand(command, args, (data) => {
          writeTerminal(data);
        });
        await process.exit;
        writelnTerminal('');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        writelnTerminal(`\r\n✗ Error: ${errorMsg}\r\n`);
      }
    },
    [webcontainerReady, writeTerminal, writelnTerminal]
  );

  if (webcontainerError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-bold mb-2">WebContainer Not Available</h2>
          <p className="text-muted-foreground mb-4">
            Code execution requires cross-origin isolation. This feature may not work in all environments.
          </p>
          <p className="text-sm text-muted-foreground">{webcontainerError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-card p-2 flex items-center gap-2">
        <select
          className="border rounded px-3 py-1.5 bg-background"
          value={selectedProject?.id || ''}
          onChange={(e) => {
            const project = projects.find((p) => p.id === e.target.value);
            if (project) loadProject(project);
          }}
          data-testid="select-project"
        >
          <option value="">Select Project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        <Button
          size="sm"
          variant="outline"
          onClick={handleAIAssist}
          data-testid="button-ai-assist"
        >
          <Sparkles className="w-4 h-4 mr-1" />
          AI Assist
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => saveProjectMutation.mutate()}
          disabled={!selectedProject || saveProjectMutation.isPending}
          data-testid="button-save"
        >
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleStartDevServer}
          disabled={!selectedProject || !webcontainerReady || isRunning}
          data-testid="button-dev-server"
        >
          <Globe className="w-4 h-4 mr-1" />
          Dev Server
        </Button>

        {isRunning ? (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleStopCode}
            data-testid="button-stop"
          >
            <Square className="w-4 h-4 mr-1" />
            Stop
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleRunCode}
            disabled={!selectedProject || !webcontainerReady}
            data-testid="button-run"
          >
            <Play className="w-4 h-4 mr-1" />
            Run
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={15} minSize={10}>
            <div className="h-full border-r bg-card/50 p-2">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
                <FolderOpen className="w-4 h-4" />
                Files
              </h3>
              <div className="space-y-1">
                {files.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setCurrentFile(file)}
                    className={`w-full text-left text-sm px-2 py-1 rounded hover-elevate flex items-center gap-1 ${
                      currentFile?.path === file.path ? 'bg-accent' : ''
                    }`}
                    data-testid={`file-${file.path}`}
                  >
                    <FileCode className="w-3 h-3" />
                    {file.name}
                  </button>
                ))}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={60}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={70}>
                <div className="h-full bg-[#1e1e1e]">
                  {currentFile ? (
                    <Editor
                      height="100%"
                      language={currentFile.language}
                      value={currentFile.content}
                      onChange={handleEditorChange}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        wordWrap: "on",
                        automaticLayout: true,
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: true,
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <FileCode className="w-12 h-12 mx-auto mb-2" />
                        <p>Select a file to edit</p>
                      </div>
                    </div>
                  )}
                </div>
              </ResizablePanel>

              <ResizableHandle />

              <ResizablePanel defaultSize={30} minSize={20}>
                <Tabs defaultValue="terminal" className="h-full flex flex-col">
                  <TabsList className="w-full justify-start rounded-none border-b">
                    <TabsTrigger value="terminal" className="gap-1">
                      <TerminalIcon className="w-3 h-3" />
                      Terminal
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="gap-1">
                      <Globe className="w-3 h-3" />
                      Preview
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="terminal" className="flex-1 m-0">
                    <Terminal ref={terminalRef} onCommand={handleTerminalCommand} />
                  </TabsContent>

                  <TabsContent value="preview" className="flex-1 m-0 bg-white">
                    {previewUrl ? (
                      <iframe
                        src={previewUrl}
                        className="w-full h-full border-0"
                        title="Preview"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <Globe className="w-12 h-12 mx-auto mb-2" />
                          <p>Start a dev server to see preview</p>
                          <p className="text-sm mt-2">
                            Click "Dev Server" button to start
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
