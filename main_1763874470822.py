# File: sora_service/main.py
# Python gRPC Server for the Sora 2 AI Video Generation Engine

import time
import logging
from concurrent import futures

import grpc
import sora_service.sora_pb2 as sora_pb2
import sora_service.sora_pb2_grpc as sora_pb2_grpc

# --- Configuration ---
_LISTEN_PORT = '[::]:50055'

logging.basicConfig(level=logging.INFO)

# --- Sora Engine Implementation ---
class SoraService(sora_pb2_grpc.SoraServiceServicer):
    """
    The Sora Service handles text-to-video generation requests.
    """
    def GenerateVideo(self, request, context):
        logging.info(f"Received Video Generation Request from user: {request.user_id} (Prompt: {request.prompt[:30]}...)")

        # --- 1. Validation and Job Creation ---
        if len(request.prompt) < 10:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("Prompt must be at least 10 characters long.")
            return sora_pb2.GenerateVideoResponse(status="FAILED")

        job_id = f"SORA-JOB-{time.time()}"
        
        # --- 2. Generation Simulation ---
        # In a real system, this would queue a job to a dedicated GPU cluster.
        # For now, we simulate the initial PENDING status.
        
        # Immediately return PENDING status
        return sora_pb2.GenerateVideoResponse(
            job_id=job_id,
            status="PENDING"
        )

# --- Server Setup ---
def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    sora_pb2_grpc.add_SoraServiceServicer_to_server(SoraService(), server)
    server.add_insecure_port(_LISTEN_PORT)
    server.start()
    logging.info(f"Sora gRPC Server started, listening on {_LISTEN_PORT}")
    try:
        while True:
            time.sleep(60 * 60 * 24)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    serve()
