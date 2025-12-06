import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Sparkles, 
  TrendingUp, 
  Lock, 
  CheckCircle2, 
  ShoppingCart,
  Star,
  Zap,
  Brain,
  Rocket,
  DollarSign,
  Users,
  Gift,
  Crown,
  Target,
  TrendingDown,
} from "lucide-react";

type MarketplaceProduct = {
  id: string;
  title: string;
  description: string;
  longDescription: string | null;
  productType: string;
  category: string;
  priceCredits: number;
  originalPriceCredits: number | null;
  features: string[] | null;
  benefits: string[] | null;
  conversionRate: string | null;
  earningsPotential: string | null;
  totalSales: number;
  isFeatured: boolean;
  isEvergreen: boolean;
};

export default function TemplateMarketplace() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("credits");

  // Fetch all marketplace products
  const { data: products = [], isLoading } = useQuery<MarketplaceProduct[]>({
    queryKey: ["/api/marketplace/products", selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== "all" ? `?category=${selectedCategory}` : "";
      const res = await fetch(`/api/marketplace/products${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  // Fetch user's purchased products
  const { data: myProducts = [] } = useQuery({
    queryKey: ["/api/marketplace/my-products"],
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest(`/api/marketplace/products/${productId}/purchase`, "POST", {});
    },
    onSuccess: (data) => {
      const title = data.promotion ? "🎁 Purchase Successful + FREE BONUS!" : "Purchase Successful! 🎉";
      const description = data.promotion 
        ? `${data.promotion.message} You now have ${data.creditsRemaining} total credits!`
        : `You now own this template. ${data.creditsRemaining} credits remaining.`;
      
      toast({
        title,
        description,
        duration: data.promotion ? 8000 : 5000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/my-products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase template",
        variant: "destructive",
      });
    },
  });

  const isOwned = (productId: string) => {
    return myProducts.some((p: any) => p.productId === productId);
  };

  const getDiscountPercentage = (product: MarketplaceProduct) => {
    if (!product.originalPriceCredits) return null;
    const discount = Math.round(
      ((product.originalPriceCredits - product.priceCredits) / product.originalPriceCredits) * 100
    );
    return discount;
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto p-6 space-y-8 relative">
        {/* Epic Hero Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 border border-white/10 mb-4">
                <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                <span className="text-sm font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                  19 Premium Products Available
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent animate-pulse">
                Template Marketplace
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Proven templates that convert followers into paying subscribers.
                <span className="block mt-2 font-semibold text-foreground">Buy once. Use forever. Resell for 50% profit.</span>
              </p>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mt-6">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-500">20-50%</div>
                  <div className="text-xs text-muted-foreground">Conversion Rate</div>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <DollarSign className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-500">$625-$1,650</div>
                  <div className="text-xs text-muted-foreground">Avg. 48hr Revenue</div>
                </div>
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <Users className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-cyan-500">1000+</div>
                  <div className="text-xs text-muted-foreground">Active Resellers</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters - Enhanced */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-xl border border-white/10">
            <TabsTrigger 
              value="all" 
              data-testid="tab-all"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-semibold"
            >
              🌟 All
            </TabsTrigger>
            <TabsTrigger 
              value="marketing" 
              data-testid="tab-marketing"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-semibold"
            >
              📢 Marketing
            </TabsTrigger>
            <TabsTrigger 
              value="psychology" 
              data-testid="tab-psychology"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-semibold"
            >
              🧠 Psychology
            </TabsTrigger>
            <TabsTrigger 
              value="business" 
              data-testid="tab-business"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-semibold"
            >
              💼 Business
            </TabsTrigger>
            <TabsTrigger 
              value="ecommerce" 
              data-testid="tab-ecommerce"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-semibold"
            >
              🛍️ Ecommerce
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Product Grid - STUNNING DESIGN */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-block animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full" />
              <p className="mt-4 text-muted-foreground">Loading premium templates...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No templates found in this category</p>
            </div>
          ) : (
            products.map((product) => {
              const owned = isOwned(product.id);
              const discount = getDiscountPercentage(product);
              const qualifiesForPromotion = product.priceCredits >= 2900;

              return (
                <div
                  key={product.id}
                  className="group relative"
                  data-testid={`card-product-${product.id}`}
                >
                  {/* Glow Effect */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${
                    product.isFeatured 
                      ? 'from-pink-500 via-purple-500 to-cyan-500' 
                      : 'from-pink-500/50 to-purple-500/50'
                  } rounded-xl blur-lg opacity-0 group-hover:opacity-75 transition duration-500`} />
                  
                  {/* Card */}
                  <Card className={`relative h-full bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border ${
                    product.isFeatured ? 'border-pink-500/50' : 'border-white/10'
                  } overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl`}>
                    
                    {/* Top Badges */}
                    <div className="absolute top-0 left-0 right-0 p-4 flex flex-wrap gap-2 z-10">
                      {product.isFeatured && (
                        <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-lg shadow-pink-500/50">
                          <Crown className="h-3 w-3 mr-1 animate-pulse" />
                          FEATURED
                        </Badge>
                      )}
                      {qualifiesForPromotion && (
                        <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-lg shadow-cyan-500/50 animate-bounce">
                          <Gift className="h-3 w-3 mr-1" />
                          FREE MONTH
                        </Badge>
                      )}
                      {discount && (
                        <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg shadow-red-500/50">
                          -{discount}% OFF
                        </Badge>
                      )}
                    </div>

                    <CardHeader className="pt-16">
                      <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                        {product.title}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {product.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Stats Grid */}
                      {(product.conversionRate || product.earningsPotential) && (
                        <div className="grid grid-cols-2 gap-3">
                          {product.conversionRate && (
                            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 backdrop-blur-sm">
                              <div className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 mb-1">
                                <TrendingUp className="h-3 w-3" />
                                Conversion
                              </div>
                              <p className="text-sm font-black text-green-600 dark:text-green-400">{product.conversionRate}</p>
                            </div>
                          )}
                          {product.earningsPotential && (
                            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 backdrop-blur-sm">
                              <div className="flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
                                <DollarSign className="h-3 w-3" />
                                Earnings
                              </div>
                              <p className="text-sm font-black text-purple-600 dark:text-purple-400">{product.earningsPotential}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Benefits */}
                      {product.benefits && product.benefits.length > 0 && (
                        <div className="space-y-1.5">
                          {product.benefits.slice(0, 3).map((benefit, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground leading-tight">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Social Proof */}
                      {product.totalSales > 0 && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5">
                          <Users className="h-3 w-3" />
                          <span>{product.totalSales} creators using this</span>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 mt-auto">
                      {/* Pricing */}
                      <div className="w-full flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 border border-white/10">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                            {product.priceCredits}
                          </span>
                          <span className="text-xs text-muted-foreground font-semibold">credits</span>
                        </div>
                        {product.originalPriceCredits && (
                          <div className="text-right">
                            <span className="text-sm line-through text-muted-foreground">
                              {product.originalPriceCredits}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {owned ? (
                        <Button 
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg shadow-green-500/30" 
                          disabled
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          OWNED
                        </Button>
                      ) : (
                        <>
                          <Button
                            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-bold shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowPaymentModal(true);
                            }}
                            data-testid={`button-buy-${product.id}`}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            BUY NOW
                          </Button>
                          <div className="text-xs text-center text-muted-foreground">
                            ${(product.priceCredits * 0.024).toFixed(2)} USD • Instant Access
                          </div>
                        </>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-white/10 hover:bg-white/5"
                        onClick={() => setSelectedProduct(product)}
                        data-testid={`button-details-${product.id}`}
                      >
                        View Full Details
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              );
            })
          )}
        </div>

        {/* Reseller CTA Section */}
        <div className="relative mt-12">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <Rocket className="h-16 w-16 mx-auto mb-4 text-pink-500 animate-pulse" />
            <h2 className="text-3xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-4">
              Become a Reseller
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Earn 50% commission on every sale. Starter plan required to resell. Free plan users can buy.
            </p>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold px-8 py-6 text-lg shadow-xl shadow-pink-500/30">
              <Crown className="h-5 w-5 mr-2" />
              Upgrade to Resell
            </Button>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && !showPaymentModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <Card 
            className="max-w-3xl w-full max-h-[85vh] overflow-y-auto bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedProduct.isFeatured && (
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-500">
                    <Crown className="h-3 w-3 mr-1" />
                    FEATURED
                  </Badge>
                )}
                {selectedProduct.priceCredits >= 2900 && (
                  <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500">
                    <Gift className="h-3 w-3 mr-1" />
                    FREE MONTH INCLUDED
                  </Badge>
                )}
              </div>
              <CardTitle className="text-3xl font-black">{selectedProduct.title}</CardTitle>
              <CardDescription className="text-base">{selectedProduct.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Long Description */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-line text-muted-foreground">{selectedProduct.longDescription}</p>
              </div>

              {/* Features */}
              {selectedProduct.features && selectedProduct.features.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    What You Get:
                  </h4>
                  <div className="grid gap-2">
                    {selectedProduct.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-white/5">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              {(selectedProduct.conversionRate || selectedProduct.earningsPotential) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedProduct.conversionRate && (
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30">
                      <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">Conversion Rate</div>
                      <div className="text-2xl font-black text-green-600 dark:text-green-400">{selectedProduct.conversionRate}</div>
                    </div>
                  )}
                  {selectedProduct.earningsPotential && (
                    <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30">
                      <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">Earnings Potential</div>
                      <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{selectedProduct.earningsPotential}</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setSelectedProduct(null)}
                className="border-white/10"
              >
                Close
              </Button>
              {!isOwned(selectedProduct.id) && (
                <Button
                  className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-bold shadow-xl"
                  onClick={() => setShowPaymentModal(true)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Now - {selectedProduct.priceCredits} Credits
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedProduct && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowPaymentModal(false)}
        >
          <Card 
            className="max-w-lg w-full bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="text-2xl font-black">Choose Payment Method</CardTitle>
              <CardDescription className="text-base">{selectedProduct.title}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Price Summary */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-muted-foreground">Total:</span>
                  <div className="text-right">
                    <div className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                      {selectedProduct.priceCredits} Credits
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${(selectedProduct.priceCredits * 0.024).toFixed(2)} USD
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="space-y-3">
                <Button
                  variant={selectedPaymentMethod === "credits" ? "default" : "outline"}
                  className={`w-full justify-start h-auto py-4 ${
                    selectedPaymentMethod === "credits"
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'border-white/10'
                  }`}
                  onClick={() => setSelectedPaymentMethod("credits")}
                  data-testid="button-payment-credits"
                >
                  <Sparkles className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-bold">Pay with Credits</div>
                    <div className="text-xs opacity-80">Instant access</div>
                  </div>
                </Button>

                <Button
                  variant={selectedPaymentMethod === "paypal" ? "default" : "outline"}
                  className={`w-full justify-start h-auto py-4 ${
                    selectedPaymentMethod === "paypal"
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'border-white/10'
                  }`}
                  onClick={() => setSelectedPaymentMethod("paypal")}
                  data-testid="button-payment-paypal"
                >
                  <DollarSign className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-bold">PayPal</div>
                    <div className="text-xs opacity-80">Secure checkout</div>
                  </div>
                </Button>

                <Button
                  variant={selectedPaymentMethod === "crypto" ? "default" : "outline"}
                  className={`w-full justify-start h-auto py-4 ${
                    selectedPaymentMethod === "crypto"
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'border-white/10'
                  }`}
                  onClick={() => setSelectedPaymentMethod("crypto")}
                  data-testid="button-payment-crypto"
                >
                  <Zap className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-bold">Cryptocurrency</div>
                    <div className="text-xs opacity-80">BTC, ETH, USDT & more</div>
                  </div>
                </Button>
              </div>
            </CardContent>
            
            <CardFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPaymentMethod("credits");
                }}
                className="border-white/10"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-bold shadow-xl"
                onClick={() => {
                  if (selectedPaymentMethod === "credits") {
                    purchaseMutation.mutate(selectedProduct.id);
                    setShowPaymentModal(false);
                  } else {
                    window.location.href = `/checkout/marketplace/${selectedProduct.id}?method=${selectedPaymentMethod}`;
                  }
                }}
                disabled={purchaseMutation.isPending}
                data-testid="button-confirm-payment"
              >
                {purchaseMutation.isPending ? "Processing..." : "Continue to Checkout"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
