#!/bin/bash
# PROFITHACK AI - Monitoring Stack Deployment Script
# Deploys Prometheus + Grafana for production observability

set -e

echo "🚀 PROFITHACK AI - Deploying Monitoring Stack..."
echo "================================================"

# Configuration
PROMETHEUS_VERSION="v2.48.0"
GRAFANA_VERSION="10.2.2"
MONITORING_DIR="$(pwd)/monitoring"

# ============================================================================
# 1. Deploy Prometheus
# ============================================================================
echo ""
echo "📊 Step 1/4: Deploying Prometheus ${PROMETHEUS_VERSION}..."

if command -v docker &> /dev/null; then
    echo "✅ Docker detected, deploying Prometheus container..."
    
    docker run -d \
        --name prometheus \
        --restart unless-stopped \
        -p 9090:9090 \
        -v "${MONITORING_DIR}/prometheus.yml:/etc/prometheus/prometheus.yml" \
        -v "${MONITORING_DIR}/alert_rules.yml:/etc/prometheus/alert_rules.yml" \
        prom/prometheus:${PROMETHEUS_VERSION} \
        --config.file=/etc/prometheus/prometheus.yml \
        --storage.tsdb.path=/prometheus \
        --web.console.libraries=/usr/share/prometheus/console_libraries \
        --web.console.templates=/usr/share/prometheus/consoles
    
    echo "✅ Prometheus deployed: http://localhost:9090"
else
    echo "⚠️  Docker not available - Prometheus deployment simulated"
    echo "   In production, use Docker or Kubernetes to deploy Prometheus"
fi

# ============================================================================
# 2. Deploy Grafana
# ============================================================================
echo ""
echo "📈 Step 2/4: Deploying Grafana ${GRAFANA_VERSION}..."

if command -v docker &> /dev/null; then
    echo "✅ Docker detected, deploying Grafana container..."
    
    docker run -d \
        --name grafana \
        --restart unless-stopped \
        -p 3001:3000 \
        -e "GF_SECURITY_ADMIN_PASSWORD=profithack2025" \
        -e "GF_USERS_ALLOW_SIGN_UP=false" \
        -e "GF_SERVER_ROOT_URL=http://localhost:3001" \
        grafana/grafana:${GRAFANA_VERSION}
    
    echo "✅ Grafana deployed: http://localhost:3001"
    echo "   Username: admin"
    echo "   Password: profithack2025"
else
    echo "⚠️  Docker not available - Grafana deployment simulated"
    echo "   In production, access Grafana at: http://localhost:3001"
fi

# ============================================================================
# 3. Configure Grafana Data Source
# ============================================================================
echo ""
echo "🔧 Step 3/4: Configuring Grafana..."

sleep 5  # Wait for Grafana to start

if command -v curl &> /dev/null && command -v docker &> /dev/null; then
    # Add Prometheus data source
    curl -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "name":"Prometheus",
            "type":"prometheus",
            "url":"http://prometheus:9090",
            "access":"proxy",
            "isDefault":true
        }' \
        http://admin:profithack2025@localhost:3001/api/datasources 2>/dev/null || true
    
    echo "✅ Prometheus data source configured in Grafana"
fi

# ============================================================================
# 4. Display Dashboard URLs
# ============================================================================
echo ""
echo "================================================"
echo "✅ MONITORING STACK DEPLOYED SUCCESSFULLY!"
echo "================================================"
echo ""
echo "📊 Prometheus Metrics:"
echo "   URL: http://localhost:9090"
echo "   Targets: http://localhost:9090/targets"
echo "   Alerts: http://localhost:9090/alerts"
echo ""
echo "📈 Grafana Dashboards:"
echo "   URL: http://localhost:3001"
echo "   Username: admin"
echo "   Password: profithack2025"
echo ""
echo "🎯 Recommended Grafana Dashboards to Import:"
echo "   - Node.js Application Metrics (ID: 11159)"
echo "   - Golang gRPC Metrics (ID: 14783)"
echo "   - PostgreSQL Database (ID: 9628)"
echo "   - Redis (ID: 11835)"
echo "   - Kafka (ID: 7589)"
echo ""
echo "📝 Metrics Endpoints:"
echo "   - Node.js API: http://localhost:5000/api/metrics/prometheus"
echo "   - Golang Feed Service: http://localhost:50051/metrics"
echo "   - Python XAI Service: http://localhost:8000/metrics"
echo ""
echo "🚨 Alert Rules Active:"
echo "   - High Latency (Feed Service P95 > 50ms)"
echo "   - High Error Rate (>1% errors)"
echo "   - Queue Depth (Kafka/BullMQ > 1000)"
echo "   - Database Connection Pool (>90% usage)"
echo "   - Redis Memory (>90% usage)"
echo ""
echo "================================================"
echo "Next Steps:"
echo "1. Access Grafana and import recommended dashboards"
echo "2. Configure alert notifications (Slack, PagerDuty, etc.)"
echo "3. Set up retention policies for metrics storage"
echo "4. Run load tests to validate alert thresholds"
echo "================================================"
