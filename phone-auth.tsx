import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

const COUNTRY_CODES = [
  // Bermuda & Caribbean
  { code: "+1441", country: "Bermuda 🇧🇲", flag: "🇧🇲" },
  { code: "+1876", country: "Jamaica 🇯🇲", flag: "🇯🇲" },
  { code: "+1868", country: "Trinidad & Tobago 🇹🇹", flag: "🇹🇹" },
  { code: "+1246", country: "Barbados 🇧🇧", flag: "🇧🇧" },
  { code: "+1284", country: "British Virgin Islands 🇻🇬", flag: "🇻🇬" },
  { code: "+1345", country: "Cayman Islands 🇰🇾", flag: "🇰🇾" },
  
  // Africa
  { code: "+233", country: "Ghana 🇬🇭", flag: "🇬🇭" },
  { code: "+234", country: "Nigeria 🇳🇬", flag: "🇳🇬" },
  { code: "+254", country: "Kenya 🇰🇪", flag: "🇰🇪" },
  { code: "+27", country: "South Africa 🇿🇦", flag: "🇿🇦" },
  { code: "+20", country: "Egypt 🇪🇬", flag: "🇪🇬" },
  { code: "+256", country: "Uganda 🇺🇬", flag: "🇺🇬" },
  { code: "+255", country: "Tanzania 🇹🇿", flag: "🇹🇿" },
  { code: "+250", country: "Rwanda 🇷🇼", flag: "🇷🇼" },
  { code: "+225", country: "Ivory Coast 🇨🇮", flag: "🇨🇮" },
  { code: "+221", country: "Senegal 🇸🇳", flag: "🇸🇳" },
  { code: "+237", country: "Cameroon 🇨🇲", flag: "🇨🇲" },
  { code: "+251", country: "Ethiopia 🇪🇹", flag: "🇪🇹" },
  
  // North America
  { code: "+1", country: "USA 🇺🇸", flag: "🇺🇸" },
  { code: "+1", country: "Canada 🇨🇦", flag: "🇨🇦" },
  { code: "+52", country: "Mexico 🇲🇽", flag: "🇲🇽" },
  
  // Europe
  { code: "+44", country: "UK 🇬🇧", flag: "🇬🇧" },
  { code: "+33", country: "France 🇫🇷", flag: "🇫🇷" },
  { code: "+49", country: "Germany 🇩🇪", flag: "🇩🇪" },
  { code: "+39", country: "Italy 🇮🇹", flag: "🇮🇹" },
  { code: "+34", country: "Spain 🇪🇸", flag: "🇪🇸" },
  { code: "+31", country: "Netherlands 🇳🇱", flag: "🇳🇱" },
  { code: "+41", country: "Switzerland 🇨🇭", flag: "🇨🇭" },
  { code: "+46", country: "Sweden 🇸🇪", flag: "🇸🇪" },
  { code: "+47", country: "Norway 🇳🇴", flag: "🇳🇴" },
  { code: "+45", country: "Denmark 🇩🇰", flag: "🇩🇰" },
  { code: "+48", country: "Poland 🇵🇱", flag: "🇵🇱" },
  { code: "+351", country: "Portugal 🇵🇹", flag: "🇵🇹" },
  { code: "+353", country: "Ireland 🇮🇪", flag: "🇮🇪" },
  { code: "+32", country: "Belgium 🇧🇪", flag: "🇧🇪" },
  { code: "+43", country: "Austria 🇦🇹", flag: "🇦🇹" },
  
  // Asia
  { code: "+91", country: "India 🇮🇳", flag: "🇮🇳" },
  { code: "+86", country: "China 🇨🇳", flag: "🇨🇳" },
  { code: "+81", country: "Japan 🇯🇵", flag: "🇯🇵" },
  { code: "+82", country: "South Korea 🇰🇷", flag: "🇰🇷" },
  { code: "+65", country: "Singapore 🇸🇬", flag: "🇸🇬" },
  { code: "+60", country: "Malaysia 🇲🇾", flag: "🇲🇾" },
  { code: "+63", country: "Philippines 🇵🇭", flag: "🇵🇭" },
  { code: "+62", country: "Indonesia 🇮🇩", flag: "🇮🇩" },
  { code: "+66", country: "Thailand 🇹🇭", flag: "🇹🇭" },
  { code: "+84", country: "Vietnam 🇻🇳", flag: "🇻🇳" },
  { code: "+92", country: "Pakistan 🇵🇰", flag: "🇵🇰" },
  { code: "+880", country: "Bangladesh 🇧🇩", flag: "🇧🇩" },
  { code: "+94", country: "Sri Lanka 🇱🇰", flag: "🇱🇰" },
  { code: "+971", country: "UAE 🇦🇪", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia 🇸🇦", flag: "🇸🇦" },
  { code: "+972", country: "Israel 🇮🇱", flag: "🇮🇱" },
  { code: "+90", country: "Turkey 🇹🇷", flag: "🇹🇷" },
  
  // South America
  { code: "+55", country: "Brazil 🇧🇷", flag: "🇧🇷" },
  { code: "+54", country: "Argentina 🇦🇷", flag: "🇦🇷" },
  { code: "+56", country: "Chile 🇨🇱", flag: "🇨🇱" },
  { code: "+57", country: "Colombia 🇨🇴", flag: "🇨🇴" },
  { code: "+51", country: "Peru 🇵🇪", flag: "🇵🇪" },
  { code: "+58", country: "Venezuela 🇻🇪", flag: "🇻🇪" },
  
  // Oceania
  { code: "+61", country: "Australia 🇦🇺", flag: "🇦🇺" },
  { code: "+64", country: "New Zealand 🇳🇿", flag: "🇳🇿" },
];

export default function PhoneAuth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Step 1: Phone number entry
  const [step, setStep] = useState<1 | 2>(1);
  const [countryCode, setCountryCode] = useState("+1441"); // Default to Bermuda
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoadingSendCode, setIsLoadingSendCode] = useState(false);
  
  // Step 2: Code verification
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoadingVerify, setIsLoadingVerify] = useState(false);

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 7) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingSendCode(true);
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    try {
      await apiRequest("POST", "/api/auth/phone/send-code", {
        phoneNumber: fullPhoneNumber,
      });

      toast({
        title: "Code sent!",
        description: `Check your SMS for the 6-digit code sent to ${fullPhoneNumber}`,
      });
      setStep(2);
    } catch (error: any) {
      toast({
        title: "Failed to send code",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSendCode(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newCode.every(digit => digit !== "") && index === 5) {
      handleVerifyCode(newCode.join(""));
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyCode = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join("");
    
    if (codeToVerify.length !== 6) {
      toast({
        title: "Incomplete code",
        description: "Please enter all 6 digits",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingVerify(true);
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    try {
      const response = await apiRequest("POST", "/api/auth/phone/verify-code", {
        phoneNumber: fullPhoneNumber,
        code: codeToVerify,
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Phone verified!",
          description: "Redirecting to complete your profile...",
        });
        
        // Redirect to Replit OAuth or onboarding
        setTimeout(() => {
          window.location.href = "/api/auth/login";
        }, 1000);
      }
    } catch (error: any) {
      toast({
        title: "Invalid code",
        description: error.message || "Please check your code and try again",
        variant: "destructive",
      });
      setCode(["", "", "", "", "", ""]);
      document.getElementById("code-0")?.focus();
    } finally {
      setIsLoadingVerify(false);
    }
  };

  const handleResendCode = async () => {
    setCode(["", "", "", "", "", ""]);
    await handleSendCode();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo / Branding */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            PROFITHACK AI
          </h1>
          <p className="text-slate-400 text-sm">
            {step === 1 ? "Enter your phone number" : "Enter verification code"}
          </p>
        </div>

        {/* Step 1: Phone Number Entry */}
        {step === 1 && (
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-8 space-y-6">
            <div className="space-y-4">
              {/* Country Code Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Country
                </label>
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger 
                    data-testid="select-country-code"
                    className="bg-slate-800 border-slate-700 text-white h-12"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((country) => (
                      <SelectItem 
                        key={country.code} 
                        value={country.code}
                        data-testid={`option-country-${country.code}`}
                      >
                        {country.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 flex items-center text-cyan-400 font-mono text-lg">
                    {countryCode}
                  </div>
                  <Input
                    data-testid="input-phone-number"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="241234567"
                    className="bg-slate-800 border-slate-700 text-white text-lg h-12 flex-1"
                    maxLength={15}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  We'll send you a 6-digit verification code
                </p>
              </div>
            </div>

            <Button
              data-testid="button-send-code"
              onClick={handleSendCode}
              disabled={isLoadingSendCode}
              className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-lg"
            >
              {isLoadingSendCode ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Send Code"
              )}
            </Button>
          </div>
        )}

        {/* Step 2: Code Verification */}
        {step === 2 && (
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-8 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-slate-300">
                Code sent to
              </p>
              <p className="text-cyan-400 font-mono text-lg">
                {countryCode} {phoneNumber}
              </p>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-purple-400 hover:text-purple-300 underline"
                data-testid="button-change-number"
              >
                Change number
              </button>
            </div>

            {/* 6-digit Code Input */}
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  data-testid={`input-code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-slate-800 border-2 border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none transition-colors"
                />
              ))}
            </div>

            {isLoadingVerify && (
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
              </div>
            )}

            <div className="text-center space-y-2">
              <p className="text-xs text-slate-400">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendCode}
                disabled={isLoadingSendCode}
                className="text-sm text-pink-400 hover:text-pink-300 font-medium"
                data-testid="button-resend-code"
              >
                Resend Code
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>By continuing, you agree to our Terms of Service</p>
          <p>and acknowledge our Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
