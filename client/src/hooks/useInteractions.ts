import { useEffect, useState, useRef, useCallback } from 'react';

// Define the structure of an incoming interaction message
interface InteractionMessage {
  type: string;
  action: string;
  videoId: number;
  actorUsername: string;
  [key: string]: any; // Allow for other properties
}

/**
 * A custom hook to manage WebSocket connections for real-time interactions.
 * @param userId - The ID of the current user.
 * @returns An object with the latest interaction and a function to send interactions.
 */
export const useInteractions = (userId: number | null) => {
  const [interaction, setInteraction] = useState<InteractionMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);

  // Function to send an interaction to the server
  const sendInteraction = useCallback((type: string, targetId: number) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && userId) {
      const message = JSON.stringify({ type, targetId });
      ws.current.send(message);
    } else {
      console.error('WebSocket is not connected or userId is not set.');
    }
  }, [userId]);

  useEffect(() => {
    // Do not connect if userId is not available
    if (!userId) {
      return;
    }

    // Construct the WebSocket URL, including the userId as a query parameter
    const wsUrl = `ws://localhost:5000?userId=${userId}`; // Use your server's address
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      const message: InteractionMessage = JSON.parse(event.data);
      console.log('Received interaction:', message);
      setInteraction(message); // Update state with the new interaction
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup function: close the WebSocket connection when the component unmounts
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [userId]); // Re-run effect if userId changes

  return { interaction, sendInteraction };
};
