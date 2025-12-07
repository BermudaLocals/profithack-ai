import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, Heart, TrendingUp, Trophy, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import "@/styles/daily-nexus.css";

interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  reward: number;
  completed: boolean;
  expiresAt: string;
}

interface Bonus {
  id: string;
  bonusType: string;
  multiplier: number;
  reason: string;
  expiresAt: string;
}

interface DailyNexusState {
  userId: string;
  streak: number;
  totalRewards: number;
  todayRewards: number;
  nextClaimTime: number;
  multiplier: number;
  level: number;
  experience: number;
  predictions: {
    timeUntilNext: number;
    expectedReward: number;
    rarity: string;
  };
  socialStats: {
    friendsOnStreak: number;
    friendsBeatenToday: number;
    leaderboardPosition: number;
  };
  challenges: Challenge[];
  bonuses: Bonus[];
}

export default function DailyNexus() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [claiming, setClaiming] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [animatingReward, setAnimatingReward] = useState(false);
  const [lastReward, setLastReward] = useState<any>(null);

  // Fetch daily state
  const { data: state, isLoading } = useQuery<DailyNexusState>({
    queryKey: ["/api/daily-nexus", user?.id],
    enabled: !!user?.id,
  });

  // Claim reward mutation
  const claimMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/daily-nexus/${user?.id}/claim`);
      return await res.json();
    },
    onSuccess: (data) => {
      setLastReward(data.reward);
      setAnimatingReward(true);
      triggerConfetti();
      triggerParticles();
      
      toast({
        title: "🎉 Reward Claimed!",
        description: `You earned ${data.reward.amount} coins!`,
      });

      setTimeout(() => setAnimatingReward(false), 3000);
      queryClient.invalidateQueries({ queryKey: ["/api/daily-nexus", user?.id] });
    },
  });

  // Timer countdown
  useEffect(() => {
    if (!state) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, state.nextClaimTime - now);

      if (diff === 0) {
        setTimeLeft("Claim Now!");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(
          hours > 0
            ? `${hours}h ${minutes}m`
            : minutes > 0
            ? `${minutes}m ${seconds}s`
            : `${seconds}s`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [state]);

  const triggerConfetti = () => {
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti-particle";
      confetti.style.left = Math.random() * 100 + "%";
      confetti.style.setProperty("--animation-duration", `${2 + Math.random()}s`);
      document.querySelector(".daily-nexus-main")?.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
    }
  };

  const triggerParticles = () => {
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement("div");
      particle.className = "reward-particle";
      particle.innerHTML = "✨";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";
      particle.style.setProperty("--animation-duration", `${1 + Math.random()}s`);
      document.querySelector(".claim-button-wrapper")?.appendChild(particle);
      setTimeout(() => particle.remove(), 2000);
    }
  };

  const handleClaim = async () => {
    if (!canClaim || claiming) return;
    setClaiming(true);
    try {
      await claimMutation.mutateAsync();
    } finally {
      setClaiming(false);
    }
  };

  if (isLoading || !state) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading">Loading Daily Nexus...</div>
      </div>
    );
  }

  const canClaim = Date.now() >= state.nextClaimTime;
  const totalMultiplier = state.multiplier * state.bonuses.reduce((acc, b) => acc * b.multiplier, 1);
  const expectedReward = Math.floor(50 * totalMultiplier);

  return (
    <div className="daily-nexus-main" data-testid="page-daily-nexus">
      {/* Header with Social Stats */}
      <div className="nexus-header">
        <div className="header-left">
          <h1>Daily Nexus</h1>
          <p>Your daily engagement hub</p>
        </div>
        <div className="header-right">
          <div className="social-stat" data-testid="stat-streak">
            <Flame className="stat-icon text-[#FF4500]" />
            <span className="stat-value">{state.streak}</span>
            <span className="stat-label">Streak</span>
          </div>
          <div className="social-stat" data-testid="stat-rank">
            <Trophy className="stat-icon text-[#FFD700]" />
            <span className="stat-value">#{state.socialStats.leaderboardPosition}</span>
            <span className="stat-label">Rank</span>
          </div>
        </div>
      </div>

      {/* Main Claim Button */}
      <div className="claim-section">
        <div className="claim-button-wrapper">
          <Button
            data-testid="button-claim-reward"
            className={`claim-button ${canClaim ? "ready" : "cooldown"} ${
              animatingReward ? "claimed" : ""
            }`}
            onClick={handleClaim}
            disabled={!canClaim || claiming}
            size="icon"
          >
            <div className="button-content">
              <Heart className="reward-icon" />
              <div className="reward-text">
                {canClaim ? (
                  <>
                    <div className="claim-label">CLAIM REWARD</div>
                    <div className="reward-amount" data-testid="text-expected-reward">+{expectedReward}</div>
                  </>
                ) : (
                  <>
                    <div className="cooldown-label">Next in</div>
                    <div className="time-display" data-testid="text-time-remaining">{timeLeft}</div>
                  </>
                )}
              </div>
            </div>
            <div className="button-glow"></div>
          </Button>

          {canClaim && (
            <div className="prediction-tooltip">
              <Zap className="tooltip-icon" />
              <span className="tooltip-text">
                Expected: {expectedReward} coins ({state.predictions.rarity})
              </span>
            </div>
          )}
        </div>

        {animatingReward && lastReward && (
          <div className="reward-popup">
            <div className="popup-icon">{lastReward.icon || "💎"}</div>
            <div className="popup-name">{lastReward.name || "Daily Reward"}</div>
            <div className="popup-amount">+{lastReward.amount}</div>
            {lastReward.bonus && (
              <div className="popup-bonus">Bonus: {lastReward.bonus}</div>
            )}
          </div>
        )}
      </div>

      {/* Multiplier Display */}
      <div className="multiplier-section">
        <Card className="multiplier-card">
          <div className="multiplier-label">Current Multiplier</div>
          <div className="multiplier-value" data-testid="text-multiplier">x{totalMultiplier.toFixed(1)}</div>
          <div className="multiplier-breakdown">
            <div className="breakdown-item">
              <span>Streak Bonus</span>
              <span>x{state.multiplier}</span>
            </div>
            {state.bonuses.map((bonus) => (
              <div key={bonus.id} className="breakdown-item">
                <span>{bonus.reason}</span>
                <span>x{bonus.multiplier}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Active Challenges */}
      {state.challenges.length > 0 && (
        <div className="challenges-section">
          <h3>Today's Challenges</h3>
          <div className="challenges-grid">
            {state.challenges.map((challenge) => (
              <Card
                key={challenge.id}
                className={`challenge-card ${challenge.completed ? "completed" : ""}`}
                data-testid={`challenge-${challenge.id}`}
              >
                <div className="challenge-icon">{challenge.icon}</div>
                <div className="challenge-info">
                  <div className="challenge-name">{challenge.name}</div>
                  <div className="challenge-progress">
                    <Progress
                      value={(challenge.progress / challenge.maxProgress) * 100}
                      className="progress-bar"
                    />
                    <span className="progress-text">
                      {challenge.progress}/{challenge.maxProgress}
                    </span>
                  </div>
                  <div className="challenge-reward">+{challenge.reward}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Level & Experience */}
      <div className="level-section">
        <Card className="level-card">
          <div className="level-display">
            <TrendingUp className="level-icon" />
            <div className="level-number" data-testid="text-level">LVL {state.level}</div>
            <div className="level-title">Daily Master</div>
          </div>
          <Progress
            value={((state.experience % 1000) / 1000) * 100}
            className="experience-bar"
          />
          <div className="experience-text" data-testid="text-experience">
            {state.experience % 1000} / 1000 XP to next level
          </div>
        </Card>
      </div>

      {/* Social Leaderboard Preview */}
      <div className="social-section">
        <h3>Friends on Streak</h3>
        <div className="friends-count">
          <Users className="count-icon" />
          <span className="count-number" data-testid="text-friends-streak">{state.socialStats.friendsOnStreak}</span>
          <span className="count-label">friends maintaining streaks</span>
        </div>
        <Button variant="outline" className="view-leaderboard-btn" data-testid="button-view-leaderboard">
          View Full Leaderboard →
        </Button>
      </div>

      {/* Daily Stats */}
      <div className="stats-section">
        <Card className="stat-card">
          <span className="stat-icon">💎</span>
          <div className="stat-info">
            <span className="stat-label">Today's Rewards</span>
            <span className="stat-value" data-testid="text-today-rewards">{state.todayRewards}</span>
          </div>
        </Card>
        <Card className="stat-card">
          <span className="stat-icon">🏆</span>
          <div className="stat-info">
            <span className="stat-label">Total Rewards</span>
            <span className="stat-value" data-testid="text-total-rewards">{state.totalRewards}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
