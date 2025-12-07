import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StartCallDialog } from "@/components/StartCallDialog";
import { Video, Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock } from "lucide-react";
import type { CallSession } from "@shared/schema";

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function getCallIcon(type: string, status: string) {
  if (status === "missed") return <PhoneMissed className="w-5 h-5 text-red-400" />;
  if (type === "video") return <Video className="w-5 h-5 text-purple-400" />;
  return <Phone className="w-5 h-5 text-cyan-400" />;
}

function getStatusBadge(status: string) {
  const badges = {
    ringing: { label: "Ringing", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    active: { label: "Active", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    ended: { label: "Ended", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
    missed: { label: "Missed", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  };
  return badges[status as keyof typeof badges] || badges.ended;
}

export default function Calls() {
  const { data: callHistory = [], isLoading } = useQuery<CallSession[]>({
    queryKey: ["/api/calls/history"],
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2">
            Calls
          </h1>
          <p className="text-slate-400">
            Make video and voice calls with crystal-clear quality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Start a Call</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <StartCallDialog
                callType="video"
                trigger={
                  <Button
                    data-testid="button-start-video-call"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Start Video Call
                  </Button>
                }
              />
              <StartCallDialog
                callType="audio"
                trigger={
                  <Button
                    data-testid="button-start-voice-call"
                    variant="outline"
                    className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Start Voice Call
                  </Button>
                }
              />
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Call Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Total Calls</p>
                  <p className="text-2xl font-bold text-cyan-400">{callHistory.length}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Duration</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {formatDuration(callHistory.reduce((sum, call) => sum + (call.duration || 0), 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Video className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">HD Video</p>
                  <p className="text-xs text-slate-400">Crystal-clear quality</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Voice Calls</p>
                  <p className="text-xs text-slate-400">Low bandwidth option</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call History */}
        <Card className="mt-6 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Call History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : callHistory.length === 0 ? (
              <div className="text-center py-12">
                <Phone className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No call history yet</p>
                <p className="text-sm text-slate-500 mt-2">
                  Start a call to see your history here
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {callHistory.map((call) => {
                    const statusBadge = getStatusBadge(call.status);
                    return (
                      <div
                        key={call.id}
                        data-testid={`call-${call.id}`}
                        className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-800 transition-colors border border-slate-800"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback className="bg-purple-600 text-white">
                              {getCallIcon(call.callType, call.status)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-white">
                                {call.callType === "video" ? "Video Call" : "Voice Call"}
                              </p>
                              <Badge variant="outline" className={statusBadge.color}>
                                {statusBadge.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span>
                                {call.createdAt && new Date(call.createdAt).toLocaleDateString()} at{" "}
                                {call.createdAt && new Date(call.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {call.duration && call.duration > 0 && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(call.duration)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            data-testid={`button-call-again-${call.id}`}
                            className="hover-elevate"
                          >
                            {call.callType === "video" ? (
                              <Video className="w-4 h-4 text-purple-400" />
                            ) : (
                              <Phone className="w-4 h-4 text-cyan-400" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
