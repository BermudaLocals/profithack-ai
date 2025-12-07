import twilio from "twilio";

// Twilio SMS Service for Phone Verification
class TwilioSMSService {
  private client: twilio.Twilio | null = null;
  private initialized = false;
  private fromPhoneNumber: string | null = null;

  private initialize() {
    if (this.initialized) return;
    this.initialized = true;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER || null;

    if (!accountSid || !authToken || !this.fromPhoneNumber) {
      console.warn("⚠️  Twilio SMS not configured - phone authentication disabled");
      console.log("   Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER");
      return;
    }

    if (!accountSid.startsWith("AC")) {
      console.error("⚠️  Invalid TWILIO_ACCOUNT_SID - must start with 'AC'");
      return;
    }

    this.client = twilio(accountSid, authToken);
    console.log("✓ Twilio SMS initialized for phone verification");
  }

  isConfigured(): boolean {
    this.initialize();
    return this.client !== null && this.fromPhoneNumber !== null;
  }

  async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    this.initialize();
    
    if (!this.client || !this.fromPhoneNumber) {
      throw new Error("Twilio SMS not configured");
    }

    try {
      await this.client.messages.create({
        body: `Your PROFITHACK AI verification code is: ${code}. Valid for 5 minutes.`,
        from: this.fromPhoneNumber,
        to: phoneNumber,
      });
    } catch (error: any) {
      if (error.status === 429) {
        throw new Error("SMS rate limit exceeded - please try again later");
      }
      console.error("Failed to send SMS:", error);
      throw new Error(`Failed to send verification code: ${error.message}`);
    }
  }

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export const twilioSMSService = new TwilioSMSService();

export function isTwilioSMSConfigured(): boolean {
  return twilioSMSService.isConfigured();
}

export async function sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
  return twilioSMSService.sendVerificationCode(phoneNumber, code);
}

export function generateVerificationCode(): string {
  return twilioSMSService.generateVerificationCode();
}
