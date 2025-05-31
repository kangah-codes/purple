# Purple Android APK Builder

This Docker setup replicates your GitHub Actions environment for building Android APKs locally with the same dependencies and build process.

## 📁 Directory Structure

```
your-monorepo/
├── infrastructure/
│   ├── Dockerfile.android-build
│   ├── docker-compose.android.yml
│   ├── build-apk.sh
│   ├── Makefile
│   ├── .env.example
│   ├── output/          # Built APKs will appear here
│   └── workspace/       # Shared workspace (optional)
└── purple/              # Your Expo React Native app
    ├── package.json
    ├── yarn.lock
    └── ... (your app source)
```

## 🚀 Quick Start

1. **Navigate to infrastructure directory:**
   ```bash
   cd infrastructure
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Build your first APK:**
   ```bash
   # Development build
   make build-dev

   # Or release candidate build
   make build-rc
   ```

## 🔧 Setup Requirements

### Prerequisites
- Docker and Docker Compose installed
- Your Expo token (get from [Expo Settings](https://expo.dev/accounts/[username]/settings/access-tokens))

### Environment Variables
Create a `.env` file in the infrastructure directory with:

```bash
EXPO_TOKEN=your_expo_token_here
API_URL=https://your-api-url.com
API_KEY=your_api_key_here
```

## 🏗️ Building APKs

### Using Makefile (Recommended)
```bash
# Setup (first time only)
make setup

# Build development APK
make build-dev

# Build release candidate APK
make build-rc

# Build both versions
make build-both

# Clean up everything
make clean
```

### Using Docker Compose Directly
```bash
# Development build
docker-compose -f docker-compose.android.yml run --rm android-builder-dev

# Release candidate build
docker-compose -f docker-compose.android.yml run --rm android-builder-rc
```

### Using Build Script Directly
```bash
# Start interactive container
docker-compose -f docker-compose.android.yml run --rm android-builder

# Inside container, run:
build-apk.sh --profile development --output my-app.apk
build-apk.sh --profile rc --output my-app-rc.apk
```

## 📋 Build Profiles

### Development Profile
- Matches your GitHub Actions `dev` branch build
- Creates `purple-dev.apk`
- Includes `NODE_ENV=dev` in environment

### Release Candidate Profile
- Matches your GitHub Actions `rc` branch build
- Creates `purple-rc.apk`
- Uses production environment variables

## 🐛 Debugging

### Open Shell in Container
```bash
make shell
# Or
docker-compose -f docker-compose.android.yml run --rm android-builder bash
```

### View Build Logs
```bash
make logs
```

### Check Built APKs
```bash
ls -la output/
```

## 🔄 Replicating GitHub Actions Environment

This setup includes the exact same dependencies as your GitHub Actions:

- **OS**: Ubuntu 22.04 (latest)
- **Node.js**: 20.x
- **Java**: OpenJDK 17 (Temurin distribution)
- **Android SDK**: Latest with required build tools
- **Expo CLI**: Latest version
- **EAS CLI**: Latest version
- **Yarn**: For dependency management

### Build Process Matching
The Docker setup replicates these GitHub Actions steps:

1. ✅ Repository checkout (your local code)
2. ✅ Node.js 20.x setup
3. ✅ JDK 17 setup (Temurin)
4. ✅ Android SDK setup
5. ✅ Expo/EAS setup with token
6. ✅ Yarn dependency installation
7. ✅ Environment file creation
8. ✅ EAS build execution
9. ✅ APK output

## 📝 Build Script Options

The `build-apk.sh` script supports these options:

```bash
--profile PROFILE    # development|rc (default: development)
--output OUTPUT      # APK filename (default: purple-dev.apk)
--env ENV           # dev|rc (default: dev)
--api-url URL       # API URL for environment
--api-key KEY       # API key for environment
--expo-token TOKEN  # Expo authentication token
--help              # Show help message
```

## 🔍 Troubleshooting

### Common Issues

1. **Expo token errors**: Make sure your `EXPO_TOKEN` is valid and has the right permissions
2. **Build failures**: Check that all required secrets (API_URL, API_KEY) are set
3. **Permission errors**: Ensure Docker has access to your project directory
4. **Out of space**: Run `make clean` to remove old containers and images

### Getting Help
```bash
# Show available commands
make help

# Show build script options
docker-compose -f docker-compose.android.yml run --rm android-builder build-apk.sh --help
```

## 🎯 Advantages Over GitHub Actions

- **Faster builds**: No CI queue time
- **Debug-friendly**: Easy to shell into container and inspect
- **Offline capable**: Build without internet (after initial setup)
- **Cost-effective**: No CI minutes consumed
- **Consistent**: Same environment every time
