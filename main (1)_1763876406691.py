# File: marketplace_service/main.py
# Python gRPC Server for Marketplace Population Service

import time
import logging
from concurrent import futures
import random
import uuid

import grpc
import marketplace_service.marketplace_pb2 as mp_pb2
import marketplace_service.marketplace_pb2_grpc as mp_pb2_grpc

# --- Configuration ---
_LISTEN_PORT = '[::]:50061'

logging.basicConfig(level=logging.INFO)

# --- Marketplace Population Implementation ---
class MarketplaceService(mp_pb2_grpc.MarketplaceServiceServicer):
    """
    The Marketplace Service automates the creation and listing of digital products.
    """
    def PopulateDigitalProducts(self, request, context):
        logging.info(f"Received Population Request for {request.count} products in category: {request.product_category}")

        product_ids = []
        for i in range(request.count):
            product_id = str(uuid.uuid4())
            product_ids.append(product_id)
            
            # --- 1. Product Generation Logic (Simulated) ---
            # In a real system, this would involve:
            # a) AI generating product descriptions, images, and pricing.
            # b) Storing the product in the database.
            
            logging.info(f"Generated product {i+1}/{request.count} (ID: {product_id}) for user {request.creator_user_id}")
            time.sleep(0.005) # Simulate database write

        return mp_pb2.PopulationResponse(
            success=True,
            message=f"Successfully populated {request.count} products in the {request.product_category} category.",
            product_ids=product_ids
        )

# --- Server Setup ---
def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    mp_pb2_grpc.add_MarketplaceServiceServicer_to_server(MarketplaceService(), server)
    server.add_insecure_port(_LISTEN_PORT)
    server.start()
    logging.info(f"Marketplace gRPC Server started, listening on {_LISTEN_PORT}")
    try:
        while True:
            time.sleep(60 * 60 * 24)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    serve()
