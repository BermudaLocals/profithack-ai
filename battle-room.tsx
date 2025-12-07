import { useEffect, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import Video, { LocalVideoTrack, LocalAudioTrack, RemoteVideoTrack, RemoteAudioTrack, RemoteParticipant } from "twilio-video";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Zap, Cloud, Clock, Hammer, Gift, Crown, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Participant {
  identity: string;
  videoTrack: RemoteVideoTrack | LocalVideoTrack | null;
  audioTrack: RemoteAudioTrack | LocalAudioTrack | null;
  points: number;
  team: "left" | "right";
}

interface PowerUp {
  id: string;
  type: "glove" | "mist" | "timer" | "hammer" | "lightning";
  name: string;
  active: boolean;
  duration: number;
}

interface FlyingGift {
  id: string;
  icon: string;
  points: number;
  x: number;
  y: number;
  team: "left" | "right";
}

export default function BattleRoomPage() {
  const [, params] = useRoute("/battle/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [room, setRoom] = useState<Video.Room | null>(null);
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [localParticipant, setLocalParticipant] = useState<Participant | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  
  // Battle features
  const [battleTimer, setBattleTimer] = useState(300); // 5 minutes
  const [isVictoryLap, setIsVictoryLap] = useState(false);
  const [victoryLapTimer, setVictoryLapTimer] = useState(180); // 3 minutes
  const [leftPoints, setLeftPoints] = useState(0);
  const [rightPoints, setRightPoints] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    { id: "1", type: "glove", name: "Boosting Glove", active: false, duration: 30 },
    { id: "2", type: "mist", name: "Magic Mist", active: false, duration: 30 },
    { id: "3", type: "timer", name: "Time-Maker", active: false, duration: 0 },
    { id: "4", type: "hammer", name: "Stun Hammer", active: false, duration: 10 },
    { id: "5", type: "lightning", name: "Lightning Bolt", active: false, duration: 20 },
  ]);
  const [flyingGifts, setFlyingGifts] = useState<FlyingGift[]>([]);
  const [showMist, setShowMist] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Battle timer
  useEffect(() => {
    if (!isVictoryLap && battleTimer > 0) {
      const interval = setInterval(() => {
        setBattleTimer(prev => {
          if (prev <= 1) {
            setIsVictoryLap(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [battleTimer, isVictoryLap]);

  // Victory lap timer
  useEffect(() => {
    if (isVictoryLap && victoryLapTimer > 0) {
      const interval = setInterval(() => {
        setVictoryLapTimer(prev => {
          if (prev <= 1) {
            leaveBattle();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isVictoryLap, victoryLapTimer]);

  // Speed multiplier cycles
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeedMultiplier(prev => {
        if (prev === 1) return 2;
        if (prev === 2) return 3;
        return 1;
      });
    }, 30000); // Change every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!params?.id) {
      toast({
        title: "Invalid battle",
        description: "No battle ID provided",
        variant: "destructive",
      });
      navigate("/battles");
      return;
    }

    joinBattle(params.id);

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [params?.id]);

  const joinBattle = async (battleId: string) => {
    try {
      setIsConnecting(true);
      
      const response = await fetch(`/api/battles/${battleId}/join`, {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to join battle");
      }
      
      const { token, roomName } = await response.json();
      
      const twilioRoom = await Video.connect(token, {
        name: roomName,
        audio: true,
        video: { width: 1280, height: 720 },
      });
      
      setRoom(twilioRoom);
      
      const localTracks = Array.from(twilioRoom.localParticipant.tracks.values());
      const localVideoTrack = localTracks.find(
        (track) => track.kind === "video"
      )?.track as LocalVideoTrack | undefined;
      const localAudioTrack = localTracks.find(
        (track) => track.kind === "audio"
      )?.track as LocalAudioTrack | undefined;
      
      setLocalParticipant({
        identity: twilioRoom.localParticipant.identity,
        videoTrack: localVideoTrack || null,
        audioTrack: localAudioTrack || null,
        points: 0,
        team: "left",
      });
      
      if (localVideoTrack && localVideoRef.current) {
        const videoElement = document.createElement('video');
        localVideoTrack.attach(videoElement);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = videoElement.srcObject;
        }
      }
      
      twilioRoom.participants.forEach((participant) => {
        addParticipant(participant);
      });
      
      twilioRoom.on("participantConnected", addParticipant);
      twilioRoom.on("participantDisconnected", removeParticipant);
      
      setIsConnecting(false);
      
      toast({
        title: "Battle Started! ⚔️",
        description: "5 minutes to victory!",
      });
    } catch (error: any) {
      console.error("Error joining battle:", error);
      toast({
        title: "Connection failed",
        description: error.message || "Could not connect to battle",
        variant: "destructive",
      });
      setIsConnecting(false);
      navigate("/battles");
    }
  };

  const addParticipant = (participant: RemoteParticipant) => {
    const videoTrack = Array.from(participant.videoTracks.values())[0]?.track || null;
    const audioTrack = Array.from(participant.audioTracks.values())[0]?.track || null;
    
    setParticipants((prev) => {
      const newParticipants = new Map(prev);
      newParticipants.set(participant.identity, {
        identity: participant.identity,
        videoTrack: videoTrack as RemoteVideoTrack | null,
        audioTrack: audioTrack as RemoteAudioTrack | null,
        points: 0,
        team: prev.size === 0 ? "right" : "left",
      });
      return newParticipants;
    });
    
    participant.on("trackSubscribed", (track) => {
      if (track.kind === "video") {
        const videoElement = remoteVideosRef.current.get(participant.identity);
        if (videoElement) {
          const video = document.createElement('video');
          (track as RemoteVideoTrack).attach(video);
          videoElement.srcObject = video.srcObject;
        }
      }
    });
  };

  const removeParticipant = (participant: RemoteParticipant) => {
    setParticipants((prev) => {
      const newParticipants = new Map(prev);
      newParticipants.delete(participant.identity);
      return newParticipants;
    });
  };

  const toggleMute = () => {
    if (localParticipant?.audioTrack && 'enable' in localParticipant.audioTrack) {
      if (isMuted) {
        (localParticipant.audioTrack as LocalAudioTrack).enable();
      } else {
        (localParticipant.audioTrack as LocalAudioTrack).disable();
      }
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localParticipant?.videoTrack && 'enable' in localParticipant.videoTrack) {
      if (isVideoOff) {
        (localParticipant.videoTrack as LocalVideoTrack).enable();
      } else {
        (localParticipant.videoTrack as LocalVideoTrack).disable();
      }
      setIsVideoOff(!isVideoOff);
    }
  };

  const leaveBattle = () => {
    if (room) {
      room.disconnect();
    }
    navigate("/battles");
  };

  const sendGift = (giftType: string, points: number, team: "left" | "right") => {
    const finalPoints = points * speedMultiplier;
    
    // Add flying gift animation
    const gift: FlyingGift = {
      id: Date.now().toString(),
      icon: giftType === "rose" ? "🌹" : giftType === "lion" ? "🦁" : giftType === "unicorn" ? "🦄" : "💎",
      points: finalPoints,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      team,
    };
    
    setFlyingGifts(prev => [...prev, gift]);
    setTimeout(() => {
      setFlyingGifts(prev => prev.filter(g => g.id !== gift.id));
    }, 2000);
    
    // Update points
    if (team === "left") {
      setLeftPoints(prev => prev + finalPoints);
    } else {
      setRightPoints(prev => prev + finalPoints);
    }
  };

  const activatePowerUp = (type: PowerUp["type"]) => {
    setPowerUps(prev => prev.map(p => 
      p.type === type ? { ...p, active: true } : p
    ));
    
    if (type === "mist") {
      setShowMist(true);
      setTimeout(() => setShowMist(false), 30000);
    } else if (type === "timer") {
      setBattleTimer(prev => prev + 60); // Add 1 minute
    }
    
    // Deactivate after duration
    const powerUp = powerUps.find(p => p.type === type);
    if (powerUp && powerUp.duration > 0) {
      setTimeout(() => {
        setPowerUps(prev => prev.map(p => 
          p.type === type ? { ...p, active: false } : p
        ));
      }, powerUp.duration * 1000);
    }
  };

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-white">Joining Battle...</h2>
        </div>
      </div>
    );
  }

  const winner = leftPoints > rightPoints ? "left" : "right";
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Flying Gifts */}
      <AnimatePresence>
        {flyingGifts.map(gift => (
          <motion.div
            key={gift.id}
            initial={{ x: gift.team === "left" ? "0%" : "100%", y: gift.y + "%", opacity: 1, scale: 0 }}
            animate={{ 
              x: gift.team === "left" ? "100%" : "0%", 
              y: (gift.y - 20) + "%", 
              opacity: 0,
              scale: 1.5 
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute z-50 text-4xl pointer-events-none"
            style={{ top: 0, left: 0 }}
          >
            {gift.icon}
            <span className="text-sm text-pink-500 ml-2">+{gift.points}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Battle Timer */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
        <Card className="bg-black/80 backdrop-blur-sm border-pink-500/50 px-6 py-3">
          <div className="text-center">
            {!isVictoryLap ? (
              <>
                <div className="text-3xl font-bold text-white mb-1">{formatTime(battleTimer)}</div>
                <div className="text-xs text-pink-500 flex items-center gap-1 justify-center">
                  <Flame className="w-3 h-3" />
                  {speedMultiplier}x SPEED
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-yellow-500 mb-1">🏆 VICTORY LAP!</div>
                <div className="text-lg text-white">{formatTime(victoryLapTimer)}</div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Split Screen Battle */}
      <div className="flex-1 flex">
        {/* Left Side */}
        <div className="w-1/2 relative border-r-2 border-pink-500">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Left Points */}
          <div className="absolute top-4 left-4 z-30">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
              key={leftPoints}
              className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full px-6 py-3"
            >
              <div className="text-3xl font-bold text-white">{showMist && winner === "right" ? "???" : leftPoints.toLocaleString()}</div>
              <div className="text-xs text-white/80">POINTS</div>
            </motion.div>
          </div>

          {/* Username */}
          <div className="absolute bottom-20 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="text-lg font-bold text-white flex items-center gap-2">
              {localParticipant?.team === "left" && <Crown className="w-5 h-5 text-yellow-500" />}
              You
            </span>
          </div>

          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-500/20">
              <VideoOff className="w-24 h-24 text-white/50" />
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="w-1/2 relative">
          {Array.from(participants.values())[0] ? (
            <>
              <video
                ref={(el) => {
                  if (el) {
                    const p = Array.from(participants.values())[0];
                    remoteVideosRef.current.set(p.identity, el);
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Right Points */}
              <div className="absolute top-4 right-4 z-30">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.3 }}
                  key={rightPoints}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full px-6 py-3"
                >
                  <div className="text-3xl font-bold text-white">{showMist && winner === "left" ? "???" : rightPoints.toLocaleString()}</div>
                  <div className="text-xs text-white/80">POINTS</div>
                </motion.div>
              </div>

              {/* Username */}
              <div className="absolute bottom-20 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-lg font-bold text-white flex items-center gap-2">
                  {Array.from(participants.values())[0]?.identity}
                  {Array.from(participants.values())[0]?.team === "right" && winner === "right" && isVictoryLap && (
                    <Crown className="w-5 h-5 text-yellow-500" />
                  )}
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <div className="text-center text-white">
                <p className="text-2xl font-bold mb-2">Waiting for opponent...</p>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VS Indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]"
        >
          ⚔️ VS
        </motion.div>
      </div>

      {/* Power-Ups Bar */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 flex gap-2">
        {powerUps.map(powerUp => (
          <Button
            key={powerUp.id}
            size="icon"
            variant={powerUp.active ? "default" : "outline"}
            className={`w-14 h-14 rounded-full ${
              powerUp.active ? "bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse" : ""
            }`}
            onClick={() => !powerUp.active && activatePowerUp(powerUp.type)}
            disabled={powerUp.active}
            data-testid={`powerup-${powerUp.type}`}
          >
            {powerUp.type === "glove" && <span className="text-2xl">🥊</span>}
            {powerUp.type === "mist" && <Cloud className="w-6 h-6" />}
            {powerUp.type === "timer" && <Clock className="w-6 h-6" />}
            {powerUp.type === "hammer" && <Hammer className="w-6 h-6" />}
            {powerUp.type === "lightning" && <Zap className="w-6 h-6" />}
          </Button>
        ))}
      </div>

      {/* Gift Menu */}
      <div className="absolute bottom-32 left-4 z-40 flex flex-col gap-2">
        <Button
          size="icon"
          className="w-16 h-16 rounded-full bg-pink-500 hover:bg-pink-600"
          onClick={() => sendGift("rose", 10, localParticipant?.team || "left")}
          data-testid="gift-rose"
        >
          <span className="text-3xl">🌹</span>
        </Button>
        <Button
          size="icon"
          className="w-16 h-16 rounded-full bg-purple-500 hover:bg-purple-600"
          onClick={() => sendGift("lion", 100, localParticipant?.team || "left")}
          data-testid="gift-lion"
        >
          <span className="text-3xl">🦁</span>
        </Button>
        <Button
          size="icon"
          className="w-16 h-16 rounded-full bg-cyan-500 hover:bg-cyan-600"
          onClick={() => sendGift("unicorn", 1000, localParticipant?.team || "left")}
          data-testid="gift-unicorn"
        >
          <span className="text-3xl">🦄</span>
        </Button>
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/80 backdrop-blur-sm border-t border-pink-500/30">
        <div className="flex items-center justify-center gap-4">
          <Button
            data-testid="button-toggle-mic"
            size="icon"
            variant={isMuted ? "destructive" : "default"}
            className="w-14 h-14 rounded-full"
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          <Button
            data-testid="button-toggle-video"
            size="icon"
            variant={isVideoOff ? "destructive" : "default"}
            className="w-14 h-14 rounded-full"
            onClick={toggleVideo}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <VideoIcon className="w-6 h-6" />}
          </Button>

          <Button
            data-testid="button-leave"
            size="icon"
            variant="destructive"
            className="w-14 h-14 rounded-full"
            onClick={leaveBattle}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
