Rideshare

## How to setup

### Database
```
docker compose up
```
![Uploading image.png…]()


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

