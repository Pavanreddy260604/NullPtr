# Comprehensive Test Plan

## 1. Introduction
This document outlines the testing strategy for the Admin Dashboard and Backend API. The goal is to ensure stability, security, and functionality across all key modules.

## 2. Test Environment
- **URL**: `http://localhost:5173` (Frontend)
- **API**: `http://localhost:5000` (Backend)
- **Database**: MongoDB (Local or Atlas)
- **Browser**: Chrome / Edge

## 3. Manual Test Cases

### 3.1 Authentication Module
| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| A-01 | Valid Login | 1. Navigate to `/login`<br>2. Enter `admin@example.com` / `admin123`<br>3. Click Login | Redirect to Dashboard (`/`) | ⬜ |
| A-02 | Invalid Login | 1. Enter random credentials<br>2. Click Login | Show "Invalid email or password" error | ⬜ |
| A-03 | Logout | 1. Click Profile Icon -> Logout | Redirect to `/login`, clear session | ⬜ |
| A-04 | Protected Route | 1. Copy Dashboard URL<br>2. Open Incognito<br>3. Paste URL | Redirect to `/login` | ⬜ |

### 3.2 Subject Management
| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| S-01 | List Subjects | 1. Go to "Subjects" page | List of existing subjects appears | ⬜ |
| S-02 | Create Subject | 1. Click "Add Subject"<br>2. Enter Name, Code, Desc<br>3. Save | New subject appears in list immediately | ⬜ |
| S-03 | Edit Subject | 1. Click Edit icon on a subject<br>2. Change name<br>3. Save | Name updates in list | ⬜ |
| S-04 | Delete Subject | 1. Click Trash icon<br>2. Confirm | Subject removed from list | ⬜ |

### 3.3 Unit Management
| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| U-01 | View Units | 1. Go to "Units" page<br>2. Select a Subject | Units for that subject appear | ⬜ |
| U-02 | Create Unit | 1. Click "Add Unit"<br>2. Enter Title, Unit No.<br>3. Save | Unit appears in list | ⬜ |
| U-03 | Delete Unit | 1. Delete a Unit with questions | Confirm unit AND related questions are deleted (Check DB) | ⬜ |

### 3.4 Question Management (Core)
| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| Q-01 | Create MCQ | 1. Go to Questions -> Select Unit -> MCQ Tab<br>2. Click Add<br>3. Fill all fields (text, 4 options, correct answer)<br>4. Save | Question appears. Options look correct. | ⬜ |
| Q-02 | Create FillBlank | 1. Go to Fill Tab -> Add<br>2. Enter text with `___`<br>3. Enter correct answer<br>4. Save | Preview shows blanks properly. | ⬜ |
| Q-03 | Descriptive Text | 1. Descriptive Tab -> Add<br>2. Add Text Block<br>3. Add Heading Block<br>4. Save | Content blocks render in correct order. | ⬜ |

### 3.5 Question Images & Bulk Import
| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| B-01 | Upload Image Block | 1. Descriptive -> Add Image Block<br>2. Select valid JPG/PNG (<5MB) | Image preview appears, Uploads to Cloudinary | ⬜ |
| B-02 | Large File Error | 1. Try uploading >5MB file | Show "File size too large" toast | ⬜ |
| B-03 | Bulk Import (JSON) | 1. Click Bulk Import<br>2. Upload valid JSON | All questions appear in list | ⬜ |
| B-04 | Combined Import | 1. Bulk Import -> Combined<br>2. Select `img1.png`<br>3. Select JSON with `ref: "img1.png"` | Image uploads, JSON imports, Ref is replaced with URL | ⬜ |
| B-05 | Bulk Delete | 1. Select 3 questions<br>2. Click "Delete Selected" | Confirmation modal -> Questions removed | ⬜ |

### 3.6 API Security (Backend Check)
| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| SEC-01 | Auth Check | 1. Use Postman to call `POST /subject`<br>2. Do NOT provide token | **FAIL**: Currently allows it (Need to fix) | ❌ |

## 4. Automated Testing Recommendations

### 4.1 Unit Testing (Backend)
- **Tool**: Jest + Supertest
- **Scope**:
    - Test `src/models` validation.
    - Test `src/controllers` logic (mocking DB).

### 4.2 Component Testing (Frontend)
- **Tool**: Vitest + React Testing Library
- **Scope**:
    - `AuthContext`: storage logic.
    - `Questions.tsx`: Form validation, Switch tabs.

### 4.3 E2E Testing
- **Tool**: Cypress or Playwright
- **Scenario**: Full flow -> Login -> Create Subject -> Create Unit -> Add Question -> Logout.

## 5. Bug Reporting Prototype
If a bug is found, format it as:
- **Title**: [Component] Short description
- **Steps to Reproduce**:
- **Expected vs Actual**:
- **Severity**: Critical / Major / Minor

---
*Created by Antigravity AI*
