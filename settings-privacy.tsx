import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Shield, Download, Trash2, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface DeletionPreview {
  email: string;
  username: string;
  deletion: {
    profile: number;
    videos: number;
    projects: number;
    messages: number;
    transactions: number;
    following: number;
    followers: number;
    totalDataPoints: number;
  };
  warning: string;
}

export default function SettingsPrivacy() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State for data export
  const [exportPassword, setExportPassword] = useState("");
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  
  // State for account deletion
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Fetch deletion preview
  const { data: deletionPreview } = useQuery<DeletionPreview>({
    queryKey: ["/api/gdpr/deletion-preview"],
    enabled: showDeleteDialog,
  });

  // Export data mutation
  const exportMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await fetch("/api/gdpr/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to export data");
      }

      // Get the JSON blob
      const blob = await response.blob();
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+?)"/);
      const filename = filenameMatch?.[1] || `profithack_data_export_${Date.now()}.json`;

      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Data Export Successful",
        description: "Your complete data archive has been downloaded.",
      });
      setExportPassword("");
      setShowExportConfirm(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete account mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ password, confirmation }: { password: string; confirmation: string }) => {
      return await apiRequest("/api/gdpr/delete-account", "POST", { password, confirmation });
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
      });
      
      // Redirect to home page after deletion
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExportData = () => {
    if (!exportPassword.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter your password to confirm data export.",
        variant: "destructive",
      });
      return;
    }
    exportMutation.mutate(exportPassword);
  };

  const handleDeleteAccount = () => {
    if (!deletePassword.trim() || deleteConfirmation !== "DELETE MY ACCOUNT") {
      toast({
        title: "Confirmation Required",
        description: "Please enter your password and type 'DELETE MY ACCOUNT' exactly.",
        variant: "destructive",
      });
      return;
    }
    deleteMutation.mutate({ password: deletePassword, confirmation: deleteConfirmation });
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Privacy & Data Rights</h1>
          <p className="text-muted-foreground">GDPR-compliant data management</p>
        </div>
      </div>

      {/* Data Export Section */}
      <Card data-testid="card-data-export">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            <CardTitle>Download Your Data</CardTitle>
          </div>
          <CardDescription>
            Export a complete archive of all your data in JSON format. This includes your profile, 
            videos, projects, messages, transactions, and all other personal information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle2 className="w-4 h-4" />
            <AlertDescription>
              <strong>GDPR Right to Access:</strong> You have the right to receive a copy of your personal 
              data in a structured, commonly used, and machine-readable format.
            </AlertDescription>
          </Alert>

          {!showExportConfirm ? (
            <Button 
              onClick={() => setShowExportConfirm(true)}
              className="w-full"
              data-testid="button-export-data"
            >
              <Download className="w-4 h-4 mr-2" />
              Export My Data
            </Button>
          ) : (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="export-password">Confirm Your Password</Label>
                <Input
                  id="export-password"
                  type="password"
                  placeholder="Enter your password"
                  value={exportPassword}
                  onChange={(e) => setExportPassword(e.target.value)}
                  disabled={exportMutation.isPending}
                  data-testid="input-export-password"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleExportData}
                  disabled={exportMutation.isPending || !exportPassword.trim()}
                  className="flex-1"
                  data-testid="button-confirm-export"
                >
                  {exportMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Export
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowExportConfirm(false);
                    setExportPassword("");
                  }}
                  disabled={exportMutation.isPending}
                  data-testid="button-cancel-export"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Deletion Section */}
      <Card className="border-destructive/50" data-testid="card-delete-account">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            <CardTitle className="text-destructive">Delete My Account</CardTitle>
          </div>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>WARNING:</strong> This will permanently delete your account, profile, videos, 
              projects, messages, transactions, and all other data. This action is irreversible.
            </AlertDescription>
          </Alert>

          <Alert>
            <CheckCircle2 className="w-4 h-4" />
            <AlertDescription>
              <strong>GDPR Right to Erasure:</strong> You have the right to request deletion of your 
              personal data at any time.
            </AlertDescription>
          </Alert>

          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="w-full"
            data-testid="button-delete-account"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete My Account
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-lg" data-testid="dialog-delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Permanently Delete Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              {deletionPreview && (
                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-semibold">The following will be deleted:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Profile: {deletionPreview.email}</li>
                    <li>• Videos: {deletionPreview.deletion.videos}</li>
                    <li>• Projects: {deletionPreview.deletion.projects}</li>
                    <li>• Messages: {deletionPreview.deletion.messages}</li>
                    <li>• Transactions: {deletionPreview.deletion.transactions}</li>
                    <li>• Following: {deletionPreview.deletion.following}</li>
                    <li>• Followers: {deletionPreview.deletion.followers}</li>
                  </ul>
                  <p className="font-semibold text-destructive pt-2">
                    Total: {deletionPreview.deletion.totalDataPoints} data points
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="delete-password">Confirm Your Password</Label>
                  <Input
                    id="delete-password"
                    type="password"
                    placeholder="Enter your password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    disabled={deleteMutation.isPending}
                    data-testid="input-delete-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delete-confirmation">
                    Type <span className="font-mono font-bold">DELETE MY ACCOUNT</span> to confirm
                  </Label>
                  <Input
                    id="delete-confirmation"
                    type="text"
                    placeholder="DELETE MY ACCOUNT"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    disabled={deleteMutation.isPending}
                    data-testid="input-delete-confirmation"
                  />
                </div>
              </div>

              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription className="text-xs">
                  This action is <strong>IRREVERSIBLE</strong>. All your data will be permanently 
                  deleted and cannot be recovered.
                </AlertDescription>
              </Alert>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={deleteMutation.isPending}
              data-testid="button-cancel-delete"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
              disabled={
                deleteMutation.isPending || 
                !deletePassword.trim() || 
                deleteConfirmation !== "DELETE MY ACCOUNT"
              }
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Permanently Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
