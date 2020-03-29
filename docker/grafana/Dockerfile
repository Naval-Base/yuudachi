FROM grafana/grafana:latest

COPY dashboards.yml /etc/grafana/provisioning/dashboards/services.yaml
COPY datasources.yml /etc/grafana/provisioning/datasources/prometheus.yaml
COPY dashboards /dashboards
