import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { insertVideoCommentSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type VideoComment = {
  id: string;
  videoId: string;
  userId: string;
  content: string;
  parentCommentId: string | null;
  likeCount: number;
  createdAt: string;
  user?: {
    username: string;
    profileImageUrl: string | null;
  };
};

interface VideoCommentsDialogProps {
  videoId: string;
  commentCount: number;
  trigger?: React.ReactNode;
}

export function VideoCommentsDialog({
  videoId,
  commentCount,
  trigger,
}: VideoCommentsDialogProps) {
  const [open, setOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: comments, isLoading } = useQuery<VideoComment[]>({
    queryKey: ["/api/videos", videoId, "comments"],
    enabled: open,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/videos/${videoId}/comments`, {
        content,
        videoId,
      });
      return response.json();
    },
    onMutate: async (content) => {
      await queryClient.cancelQueries({
        queryKey: ["/api/videos", videoId, "comments"],
      });

      const previousComments = queryClient.getQueryData<VideoComment[]>([
        "/api/videos",
        videoId,
        "comments",
      ]);

      const optimisticComment: VideoComment = {
        id: `temp-${Date.now()}`,
        videoId,
        userId: user?.id || "",
        content,
        parentCommentId: null,
        likeCount: 0,
        createdAt: new Date().toISOString(),
        user: {
          username: user?.username || "You",
          profileImageUrl: user?.profileImageUrl || null,
        },
      };

      queryClient.setQueryData<VideoComment[]>(
        ["/api/videos", videoId, "comments"],
        (old) => [optimisticComment, ...(old || [])]
      );

      return { previousComments };
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({
        queryKey: ["/api/videos", videoId, "comments"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos/reels"] });
      toast({
        title: "Comment posted!",
        description: "Your comment has been added.",
      });
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["/api/videos", videoId, "comments"],
          context.previousComments
        );
      }
      toast({
        title: "Failed to post comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentMutation.mutate(commentText);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button
            className="flex flex-col items-center gap-1 text-white"
            data-testid={`button-comment-${videoId}`}
          >
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover-elevate active-elevate-2">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold">{commentCount}</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">
            Comments ({commentCount})
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Join the conversation
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4" data-testid="comments-list">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3"
                  data-testid={`comment-${comment.id}`}
                >
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={comment.user?.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                      {comment.user?.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-semibold text-white text-sm"
                        data-testid={`comment-username-${comment.id}`}
                      >
                        @{comment.user?.username || "Unknown"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p
                      className="text-slate-300 text-sm break-words"
                      data-testid={`comment-content-${comment.id}`}
                    >
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm">No comments yet</p>
              <p className="text-slate-500 text-xs">Be the first to comment!</p>
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex gap-3 pt-4 border-t border-slate-800">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="bg-slate-950 border-slate-700 text-white resize-none"
              rows={2}
              data-testid="textarea-add-comment"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!commentText.trim() || addCommentMutation.isPending}
              className="bg-gradient-to-r from-pink-500 to-purple-600 flex-shrink-0"
              data-testid="button-post-comment"
            >
              {addCommentMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
