# File: content_acquisition_service/main.py
# Python gRPC Server for Content Acquisition & Seeding

import time
import logging
from concurrent import futures
import random

import grpc
import content_acquisition_service.acquisition_pb2 as acq_pb2
import content_acquisition_service.acquisition_pb2_grpc as acq_pb2_grpc
# Import the Sora Service client (assuming it's running on 50055)
import sora_service.sora_pb2 as sora_pb2
import sora_service.sora_pb2_grpc as sora_pb2_grpc

# --- Configuration ---
_LISTEN_PORT = '[::]:50059'
SORA_SERVICE_ADDRESS = 'localhost:50055' # Placeholder

logging.basicConfig(level=logging.INFO)

# --- Content Acquisition Implementation ---
class AcquisitionService(acq_pb2_grpc.AcquisitionServiceServicer):
    """
    Handles the full content seeding pipeline: Scrape -> Analyze -> Generate -> Seed.
    """
    def ScrapeAndGenerate(self, request, context):
        logging.info(f"Received Scrape & Generate Request for {request.count} videos on topic: {request.trend_topic}")

        # --- 1. Scrape and Analyze (Simulated) ---
        # In a real system, this would involve:
        # a) Web scraping trending topics/keywords.
        # b) NLP analysis to generate high-quality video prompts.
        
        prompts = self._generate_prompts(request.trend_topic, request.count)
        
        # --- 2. Trigger Sora AI Generation ---
        videos_seeded = 0
        try:
            with grpc.insecure_channel(SORA_SERVICE_ADDRESS) as channel:
                sora_stub = sora_pb2_grpc.SoraServiceStub(channel)
                
                for prompt in prompts:
                    # Call the Sora AI Service
                    sora_request = sora_pb2.GenerateVideoRequest(
                        user_id=request.founder_user_id,
                        prompt=prompt,
                        duration_seconds=random.randint(5, 15),
                        style="cinematic"
                    )
                    sora_response = sora_stub.GenerateVideo(sora_request)
                    
                    # --- 3. Seed to FYP (Simulated) ---
                    # In a real system, the Sora service would complete the video and then
                    # trigger the BullMQ job (via the Node.js API) to seed the content.
                    # For this simulation, we assume the job is successfully created.
                    if sora_response.status == "PENDING":
                        videos_seeded += 1
                        logging.info(f"Successfully triggered Sora job {sora_response.job_id} for prompt: {prompt[:20]}...")
                        
        except grpc.RpcError as e:
            logging.error(f"Could not connect to Sora Service: {e}")
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            context.set_details("Sora Service is unavailable.")
            return acq_pb2.AcquisitionResponse(status="FAILED", videos_seeded=0)

        return acq_pb2.AcquisitionResponse(
            job_id=f"ACQ-JOB-{time.time()}",
            status="SEEDED",
            videos_seeded=videos_seeded
        )

    def _generate_prompts(self, topic: str, count: int) -> list[str]:
        """Simulates the generation of high-quality video prompts."""
        base_prompts = [
            f"A cinematic shot of a {topic} in a futuristic city.",
            f"A hyper-realistic animation of a {topic} solving a complex coding problem.",
            f"A short, viral clip about the best 'rizz' lines for a {topic}."
        ]
        return [f"{p} - {i}" for i, p in enumerate(base_prompts * (count // len(base_prompts) + 1))][:count]

# --- Server Setup ---
def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    acq_pb2_grpc.add_AcquisitionServiceServicer_to_server(AcquisitionService(), server)
    server.add_insecure_port(_LISTEN_PORT)
    server.start()
    logging.info(f"Content Acquisition gRPC Server started, listening on {_LISTEN_PORT}")
    try:
        while True:
            time.sleep(60 * 60 * 24)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    serve()
