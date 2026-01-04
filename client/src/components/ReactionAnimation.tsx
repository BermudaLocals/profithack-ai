import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { InteractionMessage } from '../hooks/useInteractions';

interface ReactionAnimationProps {
  interaction: InteractionMessage | null;
}

// Simple inline styles for the animation to keep it self-contained
const animationStyles = `
  @keyframes floatUpAndFade {
    0% {
      opacity: 1;
      transform: translateY(0px) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-100px) scale(1.5);
    }
  }
  .reaction-animation {
    position: fixed;
    bottom: 20%;
    left: 50%;
    transform: translateX(-50%);
    animation: floatUpAndFade 2s ease-out forwards;
    pointer-events: none; // Make sure it doesn't block clicks
    z-index: 1000;
  }
`;

export const ReactionAnimation: React.FC<ReactionAnimationProps> = ({ interaction }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (interaction && interaction.type === 'like' && interaction.action === 'liked') {
      setIsVisible(true);
      // Hide the animation after it completes
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000); // Duration should match the CSS animation

      return () => clearTimeout(timer);
    }
  }, [interaction]);

  if (!isVisible) {
    return null; // Render nothing if there's no relevant interaction
  }

  return (
    <>
      <style>{animationStyles}</style>
      <div className="reaction-animation">
        <Heart size={48} fill="#ef4444" color="#ef4444" />
      </div>
    </>
  );
};
