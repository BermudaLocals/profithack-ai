import { useState, useCallback, useRef, useEffect } from "react";
import * as TwilioVideo from "twilio-video";
import { apiRequest } from "@/lib/queryClient";

interface Participant {
  userId: string;
  role: "host" | "guest" | "viewer";
  isMuted: boolean;
  isVideoOff: boolean;
  stream?: MediaStream;
  displayName?: string;
}

interface UseTwilioVideoOptions {
  roomId: string;
  isHost: boolean;
  onParticipantJoined?: (participant: Participant) => void;
  onParticipantLeft?: (userId: string) => void;
  onError?: (error: Error) => void;
}

export function useTwilioVideo({
  roomId,
  isHost,
  onParticipantJoined,
  onParticipantLeft,
  onError,
}: UseTwilioVideoOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const roomRef = useRef<TwilioVideo.Room | null>(null);
  const localTracksRef = useRef<(TwilioVideo.LocalVideoTrack | TwilioVideo.LocalAudioTrack)[]>([]);

  const connect = useCallback(async () => {
    try {
      let response;
      let data: any;

      if (isHost) {
        response = await apiRequest("POST", "/api/twilio/room/create", {
          roomId,
          type: "live_stream",
          maxParticipants: 20,
        });
        data = await response.json();
      } else {
        response = await apiRequest("POST", "/api/twilio/room/join", {
          roomId,
        });
        data = await response.json();
      }

      const { token, roomName } = data;

      const room = await TwilioVideo.connect(token, {
        name: roomName,
        audio: false,
        video: false,
        dominantSpeaker: true,
        maxAudioBitrate: 16000,
        preferredVideoCodecs: [{ codec: "VP8", simulcast: true }],
      });

      roomRef.current = room;

      room.participants.forEach((participant) => {
        handleParticipantConnected(participant);
      });

      room.on("participantConnected", handleParticipantConnected);
      room.on("participantDisconnected", handleParticipantDisconnected);

      room.on("disconnected", (room) => {
        room.localParticipant.tracks.forEach((publication) => {
          const track = publication.track;
          if (track && (track.kind === "video" || track.kind === "audio")) {
            track.stop();
            const elements = track.detach();
            elements.forEach((element) => element.remove());
          }
        });
        setIsConnected(false);
        setParticipants([]);
      });

      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect to Twilio Video:", error);
      onError?.(error as Error);
    }
  }, [roomId, isHost, onError]);

  const handleParticipantConnected = useCallback(
    (participant: TwilioVideo.RemoteParticipant) => {
      const newParticipant: Participant = {
        userId: participant.identity,
        role: "guest",
        isMuted: true,
        isVideoOff: true,
        displayName: participant.identity,
      };

      setParticipants((prev) => {
        const exists = prev.find((p) => p.userId === participant.identity);
        if (exists) return prev;
        return [...prev, newParticipant];
      });

      participant.tracks.forEach((publication) => {
        if (publication.track && (publication.track.kind === "video" || publication.track.kind === "audio")) {
          handleTrackEnabled(publication.track as TwilioVideo.RemoteVideoTrack | TwilioVideo.RemoteAudioTrack, participant.identity);
        }
      });

      participant.on("trackSubscribed", (track) => {
        if (track.kind === "video" || track.kind === "audio") {
          handleTrackEnabled(track as TwilioVideo.RemoteVideoTrack | TwilioVideo.RemoteAudioTrack, participant.identity);
        }
      });

      participant.on("trackUnsubscribed", (track) => {
        if (track.kind === "video" || track.kind === "audio") {
          handleTrackDisabled(track as TwilioVideo.RemoteVideoTrack | TwilioVideo.RemoteAudioTrack, participant.identity);
        }
      });

      onParticipantJoined?.(newParticipant);
    },
    [onParticipantJoined]
  );

  const handleParticipantDisconnected = useCallback(
    (participant: TwilioVideo.RemoteParticipant) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== participant.identity));
      onParticipantLeft?.(participant.identity);
    },
    [onParticipantLeft]
  );

  const handleTrackEnabled = useCallback(
    (track: TwilioVideo.RemoteVideoTrack | TwilioVideo.RemoteAudioTrack, userId: string) => {
      setParticipants((prev) =>
        prev.map((p) => {
          if (p.userId !== userId) return p;

          const updatedParticipant = { ...p };

          if (track.kind === "video") {
            updatedParticipant.isVideoOff = false;
            const mediaStreamTrack = track.mediaStreamTrack;
            const stream = new MediaStream([mediaStreamTrack]);
            updatedParticipant.stream = stream;
          } else if (track.kind === "audio") {
            updatedParticipant.isMuted = false;
          }

          return updatedParticipant;
        })
      );
    },
    []
  );

  const handleTrackDisabled = useCallback(
    (track: TwilioVideo.RemoteVideoTrack | TwilioVideo.RemoteAudioTrack, userId: string) => {
      setParticipants((prev) =>
        prev.map((p) => {
          if (p.userId !== userId) return p;

          const updatedParticipant = { ...p };

          if (track.kind === "video") {
            updatedParticipant.isVideoOff = true;
            updatedParticipant.stream = undefined;
          } else if (track.kind === "audio") {
            updatedParticipant.isMuted = true;
          }

          return updatedParticipant;
        })
      );
    },
    []
  );

  const publishLocalMedia = useCallback(async (stream: MediaStream) => {
    if (!roomRef.current) {
      throw new Error("Room not connected");
    }

    try {
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      const tracks: (TwilioVideo.LocalVideoTrack | TwilioVideo.LocalAudioTrack)[] = [];

      if (videoTrack) {
        const localVideoTrack = new TwilioVideo.LocalVideoTrack(videoTrack);
        await roomRef.current.localParticipant.publishTrack(localVideoTrack);
        tracks.push(localVideoTrack);
      }

      if (audioTrack) {
        const localAudioTrack = new TwilioVideo.LocalAudioTrack(audioTrack);
        await roomRef.current.localParticipant.publishTrack(localAudioTrack);
        tracks.push(localAudioTrack);
      }

      localTracksRef.current = tracks;
      setLocalStream(stream);
    } catch (error) {
      console.error("Failed to publish media:", error);
      onError?.(error as Error);
    }
  }, [onError]);

  const subscribeToParticipant = useCallback(
    async (participantId: string, producerId: string) => {
      console.log("subscribeToParticipant not needed for Twilio - auto-subscribed");
    },
    []
  );

  const toggleMute = useCallback((muted: boolean) => {
    if (!roomRef.current) return;

    roomRef.current.localParticipant.audioTracks.forEach((publication) => {
      if (muted) {
        publication.track.disable();
      } else {
        publication.track.enable();
      }
    });

    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !muted;
      }
    }
  }, [localStream]);

  const toggleVideo = useCallback((videoOff: boolean) => {
    if (!roomRef.current) return;

    roomRef.current.localParticipant.videoTracks.forEach((publication) => {
      if (videoOff) {
        publication.track.disable();
      } else {
        publication.track.enable();
      }
    });

    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoOff;
      }
    }
  }, [localStream]);

  const muteParticipant = useCallback(
    async (userId: string, muted: boolean) => {
      if (!isHost) {
        throw new Error("Only host can mute participants");
      }

      // Update local state immediately for UI feedback
      setParticipants((prev) =>
        prev.map((p) => (p.userId === userId ? { ...p, isMuted: muted } : p))
      );

      // Call backend API to signal mute (Twilio doesn't support server-side mute)
      try {
        await apiRequest("POST", "/api/twilio/participant/mute", {
          roomId,
          userId,
          muted,
        });
      } catch (error) {
        console.error("Failed to mute participant via backend:", error);
        // Revert local state on error
        setParticipants((prev) =>
          prev.map((p) => (p.userId === userId ? { ...p, isMuted: !muted } : p))
        );
        onError?.(error as Error);
        throw error;
      }
    },
    [isHost, roomId, onError]
  );

  const removeParticipant = useCallback(
    async (userId: string) => {
      if (!isHost) {
        throw new Error("Only host can remove participants");
      }

      // Update local state immediately for UI feedback
      setParticipants((prev) => prev.filter((p) => p.userId !== userId));
      onParticipantLeft?.(userId);

      // Call backend API to actually disconnect participant from Twilio
      try {
        await apiRequest("POST", "/api/twilio/participant/remove", {
          roomId,
          userId,
        });
      } catch (error) {
        console.error("Failed to remove participant via backend:", error);
        // Note: We don't revert the local state here as the participant
        // should be considered removed from the UI perspective
        onError?.(error as Error);
      }
    },
    [isHost, roomId, onParticipantLeft, onError]
  );

  const disconnect = useCallback(async () => {
    try {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }

      localTracksRef.current.forEach((track) => {
        if (track.kind === "video" || track.kind === "audio") {
          track.stop();
        }
      });
      localTracksRef.current = [];

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }

      if (isHost) {
        await apiRequest("POST", "/api/twilio/room/end", { roomId });
      }

      setIsConnected(false);
      setParticipants([]);
    } catch (error) {
      console.error("Failed to disconnect:", error);
      onError?.(error as Error);
    }
  }, [roomId, localStream, isHost, onError]);

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
