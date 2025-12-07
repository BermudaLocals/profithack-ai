import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LinkIcon, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Copy, 
  Trash2,
  Webhook,
  Database,
  Settings as SettingsIcon
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CRMSettings() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [locationId, setLocationId] = useState("");
  const [syncSettings, setSyncSettings] = useState({
    syncLeads: true,
    syncContacts: true,
    syncOpportunities: false,
    autoCreateContacts: true,
  });

  // Get existing CRM connections
  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['/api/crm/connections'],
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/crm/test-connection', {
        method: 'POST',
        body: JSON.stringify({ apiKey, locationId }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "✅ Connection successful!",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Connection failed",
        description: error.message || "Could not connect to GoHighLevel",
        variant: "destructive",
      });
    }
  });

  // Connect CRM mutation
  const connectMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/crm/connect', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'gohighlevel',
          apiKey,
          locationId,
          config: syncSettings
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "✅ GoHighLevel connected!",
        description: "Your CRM is now syncing with PROFITHACK AI",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/connections'] });
      setApiKey("");
      setLocationId("");
    },
    onError: (error: any) => {
      toast({
        title: "❌ Connection failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      return apiRequest(`/api/crm/connections/${connectionId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ CRM disconnected",
        description: "Your CRM integration has been removed",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/connections'] });
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copied!",
      description: "Webhook URL copied to clipboard",
    });
  };

  const ghlConnection = connections.find((c: any) => c.provider === 'gohighlevel');

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">CRM Integration</h1>
        <p className="text-muted-foreground">
          Connect your GoHighLevel Lead Connector to sync contacts, leads, and opportunities with your marketing bots
        </p>
      </div>

      <Tabs defaultValue="connect" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connect" data-testid="tab-connect">
            <LinkIcon className="w-4 h-4 mr-2" />
            Connect
          </TabsTrigger>
          <TabsTrigger value="webhooks" data-testid="tab-webhooks">
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="sync" data-testid="tab-sync">
            <Database className="w-4 h-4 mr-2" />
            Sync Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connect" className="space-y-4">
          {ghlConnection ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      GoHighLevel Connected
                    </CardTitle>
                    <CardDescription>
                      Location ID: {ghlConnection.locationId}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Synced</p>
                    <p className="text-2xl font-bold">{ghlConnection.totalSynced || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Synced</p>
                    <p className="font-medium">
                      {ghlConnection.lastSyncedAt 
                        ? new Date(ghlConnection.lastSyncedAt).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="destructive"
                  onClick={() => disconnectMutation.mutate(ghlConnection.id)}
                  disabled={disconnectMutation.isPending}
                  data-testid="button-disconnect-crm"
                >
                  {disconnectMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Disconnect GoHighLevel
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Connect GoHighLevel</CardTitle>
                <CardDescription>
                  Enter your API key and location ID to sync your CRM with PROFITHACK AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your GoHighLevel API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    data-testid="input-api-key"
                  />
                  <p className="text-xs text-muted-foreground">
                    Get your API key from Settings → API in your GoHighLevel account
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location-id">Location ID</Label>
                  <Input
                    id="location-id"
                    placeholder="Enter your sub-account location ID"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    data-testid="input-location-id"
                  />
                  <p className="text-xs text-muted-foreground">
                    Find this in your GoHighLevel sub-account settings
                  </p>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => testConnectionMutation.mutate()}
                    disabled={!apiKey || !locationId || testConnectionMutation.isPending}
                    data-testid="button-test-connection"
                  >
                    {testConnectionMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </Button>

                  <Button
                    onClick={() => connectMutation.mutate()}
                    disabled={!apiKey || !locationId || connectMutation.isPending}
                    data-testid="button-connect-crm"
                  >
                    {connectMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Connect GoHighLevel
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>What gets synced?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                  <span>New leads from your marketing bots automatically create contacts in GHL</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                  <span>User profiles sync with contact custom fields</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                  <span>Opportunities created in your pipeline when users subscribe</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                  <span>Tags applied automatically (PROFITHACK User, etc.)</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Configure these webhooks in your GoHighLevel account for two-way sync
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Inbound Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={ghlConnection?.inboundWebhookUrl || 'Connect GoHighLevel to generate webhook URL'}
                    readOnly
                    className="flex-1"
                    data-testid="text-webhook-url"
                  />
                  {ghlConnection && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(ghlConnection.inboundWebhookUrl)}
                      data-testid="button-copy-webhook"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Add this URL as an outbound webhook in GoHighLevel to receive contact/opportunity updates
                </p>
              </div>

              {ghlConnection && (
                <div className="space-y-2">
                  <Label>Webhook Secret</Label>
                  <Input
                    value={ghlConnection.webhookSecret}
                    readOnly
                    type="password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use this secret to verify webhook signatures (optional but recommended)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
              <CardDescription>
                Configure what data gets synced between PROFITHACK and GoHighLevel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sync Leads</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically create contacts from bot-generated leads
                  </p>
                </div>
                <Switch
                  checked={syncSettings.syncLeads}
                  onCheckedChange={(checked) => 
                    setSyncSettings(prev => ({ ...prev, syncLeads: checked }))
                  }
                  data-testid="switch-sync-leads"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Sync Contacts</Label>
                  <p className="text-sm text-muted-foreground">
                    Keep user profiles in sync with GHL contacts
                  </p>
                </div>
                <Switch
                  checked={syncSettings.syncContacts}
                  onCheckedChange={(checked) => 
                    setSyncSettings(prev => ({ ...prev, syncContacts: checked }))
                  }
                  data-testid="switch-sync-contacts"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Create Opportunities</Label>
                  <p className="text-sm text-muted-foreground">
                    Create pipeline opportunities when users subscribe
                  </p>
                </div>
                <Switch
                  checked={syncSettings.syncOpportunities}
                  onCheckedChange={(checked) => 
                    setSyncSettings(prev => ({ ...prev, syncOpportunities: checked }))
                  }
                  data-testid="switch-sync-opportunities"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Create Contacts</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically create new contacts for new users
                  </p>
                </div>
                <Switch
                  checked={syncSettings.autoCreateContacts}
                  onCheckedChange={(checked) => 
                    setSyncSettings(prev => ({ ...prev, autoCreateContacts: checked }))
                  }
                  data-testid="switch-auto-create"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={!ghlConnection}
                data-testid="button-save-settings"
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
