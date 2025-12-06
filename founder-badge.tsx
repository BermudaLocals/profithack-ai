import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FounderBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function FounderBadge({ size = "md", showLabel = true }: FounderBadgeProps) {
  const sizeClasses = {
    sm: "text-xs h-5",
    md: "text-sm h-6",
    lg: "text-base h-7",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="default" 
            className={`${sizeClasses[size]} gap-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-700 text-white font-bold shadow-lg border-yellow-400/50`}
            data-testid="badge-founder"
          >
            <Crown className={iconSizes[size]} />
            {showLabel && "FOUNDER"}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">Founding Member</p>
          <p className="text-xs text-muted-foreground">Early supporter of PROFITHACK AI</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
