import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema } from "@shared/schema";
import type { Project } from "@shared/schema";
import { z } from "zod";
import { Plus, Save, Trash2, FileCode, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileNode {
  name: string;
  path: string;
  content: string;
  language: string;
}

const LANGUAGE_OPTIONS = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
];

const createProjectFormSchema = insertProjectSchema.extend({
  name: z.string().min(1, "Project name is required"),
  language: z.string().min(1, "Language is required"),
});

export default function Workspace() {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentFile, setCurrentFile] = useState<FileNode | null>(null);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof createProjectFormSchema>>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      language: "javascript",
      isPublic: true,
      files: [],
    },
  });

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createProjectFormSchema>) => {
      const initialFile: FileNode = {
        name: "index." + getFileExtension(data.language),
        path: "index." + getFileExtension(data.language),
        content: getStarterCode(data.language),
        language: data.language,
      };

      return await apiRequest("/api/projects", "POST", {
        ...data,
        files: [initialFile],
      });
    },
    onSuccess: (project: Project) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
      });
      setDialogOpen(false);
      form.reset();
      loadProject(project);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create project. Please try again.",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({
      id,
      files,
    }: {
      id: string;
      files: FileNode[];
    }) => {
      return await apiRequest(`/api/projects/${id}`, "PUT", { files });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project saved",
        description: "Your changes have been saved.",
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

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/projects/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully.",
      });
      setSelectedProject(null);
      setFiles([]);
      setCurrentFile(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete project. Please try again.",
      });
    },
  });

  function getFileExtension(language: string): string {
    const extensions: Record<string, string> = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      cpp: "cpp",
      csharp: "cs",
      go: "go",
      rust: "rs",
      html: "html",
      css: "css",
      json: "json",
    };
    return extensions[language] || "txt";
  }

  function getStarterCode(language: string): string {
    const starters: Record<string, string> = {
      javascript: '// Welcome to your JavaScript project\nconsole.log("Hello, CreatorVerse!");',
      typescript: '// Welcome to your TypeScript project\nconsole.log("Hello, CreatorVerse!");',
      python: '# Welcome to your Python project\nprint("Hello, CreatorVerse!")',
      java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CreatorVerse!");\n    }\n}',
      cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, CreatorVerse!" << std::endl;\n    return 0;\n}',
      html: '<!DOCTYPE html>\n<html>\n<head>\n    <title>CreatorVerse Project</title>\n</head>\n<body>\n    <h1>Hello, CreatorVerse!</h1>\n</body>\n</html>',
      css: '/* Your styles here */\nbody {\n    font-family: sans-serif;\n    margin: 0;\n    padding: 20px;\n}',
    };
    return starters[language] || "// Start coding!";
  }

  function loadProject(project: Project) {
    setSelectedProject(project);
    const projectFiles = (project.files as FileNode[]) || [];
    setFiles(projectFiles);
    if (projectFiles.length > 0) {
      setCurrentFile(projectFiles[0]);
    }
  }

  function handleEditorChange(value: string | undefined) {
    if (!currentFile) return;

    const updatedFile = { ...currentFile, content: value || "" };
    setCurrentFile(updatedFile);

    const updatedFiles = files.map((f) =>
      f.path === currentFile.path ? updatedFile : f
    );
    setFiles(updatedFiles);
  }

  function saveProject() {
    if (!selectedProject) return;
    updateProjectMutation.mutate({ id: selectedProject.id, files });
  }

  function addNewFile() {
    if (!selectedProject) return;

    const fileNumber = files.length + 1;
    const ext = getFileExtension(selectedProject.language);
    const newFile: FileNode = {
      name: `file${fileNumber}.${ext}`,
      path: `file${fileNumber}.${ext}`,
      content: getStarterCode(selectedProject.language),
      language: selectedProject.language,
    };

    setFiles([...files, newFile]);
    setCurrentFile(newFile);
  }

  function deleteCurrentFile() {
    if (!currentFile || files.length <= 1) {
      toast({
        variant: "destructive",
        title: "Cannot delete",
        description: "Projects must have at least one file.",
      });
      return;
    }

    const updatedFiles = files.filter((f) => f.path !== currentFile.path);
    setFiles(updatedFiles);
    setCurrentFile(updatedFiles[0]);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Workspace</h1>
            <p className="text-muted-foreground">
              Create and manage your code projects
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="button-create-project"
                className="bg-gradient-to-r from-cyan-500 to-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Start a new coding project in your workspace
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) =>
                    createProjectMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="My Awesome Project"
                            data-testid="input-project-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What does this project do?"
                            data-testid="input-project-description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-language">
                              <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LANGUAGE_OPTIONS.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="submit"
                      data-testid="button-submit-project"
                      disabled={createProjectMutation.isPending}
                    >
                      {createProjectMutation.isPending
                        ? "Creating..."
                        : "Create Project"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <Code2 className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">No projects yet</h3>
                <p className="text-muted-foreground max-w-md">
                  Get started by creating your first project. Choose a language
                  and start coding!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="hover-elevate cursor-pointer"
                onClick={() => loadProject(project)}
                data-testid={`card-project-${project.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-cyan-400" />
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {project.language}
                    </span>
                    <span className="text-muted-foreground">
                      {((project.files as FileNode[]) || []).length} files
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedProject(null);
              setFiles([]);
              setCurrentFile(null);
            }}
            data-testid="button-back-to-projects"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            All Projects
          </Button>
          <div>
            <h2 className="font-semibold">{selectedProject.name}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedProject.language}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addNewFile}
            data-testid="button-add-file"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add File
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={saveProject}
            disabled={updateProjectMutation.isPending}
            data-testid="button-save-project"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateProjectMutation.isPending ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (
                confirm("Are you sure you want to delete this project?")
              ) {
                deleteProjectMutation.mutate(selectedProject.id);
              }
            }}
            data-testid="button-delete-project"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* File list */}
        <div className="w-48 border-r border-border overflow-y-auto">
          <div className="p-2 space-y-1">
            {files.map((file) => (
              <button
                key={file.path}
                onClick={() => setCurrentFile(file)}
                className={`w-full text-left px-3 py-2 rounded text-sm hover-elevate ${
                  currentFile?.path === file.path
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
                data-testid={`button-file-${file.name}`}
              >
                <FileCode className="w-3 h-3 inline mr-2" />
                {file.name}
              </button>
            ))}
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 flex flex-col">
          {currentFile && (
            <>
              <div className="border-b border-border p-2 flex items-center justify-between">
                <span className="text-sm font-medium">{currentFile.name}</span>
                {files.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={deleteCurrentFile}
                    data-testid="button-delete-file"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="flex-1">
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
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
