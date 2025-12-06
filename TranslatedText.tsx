import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Languages, RotateCcw } from "lucide-react";

interface TranslatedTextProps {
  text: string;
  sourceLanguage?: string;
  className?: string;
  showToggle?: boolean;
}

export function TranslatedText({ 
  text, 
  sourceLanguage,
  className = "",
  showToggle = true 
}: TranslatedTextProps) {
  const { user } = useUser();
  const [showOriginal, setShowOriginal] = useState(false);
  const [needsTranslation, setNeedsTranslation] = useState(false);

  // Determine if translation is needed
  useEffect(() => {
    if (!user?.preferredLanguage || !text) {
      setNeedsTranslation(false);
      return;
    }

    // Detect language if not provided
    if (!sourceLanguage) {
      fetch('/api/translate/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
        .then(res => res.json())
        .then(data => {
          setNeedsTranslation(data.detectedLanguage !== user.preferredLanguage);
        })
        .catch(() => setNeedsTranslation(false));
    } else {
      setNeedsTranslation(sourceLanguage !== user.preferredLanguage);
    }
  }, [text, sourceLanguage, user?.preferredLanguage]);

  // Fetch translation
  const { data: translation, isLoading } = useQuery({
    queryKey: ['/api/translate', text, user?.preferredLanguage, sourceLanguage],
    enabled: !showOriginal && needsTranslation && !!user?.preferredLanguage,
    staleTime: Infinity, // Cache translations forever
  });

  // If no translation needed or showing original, display original text
  if (!needsTranslation || showOriginal || !user?.preferredLanguage) {
    return (
      <div className={className}>
        {text}
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="h-4 bg-muted rounded w-full mb-2"></div>
        <div className="h-4 bg-muted rounded w-3/4"></div>
      </div>
    );
  }

  const translatedText = translation?.translatedText || text;
  const detectedLang = translation?.detectedLanguage || sourceLanguage;

  return (
    <div className={className}>
      <div className="relative">
        {translatedText}
        {showToggle && translatedText !== text && (
          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOriginal(!showOriginal)}
              className="text-xs h-6 px-2"
              data-testid="button-toggle-translation"
            >
              <Languages className="w-3 h-3 mr-1" />
              See Original
            </Button>
            {detectedLang && (
              <span className="text-xs text-muted-foreground">
                Translated from {detectedLang.toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Alternative component for when you want to show original with translate option
export function TranslatableText({ 
  text, 
  sourceLanguage,
  className = "" 
}: TranslatedTextProps) {
  const { user } = useUser();
  const [showTranslated, setShowTranslated] = useState(false);

  const { data: translation, isLoading } = useQuery({
    queryKey: ['/api/translate', text, user?.preferredLanguage, sourceLanguage],
    enabled: showTranslated && !!user?.preferredLanguage,
    staleTime: Infinity,
  });

  const needsTranslation = sourceLanguage && sourceLanguage !== user?.preferredLanguage;

  return (
    <div className={className}>
      <div className="relative">
        {showTranslated && translation?.translatedText ? translation.translatedText : text}
        {needsTranslation && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTranslated(!showTranslated)}
              disabled={isLoading}
              className="text-xs h-6 px-2"
              data-testid="button-translate-text"
            >
              {isLoading ? (
                <>
                  <RotateCcw className="w-3 h-3 mr-1 animate-spin" />
                  Translating...
                </>
              ) : showTranslated ? (
                <>
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Show Original
                </>
              ) : (
                <>
                  <Languages className="w-3 h-3 mr-1" />
                  Translate
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
