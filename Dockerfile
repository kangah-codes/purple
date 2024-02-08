FROM node:20.4.0

ARG EXPO_TOKEN
ENV EXPO_TOKEN=$EXPO_TOKEN

WORKDIR /
RUN npm -g i eas-cli @expo/ngrok@^4.1.0 sharp-cli@^2.1.0
RUN apt update && apt install -y wget unzip android-sdk
RUN corepack enable && corepack prepare yarn@stable --activate && yarn set version stable
RUN wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && unzip commandlinetools-linux-9477386_latest.zip
RUN mkdir -p /android-sdk/cmdline-tools/latest && mv ./cmdline-tools/* ./android-sdk/cmdline-tools/latest
ENV PATH /android-sdk/cmdline-tools/latest/bin:$PATH

# Set EAS_NO_VCS environment variable
ENV EAS_NO_VCS=1

WORKDIR /project
WORKDIR /project/app
VOLUME ["/project/app"]

# Initialize Git repository
RUN git init

CMD ["eas", "build", "-p", "android", "--profile", "preview", "--local"]
