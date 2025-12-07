import { CameraService } from './CameraService';

export class SFUClient {
  private roomId: string;
  private userId: string;
  private ws: WebSocket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private cameraService: CameraService;
  
  public onRemoteStream: (stream: MediaStream, userId: string) => void = () => {};
  public onTermination: (reason: string, redirectUrl: string) => void = () => {};

  constructor(roomId: string, userId: string, cameraService: CameraService) {
    this.roomId = roomId;
    this.userId = userId;
    this.cameraService = cameraService;
  }

  public async joinAsParticipant(): Promise<void> {
    const localStream = await this.cameraService.startCamera('user');

    this.ws = new WebSocket(`wss://${window.location.host}/api/rtc/signaling`);
    
    this.ws.onopen = () => {
      this.ws!.send(JSON.stringify({
        type: 'JOIN_ROOM',
        roomId: this.roomId,
        userId: this.userId,
        isSpectator: false
      }));
    };

    this.ws.onmessage = (event) => {
      this.handleIncomingSignal(event.data);
    };

    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    localStream.getTracks().forEach((track: MediaStreamTrack) => {
      this.peerConnection!.addTrack(track, localStream);
    });

    this.peerConnection.ontrack = (event) => {
      this.onRemoteStream(event.streams[0], event.transceiver.mid!);
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.ws) {
        this.ws.send(JSON.stringify({
          type: 'ICE_CANDIDATE',
          candidate: event.candidate,
          roomId: this.roomId,
          userId: this.userId
        }));
      }
    };

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    
    if (this.ws) {
      this.ws.send(JSON.stringify({
        type: 'OFFER',
        sdp: this.peerConnection.localDescription,
        roomId: this.roomId,
        userId: this.userId
      }));
    }
  }
  
  public async joinAsSpectator(): Promise<string> {
    return new Promise((resolve) => {
      this.ws = new WebSocket(`wss://${window.location.host}/api/rtc/signaling`);
      
      this.ws.onopen = () => {
        this.ws!.send(JSON.stringify({
          type: 'JOIN_ROOM',
          roomId: this.roomId,
          userId: this.userId,
          isSpectator: true
        }));
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'SPECTATOR_URL') {
          resolve(data.streamUrl);
        }
      };
    });
  }

  protected handleIncomingSignal(data: string): void {
    try {
      const signal = JSON.parse(data);
      
      if (signal.type === 'TERMINATE_CALL') {
        this.onTermination(signal.reason, signal.redirectUrl);
        this.close();
      } else if (signal.type === 'ANSWER' && this.peerConnection) {
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      } else if (signal.type === 'ICE_CANDIDATE' && this.peerConnection) {
        this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    } catch (e) {
      console.error("Error parsing incoming signal:", e);
    }
  }

  public close(): void {
    this.cameraService.stopCamera();
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
