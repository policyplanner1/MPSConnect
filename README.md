# MPS Connect

Super App for Government Services and Business Management built using React Native.

---

## 📱 Overview

MPS Connect is a modular super app that provides:

* Government Services (Passport, Certificates, etc.)
* Service Bundles (Grouped services)
* BizzPlanner (Business management tools)

The project follows a **modular architecture** where each feature is built as an independent module.

---

## 🏗 Project Structure

```bash
src/
 ├── app/                # App entry & global providers
 ├── core/               # Shared reusable logic
 ├── modules/            # Feature-based modules
 ├── navigation/         # Navigation setup
 ├── store/              # Global state
 ├── config/             # Environment configs
 └── assets/             # Images, fonts, icons
```

---

## 🧠 Folder Details

### 🔹 app/

Handles app initialization and global providers.

* `App.tsx` → Entry point
* `providers/` → Navigation, Theme, Store setup

---

### 🔹 core/

Reusable code shared across all modules.

* `api/` → Axios setup, API configs
* `ui/` → Common components (Button, Input)
* `theme/` → Colors, typography
* `hooks/` → Custom reusable hooks
* `utils/` → Helper functions
* `storage/` → Local & secure storage
* `constants/` → Static values

---

### 🔹 modules/

Each folder represents an independent feature (mini app).

#### services/

Government services module

* `screens/` → UI screens
* `components/` → UI elements
* `api/` → API calls
* `store/` → Local state
* `hooks/` → Business logic
* `types/` → Type definitions
* `navigation/` → Module routing

> Includes DynamicForm for scalable service forms

---

#### bundles/

Handles grouped services (e.g., marriage bundle)

---

#### bizzplanner/

Business management module

* Dashboard
* Tasks
* Finance
* Reports

---

#### auth/

Authentication (login/signup)

---

#### profile/

User profile & settings

---

#### documents/

Document upload, preview, verification

---

#### payments/ *(future)*

Payment integrations

---

#### notifications/ *(future)*

Push notifications

---

### 🔹 navigation/

Central navigation system

* `RootNavigator.tsx` → Main entry navigation
* `TabNavigator.tsx` → Bottom tabs
* `linking.ts` → Deep linking

---

### 🔹 store/

Global state management

* `authStore.ts` → User & token
* `appStore.ts` → App-level settings

---

### 🔹 config/

Environment configurations

* `env.ts` → API URLs, keys

---

### 🔹 assets/

Static resources

* images
* icons
* fonts

---

## 🧭 Navigation Flow

```text
App
 └── RootNavigator
      └── TabNavigator
           ├── Services
           ├── Bundles
           ├── BizzPlanner
           └── Profile
```

---

## 🧠 Architecture Principles

* Modular feature-based structure
* Each module is independent
* Shared logic inside `core/`
* Minimal global state
* Scalable and maintainable design

---

## ⚠️ Rules for Development

### ✅ Do

* Keep modules independent
* Use reusable components from `core/`
* Follow consistent folder structure

### ❌ Don’t

* Don’t mix module logic
* Don’t put business logic in `core/`
* Don’t use global state unnecessarily

---

## 🚀 Getting Started

```bash
npm install
npx react-native run-android
```

---

## 📌 Tech Stack

* React Native
* TypeScript
* Zustand (State Management)
* Axios (API calls)

---
 