# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started
=======
Rideshare
<img src="https://github.com/user-attachments/assets/eb5bccb7-3da7-486c-aacb-df463ed4b3e0" width="50" />

# Design

To see how the frontend should authorize requests, look into [this doc that covers id tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens#web)
Attach it to the request like this:

```
fetch('/example', {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${idToken}`
  }
})
```
## Backend

### Auth

### Rides

- POST `/rides/offers/create`
  Creates a new ride offer for the driver and stores it in the database
  
  | Name | Type | Description |
  | --- | --- | --- |
  | start_location | Location Object | {lat: int, long: int} |
  | end_location | Location Object | | 
  | pickup_radius | float | The max distance away from the start location the driver is willing to drive |
  | dropoff_radius | float | ^ except end location | 
  | time | unix timestamp | The date and time the driver is going to start the journey |
  | combined_cost | float | how much money the driver is looking to gain for doing the journey |
  | car | string | the car model |
  | max_riders| int | |
  
  Returns:
  | Name | Type | Description |
  | --- | --- | --- |
  | offer_id | int | the identifier for the offer |

- POST `/rides/offers/delete`
  | Name | Type | Description |
  | --- | --- | --- |
  | offer_id | int | the offer id to delete |

- POST `/rides/offers/update`
  | Name | Type | Description |
  | --- | --- | --- |
  | offer_id | int | the offer to update |
  | rest is the same as offers/create |

- POST `/rides/request/create`
  A possible rider may request a driver to join the ride
  | Name | Type | Description |
  | --- | --- | --- |
  | offer_id | int | |
  | notes | string | optional |
  | pickup_location | Location Object |  |
  | dropoff_location | Location Object | |
- POST `/rides/request/delete`
- POST `/rides/request/update`
- POST `/rides/request/accept`
  This is done by the driver/owner of the offer
- POST `/rides/request/decline`
- GET `/rides/offer/:offer_id/`
  Gets the information about an offer with the `:offer_id` being the offer ID of the car
- GET `/rides/requests/:request_id`
  Read the above endpoint
- GET `/rides/offers/all`
  Fetches all the current possible ride requests. It is not based on any location or preference.
  

# How to set up
>>>>>>> main

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

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

<<<<<<< HEAD
This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more
=======
### Mobile App
>>>>>>> main

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
