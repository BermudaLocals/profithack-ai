# File: observability_config.py
# Python Script for Configuring the Full Observability Stack

import os
import json
import logging

# --- Configuration Constants ---
SERVICES = [
    "feed-service", 
    "xai-service", 
    "dating-service", 
    "monetization-service", 
    "moderation-service", 
    "security-service",
    "api-gateway"
]
PROMETHEUS_CONFIG_PATH = "/etc/prometheus/prometheus.yml"
GRAFANA_DASHBOARD_PATH = "/etc/grafana/provisioning/dashboards/profithack.json"
LOGGING_AGENT_CONFIG_PATH = "/etc/vector/vector.toml"

logging.basicConfig(level=logging.INFO)

def generate_prometheus_config(services: list[str]) -> str:
    """Generates a simplified Prometheus scrape configuration."""
    scrape_configs = []
    for service in services:
        # Assuming each service exposes metrics on port 9090 (standard for Go/Python Prometheus clients)
        scrape_configs.append({
            "job_name": service,
            "static_configs": [
                {"targets": [f"{service}:9090"]}
            ],
            "metrics_path": "/metrics"
        })
    
    config = {
        "global": {"scrape_interval": "15s"},
        "scrape_configs": scrape_configs
    }
    
    return f"# Prometheus Configuration for Profithack Microservices\n{json.dumps(config, indent=2)}"

def generate_grafana_dashboard_config() -> str:
    """Generates a placeholder for the Grafana dashboard provisioning."""
    # In a real scenario, this would be a massive JSON file.
    return """
# Grafana Dashboard Provisioning File
apiVersion: 1
providers:
- name: 'Profithack Dashboards'
  orgId: 1
  folder: 'Microservices'
  type: file
  disableDeletion: false
  editable: true
  options:
    path: /var/lib/grafana/dashboards/profithack.json
"""

def generate_logging_config(services: list[str]) -> str:
    """Generates a simplified logging agent (Vector) configuration."""
    # Vector is used here as a modern log collection agent (Loki/Promtail alternative)
    config = """
# Vector Logging Agent Configuration
[sources.in_docker_logs]
type = "docker_logs"
include_containers = ["api-gateway", "feed-service", "xai-service", "moderation-service"]

[sinks.to_loki]
type = "loki"
inputs = ["in_docker_logs"]
endpoint = "http://loki:3100"
encoding = "json"
labels = { service = "{{ container_name }}" }
"""
    return config

def write_config_files():
    """Simulates writing the configuration files to their respective paths."""
    
    # 1. Prometheus Config
    prometheus_content = generate_prometheus_config(SERVICES)
    logging.info(f"Simulating write to {PROMETHEUS_CONFIG_PATH}")
    # In a real environment, this would be written to a Kubernetes ConfigMap or a file.
    # with open(PROMETHEUS_CONFIG_PATH, 'w') as f: f.write(prometheus_content)
    
    # 2. Grafana Config
    grafana_content = generate_grafana_dashboard_config()
    logging.info(f"Simulating write to {GRAFANA_DASHBOARD_PATH}")
    # with open(GRAFANA_DASHBOARD_PATH, 'w') as f: f.write(grafana_content)

    # 3. Logging Config
    logging_content = generate_logging_config(SERVICES)
    logging.info(f"Simulating write to {LOGGING_AGENT_CONFIG_PATH}")
    # with open(LOGGING_AGENT_CONFIG_PATH, 'w') as f: f.write(logging_content)

    logging.info("Observability configuration generation complete. Files are ready for deployment via GitOps.")
    
    # For user review, we'll print the content
    print("\n--- GENERATED PROMETHEUS CONFIGURATION (SIMULATED) ---")
    print(prometheus_content)
    print("\n--- GENERATED LOGGING CONFIGURATION (SIMULATED) ---")
    print(logging_content)

if __name__ == '__main__':
    write_config_files()
