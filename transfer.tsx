import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowRight, Coins, CreditCard, History, Info, Send, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TransferHistory {
  id: string;
  senderId: string;
  recipientId: string;
  amount: number;
  currency: string;
  fee: number;
  netAmount: number;
  status: string;
  message: string | null;
  createdAt: string;
}

export default function TransferPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [recipientUsername, setRecipientUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("credits");
  const [message, setMessage] = useState("");

  // Calculate fees (5% from sender + 5% from receiver)
  const FEE_PERCENTAGE = 0.05;
  const amountNum = parseInt(amount) || 0;
  const senderFee = Math.ceil(amountNum * FEE_PERCENTAGE);
  const receiverFee = Math.ceil(amountNum * FEE_PERCENTAGE);
  const totalPaid = amountNum + senderFee;
  const netAmount = amountNum - receiverFee;
  const totalPlatformFee = senderFee + receiverFee;

  const { data: history = [] } = useQuery<TransferHistory[]>({
    queryKey: ["/api/transfers/history"],
  });

  const transferMutation = useMutation({
    mutationFn: async (data: { recipientUsername: string; amount: number; currency: string; message?: string }) => {
      const response = await fetch("/api/transfers/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Transfer Successful! 💸",
        description: `Sent ${amountNum} ${currency} to @${recipientUsername}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transfers/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Reset form
      setRecipientUsername("");
      setAmount("");
      setMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Transfer Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientUsername || !amount) {
      toast({
        title: "Missing Information",
        description: "Please enter a recipient and amount",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    transferMutation.mutate({
      recipientUsername,
      amount: amountNum,
      currency,
      message,
    });
  };

  const isExplorer = user?.subscriptionTier === "explorer";

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent">
            Send Money
          </h1>
          <p className="text-muted-foreground">
            Transfer coins or credits to other users
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Your Balance</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="font-bold">{user?.coins || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-bold">{user?.credits || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isExplorer && (
        <Card className="border-yellow-400/50 bg-yellow-400/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-yellow-400" />
              Subscriber-Only Feature
            </CardTitle>
            <CardDescription>
              You must be a subscriber (Starter, Creator, or Innovator tier) to send transfers.
              Upgrade your plan to unlock this feature!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild data-testid="button-upgrade">
              <a href="/coins">Upgrade Plan</a>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Transfer Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Transfer
            </CardTitle>
            <CardDescription>
              Transfer coins or credits to another user (5% sender fee + 5% receiver fee = 10% total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Username</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                  <Input
                    id="recipient"
                    placeholder="username"
                    value={recipientUsername}
                    onChange={(e) => setRecipientUsername(e.target.value.replace("@", ""))}
                    className="pl-7"
                    disabled={isExplorer}
                    data-testid="input-recipient"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency} disabled={isExplorer}>
                  <SelectTrigger data-testid="select-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credits" data-testid="option-credits">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <span>Credits</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="coins" data-testid="option-coins">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span>Coins</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isExplorer}
                  data-testid="input-amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a note..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isExplorer}
                  data-testid="input-message"
                />
              </div>

              {amountNum > 0 && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Transfer Amount:</span>
                      <span className="font-medium">{amountNum} {currency}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sender Fee (5%):</span>
                      <span className="font-medium text-yellow-600">-{senderFee} {currency}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Receiver Fee (5%):</span>
                      <span className="font-medium text-yellow-600">-{receiverFee} {currency}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-red-400">You Pay:</span>
                      <span className="font-bold text-red-400">{totalPaid} {currency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Recipient Gets:</span>
                      <span className="font-bold text-primary">{netAmount} {currency}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>Total Platform Fee:</span>
                      <span>{totalPlatformFee} {currency} (10%)</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isExplorer || transferMutation.isPending}
                data-testid="button-send"
              >
                {transferMutation.isPending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Transfer
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Transfer History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Transfers
            </CardTitle>
            <CardDescription>Your sending and receiving history</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No transfers yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {history.map((transfer) => {
                  const isSender = transfer.senderId === user?.id;
                  return (
                    <div
                      key={transfer.id}
                      className="p-3 rounded-lg border hover-elevate"
                      data-testid={`transfer-${transfer.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isSender ? (
                            <Badge variant="destructive">Sent</Badge>
                          ) : (
                            <Badge className="bg-green-500">Received</Badge>
                          )}
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {transfer.currency === "coins" ? (
                              <Coins className="w-3 h-3" />
                            ) : (
                              <Zap className="w-3 h-3" />
                            )}
                            <span className="font-medium">
                              {isSender ? `-${transfer.amount}` : `+${transfer.netAmount}`} {transfer.currency}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(transfer.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {transfer.message && (
                        <p className="text-sm text-muted-foreground mb-2">"{transfer.message}"</p>
                      )}

                      {isSender && (
                        <div className="text-xs text-muted-foreground">
                          Fee: {transfer.fee} {transfer.currency}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
