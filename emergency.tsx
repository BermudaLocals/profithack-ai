import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import FeedPage from "@/pages/feed";
import { Toaster } from "@/components/ui/toaster";

// EMERGENCY BYPASS - Just show the feed immediately!
export default function Emergency() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen w-screen bg-background">
        <FeedPage />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
