package main

import (
	"context"
	"log"
	"net"
	"time"

	pb "dating_service/dating" // Import the generated protobuf package

	"google.golang.org/grpc"
)

const (
	port = ":50053"
)

// server is used to implement dating.DatingServiceServer.
type server struct {
	pb.UnimplementedDatingServiceServer
}

// GetMatches implements dating.DatingServiceServer
func (s *server) GetMatches(ctx context.Context, in *pb.MatchRequest) (*pb.MatchResponse, error) {
	log.Printf("Received MatchRequest from user: %s for %d matches", in.GetUserId(), in.GetCount())

	// --- 1. Matching Algorithm (Placeholder) ---
	// This is where the Golang service would query the NoSQL database for user profiles
	// and apply the high-performance matching algorithm (leveraging XAI data).
	
	// Mock Data Generation
	profiles := make([]*pb.MatchProfile, 0, in.GetCount())
	for i := 0; i < int(in.GetCount()); i++ {
		profiles = append(profiles, &pb.MatchProfile{
			UserId: fmt.Sprintf("match_%d", i),
			Username: fmt.Sprintf("MatchUser%d", i),
			Bio: "Loves Golang and long walks on the beach.",
			Interests: []string{"Golang", "Microservices", "AI"},
			// CRITICAL: Match reason leverages the XAI data
			MatchReason: "High XAI similarity score (0.95) based on shared 'Golang' and 'Rizz' content consumption.",
		})
	}

	// Simulate the sub-10ms latency goal
	time.Sleep(5 * time.Millisecond) 

	return &pb.MatchResponse{Profiles: profiles}, nil
}

// RecordSwipe implements dating.DatingServiceServer
func (s *server) RecordSwipe(ctx context.Context, in *pb.SwipeRequest) (*pb.SwipeResponse, error) {
	log.Printf("User %s swiped %s on user %s", in.GetUserId(), in.GetDirection().String(), in.GetTargetUserId())

	// --- 2. Match Logic (Placeholder) ---
	// This is where the service would check the database for a reciprocal swipe.
	isMatch := in.GetDirection() == pb.SwipeRequest_SWIPE_RIGHT && in.GetTargetUserId() == "match_1" // Mock match
	
	// Simulate the sub-10ms latency goal
	time.Sleep(2 * time.Millisecond) 

	return &pb.SwipeResponse{Success: true, IsMatch: isMatch}, nil
}

func main() {
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	
	s := grpc.NewServer()
	pb.RegisterDatingServiceServer(s, &server{})
	
	log.Printf("Dating server listening at %v", lis.Addr())
	
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
