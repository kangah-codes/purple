FROM node:20.4.0

ARG EXPO_TOKEN
ENV EXPO_TOKEN=$EXPO_TOKEN

WORKDIR /

# Install necessary packages
RUN npm -g i eas-cli @expo/ngrok@^4.1.0 sharp-cli@^2.1.0
RUN apt update && apt install -y wget unzip android-sdk git

# Download and install Android command-line tools
RUN wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && unzip commandlinetools-linux-9477386_latest.zip
RUN mkdir -p /android-sdk/cmdline-tools/latest && mv ./cmdline-tools/* ./android-sdk/cmdline-tools/latest
ENV PATH /android-sdk/cmdline-tools/latest/bin:$PATH

# Set up Docker volume for the project
VOLUME ["/project:/project"]

# Go to the project directory
WORKDIR /project/app

# Initialize Git (can be moved outside the Dockerfile if needed)
RUN git init

# Build the app using EAS
CMD ["eas", "build", "-p", "android", "--profile", "preview", "--local"]
