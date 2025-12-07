export interface CameraConstraints {
  video: {
    facingMode: 'user' | 'environment' | { exact: 'user' | 'environment' } | undefined;
    width: number;
    height: number;
  };
  audio: boolean;
}

export class CameraService {
  private stream: MediaStream | null = null;
  private currentFacingMode: 'user' | 'environment' = 'user';
  private videoElement: HTMLVideoElement | null = null;

  public stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      if (this.videoElement) {
        this.videoElement.srcObject = null;
      }
      console.log("Camera stopped and resources released.");
    }
  }

  public async startCamera(facingMode: 'user' | 'environment' = 'user'): Promise<MediaStream> {
    this.stopCamera();
    this.currentFacingMode = facingMode;
    
    const constraints: CameraConstraints = {
      video: {
        facingMode: { exact: facingMode },
        width: 1280, 
        height: 720,
      },
      audio: true, 
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      const videoTrack = this.stream.getVideoTracks()[0];
      console.log(`Camera started: ${videoTrack.label} (Facing: ${facingMode})`);
      
      return this.stream;
    } catch (error) {
      console.error(`Error accessing ${facingMode} camera:`, error);
      
      try {
        constraints.video.facingMode = facingMode;
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.warn("Used fallback camera constraints.");
        return this.stream;
      } catch (fallbackError) {
        throw new Error("Camera access denied or no device matching constraints found.");
      }
    }
  }

  public async toggleCamera(): Promise<MediaStream> {
    const newFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
    console.log(`Attempting to toggle camera to: ${newFacingMode}`);
    
    try {
      const newStream = await this.startCamera(newFacingMode);
      
      if (this.videoElement) {
        this.attachStreamToElement(this.videoElement, newStream);
      }
      
      return newStream;
    } catch (error) {
      console.error("Failed to toggle camera:", error);
      throw error;
    }
  }

  public attachStreamToElement(videoElement: HTMLVideoElement, stream?: MediaStream): void {
    const targetStream = stream || this.stream;
    this.videoElement = videoElement;
    
    if (targetStream) {
      videoElement.srcObject = targetStream;
      videoElement.play().catch(e => console.error("Video play failed:", e));
    } else {
      console.warn("No active stream to attach. Call startCamera() first.");
    }
  }
  
  public captureFrame(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.videoElement || !this.stream) {
        return reject(new Error("No active video element or stream to capture from."));
      }

      const canvas = document.createElement('canvas');
      canvas.width = this.videoElement.videoWidth;
      canvas.height = this.videoElement.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error("Could not get 2D context from canvas."));
      }
      
      ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create Blob from canvas."));
        }
      }, 'image/jpeg', 0.95);
    });
  }
}
