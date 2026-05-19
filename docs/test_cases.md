# RailGo Testing Platform - Manual Test Cases

## 📋 Test Case Documentation v1.0
**Platform:** RailGo Train Booking Simulation  
**Purpose:** QA Manual & Automation Testing Training  

---

## 🔐 AUTH MODULE TEST CASES

### TC-AUTH-001: Successful User Registration
**Priority:** High | **Type:** Positive  
**Precondition:** User is not registered  
**Steps:**
1. Navigate to `/register`
2. Enter Full Name: "Test QA User"
3. Enter Email: "qa_test_001@railgo.com"
4. Enter Phone: "081234567890"
5. Enter Password: "QATest123"
6. Enter Confirm Password: "QATest123"
7. Click "Create Account" button

**Expected Result:**  
✅ Registration successful  
✅ Toast notification: "Registration successful! Please login."  
✅ Redirected to `/login`  

**Test IDs:** `input-full-name`, `input-email`, `input-phone`, `input-password`, `input-confirm-password`, `btn-register`

---

### TC-AUTH-002: Registration with Duplicate Email
**Priority:** High | **Type:** Negative  
**Precondition:** Email "test@railgo.com" already exists  
**Steps:**
1. Navigate to `/register`
2. Enter Email: "test@railgo.com"
3. Fill all other fields with valid data
4. Click "Create Account"

**Expected Result:**  
❌ Error toast: "Email already registered."  
❌ Error message shown under email field  
❌ User stays on register page  

---

### TC-AUTH-003: Registration with Invalid Email Format
**Priority:** Medium | **Type:** Negative (Validation)  
**Steps:**
1. Navigate to `/register`
2. Enter Email: "notanemail"
3. Click "Create Account"

**Expected Result:**  
❌ Error: "Invalid email format"  
❌ Email field has red border  
❌ Form not submitted  

---

### TC-AUTH-004: Registration - Password Too Short
**Priority:** Medium | **Type:** Boundary Value  
**Steps:**
1. Navigate to `/register`
2. Enter Password: "Short1" (6 chars - below 8 minimum)
3. Click "Create Account"

**Expected Result:**  
❌ Error: "Password must be at least 8 characters"  

**Boundary Values to test:**
- 7 chars: FAIL ❌
- 8 chars: PASS ✅
- 9 chars: PASS ✅

---

### TC-AUTH-005: Registration - Passwords Don't Match
**Priority:** High | **Type:** Negative (Validation)  
**Steps:**
1. Enter Password: "RailGo123"
2. Enter Confirm Password: "RailGo456"
3. Click "Create Account"

**Expected Result:**  
❌ Error: "Passwords do not match"  
❌ Confirm password field highlighted  

---

### TC-AUTH-006: Successful Login
**Priority:** Critical | **Type:** Positive  
**Steps:**
1. Navigate to `/login`
2. Enter Email: "test@railgo.com"
3. Enter Password: "RailGo123"
4. Click "Login"

**Expected Result:**  
✅ Login successful  
✅ Toast: "Welcome back, Test!"  
✅ Redirected to `/dashboard`  
✅ JWT token stored in localStorage  
✅ User info visible in sidebar  

**Test IDs:** `input-email`, `input-password`, `btn-login`

---

### TC-AUTH-007: Login with Wrong Password
**Priority:** High | **Type:** Negative  
**Steps:**
1. Navigate to `/login`
2. Enter Email: "test@railgo.com"
3. Enter Password: "WrongPassword123"
4. Click "Login"

**Expected Result:**  
❌ Error toast: "Invalid email or password."  
❌ User stays on login page  
❌ Password field cleared or maintained  

---

### TC-AUTH-008: Login with Empty Fields
**Priority:** Medium | **Type:** Negative (Validation)  
**Steps:**
1. Navigate to `/login`
2. Leave all fields empty
3. Click "Login"

**Expected Result:**  
❌ Error: "Email is required"  
❌ Error: "Password is required"  
❌ Submit button shows loading state then stops  

---

### TC-AUTH-009: Show/Hide Password Toggle
**Priority:** Low | **Type:** Functional  
**Steps:**
1. Navigate to `/login`
2. Enter password: "MyPassword"
3. Click the eye icon (👁️) next to password field
4. Verify password is visible
5. Click again to hide

**Expected Result:**  
✅ Password toggles between `type="password"` and `type="text"`  
✅ Icon changes between 👁️ and 🙈  

**Test ID:** `btn-toggle-password`

---

## 🎫 BOOKING MODULE TEST CASES

