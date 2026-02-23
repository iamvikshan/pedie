#!/usr/bin/env bash
set -euo pipefail

# Pedie Tech Store - VPS Deployment Script
# Usage: ./scripts/deploy.sh

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Check prerequisites
check_prerequisites() {
  info "Checking prerequisites..."

  if ! command -v docker &>/dev/null; then
    error "Docker is not installed. Please install Docker first."
  fi

  if ! docker compose version &>/dev/null; then
    error "Docker Compose V2 is not available. Please update Docker."
  fi

  info "Prerequisites OK"
}

# Configure environment
configure_env() {
  if [[ ! -f .env ]]; then
    warn ".env file not found"
    if [[ -f .env.example ]]; then
      info "Copying .env.example to .env"
      cp .env.example .env
      warn "Please edit .env with your production values before continuing"
      read -rp "Press Enter when ready..."
    else
      error "No .env.example found. Cannot configure environment."
    fi
  else
    info ".env file found"
  fi
}

# Pull latest images
pull_images() {
  info "Pulling latest images..."
  docker compose -f docker-compose.prod.yml pull
}

# Deploy
deploy() {
  info "Starting deployment..."
  docker compose -f docker-compose.prod.yml up -d

  info "Waiting for health check..."
  local retries=0
  local max_retries=12

  while [[ $retries -lt $max_retries ]]; do
    if wget --spider -q http://localhost:3000 2>/dev/null; then
      info "Store is healthy and running!"
      return 0
    fi
    retries=$((retries + 1))
    echo -n "."
    sleep 5
  done

  warn "Health check timed out. Check logs with: docker compose -f docker-compose.prod.yml logs store"
}

# Main
main() {
  echo ""
  echo "=================================="
  echo "  Pedie Tech Store - Deployment"
  echo "=================================="
  echo ""

  check_prerequisites
  configure_env
  pull_images
  deploy

  echo ""
  info "Deployment complete!"
  echo ""
  echo "Useful commands:"
  echo "  Logs:    docker compose -f docker-compose.prod.yml logs -f store"
  echo "  Status:  docker compose -f docker-compose.prod.yml ps"
  echo "  Restart: docker compose -f docker-compose.prod.yml restart store"
  echo "  Stop:    docker compose -f docker-compose.prod.yml down"
  echo ""
}

main "$@"
