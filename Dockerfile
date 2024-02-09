# FROM node:20.4.0

# ARG EXPO_TOKEN
# ENV EXPO_TOKEN=$EXPO_TOKEN

# ARG EAS_NO_VCS
# ENV EAS_NO_VCS=1

# WORKDIR /
# RUN npm -g i eas-cli @expo/ngrok@^4.1.0 sharp-cli@^2.1.0
# RUN apt update && apt install -y wget unzip android-sdk
# RUN corepack enable && corepack prepare yarn@stable --activate && yarn set version stable
# RUN wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && unzip commandlinetools-linux-9477386_latest.zip
# RUN mkdir -p /android-sdk/cmdline-tools/latest && mv ./cmdline-tools/* ./android-sdk/cmdline-tools/latest
# ENV PATH /android-sdk/cmdline-tools/latest/bin:$PATH
# ENV ANDROID_SDK_ROOT /android-sdk
# ENV ANDROID_HOME /android-sdk
# ENV EAS_NO_VCS 1
# RUN yes | sdkmanager --licenses

# VOLUME ["/project/app"]
# WORKDIR /project/app

# RUN export EAS_NO_VCS=1
# RUN cd /project/app
# RUN yarn install

# CMD ["eas", "build", "-p", "android", "--profile", "preview", "--local"]

FROM node:20.4.0

ARG EXPO_TOKEN
ENV EXPO_TOKEN=$EXPO_TOKEN

ARG EAS_NO_VCS
ENV EAS_NO_VCS=$EAS_NO_VCS

RUN npm -g i eas-cli @expo/ngrok@^4.1.0 sharp-cli@^2.1.0
RUN apt update && apt install -y wget unzip android-sdk
RUN corepack enable && corepack prepare yarn@stable --activate && yarn set version stable
RUN wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && unzip commandlinetools-linux-9477386_latest.zip
RUN mkdir -p /android-sdk/cmdline-tools/latest && mv ./cmdline-tools/* ./android-sdk/cmdline-tools/latest
ENV PATH /android-sdk/cmdline-tools/latest/bin:$PATH
ENV ANDROID_SDK_ROOT /android-sdk
ENV ANDROID_HOME /android-sdk
RUN yes | sdkmanager --licenses

WORKDIR /project/app

COPY package.json yarn.lock ./
CMD yarn install && eas build -p android --profile preview --local