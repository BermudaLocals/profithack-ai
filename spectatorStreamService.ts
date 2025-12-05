import { spawn, ChildProcess } from 'child_process';

const STREAM_CONFIG = {
  format: 'HLS',
  bitrates: [
    { resolution: '1280x720', bitrate: '2500k' },
    { resolution: '854x480', bitrate: '1000k' },
    { resolution: '426x240', bitrate: '400k' },
  ],
  segmentDuration: 2,
};

export class SpectatorStreamService {
  private activeRooms: Map<string, { transcoderProcess: ChildProcess, streamUrl: string }> = new Map();

  public async startRoomStream(roomId: string, sfuInputUrl: string): Promise<string> {
    if (this.activeRooms.has(roomId)) {
      return this.activeRooms.get(roomId)!.streamUrl;
    }

    const transcoderProcess = this.runFFmpegTranscoder(roomId, sfuInputUrl);
    const streamUrl = this.generatePublicStreamUrl(roomId, STREAM_CONFIG.format);

    this.activeRooms.set(roomId, { transcoderProcess, streamUrl });
    console.log(`Started spectator stream for room ${roomId}. URL: ${streamUrl}`);
    
    return streamUrl;
  }

  public async stopRoomStream(roomId: string): Promise<void> {
    const roomData = this.activeRooms.get(roomId);
    if (roomData) {
      roomData.transcoderProcess.kill('SIGINT');
      this.activeRooms.delete(roomId);
      console.log(`Stopped spectator stream for room ${roomId}.`);
    }
  }

  private runFFmpegTranscoder(roomId: string, inputUrl: string): ChildProcess {
    const outputDir = `/tmp/live/${roomId}`;
    const outputManifest = `${outputDir}/master.m3u8`;
    
    const ffmpegArgs = [
      '-i', inputUrl,
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-g', '48',
      '-sc_threshold', '0',
      '-map', '0:v:0',
      '-map', '0:a:0',
      '-f', 'hls',
      '-hls_time', STREAM_CONFIG.segmentDuration.toString(),
      '-hls_playlist_type', 'event',
      '-hls_segment_filename', `${outputDir}/%03d.ts`,
      outputManifest
    ];
    
    console.log(`Starting FFmpeg transcoder for room ${roomId}`);
    const process = spawn('ffmpeg', ffmpegArgs);
    
    process.stderr.on('data', (data) => {
      console.log(`FFmpeg [${roomId}]: ${data}`);
    });
    
    process.on('close', (code) => {
      console.log(`FFmpeg process for room ${roomId} exited with code ${code}`);
    });
    
    return process;
  }
  
  public getStreamUrl(roomId: string): string | null {
    return this.activeRooms.get(roomId)?.streamUrl || null;
  }
  
  private generatePublicStreamUrl(roomId: string, format: string): string {
    return `https://cdn.profithack.ai/live/${roomId}/master.m3u8`;
  }
}

export const spectatorStreamService = new SpectatorStreamService();
