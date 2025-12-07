// frontend_camera_service.ts - Conceptual TypeScript/JavaScript for Camera Service

/**
 * A reusable service to manage camera access, permissions, and switching.
 * This code is typically run in the browser (React, Vue, or plain JS).
 */

// Define the constraints for the camera stream
interface CameraConstraints {
    video: {
        facingMode: 'user' | 'environment' | undefined;
        width: number;
        height: number;
    };
    audio: boolean;
}

export class CameraService {
    private stream: MediaStream | null = null;
    private currentFacingMode: 'user' | 'environment' = 'user'; // 'user' is front camera, 'environment' is back

    /**
     * Requests camera access and starts the video stream.
     * @param facingMode 'user' (front) or 'environment' (back)
     * @returns The MediaStream object
     */
    public async startCamera(facingMode: 'user' | 'environment' = 'user'): Promise<MediaStream> {
        this.currentFacingMode = facingMode;
        
        const constraints: CameraConstraints = {
            video: {
                // Request the specific camera type
                facingMode: facingMode,
                // Request high resolution for video posting
                width: 1280, 
                height: 720,
            },
            audio: true, // Always request audio for video/reels/calls
        };

        try {
            // Stop any existing stream before starting a new one
            this.stopCamera(); 
            
            // Get the media stream from the user's device
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Log the actual device used (useful for debugging)
            const videoTrack = this.stream.getVideoTracks()[0];
            console.log(`Camera started: ${videoTrack.label} (Facing: ${facingMode})`);
            
            return this.stream;
        } catch (error) {
            console.error("Error accessing camera:", error);
            // Handle common errors like permission denied
            throw new Error("Camera access denied or no device found.");
        }
    }

    /**
     * Stops the current camera stream.
     */
    public stopCamera(): void {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            console.log("Camera stopped.");
        }
    }

    /**
     * Toggles between the front ('user') and back ('environment') camera.
     * @returns The new MediaStream object
     */
    public async toggleCamera(): Promise<MediaStream> {
        const newFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
        console.log(`Toggling camera to: ${newFacingMode}`);
        return this.startCamera(newFacingMode);
    }

    /**
     * Attaches the stream to a video element.
     * @param videoElement The HTMLVideoElement to display the stream
     */
    public attachStreamToElement(videoElement: HTMLVideoElement): void {
        if (this.stream) {
            videoElement.srcObject = this.stream;
            videoElement.play();
        } else {
            console.warn("No active stream to attach.");
        }
    }
}

// Example Usage for Video Posting:
/*
const cameraService = new CameraService();
const videoElement = document.getElementById('video-preview') as HTMLVideoElement;

// Start with the front camera
try {
    const stream = await cameraService.startCamera('user');
    cameraService.attachStreamToElement(videoElement);
} catch (e) {
    // Handle error
}

// User clicks a button to switch camera
document.getElementById('switch-camera-btn').addEventListener('click', async () => {
    try {
        const newStream = await cameraService.toggleCamera();
        cameraService.attachStreamToElement(videoElement);
    } catch (e) {
        // Handle error
    }
});
*/
