Rideshare

## How to setup

![image](https://github.com/user-attachments/assets/eb5bccb7-3da7-486c-aacb-df463ed4b3e0)


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

