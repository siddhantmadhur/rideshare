Rideshare
<img src="https://github.com/user-attachments/assets/eb5bccb7-3da7-486c-aacb-df463ed4b3e0" width="50" />
## How to setup



### Database
```
docker compose up
```


### Mobile App

#### iOS

```
cd mobile/ios
pod install
cd ..
npx expo run:ios
```

#### Android
Broken


### Server

For debug/speed:
```
go run ./cmd
```

For actual build:
```
cd server
make
./build/rideshare
```

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).