import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Zod schema for onboarding form
const onboardingSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }).refine((date) => {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();
    
    // Calculate exact age
    let exactAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      exactAge--;
    }
    
    return exactAge >= 18;
  }, "You must be 18 years or older to use this platform"),
  
  // Master checkbox - I agree to all
  agreeToAll: z.boolean().refine((val) => val === true, "You must agree to all terms and conditions"),
  
  // Individual checkboxes (auto-filled by master checkbox)
  confirmAge18: z.boolean(),
  agreeTos: z.boolean(),
  agreePrivacy: z.boolean(),
  agreeHoldHarmless: z.boolean(),
  agreeLiabilityWaiver: z.boolean(),
  acceptBermudaJurisdiction: z.boolean(),
  agreeElectronicSignature: z.boolean(),
  
  electronicSignature: z.string().min(2, "Electronic signature is required"),
}).refine((data) => {
  // Ensure signature matches full name
  return data.electronicSignature.toLowerCase().trim() === data.fullName.toLowerCase().trim();
}, {
  message: "Electronic signature must match your full name exactly",
  path: ["electronicSignature"],
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitButtonRef = useRef<HTMLDivElement>(null);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: "",
      agreeToAll: false,
      confirmAge18: false,
      agreeTos: false,
      agreePrivacy: false,
      agreeHoldHarmless: false,
      agreeLiabilityWaiver: false,
      acceptBermudaJurisdiction: false,
      agreeElectronicSignature: false,
      electronicSignature: "",
    },
  });

  // Auto-scroll to submit button when signature is entered
  const watchedSignature = form.watch("electronicSignature");
  useEffect(() => {
    if (watchedSignature && watchedSignature.trim().length > 2) {
      setTimeout(() => {
        submitButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 300);
    }
  }, [watchedSignature]);

  const submitMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      // Calculate age at signup
      const today = new Date();
      const birthDate = data.dateOfBirth;
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // Create SHA-256 hash of signature
      const encoder = new TextEncoder();
      const signatureData = encoder.encode(data.electronicSignature);
      const hashBuffer = await crypto.subtle.digest('SHA-256', signatureData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const electronicSignatureHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Get user agent and IP address (IP will be captured on backend)
      const userAgent = navigator.userAgent;

      const payload = {
        email: "", // Will be populated from session on backend
        dateOfBirth: data.dateOfBirth.toISOString(),
        ageAtSignup: age,
        tosVersion: "v1.0-BMU",
        privacyPolicyVersion: "v1.0-BMU",
        holdHarmlessVersion: "v1.0-BMU",
        ipAddress: "", // Will be captured on backend
        userAgent,
        checkboxAgeConfirmed: data.confirmAge18,
        checkboxTos: data.agreeTos,
        checkboxPrivacy: data.agreePrivacy,
        checkboxHoldHarmless: data.agreeHoldHarmless,
        checkboxLiabilityWaiver: data.agreeLiabilityWaiver,
        checkboxBermudaJurisdiction: data.acceptBermudaJurisdiction,
        checkboxElectronicSignature: data.agreeElectronicSignature,
        electronicSignatureHash,
        bermudaJurisdictionAccepted: data.acceptBermudaJurisdiction,
        signupCompleted: true,
      };

      return await apiRequest("POST", "/api/onboarding", payload);
    },
    onSuccess: async () => {
      // Invalidate auth query to refresh user state
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Legal Verification Complete!",
        description: "Now let's customize your profile...",
      });
      
      // Redirect to profile setup instead of home
      navigate("/profile-setup");
    },
    onError: (error: Error) => {
      toast({
        title: "Onboarding Failed",
        description: error.message || "An error occurred during signup. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simplified validation - just check the master "agreeToAll" checkbox
  const allCheckboxesValid = !!form.watch("agreeToAll");

  const dateOfBirthValid = !!form.watch("dateOfBirth");
  const fullName = String(form.watch("fullName") || "");
  const signature = String(form.watch("electronicSignature") || "");
  const signatureMatches = fullName?.trim() && signature?.trim() && 
    fullName.toLowerCase().trim() === signature.toLowerCase().trim();
  
  const isFormValid = allCheckboxesValid && dateOfBirthValid && 
    fullName?.trim()?.length >= 2 && signatureMatches;

  return (
    <div className="min-h-screen bg-background overflow-y-auto py-4 md:py-8 px-4 md:px-8">
      <div className="w-full max-w-3xl mx-auto">
        <Card className="border-purple-500/30 shadow-lg shadow-purple-500/10 w-full">
          <CardHeader className="text-center space-y-2 pb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-purple-500/30">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-display">
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                Age Verification & Legal Agreements
              </span>
            </CardTitle>
            <CardDescription className="text-base">
              To comply with Bermuda jurisdiction and ensure platform safety, 
              all users must be 18+ and agree to our legal terms.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                  Full Legal Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  data-testid="input-full-name"
                  placeholder="Enter your full legal name"
                  {...form.register("fullName")}
                  className={cn(
                    "bg-slate-800/50 border-purple-500/30 text-foreground placeholder:text-muted-foreground",
                    form.formState.errors.fullName && "border-destructive"
                  )}
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-destructive" data-testid="error-full-name">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Date of Birth - MOBILE-FRIENDLY DROPDOWNS */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-medium text-foreground">
                  Date of Birth <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Month Dropdown */}
                  <div>
                    <Label htmlFor="month" className="text-xs text-muted-foreground">Month</Label>
                    <select
                      id="month"
                      data-testid="select-month"
                      className="w-full h-10 px-3 py-2 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-2 border-purple-400/40 rounded-md text-foreground focus:border-purple-400/60 focus:outline-none"
                      onChange={(e) => {
                        const currentDate = form.watch("dateOfBirth") || new Date(2000, 0, 1);
                        const month = parseInt(e.target.value);
                        if (!isNaN(month)) {
                          const newDate = new Date(currentDate.getFullYear(), month, currentDate.getDate());
                          form.setValue("dateOfBirth", newDate);
                        }
                      }}
                      value={form.watch("dateOfBirth")?.getMonth() ?? ""}
                    >
                      <option value="">Month</option>
                      <option value="0">January</option>
                      <option value="1">February</option>
                      <option value="2">March</option>
                      <option value="3">April</option>
                      <option value="4">May</option>
                      <option value="5">June</option>
                      <option value="6">July</option>
                      <option value="7">August</option>
                      <option value="8">September</option>
                      <option value="9">October</option>
                      <option value="10">November</option>
                      <option value="11">December</option>
                    </select>
                  </div>

                  {/* Day Dropdown */}
                  <div>
                    <Label htmlFor="day" className="text-xs text-muted-foreground">Day</Label>
                    <select
                      id="day"
                      data-testid="select-day"
                      className="w-full h-10 px-3 py-2 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-2 border-purple-400/40 rounded-md text-foreground focus:border-purple-400/60 focus:outline-none"
                      onChange={(e) => {
                        const currentDate = form.watch("dateOfBirth") || new Date(2000, 0, 1);
                        const day = parseInt(e.target.value);
                        if (!isNaN(day)) {
                          const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                          form.setValue("dateOfBirth", newDate);
                        }
                      }}
                      value={form.watch("dateOfBirth")?.getDate() ?? ""}
                    >
                      <option value="">Day</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  {/* Year Dropdown */}
                  <div>
                    <Label htmlFor="year" className="text-xs text-muted-foreground">Year</Label>
                    <select
                      id="year"
                      data-testid="select-year"
                      className="w-full h-10 px-3 py-2 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-2 border-purple-400/40 rounded-md text-foreground focus:border-purple-400/60 focus:outline-none"
                      onChange={(e) => {
                        const currentDate = form.watch("dateOfBirth") || new Date(2000, 0, 1);
                        const year = parseInt(e.target.value);
                        if (!isNaN(year)) {
                          const newDate = new Date(year, currentDate.getMonth(), currentDate.getDate());
                          form.setValue("dateOfBirth", newDate);
                        }
                      }}
                      value={form.watch("dateOfBirth")?.getFullYear() ?? ""}
                    >
                      <option value="">Year</option>
                      {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {form.formState.errors.dateOfBirth && (
                  <p className="text-sm text-destructive" data-testid="error-dob">
                    {form.formState.errors.dateOfBirth.message}
                  </p>
                )}
                {form.watch("dateOfBirth") && !form.formState.errors.dateOfBirth && (
                  <p className="text-sm text-emerald-400 flex items-center gap-1" data-testid="text-age-verified">
                    <CheckCircle2 className="w-4 h-4" />
                    Age verified: 18+ confirmed
                  </p>
                )}
              </div>

              {/* Legal Agreements Section */}
              <div className="space-y-4 pt-4 border-t border-slate-700">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-foreground">Legal Agreements</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Check the box below to accept all terms and agreements.
                </p>

                {/* MASTER CHECKBOX - I AGREE TO ALL */}
                <div className="p-4 rounded-lg border-2 border-pink-500/50 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="agreeToAll"
                      data-testid="checkbox-agree-all"
                      checked={form.watch("agreeToAll") || false}
                      onCheckedChange={(checked) => {
                        const isChecked = checked as boolean;
                        form.setValue("agreeToAll", isChecked);
                        // Auto-check/uncheck all other checkboxes
                        form.setValue("confirmAge18", isChecked);
                        form.setValue("agreeTos", isChecked);
                        form.setValue("agreePrivacy", isChecked);
                        form.setValue("agreeHoldHarmless", isChecked);
                        form.setValue("agreeLiabilityWaiver", isChecked);
                        form.setValue("acceptBermudaJurisdiction", isChecked);
                        form.setValue("agreeElectronicSignature", isChecked);
                      }}
                      className="mt-1 h-6 w-6"
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="agreeToAll"
                        className="text-base font-bold leading-none cursor-pointer text-white"
                      >
                        ✅ I AGREE TO ALL TERMS & CONDITIONS <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-xs text-pink-300">
                        By checking this box, you accept all 7 legal agreements below.
                      </p>
                    </div>
                  </div>
                </div>

                <ScrollArea className="h-[300px] rounded-md border border-purple-500/30 p-4 bg-slate-900/50">
                  <div className="space-y-4">
                    {/* Age Confirmation */}
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="confirmAge18"
                        data-testid="checkbox-age-18"
                        checked={form.watch("confirmAge18")}
                        disabled={true}
                        className={cn(
                          "mt-1",
                          form.watch("confirmAge18") ? "border-emerald-500 bg-emerald-500/20" : "border-red-500 bg-red-500/20"
                        )}
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor="confirmAge18"
                          className="text-sm font-medium leading-none text-foreground"
                        >
                          {form.watch("confirmAge18") ? "✅" : "❌"} I confirm I am 18 years or older
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          You must be at least 18 years old to use PROFITHACK AI.
                        </p>
                      </div>
                    </div>

                    {/* Terms of Service */}
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeTos"
                        data-testid="checkbox-tos"
                        checked={form.watch("agreeTos")}
                        disabled={true}
                        className={cn(
                          "mt-1",
                          form.watch("agreeTos") ? "border-emerald-500 bg-emerald-500/20" : "border-red-500 bg-red-500/20"
                        )}
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor="agreeTos"
                          className="text-sm font-medium leading-none text-foreground"
                        >
                          {form.watch("agreeTos") ? "✅" : "❌"} I agree to <a href="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</a>
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          By checking this box, you agree to abide by our platform rules and guidelines.
                        </p>
                      </div>
                    </div>

                    {/* Privacy Policy */}
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreePrivacy"
                        data-testid="checkbox-privacy"
                        checked={form.watch("agreePrivacy")}
                        disabled={true}
                        className={cn(
                          "mt-1",
                          form.watch("agreePrivacy") ? "border-emerald-500 bg-emerald-500/20" : "border-red-500 bg-red-500/20"
                        )}
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor="agreePrivacy"
                          className="text-sm font-medium leading-none text-foreground"
                        >
                          {form.watch("agreePrivacy") ? "✅" : "❌"} I agree to <a href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</a>
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          We will handle your personal data according to our privacy policy.
                        </p>
                      </div>
                    </div>

                    {/* Hold Harmless Agreement */}
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeHoldHarmless"
                        data-testid="checkbox-hold-harmless"
                        checked={form.watch("agreeHoldHarmless")}
                        disabled={true}
                        className={cn(
                          "mt-1",
                          form.watch("agreeHoldHarmless") ? "border-emerald-500 bg-emerald-500/20" : "border-red-500 bg-red-500/20"
                        )}
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor="agreeHoldHarmless"
                          className="text-sm font-medium leading-none text-foreground"
                        >
                          {form.watch("agreeHoldHarmless") ? "✅" : "❌"} I agree to Hold Harmless Agreement
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          You agree not to hold the platform liable for user-generated content or interactions.
                        </p>
                      </div>
                    </div>

                    {/* Liability Waiver */}
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeLiabilityWaiver"
                        data-testid="checkbox-liability-waiver"
                        checked={form.watch("agreeLiabilityWaiver")}
                        disabled={true}
                        className={cn(
                          "mt-1",
                          form.watch("agreeLiabilityWaiver") ? "border-emerald-500 bg-emerald-500/20" : "border-red-500 bg-red-500/20"
                        )}
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor="agreeLiabilityWaiver"
                          className="text-sm font-medium leading-none text-foreground"
                        >
                          {form.watch("agreeLiabilityWaiver") ? "✅" : "❌"} I agree to Liability Waiver
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          You waive certain rights to legal claims against the platform.
                        </p>
                      </div>
                    </div>

                    {/* Bermuda Jurisdiction */}
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="acceptBermudaJurisdiction"
                        data-testid="checkbox-bermuda-jurisdiction"
                        checked={form.watch("acceptBermudaJurisdiction")}
                        disabled={true}
                        className={cn(
                          "mt-1",
                          form.watch("acceptBermudaJurisdiction") ? "border-emerald-500 bg-emerald-500/20" : "border-red-500 bg-red-500/20"
                        )}
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor="acceptBermudaJurisdiction"
                          className="text-sm font-medium leading-none text-foreground"
                        >
                          {form.watch("acceptBermudaJurisdiction") ? "✅" : "❌"} I accept Bermuda Jurisdiction
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          All legal disputes will be governed by and construed under Bermuda law.
                        </p>
                      </div>
                    </div>

                    {/* Electronic Signature */}
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeElectronicSignature"
                        data-testid="checkbox-electronic-signature"
                        checked={form.watch("agreeElectronicSignature")}
                        disabled={true}
                        className={cn(
                          "mt-1",
                          form.watch("agreeElectronicSignature") ? "border-emerald-500 bg-emerald-500/20" : "border-red-500 bg-red-500/20"
                        )}
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor="agreeElectronicSignature"
                          className="text-sm font-medium leading-none text-foreground"
                        >
                          {form.watch("agreeElectronicSignature") ? "✅" : "❌"} I agree to Electronic Signature
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Your typed signature below will be legally binding.
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Electronic Signature - BRIGHTER COLORS */}
              <div className="space-y-2 pt-4 border-t border-slate-700">
                <Label htmlFor="electronicSignature" className="text-sm font-medium text-foreground">
                  Electronic Signature <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-purple-300 mb-2">
                  Type your full name exactly as entered above to electronically sign this agreement.
                </p>
                <Input
                  id="electronicSignature"
                  data-testid="input-signature"
                  placeholder="Type your full name to sign"
                  {...form.register("electronicSignature")}
                  className={cn(
                    "bg-gradient-to-r from-pink-500/10 to-purple-500/10",
                    "border-2 border-pink-400/40 hover:border-pink-400/60",
                    "text-foreground placeholder:text-pink-300/60",
                    "font-serif text-lg focus:border-pink-400",
                    form.formState.errors.electronicSignature && "border-destructive"
                  )}
                />
                {form.formState.errors.electronicSignature && (
                  <p className="text-sm text-destructive" data-testid="error-signature">
                    {form.formState.errors.electronicSignature.message}
                  </p>
                )}
                {form.watch("electronicSignature") && 
                 form.watch("fullName") && 
                 form.watch("electronicSignature").toLowerCase().trim() === form.watch("fullName").toLowerCase().trim() && (
                  <p className="text-sm text-emerald-400 flex items-center gap-1" data-testid="text-signature-valid">
                    <CheckCircle2 className="w-4 h-4" />
                    Signature verified
                  </p>
                )}
              </div>

              {/* Submit Button (Sticky) */}
              <div ref={submitButtonRef} className="sticky bottom-0 pt-6 pb-2 bg-card border-t border-slate-700 -mx-6 px-6 -mb-6">
                {!isFormValid && (
                  <div className="mb-3 p-3 bg-red-500/20 border border-red-400/60 rounded text-sm">
                    <p className="font-semibold mb-1 text-black dark:text-white">Complete these to continue:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-black dark:text-white/90">
                      {!fullName?.trim() && <li>Enter your full legal name</li>}
                      {!dateOfBirthValid && <li>Select your date of birth</li>}
                      {!allCheckboxesValid && <li>Check "I AGREE TO ALL TERMS & CONDITIONS"</li>}
                      {!signatureMatches && <li>Electronic signature must match your full name exactly</li>}
                    </ul>
                  </div>
                )}
                <Button
                  type="submit"
                  data-testid="button-submit"
                  disabled={!isFormValid || isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-black font-bold disabled:opacity-50 disabled:bg-gray-500"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2 w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                      Processing...
                    </>
                  ) : (
                    "Complete Verification & Continue"
                  )}
                </Button>
                {!isFormValid && (
                  <p className="text-xs text-center text-muted-foreground mt-2" data-testid="text-form-incomplete">
                    Please complete all required fields and agreements to continue
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Notice */}
        <p className="text-xs text-center text-muted-foreground mt-6">
          By submitting this form, you acknowledge that you have read, understood, and agree to be legally bound 
          by all terms and conditions under Bermuda jurisdiction.
        </p>
      </div>
    </div>
  );
}
