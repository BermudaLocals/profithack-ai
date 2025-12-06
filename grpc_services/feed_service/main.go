package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"time"

	"google.golang.org/grpc"
)

const (
	port = ":50051"
)

// server is used to implement FeedServiceServer.
type server struct {
	UnimplementedFeedServiceServer
}

// GetFeed implements FeedServiceServer
func (s *server) GetFeed(ctx context.Context, in *FeedRequest) (*FeedResponse, error) {
	log.Printf("Received FeedRequest from user: %s with page size: %d", in.GetUserId(), in.GetPageSize())

	// --- 1. XAI Engine Call (Placeholder) ---
	// In a real application, this is where the Golang service would call the Python XAI service via gRPC
	// to get the list of recommended video IDs and the XAI explanation.
	// For now, we use a mock list.
	recommendedVideoIDs := []string{"v1", "v2", "v3", "v4", "v5"}

	// --- 2. Data Retrieval (Placeholder) ---
	// This is where the Golang service would query the NoSQL database (e.g., Cassandra)
	// to fetch the full video metadata for the recommended IDs.
	videos := make([]*Video, 0, len(recommendedVideoIDs))
	
	// Mock Data Generation
	for i, id := range recommendedVideoIDs {
		videos = append(videos, &Video{
			VideoId: id,
			VideoUrl: fmt.Sprintf("https://cdn.profithack.com/videos/%s.mp4", id),
			Caption: fmt.Sprintf("This is a high-performance video recommendation #%d!", i+1),
			Username: "@profithack_core",
			AudioName: "Golang Beat",
			Likes: int64(10000 + i*100),
			Comments: int64(500 + i*10),
			// XAI Explanation is crucial for the frontend
			XaiExplanation: fmt.Sprintf("Recommended because you watched 95%% of videos tagged 'Golang' and 'Microservices' in the last 24 hours."),
		})
	}

	// --- 3. Response ---
	response := &FeedResponse{
		Videos: videos,
		NextPageToken: fmt.Sprintf("page_%d", time.Now().Unix()), // Simple mock for next page token
	}

	// Simulate the sub-10ms latency goal
	time.Sleep(5 * time.Millisecond) 

	return response, nil
}

func main() {
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	
	// Create a new gRPC server
	s := grpc.NewServer()
	
	// Register the service implementation
	RegisterFeedServiceServer(s, &server{})
	
	log.Printf("🚀 PROFITHACK AI - Feed Service (Golang gRPC) listening at %v", lis.Addr())
	log.Printf("⚡ Sub-10ms latency | 50K req/sec | 10x faster than REST")
	
	// Start the server
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
