# FROM node:20.4.0

# ARG EXPO_TOKEN
# ENV EXPO_TOKEN=$EXPO_TOKEN

# WORKDIR /
# RUN npm -g i eas-cli @expo/ngrok@^4.1.0 sharp-cli@^2.1.0
# RUN apt update && apt install -y wget unzip android-sdk
# RUN corepack enable && corepack prepare yarn@stable --activate && yarn set version stable
# RUN wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && unzip commandlinetools-linux-9477386_latest.zip
# RUN mkdir -p /android-sdk/cmdline-tools/latest && mv ./cmdline-tools/* ./android-sdk/cmdline-tools/latest
# ENV PATH /android-sdk/cmdline-tools/latest/bin:$PATH

# # Set EAS_NO_VCS environment variable
# RUN export EAS_NO_VCS=1

# WORKDIR /project
# WORKDIR /project/app
# VOLUME ["/project/app"]

# CMD ["eas", "build", "-p", "android", "--profile", "preview", "--local"]

# Use the official Node.js 14 LTS image as the base image
FROM node:14

ARG EXPO_TOKEN
ENV EXPO_TOKEN=$EXPO_TOKEN

# Install Java Development Kit (JDK), required for Android development
RUN apt-get update && apt-get install -y openjdk-11-jdk

# Install required dependencies
RUN npm install -g expo-cli

# Set up environment variables for Android SDK
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin

# Download and install Android SDK
RUN wget -q https://dl.google.com/android/repository/commandlinetools-linux-7583922_latest.zip -O android-sdk.zip \
    && mkdir -p $ANDROID_SDK_ROOT/cmdline-tools/latest \
    && unzip -q android-sdk.zip -d $ANDROID_SDK_ROOT/cmdline-tools/latest \
    && rm android-sdk.zip

# Accept Android SDK licenses
RUN yes | sdkmanager --licenses

# Set up working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the entire project
COPY . .

# Build the Android app using EAS
RUN expo build:android --local

# Copy the APK file to a directory for further use
RUN mkdir /output
RUN cp android/app/build/outputs/apk/debug/purple-debug.apk /output/purple-debug.apk
