import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface WordUsageProgressProps {
  compact?: boolean;
}

export function WordUsageProgress({ compact = false }: WordUsageProgressProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!profile) return null;

  const wordsUsed = profile.words_used || 0;
  const wordsLimit = profile.words_limit || 5000;
  const wordsRemaining = Math.max(0, wordsLimit - wordsUsed);
  const usagePercentage = Math.min((wordsUsed / wordsLimit) * 100, 100);

  const getProgressColor = () => {
    if (usagePercentage >= 90) return "bg-destructive";
    if (usagePercentage >= 70) return "bg-yellow-500";
    return "bg-primary";
  };

  if (compact) {
    return (
      <div className="px-3 py-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Word Usage</span>
        </div>
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground">
            {wordsUsed.toLocaleString()} used
          </span>
          <span className="text-[10px] text-muted-foreground">
            {wordsRemaining.toLocaleString()} left
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-card rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Word Usage</p>
            <p className="text-xs text-muted-foreground capitalize">
              {profile.subscription_plan || "free"} plan
            </p>
          </div>
        </div>
        <span className="text-sm font-semibold">
          {Math.round(usagePercentage)}%
        </span>
      </div>

      <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-2">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${getProgressColor()}`}
          style={{ width: `${usagePercentage}%` }}
        />
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">{wordsUsed.toLocaleString()}</span>
          {" "}/ {wordsLimit.toLocaleString()} words
        </span>
        <span className="text-muted-foreground">
          {wordsRemaining.toLocaleString()} remaining
        </span>
      </div>

      {usagePercentage >= 80 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3"
          onClick={() => navigate("/app/pricing")}
        >
          Upgrade Plan
        </Button>
      )}
    </div>
  );
}
