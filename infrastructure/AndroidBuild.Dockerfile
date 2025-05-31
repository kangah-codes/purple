# infrastructure/Dockerfile.android-build
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/tools/bin:${ANDROID_HOME}/platform-tools
ENV JAVA_HOME=/opt/java/openjdk
ENV PATH=${PATH}:${JAVA_HOME}/bin
ENV NODE_VERSION=20.x

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    build-essential \
    python3 \
    python3-pip \
    openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*

# Set up Java environment
RUN update-alternatives --install /usr/bin/java java /usr/lib/jvm/java-17-openjdk-amd64/bin/java 1
RUN update-alternatives --install /usr/bin/javac javac /usr/lib/jvm/java-17-openjdk-amd64/bin/javac 1
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install Yarn
RUN npm install -g yarn

# Install Android SDK
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    cd ${ANDROID_HOME}/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
    unzip commandlinetools-linux-9477386_latest.zip && \
    rm commandlinetools-linux-9477386_latest.zip && \
    mv cmdline-tools latest

# Update PATH for Android SDK
ENV PATH=${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin

# Accept Android SDK licenses and install required packages
RUN yes | sdkmanager --licenses && \
    sdkmanager "platforms;android-34" \
    "build-tools;34.0.0" \
    "platform-tools" \
    "tools"

# Install Expo CLI and EAS CLI globally
RUN npm install -g @expo/cli@latest eas-cli@latest

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY purple/package.json purple/yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the entire purple directory
COPY purple/ ./

# Create entrypoint script
COPY infrastructure/build-apk.sh /usr/local/bin/build-apk.sh
RUN chmod +x /usr/local/bin/build-apk.sh

# Set the entrypoint
ENTRYPOINT ["/usr/local/bin/build-apk.sh"]
