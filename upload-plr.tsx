import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Upload,
  Plus,
  Trash2,
  DollarSign,
  Package,
  TrendingUp,
  FileText,
  X,
} from "lucide-react";

export default function UploadPLR() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    productType: "plr_content",
    category: "business",
    priceCredits: 100,
    originalPriceCredits: null as number | null,
    features: [""],
    benefits: [""],
    tags: [""],
    contentUrl: "",
    fileType: "",
    fileSize: "",
  });

  // Fetch user's uploaded products
  const { data: myUploads = [], isLoading } = useQuery({
    queryKey: ["/api/marketplace/my-uploads"],
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("/api/marketplace/products/upload", "POST", {
        ...data,
        features: data.features.filter(f => f.trim()),
        benefits: data.benefits.filter(b => b.trim()),
        tags: data.tags.filter(t => t.trim()),
        originalPriceCredits: data.originalPriceCredits || null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Product Uploaded! 🎉",
        description: "Your PLR product is now live in the marketplace.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/my-uploads"] });
      // Reset form
      setFormData({
        title: "",
        description: "",
        longDescription: "",
        productType: "plr_content",
        category: "business",
        priceCredits: 100,
        originalPriceCredits: null,
        features: [""],
        benefits: [""],
        tags: [""],
        contentUrl: "",
        fileType: "",
        fileSize: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload product",
        variant: "destructive",
      });
    },
  });

  const addArrayField = (field: 'features' | 'benefits' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const updateArrayField = (field: 'features' | 'benefits' | 'tags', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item),
    }));
  };

  const removeArrayField = (field: 'features' | 'benefits' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.contentUrl) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    uploadMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
          Upload PLR Products
        </h1>
        <p className="text-muted-foreground">
          Upload digital products and earn 50% on every sale. Templates, courses, ebooks, and more.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Product
            </CardTitle>
            <CardDescription>
              Create a new marketplace listing. All products are reviewed before going live.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Ultimate Marketing Email Templates 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  data-testid="input-product-title"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  placeholder="One-line pitch (max 150 chars)"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  maxLength={150}
                  required
                  data-testid="input-product-description"
                />
              </div>

              {/* Long Description */}
              <div className="space-y-2">
                <Label htmlFor="longDescription">Full Description</Label>
                <Textarea
                  id="longDescription"
                  placeholder="Detailed description, benefits, use cases..."
                  value={formData.longDescription}
                  onChange={(e) => setFormData({...formData, longDescription: e.target.value})}
                  rows={4}
                  data-testid="input-product-long-description"
                />
              </div>

              {/* Category & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="psychology">Psychology</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="ecommerce">Ecommerce</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Product Type</Label>
                  <Select value={formData.productType} onValueChange={(val) => setFormData({...formData, productType: val})}>
                    <SelectTrigger data-testid="select-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plr_content">PLR Content</SelectItem>
                      <SelectItem value="marketing_template">Marketing Template</SelectItem>
                      <SelectItem value="course">Online Course</SelectItem>
                      <SelectItem value="ebook">Ebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (Credits) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="1"
                    value={formData.priceCredits}
                    onChange={(e) => setFormData({...formData, priceCredits: parseInt(e.target.value) || 0})}
                    required
                    data-testid="input-price-credits"
                  />
                  <p className="text-xs text-muted-foreground">
                    ~${(formData.priceCredits * 0.024).toFixed(2)} USD
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    placeholder="For discount badge"
                    value={formData.originalPriceCredits || ""}
                    onChange={(e) => setFormData({...formData, originalPriceCredits: parseInt(e.target.value) || null})}
                    data-testid="input-original-price"
                  />
                </div>
              </div>

              {/* Content URL */}
              <div className="space-y-2">
                <Label htmlFor="contentUrl">Download URL *</Label>
                <Input
                  id="contentUrl"
                  type="url"
                  placeholder="https://... (Google Drive, Dropbox, etc.)"
                  value={formData.contentUrl}
                  onChange={(e) => setFormData({...formData, contentUrl: e.target.value})}
                  required
                  data-testid="input-content-url"
                />
                <p className="text-xs text-muted-foreground">
                  Public download link to your PLR files
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Features</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField('features')}
                    data-testid="button-add-feature"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                {formData.features.map((feature, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`Feature ${i + 1}`}
                      value={feature}
                      onChange={(e) => updateArrayField('features', i, e.target.value)}
                      data-testid={`input-feature-${i}`}
                    />
                    {formData.features.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayField('features', i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Benefits</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField('benefits')}
                    data-testid="button-add-benefit"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                {formData.benefits.map((benefit, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`Benefit ${i + 1}`}
                      value={benefit}
                      onChange={(e) => updateArrayField('benefits', i, e.target.value)}
                      data-testid={`input-benefit-${i}`}
                    />
                    {formData.benefits.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayField('benefits', i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
                disabled={uploadMutation.isPending}
                data-testid="button-upload-product"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload Product"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* My Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              My Products ({myUploads.length})
            </CardTitle>
            <CardDescription>
              Your earnings: 50% on every sale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading your products...</p>
            ) : myUploads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No products uploaded yet</p>
                <p className="text-xs">Upload your first PLR product to start earning</p>
              </div>
            ) : (
              myUploads.map((product: any) => (
                <Card key={product.id} className="hover-elevate" data-testid={`card-upload-${product.id}`}>
                  <CardContent className="pt-6 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{product.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                      </div>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Live" : "Draft"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-semibold">{product.priceCredits} cr</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sales</p>
                        <p className="font-semibold">{product.totalSales}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-semibold">{product.totalRevenue} cr</p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Your earnings: {Math.floor(product.totalRevenue * 0.5)} credits
                      </span>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        50% Split
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