### TC-BOOK-001: Successful Train Search
**Priority:** High | **Type:** Positive  
**Precondition:** User logged in  
**Steps:**
1. Navigate to `/schedule`
2. Select Origin: "Jakarta"
3. Select Destination: "Bandung"
4. Select Date: Tomorrow's date
5. Click "Search"

**Expected Result:**  
✅ Train results displayed  
✅ Results count shown: "X train(s) found"  
✅ Each result shows: train name, departure, arrival, price, seats  

**Test IDs:** `select-search-origin`, `select-search-destination`, `btn-search-schedule`, `schedule-results`

---

### TC-BOOK-002: Search Same Origin and Destination
**Priority:** Medium | **Type:** Negative  
**Steps:**
1. Select Origin: "Jakarta"
2. Select Destination: "Jakarta"
3. Click "Search"

**Expected Result:**  
❌ No results found (or logical error message)  

---

### TC-BOOK-003: Seat Selection
**Priority:** High | **Type:** Functional  
**Steps:**
1. Select a train and proceed to booking form
2. Select 2 passengers
3. Click available seat "A1"
4. Click available seat "A2"
5. Try to click taken seat

**Expected Result:**  
✅ Available seats: white/blue on hover  
✅ Selected seats: blue fill  
✅ Taken seats: gray, cannot click  
✅ Counter shows "2/2 selected"  

**Test ID:** `seat-map`, `seat-A1`, `seat-A2`

---

### TC-BOOK-004: Complete Booking Flow
**Priority:** Critical | **Type:** E2E Positive  
**Steps:**
1. Login as test@railgo.com
2. Search Jakarta → Bandung
3. Select a train
4. Fill passenger details
5. Select 1 seat
6. Click "Confirm Booking"

**Expected Result:**  
✅ Booking created with unique booking code  
✅ Redirected to payment page  
✅ Countdown timer starts  
✅ Booking visible in "My Tickets"  

---

### TC-BOOK-005: Booking Without Login
**Priority:** High | **Type:** Negative (Auth)  
**Steps:**
1. Logout if logged in
2. Navigate to `/booking`
3. Search and select a train
4. Fill passenger details
5. Click "Confirm Booking"

**Expected Result:**  
❌ Toast error: "Please login to continue booking"  
❌ Redirected to `/login`  

---

## 💳 PAYMENT MODULE TEST CASES

### TC-PAY-001: Successful Payment - Bank Transfer
**Priority:** Critical | **Type:** Positive  
**Precondition:** Active booking with pending payment  
**Steps:**
1. Navigate to payment page
2. Select "Bank Transfer"
3. Upload payment proof image
4. Click "Confirm Payment"

**Expected Result:**  
✅ Payment submitted successfully  
✅ Toast: "Payment successful! Booking confirmed!"  
✅ Booking status changes to "confirmed"  
✅ Redirected to My Tickets  

**Test IDs:** `payment-method-bank_transfer`, `input-payment-proof`, `btn-submit-payment`

---

### TC-PAY-002: Payment Countdown Timer
**Priority:** Medium | **Type:** Functional  
**Steps:**
1. Open payment page
2. Observe countdown timer

**Expected Result:**  
✅ Timer counting down from 2 hours  
✅ Timer turns red when < 5 minutes  
✅ Timer displays correctly: HH:MM:SS format  

**Test ID:** `countdown-display`

---

### TC-PAY-003: Payment Method Selection
**Priority:** Medium | **Type:** Functional  
**Steps:**
1. Open payment page
2. Click each payment method radio button

**Expected Result:**  
✅ Selected method highlights with blue border  
✅ Only one method selectable at a time  
✅ Radio button state matches selection  

**Test IDs:** `radio-bank_transfer`, `radio-ewallet`, `radio-credit_card`

---

## 🎟 TICKET MODULE TEST CASES

### TC-TICK-001: Cancel Booking
**Priority:** High | **Type:** Functional  
**Steps:**
1. Login and navigate to My Tickets
2. Find a pending/confirmed booking
3. Click "Show Details"
4. Click "Cancel Ticket"
5. Confirm in dialog

**Expected Result:**  
✅ Booking status changes to "cancelled"  
✅ Toast: "Booking cancelled successfully"  
✅ Cancel button disappears  
✅ Available seats restored  

**Test ID:** `btn-cancel-{booking_code}`

---

### TC-TICK-002: Filter Tickets by Status
**Priority:** Medium | **Type:** Functional  
**Steps:**
1. Navigate to My Tickets
2. Click "Confirmed" filter tab
3. Click "Pending" filter tab
4. Click "All" filter tab

