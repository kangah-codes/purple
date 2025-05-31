#!/bin/bash
# infrastructure/build-apk.sh

set -e

# Default values
PROFILE="development"
OUTPUT_NAME="purple-dev.apk"
NODE_ENV="dev"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --profile)
      PROFILE="$2"
      shift 2
      ;;
    --output)
      OUTPUT_NAME="$2"
      shift 2
      ;;
    --env)
      NODE_ENV="$2"
      shift 2
      ;;
    --api-url)
      API_URL="$2"
      shift 2
      ;;
    --api-key)
      API_KEY="$2"
      shift 2
      ;;
    --expo-token)
      EXPO_TOKEN="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  --profile PROFILE    Build profile (development|rc) [default: development]"
      echo "  --output OUTPUT      Output APK filename [default: purple-dev.apk]"
      echo "  --env ENV           Environment (dev|rc) [default: dev]"
      echo "  --api-url URL       API URL for environment variables"
      echo "  --api-key KEY       API key for environment variables"
      echo "  --expo-token TOKEN  Expo token for authentication"
      echo "  -h, --help          Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo "🔧 Building APK with profile: $PROFILE"
echo "📦 Output file: $OUTPUT_NAME"
echo "🌍 Environment: $NODE_ENV"

# Create .env file if API credentials are provided
if [[ -n "$API_URL" && -n "$API_KEY" ]]; then
  echo "📝 Creating .env file..."
  echo "EXPO_PUBLIC_API_URL=$API_URL" > .env
  echo "EXPO_PUBLIC_API_KEY=$API_KEY" >> .env

  if [[ "$NODE_ENV" == "dev" ]]; then
    echo "NODE_ENV=dev" >> .env
  fi

  echo "✅ Environment file created"
fi

# Set Expo token if provided
if [[ -n "$EXPO_TOKEN" ]]; then
  export EXPO_TOKEN="$EXPO_TOKEN"
  echo "🔑 Expo token configured"
fi

# Ensure dependencies are up to date
echo "📦 Installing dependencies..."
yarn install --frozen-lockfile

# Build the APK
echo "🚀 Starting build process..."
if [[ "$PROFILE" == "rc" ]]; then
  echo "🏗️ Building Release Candidate..."
  if [[ -f ".env" ]]; then
    npx dotenv -c -- eas build --non-interactive -p android --profile rc --local --output "/output/$OUTPUT_NAME"
  else
    eas build --non-interactive -p android --profile rc --local --output "/output/$OUTPUT_NAME"
  fi
else
  echo "🏗️ Building Development version..."
  eas build --non-interactive -p android --profile development --local --output "/output/$OUTPUT_NAME"
fi

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "📋 Build completed successfully!"
echo "   Version: $VERSION"
echo "   Profile: $PROFILE"
echo "   Output: /output/$OUTPUT_NAME"

# Copy to workspace root if building in container
if [[ -d "/workspace" ]]; then
  cp "/output/$OUTPUT_NAME" "/workspace/$OUTPUT_NAME"
  echo "📁 APK copied to workspace: /workspace/$OUTPUT_NAME"
fi
