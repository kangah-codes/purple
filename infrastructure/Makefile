# infrastructure/Makefile

.PHONY: help build-dev build-rc build-container clean setup db-up db-down

# Default target
help:
	@echo "Purple Infrastructure Commands"
	@echo "=============================="
	@echo ""
	@echo "Database commands:"
	@echo "  db-up       - Start PostgreSQL and Redis containers"
	@echo "  db-down     - Stop database containers"
	@echo "  db-restart  - Restart database containers"
	@echo ""
	@echo "Android APK Builder commands:"
	@echo "  setup       - Create necessary directories and build Docker image"
	@echo "  build-dev   - Build development APK"
	@echo "  build-rc    - Build release candidate APK"
	@echo "  build-both  - Build both development and RC APKs"
	@echo "  clean       - Remove built APKs and Docker containers"
	@echo "  shell       - Open shell in build container"
	@echo "  logs        - Show build logs"
	@echo ""
	@echo "Environment variables:"
	@echo "  EXPO_TOKEN  - Your Expo authentication token"
	@echo "  API_URL     - API URL for the app"
	@echo "  API_KEY     - API key for the app"
	@echo ""
	@echo "Examples:"
	@echo "  make db-up"
	@echo "  make setup"
	@echo "  EXPO_TOKEN=your_token API_URL=https://api.example.com API_KEY=your_key make build-dev"

# Database commands
db-up:
	@echo "🗄️ Starting database containers..."
	docker compose up -d postgres redis
	@echo "✅ Database containers started!"
	@echo "   PostgreSQL: localhost:5432 (user: admin, password: admin, db: purple)"
	@echo "   Redis: localhost:6379"

db-down:
	@echo "🛑 Stopping database containers..."
	docker compose stop postgres redis
	@echo "✅ Database containers stopped!"

db-restart: db-down db-up
	@echo "🔄 Database containers restarted!"

# Create directories and build container
setup:
	@echo "🔧 Setting up build environment..."
	mkdir -p output workspace
	docker compose build android-builder
	@echo "✅ Setup complete!"

# Build development APK
build-dev: setup
	@echo "🚀 Building development APK..."
	docker compose run --rm android-builder-dev
	@echo "✅ Development build complete! Check ./output/purple-dev.apk"

# Build release candidate APK
build-rc: setup
	@echo "🚀 Building release candidate APK..."
	docker compose run --rm android-builder-rc
	@echo "✅ Release candidate build complete! Check ./output/purple-rc.apk"

# Build both versions
build-both: build-dev build-rc
	@echo "✅ Both builds complete!"

# Clean up Android builder containers only
clean:
	@echo "🧹 Cleaning up Android build containers..."
	docker compose stop android-builder android-builder-dev android-builder-rc || true
	docker compose rm -f android-builder android-builder-dev android-builder-rc || true
	docker system prune -f
	rm -rf output/*.apk
	@echo "✅ Android build cleanup complete!"

# Clean everything including databases
clean-all:
	@echo "🧹 Cleaning up everything..."
	docker compose down --volumes --remove-orphans
	docker system prune -f
	rm -rf output/*.apk
	@echo "✅ Full cleanup complete!"

# Open shell in container for debugging
shell: setup
	@echo "🐚 Opening shell in build container..."
	docker compose run --rm android-builder bash

# Show logs
logs:
	docker compose logs -f

# Show logs for specific service
logs-db:
	docker compose logs -f postgres redis

logs-android:
	docker compose logs -f android-builder

# Build container only
build-container:
	@echo "🔨 Building Docker container..."
	docker compose build android-builder
