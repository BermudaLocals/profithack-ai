package main

import (
	"context"
	"log"
	"net"
	"time"
	"crypto/rand"
	"encoding/base64"

	pb "security_service/security"

	"google.golang.org/grpc"
)

const (
	port = ":50058"
)

// server is used to implement security.SecurityServiceServer.
type server struct {
	pb.UnimplementedSecurityServiceServer
}

// IssueMTLSCertificate implements security.SecurityServiceServer
func (s *server) IssueMTLSCertificate(ctx context.Context, in *pb.CertRequest) (*pb.CertResponse, error) {
	log.Printf("Received Cert Issue Request for Service: %s (CN: %s)", in.GetServiceName(), in.GetCommonName())

	// --- 1. Certificate Authority (CA) Logic (Placeholder) ---
	// In a real system, this service would interface with a vault (e.g., HashiCorp Vault)
	// or a dedicated CA to generate and sign a new mTLS certificate.
	
	// Mock Certificate Generation
	certData := make([]byte, 64)
	keyData := make([]byte, 64)
	rand.Read(certData)
	rand.Read(keyData)
	
	certPEM := base64.StdEncoding.EncodeToString(certData)
	keyPEM := base64.StdEncoding.EncodeToString(keyData)

	// Simulate the secure generation process
	time.Sleep(5 * time.Millisecond) 

	return &pb.CertResponse{
		Success: true,
		Message: fmt.Sprintf("mTLS Certificate issued for %s. Valid for 90 days.", in.GetServiceName()),
		CertificatePem: certPEM,
		PrivateKeyPem: keyPEM,
	}, nil
}

// RevokeMTLSCertificate implements security.SecurityServiceServer
func (s *server) RevokeMTLSCertificate(ctx context.Context, in *pb.CertRequest) (*pb.CertResponse, error) {
	log.Printf("Received Cert Revocation Request for Service: %s (CN: %s)", in.GetServiceName(), in.GetCommonName())

	// --- 2. Revocation Logic (Placeholder) ---
	// This would interface with the CA to add the certificate to the Certificate Revocation List (CRL).
	
	time.Sleep(2 * time.Millisecond) 

	return &pb.CertResponse{
		Success: true,
		Message: fmt.Sprintf("mTLS Certificate for %s successfully revoked.", in.GetServiceName()),
	}, nil
}

func main() {
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	
	s := grpc.NewServer()
	pb.RegisterSecurityServiceServer(s, &server{})
	
	log.Printf("Security server listening at %v", lis.Addr())
	
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
