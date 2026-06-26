# MPSConnect — Authentication & Calculators Flow Diagrams

Open this file in VS Code / Cursor with a Mermaid preview extension, or paste diagrams into [mermaid.live](https://mermaid.live).

---

## 1. App bootstrap (Splash → Home or Onboarding)

```mermaid
flowchart TD
    A[App Launch] --> B[SplashScreen ~1.6s]
    B --> C{ACCESS_TOKEN in AsyncStorage?}
    C -->|Yes| D[ServicesStack / Home]
    C -->|No| E[OnboardingScreen]
    E --> F[Skip or finish slides]
    F --> G[LoginScreen]
    D --> H[Background: ensureUserId, CRM sync, MPS OAuth, FCM]
```

---

## 2. Authentication — full navigation map

```mermaid
flowchart TB
    subgraph Auth["Auth Module (state-based navigation)"]
        Splash[SplashScreen]
        Onboard[OnboardingScreen]
        Login[LoginScreen]
        Register[RegisterScreen]
        Forgot[ForgotPasswordScreen]
        OTP[VerificationCodeScreen]
        Reset[ResetPasswordScreen]
        Home[ServicesStack / Home]
        Profile[ProfileScreen]
    end

    Splash -->|token exists| Home
    Splash -->|no token| Onboard
    Onboard --> Login
    Login <--> Register
    Login --> Forgot
    Forgot -->|OTP sent| OTP
    OTP -->|verified| Reset
    Reset -->|success| Login
    Login -->|success| Home
    Home --> Profile
    Profile -->|logout confirm| Login
```

---

## 3. Login sequence (mobile + API + MPS OAuth)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant LS as LoginScreen
    participant API as POST /auth/login
    participant Store as AsyncStorage
    participant MPS as MPS OAuth API
    participant Home as ServicesStack

    U->>LS: Email + password + Login
    LS->>LS: validateLoginForm()
    LS->>Store: Clear stale token, userId, CRM, MPS session
    LS->>API: { email, password }
    API-->>LS: { token, data: { id, name, email, role } }
    LS->>Store: saveToken(token)
    LS->>Store: saveUserId, saveCrmUserId
    LS->>MPS: ensureMpsOAuthToken()
    alt MPS OAuth fails
        MPS-->>LS: Error
        LS->>Store: Clear all auth storage
        LS-->>U: Alert "MPS authentication"
    else MPS OAuth OK
        MPS-->>LS: Session stored
        LS->>Store: Remember email (optional)
        LS->>Home: onContinueToApp()
    end
```

---

## 4. Register sequence

```mermaid
sequenceDiagram
    participant U as User
    participant RS as RegisterScreen
    participant API as POST /auth/signup
    participant Email as Welcome Email

    U->>RS: Fill name, email, contact, password
    RS->>RS: validateSignupForm()
    RS->>API: Signup payload
    API->>Email: sendWelcomeEmail (non-blocking)
    API-->>RS: 201 success
    RS-->>U: Success alert → LoginScreen
```

---

## 5. Forgot password + OTP + reset

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant App as Auth Screens
    participant API as Backend /auth/*

    U->>App: Enter email (ForgotPassword)
    App->>API: POST /forgot-password
    API-->>App: OTP emailed (expires 10 min)
    App->>App: Navigate VerificationCode

    U->>App: Enter 4-digit OTP
    App->>API: POST /verify-otp
    API-->>App: Verified
    App->>App: Navigate ResetPassword

    U->>App: New password + confirm
    App->>API: POST /reset-password
    API-->>App: Password updated, OTP marked used
    App->>App: Navigate Login
```

---

## 6. Backend auth API map

```mermaid
flowchart LR
    subgraph Public["Public endpoints"]
        S[POST /auth/signup]
        L[POST /auth/login]
        F[POST /auth/forgot-password]
        R[POST /auth/resend-otp]
        V[POST /auth/verify-otp]
        RP[POST /auth/reset-password]
    end

    subgraph Protected["Bearer JWT required"]
        M[GET /auth/me]
        N[POST /notifications/fcm-token]
    end

    L -->|JWT 7d| M
    MW[protect middleware] --> M
    MW --> N
```

---

## 7. JWT protect middleware flow

```mermaid
flowchart TD
    A[Incoming request] --> B{Authorization header?}
    B -->|No| C[401 No token provided]
    B -->|Yes| D{Bearer format?}
    D -->|Invalid| E[401 Invalid token format]
    D -->|Valid| F{jwt.verify OK?}
    F -->|No| G[401 Unauthorized]
    F -->|Yes| H[req.user = decoded payload]
    H --> I[Route handler]
```

---

## 8. Logout flow

```mermaid
flowchart TD
    A[Profile → Logout] --> B{Confirm dialog?}
    B -->|Cancel| C[Stay on Profile]
    B -->|OK| D[removeToken]
    D --> E[removeUserId]
    E --> F[removeCrmUserId]
    F --> G[removeMpsOAuthSession]
    G --> H[Navigate LoginScreen]
```

---

## 9. PlanWealth calculators — navigation map

```mermaid
flowchart TB
    SH[Services HomeScreen]
    Hub[CalculatorHomeScreen - PlanWealth]

    SH -->|PlanWealth tile| Hub

    Hub --> EMI[EMI Calculator]
    Hub --> Loan[Loan Calculator]
    Hub --> SIP[SIP Calculator]
    Hub --> Tax[Income Tax Calculator]
    Hub --> Todo[Todo List]
    Hub --> Savings[Savings Tracker]
    Hub --> Planner[Financial Planner]
    Hub --> Goal[Financial Goal Planner]

    Todo --> TodoForm[Todo Form]
    Savings --> SAdd[Add Entry]
    Savings --> SComp[Compare]
    Savings --> SRep[Reports]
    Savings --> SGoal[Goals]
    Planner --> Income[Income Details]
    Planner --> Loans[Loans & EMI]
    Planner --> Expenses[Monthly Expenses]
    Planner --> Snapshot[Financial Snapshot]
    Planner --> Recs[Recommendations]
    Loans --> EMI

    Goal --> G1[Welcome] --> G2[Choose Goal] --> G3[Personal]
    G3 --> G4[Details] --> G5[Summary] --> G6[Result]
```

---

## 10. EMI calculator — data flow

```mermaid
flowchart LR
    Inputs[Loan amount, Rate, Tenure, Extra payment] --> Formula[emiFormula.ts]
    Formula --> EMI[computeEMI]
    Formula --> Base[baselineTotals]
    Formula --> Sim[simulateLoanWithExtraPayments]
    EMI --> UI[Summary + Donut chart]
    Base --> UI
    Sim --> UI
```

---

## 11. Financial planner — first visit flow

```mermaid
flowchart TD
    A[Open Financial Planner] --> B{monthlySalary == 0?}
    B -->|Yes| C[Income Details overlay - required]
    C -->|Back| D[Exit to calculator hub]
    C -->|Save salary > 0| E[Snapshot tab]
    B -->|No| E
    E --> F[Add expenses / loans]
    F --> G[Surplus = income - expenses - EMI]
    G --> H[Recommendations rules]
```

---

## 12. Savings tracker — entry aggregation

```mermaid
flowchart TD
    A[Add Entry] --> B{Recurrence type}
    B -->|oneTime| C[Exact month/year only]
    B -->|monthly| D[From anchor month forward]
    B -->|yearly| E[Same month each year]
    C --> F[savingsEngine aggregateMonth]
    D --> F
    E --> F
    F --> G[saved = max 0, oldCost - newCost]
    G --> H[Dashboard metrics + goal progress]
```

---

## 13. Financial goal wizard

```mermaid
stateDiagram-v2
    [*] --> Welcome
    Welcome --> ChooseGoal
    ChooseGoal --> PersonalInfo
    PersonalInfo --> GoalDetails
    GoalDetails --> Summary: Calculate my plan
    Summary --> Result: View full plan
    Result --> Welcome: Start over
    Result --> [*]: Close
```

---

## 14. Test execution order (recommended)

```mermaid
flowchart TD
    T1[1. Backend API auth tests] --> T2[2. Mobile unit tests - formulas + validation]
    T2 --> T3[3. Mobile auth integration / Detox]
    T3 --> T4[4. Calculator hub smoke]
    T4 --> T5[5. Stateful modules - Todo, Savings, Planner]
    T5 --> T6[6. Goal wizard E2E]
```
