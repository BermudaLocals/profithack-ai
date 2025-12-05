import { WebSocket } from 'ws';

interface UserConnection {
  ws: WebSocket;
  roomId: string;
  userId: string;
}

class PaymentEnforcementService {
  private activeConnections: Map<string, UserConnection> = new Map();

  public registerConnection(roomId: string, userId: string, ws: WebSocket): void {
    const key = `${roomId}:${userId}`;
    this.activeConnections.set(key, { ws, roomId, userId });
    console.log(`Registered connection for user ${userId} in room ${roomId}`);
  }

  public unregisterConnection(roomId: string, userId: string): void {
    const key = `${roomId}:${userId}`;
    this.activeConnections.delete(key);
    console.log(`Unregistered connection for user ${userId} in room ${roomId}`);
  }

  public async handlePaymentFailure(
    roomId: string, 
    userId: string, 
    reason: 'PAYMENT_FAILED' | 'TIME_EXPIRED'
  ): Promise<void> {
    console.warn(`Payment failure detected for user ${userId} in room ${roomId}. Reason: ${reason}`);

    const key = `${roomId}:${userId}`;
    const connection = this.activeConnections.get(key);

    if (connection && connection.ws.readyState === WebSocket.OPEN) {
      const terminationSignal = {
        type: 'TERMINATE_CALL',
        reason: reason,
        redirectUrl: '/models'
      };
      
      try {
        connection.ws.send(JSON.stringify(terminationSignal));
        console.log(`Sent termination signal to user ${userId}`);
        
        setTimeout(() => {
          connection.ws.close();
          this.unregisterConnection(roomId, userId);
        }, 2000);
        
      } catch (error) {
        console.error(`Error sending termination signal to ${userId}:`, error);
      }
    } else {
      console.warn(`No active connection found for user ${userId} in room ${roomId}`);
    }
  }

  public terminateUserStream(roomId: string, userId: string, reason: string): boolean {
    const key = `${roomId}:${userId}`;
    const connection = this.activeConnections.get(key);

    if (connection && connection.ws.readyState === WebSocket.OPEN) {
      const terminationSignal = {
        type: 'TERMINATE_CALL',
        reason: reason,
        redirectUrl: '/models'
      };
      
      try {
        connection.ws.send(JSON.stringify(terminationSignal));
        connection.ws.close();
        this.unregisterConnection(roomId, userId);
        console.log(`Terminated stream for user ${userId} in room ${roomId}`);
        return true;
      } catch (error) {
        console.error(`Error terminating stream for ${userId}:`, error);
        return false;
      }
    }
    
    return false;
  }
}

export const paymentEnforcementService = new PaymentEnforcementService();
