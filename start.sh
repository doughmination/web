#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check for --rebuild flag
FORCE_REBUILD=false
if [[ "$1" == "--rebuild" ]]; then
    FORCE_REBUILD=true
    echo -e "${YELLOW}🔨 Force rebuild enabled — skipping pulls${NC}"
fi

# Excluded services
EXCLUDE_SERVICES=("status-front" "status-back")

echo -e "${BLUE}😸 Pulling GitHub Updates... ${NC}"
echo "=================================="

git pull

echo -e "${BLUE}🚀 Starting Butterfly Network Websites...${NC}"
echo "=================================="

# Stop all running containers
echo -e "${YELLOW}🛑 Stopping all running containers...${NC}"
docker compose down

# Get list of services from docker-compose.yml
services=$(docker compose config --services)

# Track started services
started=()

for service in $services; do
    # Skip excluded services
    if [[ " ${EXCLUDE_SERVICES[*]} " =~ " ${service} " ]]; then
        echo -e "${YELLOW}⏩ Skipping excluded service: ${service}${NC}"
        continue
    fi

    echo -e "${YELLOW}📦 Processing service: ${service}${NC}"
    start_ok=false

    if [ "$FORCE_REBUILD" = true ]; then
        # Always rebuild if flag is set
        echo -e "${YELLOW}🔨 Building image for ${service} (forced)...${NC}"
        if docker compose build "$service"; then
            echo -e "${GREEN}✅ Build succeeded for ${service}${NC}"
            start_ok=true
        else
            echo -e "${RED}❌ Build failed for ${service}${NC}"
        fi
    else
        # Try pulling
        echo -e "${YELLOW}📥 Pulling image for ${service}...${NC}"
        if docker compose pull "$service"; then
            # Check if the image exists locally
            image=$(docker compose config | awk -v srv="$service" '
                $1 == srv ":" {in_service=1; next}
                in_service && $1 ~ /image:/ {print $2; exit}
            ')
            if [ -n "$image" ] && docker image inspect "$image" >/dev/null 2>&1; then
                echo -e "${GREEN}✅ Pull succeeded for ${service}${NC}"
                start_ok=true
            else
                echo -e "${YELLOW}ℹ️ No pulled image found for ${service}, will try build${NC}"
            fi
        else
            echo -e "${RED}❌ Pull failed for ${service}${NC}"
        fi

        # If no working image, try build
        if [ "$start_ok" = false ]; then
            echo -e "${YELLOW}🔨 Building image for ${service}...${NC}"
            if docker compose build "$service"; then
                echo -e "${GREEN}✅ Build succeeded for ${service}${NC}"
                start_ok=true
            else
                echo -e "${RED}❌ Build failed for ${service}${NC}"
            fi
        fi
    fi

    # Start service if successful
    if [ "$start_ok" = true ]; then
        echo -e "${YELLOW}🚢 Starting ${service}...${NC}"
        if docker compose up -d "$service"; then
            echo -e "${GREEN}✅ ${service} started${NC}"
            started+=("$service")
        else
            echo -e "${RED}❌ Failed to start ${service}${NC}"
        fi
    else
        echo -e "${RED}⏩ Skipping ${service}, no working image${NC}"
    fi

    echo ""
done

echo -e "${BLUE}📋 Startup summary:${NC}"
if [ ${#started[@]} -eq 0 ]; then
    echo -e "${RED}❌ No services were started${NC}"
else
    for s in "${started[@]}"; do
        echo -e "${GREEN}✅ $s running${NC}"
    done
    echo ""
    docker compose ps
    echo ""
    echo -e "${BLUE}📋 Showing live logs (Ctrl+C to exit)...${NC}"
    docker compose logs -f "${started[@]}"
fi
