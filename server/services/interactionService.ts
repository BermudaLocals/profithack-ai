/**
 * INTERACTION SERVICE
 * 
 * This is the unified engine for all real-time interactions in the app.
 * It handles database updates, credit transactions, and WebSocket broadcasts.
 * This is the single source of truth for all real-time events.
 */

import { db } from '../db'; // Assuming your db connection is in server/db.ts
import { users, videos, videoLikes } from '../../shared/schema';
import { eq, and, gte, lt } from 'drizzle-orm';
import { WebSocketServer, WebSocket } from 'ws'; // You will need to install 'ws' and its types

// A map to store active WebSocket connections, keyed by userId
let activeConnections = new Map<number, WebSocket>();

// This function will be called by our main server file to initialize the service
export const initializeInteractionService = (wss: WebSocketServer) => {
  wss.on('connection', (ws: WebSocket, req) => {
    // In a real app, you'd authenticate the user here and get their userId
    // For now, we'll assume the userId is sent in a query param for simplicity
    const userId = new URL(req.url!, `http://${req.headers.host}`).searchParams.get('userId');
    if (!userId) {
      ws.close(1008, 'User ID not provided');
      return;
    }
    
    const userIdNum = parseInt(userId);
    activeConnections.set(userIdNum, ws);

    ws.on('close', () => {
      activeConnections.delete(userIdNum);
    });

    ws.on('message', (message) => {
      // Handle incoming messages from the client if needed
      console.log(`Received message from user ${userIdNum}: ${message}`);
    });
  });
};

/**
 * Broadcasts an interaction message to a specific user's connected clients.
 * @param targetUserId - The ID of the user to receive the broadcast.
 * @param message - The interaction message to send.
 */
const broadcastToUser = (targetUserId: number, message: object) => {
  const connection = activeConnections.get(targetUserId);
  if (connection && connection.readyState === WebSocket.OPEN) {
    connection.send(JSON.stringify(message));
  }
};

/**
 * Processes a 'like' interaction.
 * @param actorId - The ID of the user performing the like.
 * @param targetVideoId - The ID of the video being liked.
 */
export const processLikeInteraction = async (actorId: number, targetVideoId: number) => {
  try {
    // 1. Database: Check if the user has already liked this video
    const existingLike = await db.select()
      .from(videoLikes)
      .where(and(eq(videoLikes.userId, actorId), eq(videoLikes.videoId, targetVideoId)))
      .limit(1);

    if (existingLike.length > 0) {
      // User has already liked, so we 'unlike' it
      await db.delete(videoLikes)
        .where(and(eq(videoLikes.userId, actorId), eq(videoLikes.videoId, targetVideoId)));
      
      // Broadcast 'unlike' event
      broadcastToUser(actorId, { type: 'like', action: 'unliked', videoId: targetVideoId });
    } else {
      // User has not liked, so we add the like
      await db.insert(videoLikes).values({ userId: actorId, videoId: targetVideoId });

      // 2. Database: Get the creator of the video to notify them
      const video = await db.select({ creatorId: videos.userId }).from(videos).where(eq(videos.id, targetVideoId)).limit(1);
      if (!video.length) return;
      
      const creatorId = video[0].creatorId;

      // 3. Broadcast: Send the 'like' event to the creator
      broadcastToUser(creatorId, { 
        type: 'like', 
        action: 'liked', 
        videoId: targetVideoId, 
        actorUsername: `user${actorId}` // In a real app, fetch the username
      });
    }
  } catch (error) {
    console.error('Error processing like interaction:', error);
  }
};

// We will add more interaction processors here later (e.g., processGiftInteraction, processBetInteraction)
