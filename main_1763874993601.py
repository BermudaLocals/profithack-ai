# File: moderation_service/main.py
# Python gRPC Server for the AI Content Moderation Service

import time
import logging
from concurrent import futures
import random

import grpc
import moderation_service.moderation_pb2 as mod_pb2
import moderation_service.moderation_pb2_grpc as mod_pb2_grpc

# --- Configuration ---
_LISTEN_PORT = '[::]:50057'

logging.basicConfig(level=logging.INFO)

# --- AI Moderation Implementation ---
class ModerationService(mod_pb2_grpc.ModerationServiceServicer):
    """
    The Moderation Service implements AI-Powered Content Moderation and Quality Scoring.
    """
    def AnalyzeVideo(self, request, context):
        logging.info(f"Received Analysis Request for video: {request.video_id} (User: {request.user_id})")

        # --- 1. Quality Score Model (Placeholder) ---
        # Simulates a model checking for low-resolution, poor lighting, etc.
        quality_score = random.uniform(0.7, 0.99) 
        
        # --- 2. Policy Violation Model (Placeholder) ---
        violations = []
        is_safe = True

        # Check for OnlyFans-style content violation (HIGH severity)
        if "exclusive" in request.caption.lower() and "onlyfans" in request.caption.lower():
            violations.append(mod_pb2.Violation(
                policy_name="Adult Content Policy",
                confidence_score=0.95,
                severity="HIGH"
            ))
            is_safe = False
        
        # Check for spam/low-quality (MEDIUM severity)
        if len(request.caption) < 5 or quality_score < 0.5:
            violations.append(mod_pb2.Violation(
                policy_name="Low Quality/Spam Policy",
                confidence_score=0.80,
                severity="MEDIUM"
            ))

        # Simulate model inference time
        time.sleep(0.02) 

        return mod_pb2.AnalyzeVideoResponse(
            is_safe=is_safe,
            quality_score=quality_score,
            violations=violations
        )

# --- Server Setup ---
def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    mod_pb2_grpc.add_ModerationServiceServicer_to_server(ModerationService(), server)
    server.add_insecure_port(_LISTEN_PORT)
    server.start()
    logging.info(f"Moderation gRPC Server started, listening on {_LISTEN_PORT}")
    try:
        while True:
            time.sleep(60 * 60 * 24)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    serve()
