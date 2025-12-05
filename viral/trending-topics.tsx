import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, Users, Zap, Lightbulb } from "lucide-react";
import type { TrendingTopic } from "@shared/schema";

export function TrendingTopics() {
  const { data: trends, isLoading } = useQuery<TrendingTopic[]>({
    queryKey: ["/api/viral/trending-topics"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trending Topics - Be First! 🚀
          </CardTitle>
          <CardDescription>Loading viral opportunities...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/20 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-trending-topics">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trending Topics - Be First! 🚀
        </CardTitle>
        <CardDescription>
          Jump on these viral waves before they peak. First movers win big!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!trends || trends.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No trending topics detected yet.</p>
            <p className="text-sm mt-1">Check back soon for viral opportunities!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trends.map((trend, index) => (
              <div
                key={trend.id}
                className="border rounded-lg p-4 hover-elevate active-elevate-2 transition-all cursor-pointer"
                data-testid={`trend-item-${index}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{trend.topic}</h4>
                      {index === 0 && (
                        <Badge variant="default" className="gap-1">
                          <Zap className="h-3 w-3" />
                          HOT
                        </Badge>
                      )}
                      {trend.competitionLevel === "low" && (
                        <Badge variant="secondary" className="gap-1">
                          <Users className="h-3 w-3" />
                          Low Competition
                        </Badge>
                      )}
                    </div>
                    
                    {trend.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {trend.description}
                      </p>
                    )}

                    {/* Metrics */}
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{trend.trendScore}</span>
                        <span className="text-muted-foreground">score</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">{trend.peakWindow}h</span>
                        <span className="text-muted-foreground">to peak</span>
                      </div>
                      {trend.xTwitterMentions && trend.xTwitterMentions > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">
                            {trend.xTwitterMentions.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">mentions</span>
                        </div>
                      )}
                    </div>

                    {/* Suggested Hashtags */}
                    {trend.recommendedHashtags && trend.recommendedHashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {trend.recommendedHashtags.slice(0, 5).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Hook Ideas */}
                    {trend.suggestedHooks && trend.suggestedHooks.length > 0 && (
                      <div className="bg-muted/30 rounded-md p-3 mt-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">Hook Ideas:</span>
                        </div>
                        <ul className="text-sm space-y-1">
                          {trend.suggestedHooks.slice(0, 2).map((hook, i) => (
                            <li key={i} className="text-muted-foreground pl-4">
                              • {hook}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button size="sm" data-testid={`button-create-video-${index}`}>
                      Create Video
                    </Button>
                    <Button size="sm" variant="outline" data-testid={`button-copy-hashtags-${index}`}>
                      Copy Tags
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
