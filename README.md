<div align="center">
  <img src="./purple/assets/images/icon.png" style="border-radius: 10%; width: 100px">
    
  <p style="font-weight: 900; font-size: 40px">Purple</p>
</div>

# Personal Finance and Budget Tracker

Purple is a budget and expense tracker mobile app I'm currently building for personal use. I was inspired to build Purple because after I made the switch to Android, I couldn't find a budget app that I liked. I wanted something simple, clean, and easy to use, which was hard to find on Android. So I decided to build my own, and to use this as an opportunity to further polish my React Native skills.

## Directory Structure

-   [`purple/`](#purple-react-native-app): Contains the Expo-based React Native app.
-   [`nucleus/`](#nucleus-backend): Contains the Go backend using Gin and GORM with PostgreSQL.

## Purple (React Native App)

Purple is the frontend for the budget and expense tracker app. It's built with React Native using the Expo SDK. Yeah, I know, naming the frontend for Purple, (drumroll.....) Purple.

Some Inspiration for the design was taken from [here](https://www.behance.net/gallery/173280263/A-Budget-PLanner-app?tracking_source=search_projects|budget+app&l=24).

### Supported Platforms

Since I'm primarily an android user, that is my _only_ target. However since React Native is cross-platform the app should work fairly well on iOS devices as well, but I'm not so worried about optimising for certain iOS devices like the phones without a notch or dynamic whatevers.

For now Purple is going to work exclusively offline, probably going to use sqlite3 for handling local database operations, once I figure out which direction this project is gonna go I may consider building a backend to allow for online syncing.

### Sample Screens

Here are a few (outdated) screenshots of the app so far:

<div style="display: flex; flex-direction: row;">
<img src="/assets/screenshots/home.png" style="width: 150px" />
<img src="/assets/screenshots/plans.png" style="width: 150px" />
<img src="/assets/screenshots/receipt.png" style="width: 150px" />
<img src="/assets/screenshots/transactions.png" style="width: 150px" />
</div>

<div style="display: flex; flex-direction: row;">
<img src="/assets/screenshots/new-transaction.png" style="width: 150px" />
<img src="/assets/screenshots/plans.png" style="width: 150px" />
<img src="/assets/screenshots/new-plan.png" style="width: 150px" />
</div>

### Building the app

Since this application uses the expo-sdk and is built with React Native, building the app is fairly simple. You can follow the steps below to build the app:

-   Clone the repository
-   cd into the project directory
-   Run `yarn install` to install all the dependencies
-   To build for Android, you have to have your Android development environment set up
    -   Run `eas build -p android --profile preview --local --output purple.apk` to build the app for an android target _OR_ you can use the GitHub action provided which builds the apk and creates a new release for it, so you can just download the `.apk` file contained in the build artifact `.zip` file directly from the action run. You must have android sdk tools installed to run a local build.

### Roadmap

Right now, Purple is still just a pet project, I'm not entirely sure I have the direction I want to take it in. But I do have a few ideas in mind (in no particular order):

-   Adding recurring transactions 🔄
-   Session Recording & Tracking 📹 (Trust me bro it's for analytics only I swear bro 🥺👉👈)
-   Dark Mode 🌚
-   Search functionality 🔍
-   Push Notifications 📬
-   Custom Categories 📊
-   Buget Limits 📉
-   Expense Splitting 🤝
-   Automatic Exchange Rate Conversion / Proper multi-currency support 🌍
-   Reporting 📈 (Cashflow analysis)
-   Iris 🪻
-   Offline Syncing 🔄
-   Calender Integration 📅
-   Web Version? 🌐
-   Integration with bank/mobile money services for automatic expense tracking 🏦
-   Opt-in encryption (Users can choose to have their sensitive data in the db encrypted)

## Nucleus (Backend)

Nucleus is the backend for Purple, it's built with Go using the Gin framework and GORM for database operations. The database used is PostgreSQL. It's essentially just a CRUD API in terms of functionality (isn't everything?).

### Contributing

I'm not currently looking for contributors since Purple is still in very early stages, but if you have any ideas or suggestions, feel free to open an issue.
