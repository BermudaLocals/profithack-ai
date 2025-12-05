import { SFUClient } from './SFUClient';
import { CameraService } from './CameraService';

interface TerminationSignal {
  type: 'TERMINATE_CALL';
  reason: string;
  redirectUrl: string;
}

export class PrivateCallClient extends SFUClient {
  private videoElement: HTMLVideoElement | null = null;
  private audioElement: HTMLAudioElement | null = null;

  constructor(roomId: string, userId: string, cameraService: CameraService) {
    super(roomId, userId, cameraService);
    
    this.onTermination = (reason: string, redirectUrl: string) => {
      this.handleTermination({ type: 'TERMINATE_CALL', reason, redirectUrl });
    };
  }

  public attachStreamElements(videoEl: HTMLVideoElement, audioEl: HTMLAudioElement): void {
    this.videoElement = videoEl;
    this.audioElement = audioEl;
  }

  protected override handleIncomingSignal(data: string): void {
    try {
      const signal: TerminationSignal | any = JSON.parse(data);
      
      if (signal.type === 'TERMINATE_CALL') {
        this.handleTermination(signal as TerminationSignal);
      } else {
        super.handleIncomingSignal(data);
      }
    } catch (e) {
      console.error("Error parsing incoming signal:", e);
    }
  }

  private handleTermination(signal: TerminationSignal): void {
    console.warn(`Call terminated by server. Reason: ${signal.reason}. Redirecting to ${signal.redirectUrl}`);

    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement.style.backgroundColor = 'black';
    }

    if (this.audioElement) {
      this.audioElement.srcObject = null;
      this.audioElement.muted = true;
    }
    
    this.close();

    const reasonText = signal.reason.replace(/_/g, ' ');
    alert(`Your private call has ended. Reason: ${reasonText}. Redirecting to the models page.`);
    
    setTimeout(() => {
      window.location.href = signal.redirectUrl;
    }, 1000);
  }
}
