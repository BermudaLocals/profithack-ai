import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, 
  Sparkles, Gift, Crown, TrendingUp, History, DollarSign,
  CheckCircle, Clock, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface WalletData {
  credits: number;
  pendingCredits: number;
  totalEarned: number;
  totalSpent: number;
}

interface Transaction {
  id: string;
  type: 'purchase' | 'gift_sent' | 'gift_received' | 'subscription' | 'tip' | 'withdrawal';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  metadata?: {
    from?: string;
    to?: string;
    giftName?: string;
  };
}

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  { id: "starter", credits: 100, price: 0.99 },
  { id: "basic", credits: 500, price: 4.99, bonus: 50 },
  { id: "popular", credits: 1000, price: 9.99, bonus: 150, popular: true },
  { id: "pro", credits: 2500, price: 19.99, bonus: 500 },
  { id: "mega", credits: 5000, price: 39.99, bonus: 1500 },
  { id: "ultimate", credits: 10000, price: 79.99, bonus: 4000 },
];

export default function CreatorWallet() {
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const { toast } = useToast();

  const { data: wallet, isLoading } = useQuery<WalletData>({
    queryKey: ['/api/wallet'],
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['/api/wallet/transactions'],
  });

  const purchaseMutation = useMutation({
    mutationFn: (packageId: string) => apiRequest('/api/wallet/purchase', "POST", { packageId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      toast({ title: "Credits Added!", description: "Your credits have been added to your wallet" });
      setShowBuyCredits(false);
    },
    onError: () => {
      toast({ title: "Purchase Failed", description: "Please try again", variant: "destructive" });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (amount: number) => apiRequest('/api/wallet/withdraw', "POST", { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      toast({ title: "Withdrawal Requested", description: "Your withdrawal is being processed" });
      setShowWithdraw(false);
      setWithdrawAmount("");
    },
    onError: () => {
      toast({ title: "Withdrawal Failed", description: "Please try again", variant: "destructive" });
    },
  });

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'purchase': return <CreditCard className="w-4 h-4 text-green-400" />;
      case 'gift_sent': return <Gift className="w-4 h-4 text-pink-400" />;
      case 'gift_received': return <Gift className="w-4 h-4 text-yellow-400" />;
      case 'subscription': return <Crown className="w-4 h-4 text-purple-400" />;
      case 'tip': return <Sparkles className="w-4 h-4 text-blue-400" />;
      case 'withdrawal': return <ArrowUpRight className="w-4 h-4 text-orange-400" />;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500/20 text-green-400 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'pending': return <Badge className="bg-yellow-500/20 text-yellow-400 text-xs"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed': return <Badge className="bg-red-500/20 text-red-400 text-xs"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 pb-24" data-testid="creator-wallet">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Wallet className="w-7 h-7 text-pink-500" />
        My Wallet
      </h1>

      <Card className="bg-gradient-to-br from-pink-500/20 via-purple-600/20 to-cyan-500/20 border-pink-500/30 p-6 mb-6">
        <div className="text-center mb-6">
          <p className="text-gray-400 text-sm mb-1">Available Credits</p>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <span className="text-5xl font-bold text-white">{wallet?.credits?.toLocaleString() ?? 0}</span>
          </div>
          {wallet?.pendingCredits && wallet.pendingCredits > 0 && (
            <p className="text-yellow-400 text-sm mt-2">
              <Clock className="w-3 h-3 inline mr-1" />
              {wallet.pendingCredits.toLocaleString()} credits pending
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-black/30 rounded-lg">
            <ArrowDownLeft className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-white font-bold">{wallet?.totalEarned?.toLocaleString() ?? 0}</p>
            <p className="text-gray-400 text-xs">Total Earned</p>
          </div>
          <div className="text-center p-3 bg-black/30 rounded-lg">
            <ArrowUpRight className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-white font-bold">{wallet?.totalSpent?.toLocaleString() ?? 0}</p>
            <p className="text-gray-400 text-xs">Total Spent</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            onClick={() => setShowBuyCredits(true)}
            data-testid="button-buy-credits"
          >
            <Plus className="w-4 h-4 mr-2" /> Buy Credits
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-green-500 text-green-400 hover:bg-green-500/10"
            onClick={() => setShowWithdraw(true)}
            data-testid="button-withdraw"
          >
            <DollarSign className="w-4 h-4 mr-2" /> Cash Out
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4 bg-white/5 border-white/10">
          <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
          <p className="text-2xl font-bold text-white">$0.01</p>
          <p className="text-gray-400 text-xs">= 1 Credit</p>
        </Card>
        <Card className="p-4 bg-white/5 border-white/10">
          <Gift className="w-6 h-6 text-pink-400 mb-2" />
          <p className="text-2xl font-bold text-white">55%</p>
          <p className="text-gray-400 text-xs">Creator Earnings</p>
        </Card>
      </div>

      <Tabs defaultValue="history" className="mt-6">
        <TabsList className="w-full bg-white/5 p-1 rounded-lg">
          <TabsTrigger value="history" className="flex-1 data-[state=active]:bg-pink-500/20">
            <History className="w-4 h-4 mr-2" /> History
          </TabsTrigger>
          <TabsTrigger value="gifts" className="flex-1 data-[state=active]:bg-pink-500/20">
            <Gift className="w-4 h-4 mr-2" /> Gifts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <div className="space-y-3">
            {transactions?.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No transactions yet</p>
              </div>
            ) : (
              transactions?.map((tx) => (
                <Card key={tx.id} className="p-4 bg-white/5 border-white/10" data-testid={`transaction-${tx.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{tx.description}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-bold",
                        tx.type === 'gift_received' || tx.type === 'subscription' || tx.type === 'tip' 
                          ? "text-green-400" 
                          : "text-red-400"
                      )}>
                        {tx.type === 'gift_received' || tx.type === 'subscription' || tx.type === 'tip' ? '+' : '-'}
                        {tx.amount.toLocaleString()}
                      </p>
                      {getStatusBadge(tx.status)}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="gifts" className="mt-4">
          <div className="text-center py-8 text-gray-400">
            <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Gift history coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showBuyCredits} onOpenChange={setShowBuyCredits}>
        <DialogContent className="bg-black/95 border-pink-500/20 max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-center text-xl">Buy Credits</DialogTitle>
            <DialogDescription className="text-gray-400 text-center">
              Use credits to send gifts, unlock content, and subscribe to creators
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 p-2">
            {CREDIT_PACKAGES.map((pkg) => (
              <motion.div
                key={pkg.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative p-4 rounded-xl cursor-pointer border-2 transition-all",
                  selectedPackage?.id === pkg.id 
                    ? "border-pink-500 bg-pink-500/10" 
                    : "border-white/10 bg-white/5 hover:border-white/30"
                )}
                onClick={() => setSelectedPackage(pkg)}
                data-testid={`package-${pkg.id}`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs">
                    BEST VALUE
                  </Badge>
                )}
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{pkg.credits.toLocaleString()}</p>
                  {pkg.bonus && (
                    <p className="text-green-400 text-xs">+{pkg.bonus} bonus</p>
                  )}
                  <p className="text-pink-400 font-bold mt-2">${pkg.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-3 p-2">
            <Button
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300"
              onClick={() => setShowBuyCredits(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600"
              disabled={!selectedPackage || purchaseMutation.isPending}
              onClick={() => selectedPackage && purchaseMutation.mutate(selectedPackage.id)}
              data-testid="button-confirm-purchase"
            >
              {purchaseMutation.isPending ? "Processing..." : `Buy for $${selectedPackage?.price || 0}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogContent className="bg-black/95 border-pink-500/20 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-center text-xl">Withdraw Earnings</DialogTitle>
            <DialogDescription className="text-gray-400 text-center">
              Minimum withdrawal: 1,000 credits ($10)
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Amount (credits)</label>
              <Input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="bg-white/5 border-white/10 text-white"
                data-testid="input-withdraw-amount"
              />
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Available:</span>
                <span className="text-white">{wallet?.credits?.toLocaleString() ?? 0} credits</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-400">You'll receive:</span>
                <span className="text-green-400 font-bold">
                  ${((parseInt(withdrawAmount) || 0) * 0.0055).toFixed(2)}
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-2">55% creator share • 45% platform fee</p>
            </div>
          </div>
          <div className="flex gap-3 p-2">
            <Button
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300"
              onClick={() => setShowWithdraw(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-green-500 hover:bg-green-600"
              disabled={!withdrawAmount || parseInt(withdrawAmount) < 1000 || withdrawMutation.isPending}
              onClick={() => withdrawMutation.mutate(parseInt(withdrawAmount))}
              data-testid="button-confirm-withdraw"
            >
              {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
