package main

import (
	"context"
	"log"
	"net"
	"time"
	"math/rand"

	pb "chaos_service/chaos"

	"google.golang.org/grpc"
)

const (
	port = ":50056"
)

// server is used to implement chaos.ChaosServiceServer.
type server struct {
	pb.UnimplementedChaosServiceServer
}

// InjectLatency implements chaos.ChaosServiceServer
func (s *server) InjectLatency(ctx context.Context, in *pb.LatencyRequest) (*pb.ChaosResponse, error) {
	log.Printf("Received Latency Injection Request for %s (Duration: %dms, Prob: %.2f)", 
		in.GetServiceName(), in.GetDurationMs(), in.GetProbability())

	// --- 1. Simulation Logic (Placeholder) ---
	// In a real system, this service would communicate with a service mesh (e.g., Istio)
	// or a dedicated chaos agent to modify network traffic rules.
	
	if rand.Float32() < in.GetProbability() {
		log.Printf("Chaos: Injecting %dms latency into %s", in.GetDurationMs(), in.GetServiceName())
		// This is a simulation; the actual latency would be injected into the target service's network path.
		// time.Sleep(time.Duration(in.GetDurationMs()) * time.Millisecond) 
		return &pb.ChaosResponse{
			Success: true,
			Message: fmt.Sprintf("Simulated injection of %dms latency into %s with %.2f probability.", in.GetDurationMs(), in.GetServiceName(), in.GetProbability()),
		}, nil
	}

	return &pb.ChaosResponse{
		Success: true,
		Message: fmt.Sprintf("Latency injection request received for %s, but not executed (below probability threshold).", in.GetServiceName()),
	}, nil
}

// InjectFailure implements chaos.ChaosServiceServer
func (s *server) InjectFailure(ctx context.Context, in *pb.FailureRequest) (*pb.ChaosResponse, error) {
	log.Printf("Received Failure Injection Request for %s (Prob: %.2f)", 
		in.GetServiceName(), in.GetProbability())

	if rand.Float32() < in.GetProbability() {
		log.Printf("Chaos: Injecting failure into %s with message: %s", in.GetServiceName(), in.GetErrorMessage())
		// In a real system, this would communicate with the target service to force a specific error response.
		return &pb.ChaosResponse{
			Success: true,
			Message: fmt.Sprintf("Simulated injection of failure into %s with message: %s", in.GetServiceName(), in.GetErrorMessage()),
		}, nil
	}

	return &pb.ChaosResponse{
		Success: true,
		Message: fmt.Sprintf("Failure injection request received for %s, but not executed (below probability threshold).", in.GetServiceName()),
	}, nil
}

func main() {
	rand.Seed(time.Now().UnixNano())
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	
	s := grpc.NewServer()
	pb.RegisterChaosServiceServer(s, &server{})
	
	log.Printf("Chaos Engineering server listening at %v", lis.Addr())
	
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
