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

