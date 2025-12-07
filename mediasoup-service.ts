/**
 * Mediasoup WebRTC SFU Service
 * Handles TikTok-style live panels with up to 20 participants
 */

import * as mediasoup from "mediasoup";
import type {
  Worker,
  Router,
  WebRtcTransport,
  Producer,
  Consumer,
  RtpCapabilities,
  DtlsParameters,
  MediaKind,
  RtpParameters,
} from "mediasoup/node/lib/types";

interface Room {
  id: string;
  router: Router;
  participants: Map<string, Participant>;
  hostId: string;
  createdAt: Date;
}

interface Participant {
  userId: string;
  transports: Map<string, WebRtcTransport>;
  producers: Map<string, Producer>;
  consumers: Map<string, Consumer>;
  role: "host" | "guest" | "viewer";
  isMuted: boolean;
  isVideoOff: boolean;
}

export class MediasoupService {
  private worker: Worker | null = null;
  private rooms = new Map<string, Room>();
  private readonly MAX_GUESTS = 19; // Host + 19 guests = 20 total

  async initialize() {
    if (this.worker) return;

    this.worker = await mediasoup.createWorker({
      logLevel: "warn",
      rtcMinPort: 40000,
      rtcMaxPort: 49999,
    });

    this.worker.on("died", () => {
      console.error("Mediasoup worker died, restarting...");
      this.worker = null;
      setTimeout(() => this.initialize(), 2000);
    });

    console.log("Mediasoup worker initialized");
  }

  async createRoom(roomId: string, hostId: string): Promise<RtpCapabilities> {
    if (!this.worker) {
      throw new Error("Mediasoup worker not initialized");
    }

    if (this.rooms.has(roomId)) {
      const room = this.rooms.get(roomId)!;
      return room.router.rtpCapabilities;
    }

    const router = await this.worker.createRouter({
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000,
          parameters: {
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/H264",
          clockRate: 90000,
          parameters: {
            "packetization-mode": 1,
            "profile-level-id": "42e01f",
            "level-asymmetry-allowed": 1,
          },
        },
      ],
    });

    const room: Room = {
      id: roomId,
      router,
      participants: new Map(),
      hostId,
      createdAt: new Date(),
    };

    this.rooms.set(roomId, room);

    // Auto-cleanup after 24 hours
    setTimeout(() => {
      this.closeRoom(roomId);
    }, 24 * 60 * 60 * 1000);

    return router.rtpCapabilities;
  }

  async joinRoom(
    roomId: string,
    userId: string,
    role: "host" | "guest" | "viewer"
  ): Promise<Participant | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Check guest limit
    const guestCount = Array.from(room.participants.values()).filter(
      (p) => p.role === "guest" || p.role === "host"
    ).length;

    if (role === "guest" && guestCount >= this.MAX_GUESTS + 1) {
      throw new Error("Room is full (max 20 participants)");
    }

    const participant: Participant = {
      userId,
      transports: new Map(),
      producers: new Map(),
      consumers: new Map(),
      role,
      isMuted: false,
      isVideoOff: false,
    };

    room.participants.set(userId, participant);
    return participant;
  }

  async createWebRtcTransport(
    roomId: string,
    userId: string
  ): Promise<{
    id: string;
    iceParameters: any;
    iceCandidates: any[];
    dtlsParameters: DtlsParameters;
  }> {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("Room not found");

    const participant = room.participants.get(userId);
    if (!participant) throw new Error("Participant not found");

    const transport = await room.router.createWebRtcTransport({
      listenIps: [
        {
          ip: process.env.MEDIASOUP_LISTEN_IP || "0.0.0.0",
          announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP,
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    participant.transports.set(transport.id, transport);

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    };
  }

  async connectTransport(
    roomId: string,
    userId: string,
    transportId: string,
    dtlsParameters: DtlsParameters
  ) {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("Room not found");

    const participant = room.participants.get(userId);
    if (!participant) throw new Error("Participant not found");

    const transport = participant.transports.get(transportId);
    if (!transport) throw new Error("Transport not found");

    await transport.connect({ dtlsParameters });
  }

  async produce(
    roomId: string,
    userId: string,
    transportId: string,
    kind: MediaKind,
    rtpParameters: RtpParameters
  ): Promise<string> {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("Room not found");

    const participant = room.participants.get(userId);
    if (!participant) throw new Error("Participant not found");

    const transport = participant.transports.get(transportId);
    if (!transport) throw new Error("Transport not found");

    const producer = await transport.produce({ kind, rtpParameters });
    participant.producers.set(producer.id, producer);

    // Create consumers for all other participants
    this.createConsumersForProducer(roomId, userId, producer);

    return producer.id;
  }

  private async createConsumersForProducer(
    roomId: string,
    producerUserId: string,
    producer: Producer
  ) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    for (const [userId, participant] of room.participants.entries()) {
      if (userId === producerUserId) continue;

      // Create consumer for this participant
      const consumerTransport = Array.from(participant.transports.values())[0];
      if (!consumerTransport) continue;

      try {
        const consumer = await consumerTransport.consume({
          producerId: producer.id,
          rtpCapabilities: room.router.rtpCapabilities,
          paused: true,
        });

        participant.consumers.set(consumer.id, consumer);
      } catch (error) {
        console.error("Error creating consumer:", error);
      }
    }
  }

  async consume(
    roomId: string,
    userId: string,
    transportId: string,
    producerId: string,
    rtpCapabilities: RtpCapabilities
  ): Promise<{
    id: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
    producerId: string;
  } | null> {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("Room not found");

    const participant = room.participants.get(userId);
    if (!participant) throw new Error("Participant not found");

    const transport = participant.transports.get(transportId);
    if (!transport) throw new Error("Transport not found");

    if (!room.router.canConsume({ producerId, rtpCapabilities })) {
      return null;
    }

    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: false,
    });

    participant.consumers.set(consumer.id, consumer);

    return {
      id: consumer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
      producerId: consumer.producerId,
    };
  }

  async removeParticipant(roomId: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(userId);
    if (!participant) return;

    // Close all transports
    for (const transport of participant.transports.values()) {
      transport.close();
    }

    // Remove from room
    room.participants.delete(userId);

    // Close room if empty
    if (room.participants.size === 0) {
      this.closeRoom(roomId);
    }
  }

  async closeRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Close all participant transports
    for (const participant of room.participants.values()) {
      for (const transport of participant.transports.values()) {
        transport.close();
      }
    }

    // Close router
    room.router.close();

    this.rooms.delete(roomId);
    console.log(`Room ${roomId} closed`);
  }

  getRoomParticipants(roomId: string): Participant[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return Array.from(room.participants.values());
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  async muteParticipant(roomId: string, userId: string, isMuted: boolean) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(userId);
    if (!participant) return;

    participant.isMuted = isMuted;

    // Pause/resume audio producers
    for (const producer of participant.producers.values()) {
      if (producer.kind === "audio") {
        if (isMuted) {
          producer.pause();
        } else {
          producer.resume();
        }
      }
    }
  }

  async toggleVideo(roomId: string, userId: string, isVideoOff: boolean) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(userId);
    if (!participant) return;

    participant.isVideoOff = isVideoOff;

    // Pause/resume video producers
    for (const producer of participant.producers.values()) {
      if (producer.kind === "video") {
        if (isVideoOff) {
          producer.pause();
        } else {
          producer.resume();
        }
      }
    }
  }
}

export const mediasoupService = new MediasoupService();
