import twilio from "twilio";

// Twilio Video Service for Lives, Battles, and Premium 1-on-1 Calls
class TwilioVideoService {
  private client: twilio.Twilio | null = null;
  private initialized = false;

  private initialize() {
    if (this.initialized) return;
    this.initialized = true;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      console.warn("⚠️  Twilio Video not configured - group calling disabled");
      return;
    }

    if (!accountSid.startsWith("AC")) {
      console.error("⚠️  Invalid TWILIO_ACCOUNT_SID - must start with 'AC'");
      return;
    }

    this.client = twilio(accountSid, authToken);
    console.log("✓ Twilio Video initialized for group calling");
  }

  isConfigured(): boolean {
    this.initialize(); // Lazy init
    return this.client !== null;
  }

  // Create a Twilio Video Room (Lives, Battles, Panels)
  async createRoom(params: {
    uniqueName: string;
    type: "live_stream" | "battle" | "panel" | "premium_1on1";
    maxParticipants?: number;
  }): Promise<{ roomSid: string; roomName: string }> {
    this.initialize(); // Lazy init
    if (!this.client) {
      throw new Error("Twilio Video not configured");
    }

    try {
      const room = await this.client.video.v1.rooms.create({
        uniqueName: params.uniqueName,
        type: "group", // Twilio room type
        maxParticipants: params.maxParticipants || 20,
        recordParticipantsOnConnect: false, // Can enable for premium features
      });

      return {
        roomSid: room.sid,
        roomName: room.uniqueName,
      };
    } catch (error: any) {
      if (error.status === 429) {
        throw new Error("Twilio rate limit exceeded - please try again later");
      }
      console.error("Twilio createRoom error:", error);
      throw new Error(`Failed to create Twilio room: ${error.message}`);
    }
  }

  // Generate Access Token for participant to join room
  async generateAccessToken(params: {
    identity: string; // User ID
    roomName: string;
  }): Promise<string> {
    this.initialize(); // Lazy init
    if (!this.client) {
      throw new Error("Twilio Video not configured");
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKeySid = process.env.TWILIO_API_KEY_SID;
    const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;

    if (!accountSid || !apiKeySid || !apiKeySecret) {
      throw new Error("Twilio API credentials incomplete - check TWILIO_API_KEY_SID and TWILIO_API_KEY_SECRET");
    }

    const AccessToken = twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, {
      identity: params.identity,
      ttl: 14400, // 4 hours
    });

    const videoGrant = new VideoGrant({
      room: params.roomName,
    });

    token.addGrant(videoGrant);

    return token.toJwt();
  }

  // End a room
  async endRoom(roomSid: string): Promise<void> {
    this.initialize(); // Lazy init
    if (!this.client) {
      throw new Error("Twilio Video not configured");
    }

    try {
      await this.client.video.v1.rooms(roomSid).update({
        status: "completed",
      });
    } catch (error: any) {
      if (error.status === 429) {
        throw new Error("Twilio rate limit exceeded - please try again later");
      }
      console.error("Twilio endRoom error:", error);
      throw new Error(`Failed to end Twilio room: ${error.message}`);
    }
  }

  // Get room details
  async getRoomDetails(roomSid: string) {
    this.initialize(); // Lazy init
    if (!this.client) {
      throw new Error("Twilio Video not configured");
    }

    return await this.client.video.v1.rooms(roomSid).fetch();
  }

  // Get active participants in a room
  async getParticipants(roomSid: string) {
    this.initialize(); // Lazy init
    if (!this.client) {
      throw new Error("Twilio Video not configured");
    }

    return await this.client.video.v1.rooms(roomSid).participants.list();
  }

  // Disconnect a participant from a room
  async disconnectParticipant(roomSid: string, participantSid: string): Promise<void> {
    this.initialize(); // Lazy init
    if (!this.client) {
      throw new Error("Twilio Video not configured");
    }

    try {
      await this.client.video.v1
        .rooms(roomSid)
        .participants(participantSid)
        .update({ status: "disconnected" });
    } catch (error: any) {
      if (error.status === 429) {
        throw new Error("Twilio rate limit exceeded - please try again later");
      }
      console.error("Twilio disconnectParticipant error:", error);
      throw new Error(`Failed to disconnect participant: ${error.message}`);
    }
  }

  // Get active rooms from database (wrapper for storage layer)
  async getActiveRooms(roomType?: string) {
    const { storage } = await import("./storage");
    const rooms = await storage.getActiveTwilioRooms();
    
    if (roomType) {
      return rooms.filter(room => room.roomType === roomType);
    }
    
    return rooms;
  }
}

export const twilioVideoService = new TwilioVideoService();

export function isTwilioVideoConfigured(): boolean {
  return twilioVideoService.isConfigured();
}
