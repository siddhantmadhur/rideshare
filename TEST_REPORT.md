# 🧪 Test Plan and Report  
**Product Name**: RideShare
**Date**: 06/03/2025

---

## ✅ System Test Scenarios

### User Story 1 
**As a user**, I want to create an account so that I can use the app.

**Scenario 1: Create Account (Pass/Fail)**  
1. Start the app   
3. Input:  
   - Email Address: Jane  
   - Password: MySecurePass  
   - Confirm Password: MySecurePass  
4. Press “Sign Up”  
**Expected Output:** Account created message  
**Result:** ✅ Pass  

---

### User Story 2  
**As a user**, I want to post a ride so that others can join.

**Scenario 2: Post Ride (Pass/Fail)**  
1. Log in to the app  
2. Click the bottom right plus button on the list view to initiate a post  
3. Input:
   - Pickup: UCSC East Remote  
   - Destination: Santa Cruz Downtown  
   - Time: 3:00 PM  
4. Click “Submit”  
**Expected Output:** Ride added to list and PostgreSQL on pgAdmin4
**Result:** ✅ Pass 
---

### User Story 3  
**As a user**, I want to check the past ratings/reviews of a driver/rider before a ride.

**Scenario 3: Create a review (Pass/Fail)**  
1. Finish a ride  
2. Select ‘Rate Your Ride’ 
3. Enter rating; type description(optional)  
**Expected Output:** Review created message  
**Result:** ✅ Pass  

**Scenario 4: Show past ratings/reviews of a user (Pass/Fail)**  
1. Select a user's profile
2. Click on the user's rating
3. user should see the past ratings/reviews of the person selected  
**Expected Output:** A list of reviews of being displayed  
**Result:** ✅ Pass 

---

## 🧪 Unit Tests

### rides_test.go

- **Description**: Checking if a ride offer can be successfully created/deleted/updated.
- **Directory**: `server/internal/server/`
- **Test Result**: ✅ Passed 

### middleware_test.go

- **Description**: Checking the middleware is working properly to extract authentication tokens from HTTP Authorization headers. 
- **Directory**: `server/internal/server/`
- **Test Result**: ✅ Passed 

### rating_test.go

- **Description**: Checking if a review can be correctly created/deleted; and if rating.go can display reviews as list view.
- **Directory**: `server/internal/server/`, `server/internal/rating`
- **Test Result**: ✅ Passed 

### storage_test.go

- **Description**: Verifing database connectivity and basic GORM operations.
- **Directory**: `server/internal/storage/`
- **Test Result**: ✅ Passed