**Expected Result:**  
✅ Only matching tickets shown per filter  
✅ Active filter tab highlighted  
✅ Count updates correctly  

**Test IDs:** `filter-tab-all`, `filter-tab-confirmed`, `filter-tab-pending`, `filter-tab-cancelled`

---

### TC-TICK-003: Download Ticket PDF
**Priority:** Low | **Type:** Functional  
**Steps:**
1. Navigate to a confirmed booking in My Tickets
2. Expand ticket details
3. Click "Download PDF"

**Expected Result:**  
✅ Toast: "Downloading ticket... / Ticket downloaded as PDF!"  
✅ Button only visible for confirmed bookings  

---

## 🧪 QA SANDBOX TEST CASES

### TC-QA-001: Slow Response Handling
**Priority:** Medium | **Type:** Performance  
**Steps:**
1. Navigate to `/qa-sandbox`
2. Click "Trigger Slow Response" button
3. Observe loading state

**Expected Result:**  
✅ Loading spinner visible for 3 seconds  
✅ Button disabled during loading  
✅ Success/error message appears after response  
✅ Button re-enables after completion  

---

### TC-QA-002: Random Failure Handling
**Priority:** Medium | **Type:** Error Handling  
**Steps:**
1. Navigate to `/qa-sandbox`
2. Click "Try Random Request" 10 times

**Expected Result:**  
✅ Approximately 50% success, 50% failure  
✅ Each result shows appropriate toast message  
✅ Result indicator updates each time  

---

## 📊 TEST SUMMARY TABLE

| ID | Module | Type | Priority | Status |
|----|--------|------|----------|--------|
| TC-AUTH-001 | Registration | Positive | High | - |
| TC-AUTH-002 | Registration | Negative | High | - |
| TC-AUTH-003 | Registration | Validation | Medium | - |
| TC-AUTH-004 | Registration | Boundary | Medium | - |
| TC-AUTH-005 | Registration | Validation | High | - |
| TC-AUTH-006 | Login | Positive | Critical | - |
| TC-AUTH-007 | Login | Negative | High | - |
| TC-AUTH-008 | Login | Validation | Medium | - |
| TC-AUTH-009 | Login UI | Functional | Low | - |
| TC-BOOK-001 | Search | Positive | High | - |
| TC-BOOK-002 | Search | Negative | Medium | - |
| TC-BOOK-003 | Seat Select | Functional | High | - |
| TC-BOOK-004 | E2E Booking | E2E | Critical | - |
| TC-BOOK-005 | Auth Guard | Negative | High | - |
| TC-PAY-001 | Payment | Positive | Critical | - |
| TC-PAY-002 | Timer | Functional | Medium | - |
| TC-PAY-003 | Pay Method | Functional | Medium | - |
| TC-TICK-001 | Cancel | Functional | High | - |
| TC-TICK-002 | Filter | Functional | Medium | - |
| TC-QA-001 | Sandbox | Performance | Medium | - |

---

## 🤖 KATALON STUDIO AUTOMATION TIPS

### WebUI Test Example - Login
```groovy
// Login Test
WebUI.openBrowser('')
WebUI.navigateToUrl('http://localhost:3000/login')

// Wait for page
WebUI.waitForElementVisible(findTestObject('Page_Login/input_email-login'), 10)

// Enter credentials
WebUI.click(findTestObject('Page_Login/input_email-login'))
WebUI.setText(findTestObject('Page_Login/input_email-login'), 'test@railgo.com')

WebUI.click(findTestObject('Page_Login/input_password-login'))  
WebUI.setText(findTestObject('Page_Login/input_password-login'), 'RailGo123')

// Submit
WebUI.click(findTestObject('Page_Login/button_btn-login'))

// Verify redirect to dashboard
WebUI.waitForUrl('http://localhost:3000/dashboard', 10)
WebUI.verifyCurrentUrl().contains('/dashboard')
```

### Key Selectors Reference
| Element | CSS Selector | XPath |
|---------|-------------|-------|
| Email Input (Login) | `#email-login` | `//input[@id='email-login']` |
| Password Input | `#password-login` | `//input[@name='password']` |
| Login Button | `#btn-login` | `//button[@id='btn-login']` |
| Register Button | `#btn-register` | `//button[@data-testid='btn-register']` |
| Search Origin | `#search-origin` | `//select[@id='search-origin']` |
| Book Now Button | `[data-testid='btn-book-1']` | `//button[@data-testid='btn-book-1']` |
| Confirm Booking | `#btn-confirm-booking` | `//button[@id='btn-confirm-booking']` |
| Countdown Timer | `#countdown-display` | `//div[@id='countdown-display']` |
