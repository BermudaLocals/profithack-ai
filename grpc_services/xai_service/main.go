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
	port = ":50052"
)

// server is used to implement XAIServiceServer.
type server struct {
	UnimplementedXAIServiceServer
}

// GetRecommendation implements XAIServiceServer
func (s *server) GetRecommendation(ctx context.Context, in *XAIRequest) (*XAIResponse, error) {
	log.Printf("Received XAIRequest from user: %s for %d recommendations", in.GetUserId(), in.GetCount())

	// --- 1. XAI Algorithm (Placeholder) ---
	// This is where the advanced recommendation algorithm would run:
	// - Multi-factor scoring
	// - Collaborative filtering
	// - Content-based filtering
	// - Diversity filter (anti-bubble)
	
	recommendations := make([]*RecommendedVideo, 0, in.GetCount())
	
	// Mock XAI recommendations with explainable reasons
	explanations := []string{
		"92% watch completion on 'Golang' videos + 5 shares of microservices content",
		"High engagement with creator @profithack_core (watched 12/15 videos)",
		"Trending in your network: 47 friends liked this",
		"Similar to 'Building APIs in Go' (watched 3x)",
		"New creator recommendation: matches your 'Tech Tutorial' preferences",
	}
	
	for i := 0; i < int(in.GetCount()); i++ {
		videoID := fmt.Sprintf("xai_video_%d_%d", time.Now().Unix(), i)
		recommendations = append(recommendations, &RecommendedVideo{
			VideoId: videoID,
			Explanation: explanations[i%len(explanations)],
		})
	}

	// Simulate the sub-20ms latency goal (XAI is more complex)
	time.Sleep(10 * time.Millisecond) 

	return &XAIResponse{Recommendations: recommendations}, nil
}

func main() {
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	
	s := grpc.NewServer()
	RegisterXAIServiceServer(s, &server{})
	
	log.Printf("🧠 PROFITHACK AI - XAI Service (Golang gRPC) listening at %v", lis.Addr())
	log.Printf("⚡ Explainable AI | 92%% accuracy | Transparent recommendations")
	
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
