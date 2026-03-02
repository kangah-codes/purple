# Use Node.js 20.x as base image (to match GitHub Actions)
FROM node:20

# Set working directory
WORKDIR /app

# Install dependencies for builds
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    && apt-get clean

# Set up JDK 17 (Temurin distribution)
RUN apt-get update && apt-get install -y wget apt-transport-https \
    && mkdir -p /etc/apt/keyrings \
    && wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | tee /etc/apt/keyrings/adoptium.asc \
    && echo "deb [signed-by=/etc/apt/keyrings/adoptium.asc] https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | tee /etc/apt/sources.list.d/adoptium.list \
    && apt-get update \
    && apt-get install -y temurin-17-jdk \
    && apt-get clean

# Set environment variables for Java and Android SDK
ENV JAVA_HOME=/usr/lib/jvm/temurin-17-jdk-amd64
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

# Install Android SDK
RUN mkdir -p $ANDROID_HOME/cmdline-tools && \
    curl -o sdk-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
    unzip sdk-tools.zip -d $ANDROID_HOME/cmdline-tools && \
    mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest && \
    rm sdk-tools.zip

# Accept Android SDK licenses
RUN yes | sdkmanager --licenses || true

# Install required Android SDK components (matching your GitHub workflow)
RUN sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.2"

# Install Expo and EAS CLI globally (to match GitHub Actions)
RUN npm install -g expo-cli eas-cli dotenv-cli

# Create a directory for the build output
RUN mkdir -p /app/output
