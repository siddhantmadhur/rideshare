# Rideshare

## Dependencies
The project relies on the following dependencies to function correctly:
1. React and React Native: This is the frontend JavaScript library that allows us to create cross-platform mobile apps.
2. Firebase: We use this for authentication so that we do not personallly store private information or passwords.
3. Postgres: This is the database we use to store user and ride information.
4. Golang and Echo: We used the golang standard library, along with Echo to create a fast web server to process secure information like ride information.
5. Docker: In order to containerize the web server and postgres database we used docker

To run the app, make sure to install:
1. npm
2. go
3. docker

### Compilation

1. Make sure an emulator (iOS or Android) is running on your device
2. Compile the frontend
```bash
# from project root
cd mobile
npm install --legacy-peer-deps
```
3. Compile the backend
```bash
# from project root
cd server
go build cmd/main.go # or make
```


### Running the app
1. Make sure the database server is running:
```bash
docker compose up
```
2. Run the backend
```bash
# from server folder
./build/rideshare
```
3. Run the frontend
```bash
# from mobile folder
npx expo run:ios
```

### Known Bugs / Issues

1. On Android the Google Sign In doesn't work so we have an email and password for now
2. On iOS in order to compile the program the required "podfiles" errors out sometimes. It works on some versions and laptops but not others.
