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

## 🧪 Unit Tests

- **Test Framework Used**: Golang
- **Location in Repo**: `tests/unit/`  
- **Automated Test Result Summary**:
  - `auth.test.js` ✅ Passed  
  - `rideList.test.js` ❌ Failed – data not returned correctly  
- Be prepared to run these tests during the project review
