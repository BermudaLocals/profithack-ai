import { useState } from "react";
import { COMING_SOON_FEATURES, type FeatureId } from "@/config/features";

export function useComingSoon() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<FeatureId | null>(null);

  const showComingSoon = (featureId: FeatureId) => {
    setCurrentFeature(featureId);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setCurrentFeature(null);
  };

  const feature = currentFeature ? COMING_SOON_FEATURES[currentFeature] : null;

  return {
    isOpen,
    feature,
    showComingSoon,
    closeModal
  };
}
