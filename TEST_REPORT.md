# 🧪 Test Plan and Report  
**Product Name**: RideShare
**Date**: 06/03/2025

---

## ✅ System Test Scenarios

### User Story 1  
**As a user**, I want to create an account so that I can use the app.

**Scenario 1: Create Account (Pass/Fail)**  
1. Start the app  
2. Select ‘New User’  
3. Input:  
   - Name: Jane  
   - Password: MySecurePass  
   - Confirm Password: MySecurePass  
4. Press “Register”  
**Expected Output:** Account created message  
**Result:** ✅ Pass  

---

### User Story 2  
**As a user**, I want to post a ride so that others can join.

**Scenario 2: Post Ride (Pass/Fail)**  
1. Log in to the app  
2. Go to “Post Ride”  
3. Input:
   - Pickup: UCSC East Remote  
   - Destination: Santa Cruz Downtown  
   - Time: 3:00 PM  
4. Click “Submit”  
**Expected Output:** Ride added to list  
**Result:** ❌ Fail – doesn’t appear until manual refresh  

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

- **Test Framework Used**: Golang
- **Location in Repo**: `tests/unit/`
                        `server/internal/server/`
                        `server/internal/storage`
- **Automated Test Result Summary**:
  - `auth.test.js` ✅ Passed  
  - `rideList.test.js` ❌ Failed – data not returned correctly
  - `rating_test.go` ✅ Passed
  - `middleware_test.go` ✅ Passed
  - `rides_test.go` ✅ Passed
  - `storage_test.go` ✅ Passed
- Be prepared to run these tests during the project review
