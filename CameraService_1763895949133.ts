// CameraService.ts - Production-Ready TypeScript Implementation

/**
 * A reusable service to manage camera access, permissions, and dynamic switching 
 * for video recording, video calls, and future biometric sign-in.
 * 
 * This implementation uses the MediaDevices API with explicit constraints 
 * to ensure front/back camera switching works reliably across devices.
 */

// Define the constraints for the camera stream
interface CameraConstraints {
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

    /**
     * Stops any active stream and releases the camera hardware.
     */
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

    /**
     * Requests camera access and starts the video stream.
     * @param facingMode 'user' (front) or 'environment' (back)
     * @returns The MediaStream object
     */
    public async startCamera(facingMode: 'user' | 'environment' = 'user'): Promise<MediaStream> {
        this.stopCamera(); // Always stop the previous stream first
        this.currentFacingMode = facingMode;
        
        // Use 'exact' constraint for reliable switching, as simple 'user'/'environment' 
        // can sometimes default to the wrong camera if not explicitly requested.
        const constraints: CameraConstraints = {
            video: {
                facingMode: { exact: facingMode },
                // Request a standard HD resolution for good quality/performance balance
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
            
            // Fallback: If 'exact' fails, try without it (some older devices require this)
            try {
                constraints.video.facingMode = facingMode;
                this.stream = await navigator.mediaDevices.getUserMedia(constraints);
                console.warn("Used fallback camera constraints.");
                return this.stream;
            } catch (fallbackError) {
                // Final failure: Throw a user-friendly error
                throw new Error("Camera access denied or no device matching constraints found.");
            }
        }
    }

    /**
     * Toggles between the front ('user') and back ('environment') camera.
     * @returns The new MediaStream object
     */
    public async toggleCamera(): Promise<MediaStream> {
        const newFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
        console.log(`Attempting to toggle camera to: ${newFacingMode}`);
        
        try {
            const newStream = await this.startCamera(newFacingMode);
            
            // If a video element was attached, re-attach the new stream
            if (this.videoElement) {
                this.attachStreamToElement(this.videoElement, newStream);
            }
            
            return newStream;
        } catch (error) {
            console.error("Failed to toggle camera:", error);
            throw error;
        }
    }

    /**
     * Attaches the stream to a video element for display.
     * @param videoElement The HTMLVideoElement to display the stream
     * @param stream Optional: The stream to attach (defaults to current stream)
     */
    public attachStreamToElement(videoElement: HTMLVideoElement, stream?: MediaStream): void {
        const targetStream = stream || this.stream;
        this.videoElement = videoElement; // Store reference for toggling
        
        if (targetStream) {
            videoElement.srcObject = targetStream;
            // Play is required for the video to start showing
            videoElement.play().catch(e => console.error("Video play failed:", e));
        } else {
            console.warn("No active stream to attach. Call startCamera() first.");
        }
    }
    
    /**
     * Captures a single frame from the current video stream (useful for Bio Sign-In).
     * @returns A Promise that resolves to a Blob containing the image data (e.g., image/jpeg).
     */
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
            
            // Convert canvas content to a Blob (e.g., for sending to the backend)
            canvas.toBlob(blob => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Failed to create Blob from canvas."));
                }
            }, 'image/jpeg', 0.95); // JPEG format with 95% quality
        });
    }
}

// Example of how to use the captureFrame for Bio Sign-In:
/*
const cameraService = new CameraService();
const videoElement = document.getElementById('bio-capture') as HTMLVideoElement;

// 1. Start with the front camera for face capture
await cameraService.startCamera('user');
cameraService.attachStreamToElement(videoElement);

// 2. User clicks "Sign In"
document.getElementById('sign-in-btn').addEventListener('click', async () => {
    try {
        const imageBlob = await cameraService.captureFrame();
        
        // Send the Blob to the backend for authentication
        const formData = new FormData();
        formData.append('liveImage', imageBlob, 'bio_capture.jpg');
        formData.append('userId', 'current_user_id');

        const response = await fetch('/api/auth/biometric', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            console.log("Biometric Sign-In Successful!");
        } else {
            console.error("Biometric Sign-In Failed.");
        }
        
    } catch (e) {
        console.error("Capture or authentication failed:", e);
    } finally {
        cameraService.stopCamera();
    }
});
*/
