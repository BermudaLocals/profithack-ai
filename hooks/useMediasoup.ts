import { useState, useCallback, useRef, useEffect } from "react";
import { Device, types } from "mediasoup-client";
import { apiRequest } from "@/lib/queryClient";

type Transport = types.Transport;
type Producer = types.Producer;
type Consumer = types.Consumer;

interface Participant {
  userId: string;
  role: "host" | "guest" | "viewer";
  isMuted: boolean;
  isVideoOff: boolean;
  stream?: MediaStream;
  displayName?: string;
}

interface UseMediasoupOptions {
  roomId: string;
  isHost: boolean;
  onParticipantJoined?: (participant: Participant) => void;
  onParticipantLeft?: (userId: string) => void;
  onError?: (error: Error) => void;
}

export function useMediasoup({
  roomId,
  isHost,
  onParticipantJoined,
  onParticipantLeft,
  onError,
}: UseMediasoupOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Mediasoup refs
  const deviceRef = useRef<Device | null>(null);
  const sendTransportRef = useRef<Transport | null>(null);
  const recvTransportRef = useRef<Transport | null>(null);
  const producersRef = useRef<Map<string, Producer>>(new Map());
  const consumersRef = useRef<Map<string, Consumer>>(new Map());

  /**
   * Initialize Mediasoup device and create/join room
   */
  const connect = useCallback(async () => {
    try {
      // Step 1: Create or join room
      const response = isHost
        ? await apiRequest("POST", "/api/webrtc/room/create")
        : await apiRequest("POST", "/api/webrtc/room/join", { roomId });
      const roomData: any = await response.json();

      // Step 2: Initialize Mediasoup device
      const device = new Device();
      await device.load({ routerRtpCapabilities: roomData.rtpCapabilities });
      deviceRef.current = device;

      // Step 3: Create WebRTC send transport (for publishing local media)
      const sendTransportResponse = await apiRequest("POST", "/api/webrtc/transport/create", {
        roomId,
        direction: "send",
      });
      const sendTransportData: any = await sendTransportResponse.json();

      const sendTransport = device.createSendTransport(sendTransportData);
      sendTransportRef.current = sendTransport;

      // Handle transport connection
      sendTransport.on("connect", async ({ dtlsParameters }, callback, errback) => {
        try {
          await apiRequest("POST", "/api/webrtc/transport/connect", {
            transportId: sendTransportData.id,
            dtlsParameters,
          });
          callback();
        } catch (error) {
          errback(error as Error);
        }
      });

      // Handle media production
      sendTransport.on("produce", async ({ kind, rtpParameters }, callback, errback) => {
        try {
          const response = await apiRequest("POST", "/api/webrtc/produce", {
            roomId,
            transportId: sendTransportData.id,
            kind,
            rtpParameters,
          });
          const result: any = await response.json();
          callback({ id: result.producerId });
        } catch (error) {
          errback(error as Error);
        }
      });

      // Step 4: Create WebRTC receive transport (for consuming remote media)
      const recvTransportResponse = await apiRequest("POST", "/api/webrtc/transport/create", {
        roomId,
        direction: "recv",
      });
      const recvTransportData: any = await recvTransportResponse.json();

      const recvTransport = device.createRecvTransport(recvTransportData);
      recvTransportRef.current = recvTransport;

      recvTransport.on("connect", async ({ dtlsParameters }, callback, errback) => {
        try {
          await apiRequest("POST", "/api/webrtc/transport/connect", {
            transportId: recvTransportData.id,
            dtlsParameters,
          });
          callback();
        } catch (error) {
          errback(error as Error);
        }
      });

      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect to Mediasoup:", error);
      onError?.(error as Error);
    }
  }, [roomId, isHost, onError]);

  /**
   * Publish local media (camera/microphone)
   */
  const publishLocalMedia = useCallback(async (stream: MediaStream) => {
    if (!sendTransportRef.current) {
      throw new Error("Send transport not initialized");
    }

    try {
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      // Produce video
      if (videoTrack) {
        const videoProducer = await sendTransportRef.current.produce({
          track: videoTrack,
        });
        producersRef.current.set("video", videoProducer);
      }

      // Produce audio
      if (audioTrack) {
        const audioProducer = await sendTransportRef.current.produce({
          track: audioTrack,
        });
        producersRef.current.set("audio", audioProducer);
      }

      setLocalStream(stream);
    } catch (error) {
      console.error("Failed to publish media:", error);
      onError?.(error as Error);
    }
  }, [onError]);

  /**
   * Subscribe to remote participant's media
   */
  const subscribeToParticipant = useCallback(
    async (participantId: string, producerId: string) => {
      if (!recvTransportRef.current || !deviceRef.current) {
        throw new Error("Receive transport or device not initialized");
      }

      try {
        const response = await apiRequest("POST", "/api/webrtc/consume", {
          roomId,
          producerId,
          rtpCapabilities: deviceRef.current.rtpCapabilities,
        });
        
        const result: any = await response.json();
        const { id, kind, rtpParameters } = result;

        const consumer = await recvTransportRef.current.consume({
          id,
          producerId,
          kind,
          rtpParameters,
        });

        consumersRef.current.set(participantId, consumer);

        // Add participant with media stream
        const stream = new MediaStream([consumer.track]);
        setParticipants((prev) => {
          const existing = prev.find((p) => p.userId === participantId);
          if (existing) {
            return prev.map((p) =>
              p.userId === participantId ? { ...p, stream } : p
            );
          }
          return [
            ...prev,
            {
              userId: participantId,
              role: "guest",
              isMuted: false,
              isVideoOff: false,
              stream,
            },
          ];
        });

        onParticipantJoined?.({
          userId: participantId,
          role: "guest",
          isMuted: false,
          isVideoOff: false,
          stream,
        });
      } catch (error) {
        console.error("Failed to consume participant media:", error);
        onError?.(error as Error);
      }
    },
    [roomId, onParticipantJoined, onError]
  );

  /**
   * Mute/unmute local audio
   */
  const toggleMute = useCallback((muted: boolean) => {
    const audioProducer = producersRef.current.get("audio");
    if (audioProducer) {
      if (muted) {
        audioProducer.pause();
      } else {
        audioProducer.resume();
      }
    }

    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !muted;
      }
    }
  }, [localStream]);

  /**
   * Enable/disable local video
   */
  const toggleVideo = useCallback((videoOff: boolean) => {
    const videoProducer = producersRef.current.get("video");
    if (videoProducer) {
      if (videoOff) {
        videoProducer.pause();
      } else {
        videoProducer.resume();
      }
    }

    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoOff;
      }
    }
  }, [localStream]);

  /**
   * Host Controls: Mute a participant (requires host role)
   */
  const muteParticipant = useCallback(
    async (userId: string, muted: boolean) => {
      if (!isHost) {
        throw new Error("Only host can mute participants");
      }

      try {
        await apiRequest("POST", "/api/webrtc/participant/mute", {
          roomId,
          userId,
          isMuted: muted,
        });

        setParticipants((prev) =>
          prev.map((p) => (p.userId === userId ? { ...p, isMuted: muted } : p))
        );
      } catch (error) {
        console.error("Failed to mute participant:", error);
        onError?.(error as Error);
      }
    },
    [isHost, roomId, onError]
  );

  /**
   * Host Controls: Remove a participant (requires host role)
   */
  const removeParticipant = useCallback(
    async (userId: string) => {
      if (!isHost) {
        throw new Error("Only host can remove participants");
      }

      try {
        await apiRequest("POST", "/api/webrtc/participant/remove", {
          roomId,
          userId,
        });

        setParticipants((prev) => prev.filter((p) => p.userId !== userId));
        onParticipantLeft?.(userId);
      } catch (error) {
        console.error("Failed to remove participant:", error);
        onError?.(error as Error);
      }
    },
    [isHost, roomId, onParticipantLeft, onError]
  );

  /**
   * Leave room and cleanup
   */
  const disconnect = useCallback(async () => {
    try {
      // Close all producers
      producersRef.current.forEach((producer) => producer.close());
      producersRef.current.clear();

      // Close all consumers
      consumersRef.current.forEach((consumer) => consumer.close());
      consumersRef.current.clear();

      // Close transports
      sendTransportRef.current?.close();
      recvTransportRef.current?.close();

      // Stop local media
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }

      // Leave room
      await apiRequest("POST", "/api/webrtc/room/leave", { roomId });

      setIsConnected(false);
      setParticipants([]);
    } catch (error) {
      console.error("Failed to disconnect:", error);
      onError?.(error as Error);
    }
  }, [roomId, localStream, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [isConnected, disconnect]);

  return {
    isConnected,
    participants,
    localStream,
    connect,
    publishLocalMedia,
    subscribeToParticipant,
    toggleMute,
    toggleVideo,
    muteParticipant,
    removeParticipant,
    disconnect,
  };
}
