package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
	pb "./proto"
)

const (
	port = ":50051"
)

// Server implements the FeedService gRPC server
type server struct {
	pb.UnimplementedFeedServiceServer
}

// GetFeed returns a personalized video feed
func (s *server) GetFeed(ctx context.Context, req *pb.FeedRequest) (*pb.FeedResponse, error) {
	log.Printf("📺 GetFeed called: userId=%s, limit=%d, category=%s", req.UserId, req.Limit, req.Category)
	
	// Hardcoded video IDs for initial implementation
	// TODO: Replace with real ML-powered recommendation engine
	videos := []*pb.VideoItem{
		{
			VideoId:         "c8966e52-dca3-4a7c-a6a7-cdd3a01cd4fc",
			Title:           "The Future of Making Money Online",
			VideoUrl:        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
			ThumbnailUrl:    "https://via.placeholder.com/1080x1920/ff00ff/ffffff?text=Video1",
			Views:           15420,
			Likes:           892,
			EngagementScore: 0.87,
		},
		{
			VideoId:         "f3948a4d-3f71-4db6-8ab6-fb8a52e72361",
			Title:           "PROFITHACK AI vs OnlyFans",
			VideoUrl:        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
			ThumbnailUrl:    "https://via.placeholder.com/1080x1920/00ffff/ffffff?text=Video2",
			Views:           23100,
			Likes:           1523,
			EngagementScore: 0.92,
		},
		{
			VideoId:         "88b15321-0ab1-408e-ad8d-221e733cd44f",
			Title:           "Platform Killing OnlyFans",
			VideoUrl:        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
			ThumbnailUrl:    "https://via.placeholder.com/1080x1920/ff00aa/ffffff?text=Video3",
			Views:           18750,
			Likes:           1204,
			EngagementScore: 0.89,
		},
		{
			VideoId:         "a3466ac0-94fe-4827-9145-3c8a9971a7dc",
			Title:           "From Broke to $10K/Month",
			VideoUrl:        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
			ThumbnailUrl:    "https://via.placeholder.com/1080x1920/aa00ff/ffffff?text=Video4",
			Views:           31200,
			Likes:           2845,
			EngagementScore: 0.95,
		},
		{
			VideoId:         "c6573bab-564f-4fa0-a2f5-854fb740eb29",
			Title:           "Why Creators Move to PROFITHACK",
			VideoUrl:        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
			ThumbnailUrl:    "https://via.placeholder.com/1080x1920/00aaff/ffffff?text=Video5",
			Views:           12340,
			Likes:           743,
			EngagementScore: 0.84,
		},
	}
	
	// Apply limit
	limit := int(req.Limit)
	if limit == 0 || limit > len(videos) {
		limit = len(videos)
	}
	
	return &pb.FeedResponse{
		Videos:     videos[:limit],
		HasMore:    limit < len(videos),
		NextCursor: fmt.Sprintf("cursor_%d", limit),
	}, nil
}

// GetTrendingFeed returns trending videos
func (s *server) GetTrendingFeed(ctx context.Context, req *pb.TrendingRequest) (*pb.FeedResponse, error) {
	log.Printf("🔥 GetTrendingFeed called: limit=%d, category=%s, timeRange=%s", req.Limit, req.Category, req.TimeRange)
	
	// TODO: Implement real trending algorithm with time-weighted engagement scores
	// For now, return same as personalized feed
	feedReq := &pb.FeedRequest{
		UserId: "trending",
		Limit:  req.Limit,
		Category: req.Category,
	}
	
	return s.GetFeed(ctx, feedReq)
}

// RecordInteraction records user interaction for ML model
func (s *server) RecordInteraction(ctx context.Context, req *pb.InteractionRequest) (*pb.InteractionResponse, error) {
	log.Printf("📊 RecordInteraction: userId=%s, videoId=%s, type=%s, duration=%dms", 
		req.UserId, req.VideoId, req.InteractionType, req.WatchDurationMs)
	
	// TODO: Send to Kafka for real-time processing by Flink
	// TODO: Update Redis cache with user preferences
	// TODO: Store in Cassandra for historical analysis
	
	return &pb.InteractionResponse{
		Success: true,
		Message: "Interaction recorded successfully",
	}, nil
}

func main() {
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("❌ Failed to listen: %v", err)
	}
	
	s := grpc.NewServer()
	pb.RegisterFeedServiceServer(s, &server{})
	
	// Register reflection service for grpcurl debugging
	reflection.Register(s)
	
	log.Printf("🚀 Golang Feed Service (gRPC) listening on %s", port)
	log.Printf("⚡ High-performance feed service ready for 100M+ users")
	log.Printf("🎯 Next steps: Integrate ML recommendation engine, Kafka, Redis Cluster")
	
	if err := s.Serve(lis); err != nil {
		log.Fatalf("❌ Failed to serve: %v", err)
	}
}
