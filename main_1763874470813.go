package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"time"

	pb "monetization_service/monetization"

	"google.golang.org/grpc"
)

const (
	port = ":50054"
)

// server is used to implement monetization.MonetizationServiceServer.
type server struct {
	pb.UnimplementedMonetizationServiceServer
}

// SendGift implements monetization.MonetizationServiceServer
func (s *server) SendGift(ctx context.Context, in *pb.SendGiftRequest) (*pb.SendGiftResponse, error) {
	log.Printf("Received SendGiftRequest: Sender %s to Recipient %s (Gift ID: %s, Qty: %d)", 
		in.GetSenderUserId(), in.GetRecipientUserId(), in.GetGiftId(), in.GetQuantity())

	// --- 1. Transaction Logic (Placeholder) ---
	// This is where the service would:
	// a) Deduct coins from the sender's account (using a dedicated ledger service).
	// b) Credit the recipient's account.
	// c) Record the transaction in the ledger.
	
	// Mock coin deduction
	remainingCoins := 1000 - (in.GetQuantity() * 10) // Assuming gift costs 10 coins
	
	// Simulate the high-speed transaction
	time.Sleep(2 * time.Millisecond) 

	return &pb.SendGiftResponse{
		Success: true,
		RemainingCoins: int32(remainingCoins),
		TransactionId: fmt.Sprintf("TX-%d", time.Now().UnixNano()),
	}, nil
}

// Subscribe implements monetization.MonetizationServiceServer
func (s *server) Subscribe(ctx context.Context, in *pb.SubscribeRequest) (*pb.SubscribeResponse, error) {
	log.Printf("Received SubscribeRequest: Subscriber %s to Creator %s (Tier: %s)", 
		in.GetSubscriberUserId(), in.GetCreatorUserId(), in.GetSubscriptionTierId())

	// --- 2. Subscription Logic (Placeholder) ---
	// This is where the service would:
	// a) Process payment via a payment gateway (Stripe/PayPal/etc.).
	// b) Update the user's subscription status in the database.
	// c) Grant access to premium content/features (e.g., E2E encrypted group chat).
	
	// Simulate payment processing
	time.Sleep(10 * time.Millisecond) 

	return &pb.SubscribeResponse{
		Success: true,
		TransactionId: fmt.Sprintf("SUB-TX-%d", time.Now().UnixNano()),
		TierName: "Premium Access",
	}, nil
}

func main() {
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	
	s := grpc.NewServer()
	pb.RegisterMonetizationServiceServer(s, &server{})
	
	log.Printf("Monetization server listening at %v", lis.Addr())
	
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
