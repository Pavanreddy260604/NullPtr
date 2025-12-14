# Test Audit Report & Debugging Plan

## 1. Architecture Overview
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Frontend**: React (Vite), TypeScript, TailwindCSS.
- **External Services**: Cloudinary (Image Uploads).

## 2. Critical Findings & Security Risks

### 🚨 2.1 Fake Authentication
- **Frontend**: The `AuthContext.tsx` uses hardcoded credentials (`admin@example.com` / `admin123`) stored in the client-side code. This is **extremely insecure**. Anyone viewing the source code can find these credentials.
- **Backend**: There is **no authentication middleware** checking requests. All API endpoints (`/subject`, `/unit`, `/question`, etc.) are open to the public internet if the backend URL is known.
- **Recommendation**: Implement JWT (JSON Web Token) authentication. Create a true `User` model and `authController` on the backend. Protect all administrative routes with a `verifyToken` middleware.

### ⚠️ 2.2 Duplicate & Misnamed Logic
- **File**: `backend/src_temp/controllers/user.controller.js`
- **Issue**: This file contains CRUD operations for **Units**, not Users. It appears to be an outdated or duplicate version of `unitController.js`.
- **Risk**: If any route is pointing to `user.controller.js` (none currently found in `app.js`, but check imports), it lacks the logic to update the parent `Subject` (e.g., pushing/pulling unit IDs from the subject's `units` array), leading to data inconsistency.
- **Recommendation**: Delete `backend/src_temp/controllers/user.controller.js` if unused.

## 3. Feature Gaps

### 3.1 Bulk Delete
- **Frontend**: Implemented using `Promise.all` to call individual delete endpoints. This works but is not atomic.
- **Backend**: No dedicated bulk delete endpoint exists (`/question/bulk-delete`).
- **Recommendation**: Create a backend endpoint that accepts an array of IDs and performs a `deleteMany` operation for efficiency and atomicity.

### 3.2 Testing
- **Status**: Zero tests found. No Jest, Mocha, or Cypress configurations.
- **Recommendation**: Initialize a testing framework (e.g., Vitest for frontend, Jest/Supertest for backend) to prevent regression.

## 4. Manual Test Plan (Checklist)

### 4.1 Authentication (Current State)
- [ ] Login with `admin@example.com` / `admin123` -> **Should Success**
- [ ] Login with invalid credentials -> **Should Fail**
- [ ] Refresh page -> **Should remain logged in** (localStorage check)
- [ ] Logout -> **Should clear session**

### 4.2 Subjects Management
- [ ] **Create**: Add a new subject (e.g., "Mathematics"). Verify it appears in list.
- [ ] **Read**: Ensure "Mathematics" is listed in dropdowns.
- [ ] **Update**: Rename to "Advanced Mathematics".
- [ ] **Delete**: Delete the subject. **Verify**: Check database if child Units are handled (Cascading delete check needed in `subjectController`?).

### 4.3 Units Management
- [ ] **Create**: Add Unit under a Subject. **Verify**: Backend `unitController` should add Unit ID to Subject's `units` array.
- [ ] **Delete**: Delete Unit. **Verify**: Questions under this unit should be deleted (Cascading delete logic exists in `unitController.js`).

### 4.4 Questions (MCQ, Fill, Descriptive)
- [ ] **Create MCQ**: Add question with 4 options. Select correct answer.
- [ ] **Create Descriptive (Text)**: Add question with text blocks.
- [ ] **Create Descriptive (Image)**: Upload an image block. **Verify**: Image stored in Cloudinary, URL saved in DB.
- [ ] **Update**: Edit a question. Change correct answer.
- [ ] **Delete (Single)**: Delete one question.
- [ ] **Bulk Delete**: Select multiple questions -> Delete. **Verify**: UI updates, DB shows items removed.

### 4.5 Bulk Import
- [ ] **JSON Import**: Upload valid JSON for MCQ.
- [ ] **Combined Import**: Upload images + JSON with matching `ref`.
    - **Verify**: `ref` strings in JSON are replaced with Cloudinary URLs.
    - **Edge Case**: Upload JSON with `ref` that matches NO image. Check error handling.

## 5. Summary of Bugs Fixed (Recent Session)
- **Frontend Syntax**: Fixed mismatched braces and generic type errors in `Questions.tsx`.
- **Type Safety**: Added missing function definitions (`handleSelect`, `handleBulkDelete`) and fixed TypeScript errors.
- **Cloudinary**: Resolved `400 Bad Request` by properly structuring `FormData` and signature.

## 6. Next Steps
1.  **Delete** `backend/src_temp/controllers/user.controller.js`.
2.  **Implement** Backend Authentication.
3.  **Refactor** Frontend to use real Auth API.
