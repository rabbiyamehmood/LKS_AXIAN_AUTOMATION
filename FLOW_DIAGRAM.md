# LKS AXIAN Automation Testing Framework - Test Flow Diagram

## 🎯 Overall Test Execution Flow

```mermaid
flowchart TD
    A[Start Test Execution] --> B[Environment Setup]
    B --> C[Load Configuration]
    C --> D[Initialize Playwright]
    D --> E[Load Test Data]
    E --> F{Select Test Suite}
    
    F --> G[Authentication Tests]
    F --> H[Payment Tests]
    F --> I[Profile Management Tests]
    F --> J[Merchant Portal Tests]
    
    G --> K{Login Status}
    K -->|Success| K1[Proceed to Payments]
    K -->|Failed| K2[Verify Error Handling]
    
    H --> L[Execute Payment Flows]
    I --> M[Execute Profile Updates]
    J --> N[Execute Merchant Tests]
    
    K1 --> O[Execute Tests]
    K2 --> O
    L --> O
    M --> O
    N --> O
    
    O --> P[Capture Results & Screenshots]
    P --> Q[Generate HTML Report]
    Q --> R[Cleanup & Close Browsers]
    R --> S[End Test Execution]
```

## 🔐 Login & Authentication Flow

```mermaid
sequenceDiagram
    participant Test as Test Runner
    participant Browser as Playwright Browser
    participant Server as LKS Server
    
    Test->>Browser: Navigate to Login Page
    Browser->>Server: GET /login
    Server-->>Browser: Login Page HTML
    Browser-->>Test: Page Loaded
    
    Test->>Browser: Enter Email/Username
    Test->>Browser: Enter Password
    Test->>Browser: Click Login Button
    
    Browser->>Server: POST /api/login (credentials)
    Server-->>Browser: Authentication Response
    
    alt Login Successful
        Browser-->>Test: Dashboard Redirected
        Test->>Test: Verify Dashboard Elements
        Test->>Test: Store Authentication Token
    else Login Failed
        Browser-->>Test: Error Message Displayed
        Test->>Test: Verify Error Message
        Test->>Test: Verify Retry Option
    end
```

## 💳 Payment Processing Flow

```mermaid
graph TB
    subgraph "Bank Transfer"
        BT1[User Login] --> BT2[Navigate to Send Money]
        BT2 --> BT3[Select Bank Transfer]
        BT3 --> BT4[Fill Bank Details]
        BT4 --> BT5[Enter Amount]
        BT5 --> BT6[Review Transfer Details]
        BT6 --> BT7[Confirm Transaction]
        BT7 --> BT8{Success?}
        BT8 -->|Yes| BT9[Verify Success Message]
        BT8 -->|No| BT10[Verify Error Handling]
    end
    
    subgraph "Bill Payment"
        BP1[User Login] --> BP2[Navigate to Bill Payment]
        BP2 --> BP3[Select Biller]
        BP3 --> BP4[Select Bill Type]
        BP4 --> BP5[Enter Bill Number]
        BP5 --> BP6[Enter Amount]
        BP6 --> BP7[Review Payment Details]
        BP7 --> BP8[Confirm Payment]
        BP8 --> BP9{Success?}
        BP9 -->|Yes| BP10[Verify Receipt]
        BP9 -->|No| BP11[Verify Error Message]
    end
    
    subgraph "Cash Out"
        CO1[User Login] --> CO2[Navigate to Cashout]
        CO2 --> CO3[Select Cash Out Option]
        CO3 --> CO4[Enter Amount]
        CO4 --> CO5[Review Charges]
        CO5 --> CO6[Confirm Cashout]
        CO6 --> CO7{Success?}
        CO7 -->|Yes| CO8[Verify Confirmation]
        CO7 -->|No| CO9[Verify Error Handling]
    end
    
    subgraph "Send Money"
        SM1[User Login] --> SM2[Navigate to Send Money]
        SM2 --> SM3[Select Recipient]
        SM3 --> SM4[Enter Amount]
        SM4 --> SM5[Review Transfer Details]
        SM5 --> SM6[Confirm Transfer]
        SM6 --> SM7{Success?}
        SM7 -->|Yes| SM8[Verify Transaction ID]
        SM7 -->|No| SM9[Verify Error Message]
    end
    
    subgraph "Scheduled Payments"
        SP1[User Login] --> SP2[Navigate to Schedule Payment]
        SP2 --> SP3{Payment Type?}
        SP3 -->|Wallet to Bank| SP4[Select Bank Account]
        SP3 -->|Wallet to Wallet| SP5[Select Recipient]
        SP4 --> SP6[Enter Amount & Date]
        SP5 --> SP6
        SP6 --> SP7[Review Schedule Details]
        SP7 --> SP8[Confirm Schedule]
        SP8 --> SP9{Success?}
        SP9 -->|Yes| SP10[Verify Schedule Created]
        SP9 -->|No| SP11[Verify Error Handling]
    end
```

## 👤 Profile Management Flow

```mermaid
graph TB
    subgraph "Change MPIN"
        CP1[User Login] --> CP2[Navigate to Profile Settings]
        CP2 --> CP3[Select Change MPIN]
        CP3 --> CP4[Enter Current MPIN]
        CP4 --> CP5[Enter New MPIN]
        CP5 --> CP6[Confirm New MPIN]
        CP6 --> CP7{Validation}
        CP7 -->|Pass| CP8[Confirm Change]
        CP7 -->|Fail| CP9[Show Error Message]
        CP8 --> CP10[Verify Success Message]
        CP9 --> CP11[Verify Error Details]
    end
    
    subgraph "Change Password"
        PW1[User Login] --> PW2[Navigate to Profile Settings]
        PW2 --> PW3[Select Change Password]
        PW3 --> PW4[Enter Current Password]
        PW4 --> PW5[Enter New Password]
        PW5 --> PW6[Confirm New Password]
        PW6 --> PW7{Validation}
        PW7 -->|Pass| PW8[Confirm Change]
        PW7 -->|Fail| PW9[Show Error Message]
        PW8 --> PW10[Verify Success Message]
        PW9 --> PW11[Verify Error Details]
    end
```

## 🏪 Merchant Portal Flow

```mermaid
sequenceDiagram
    participant Test as Test Runner
    participant Browser as Playwright Browser
    participant MerchantPortal as Merchant Portal Server
    
    Test->>Browser: Navigate to Merchant Portal
    Browser->>MerchantPortal: GET /merchant
    MerchantPortal-->>Browser: Portal Page
    Browser-->>Test: Page Loaded
    
    Test->>Browser: Enter Merchant Credentials
    Test->>Browser: Click Login
    
    Browser->>MerchantPortal: POST /api/merchant/login
    MerchantPortal-->>Browser: Authentication Response
    
    alt Login Successful
        Browser-->>Test: Dashboard Loaded
        Test->>Browser: Navigate to Dashboard
        Test->>Test: Verify Merchant Data
        Test->>Browser: Check Available Features
        Test->>Test: Verify Merchant Reports
    else Login Failed
        Browser-->>Test: Error Message
        Test->>Test: Verify Error Handling
    end
```

## 📊 Test Execution Sequence

```mermaid
graph LR
    A[Start] --> B[Setup Test Environment]
    B --> C[Login User]
    C --> D{Test Category}
    D -->|Payment| E[Execute Payment Tests]
    D -->|Profile| F[Execute Profile Tests]
    D -->|Merchant| G[Execute Merchant Tests]
    E --> H[Capture Results]
    F --> H
    G --> H
    H --> I[Generate Report]
    I --> J[Cleanup]
    J --> K[End]
```

## 📋 Test Data Flow

```mermaid
graph TB
    A[testData.ts] --> B{Data Type}
    B -->|Login Credentials| C[User Email & Password]
    B -->|Payment Data| D[Recipient Info, Amounts]
    B -->|Profile Data| E[MPIN, Password Details]
    B -->|URLs| F[Base URL, Endpoints]
    
    C --> G[Use in Login Tests]
    D --> H[Use in Payment Tests]
    E --> I[Use in Profile Tests]
    F --> J[Configure Test Environment]
    
    G --> K[Test Execution]
    H --> K
    I --> K
    J --> K
    K --> L[Generate Results]
```
        LM2 --> LM3[Create Labesh Entry]
        LM3 --> LM4[Submit for Verification]
    end
    
    subgraph "Labesh Checker Workflow"
        LC1[Login as Labesh Checker] --> LC2[Verify Labesh Entries]
        LC2 --> LC3{Approve/Reject?}
        LC3 -->|Approve| LC4[Approve Labesh]
        LC3 -->|Reject| LC5[Return for Correction]
    end
```

## 📊 Test Data Flow

```mermaid
flowchart LR
    A[Excel Test Data] --> B[ExcelJS Parser]
    B --> C[JSON Test Data]
    C --> D[Test Runner]
    D --> E[Page Objects]
    E --> F[MMP Application]
    F --> G[Test Results]
    G --> H[Allure Results]
    H --> I[Allure Report]
    G --> J[Playwright Results]
    J --> K[HTML Report]
```

## 🔄 Test Execution Pipeline

```mermaid
graph LR
    A[Git Repository] --> B[CI/CD Pipeline]
    B --> C[Install Dependencies]
    C --> D[Run Tests]
    D --> E[Generate Reports]
    E --> F[Upload Artifacts]
    F --> G[Notify Team]
    G --> H[Quality Dashboard]
```

## 🧪 Test Case Structure

```mermaid
graph TD
    A[Test File] --> B[Test Suite]
    B --> C[Test Case 1]
    B --> D[Test Case 2]
    B --> E[Test Case N]
    
    C --> F[Setup]
    C --> G[Test Steps]
    C --> H[Assertions]
    C --> I[Teardown]
    
    F --> J[Login if needed]
    F --> K[Load Test Data]
    F --> L[Initialize Page Objects]
    
    G --> M[Navigate to Page]
    G --> N[Perform Actions]
    G --> O[Wait for Responses]
    
    H --> P[Verify UI Elements]
    H --> Q[Verify Data]
    H --> R[Verify State]
    
    I --> S[Logout if needed]
    I --> T[Clean Test Data]
    I --> U[Close Browser]
```

## 📈 Reporting Flow

```mermaid
flowchart TD
    A[Test Execution] --> B[Capture Results]
    B --> C[Screenshots on Failure]
    B --> D[Video Recording]
    B --> E[Trace Files]
    B --> F[Console Logs]
    
    C --> G[Allure Attachments]
    D --> G
    E --> G
    F --> G
    
    G --> H[Allure Results JSON]
    H --> I[Allure Generate Report]
    I --> J[HTML Report]
    
    B --> K[Playwright Results]
    K --> L[Playwright HTML Report]
    
    J --> M[Share with Team]
    L --> M
    M --> N[Analysis & Action]
```

## 🔧 Configuration Flow

```mermaid
sequenceDiagram
    participant T as Test Runner
    participant C as Config Loader
    participant E as .env File
    participant P as Playwright Config
    
    T->>C: Load Configuration
    C->>E: Read .env Variables
    E-->>C: Environment Variables
    C->>P: Load playwright.config.ts
    P-->>C: Test Configuration
    C-->>T: Merged Configuration
    
    T->>T: Apply Configuration
    T->>T: Initialize Browser Context
    T->>T: Set Base URL
    T->>T: Configure Timeouts
    T->>T: Setup Reporters
```

## 🚀 Deployment Flow

```mermaid
graph TD
    A[Local Development] --> B[Commit Changes]
    B --> C[Push to GitLab]
    C --> D[GitLab CI/CD Pipeline]
    D --> E[Run Tests]
    E --> F{Tests Pass?}
    F -->|Yes| G[Generate Reports]
    F -->|No| H[Notify Developers]
    G --> I[Deploy Reports]
    I --> J[Update Dashboard]
    H --> K[Fix Issues]
    K --> B
```

## 📋 Key Test Scenarios

### 1. **Login Tests**
- Valid credentials login
- Invalid credentials login
- Password reset flow
- Session management

### 2. **Aggregator Management**
- Create new aggregator
- Update existing aggregator
- Delete aggregator
- Approve/reject aggregator
- Search and filter aggregators

### 3. **Role Management**
- Create user roles
- Assign permissions
- Update role permissions
- Delete roles
- Role-based access control

### 4. **Configuration Management**
- System settings configuration
- Business rules setup
- Parameter management
- Configuration validation

### 5. **Bulk Onboarding**
- Excel template download
- Data validation
- Bulk upload processing
- Error handling
- Status tracking

### 6. **Reports**
- Report generation
- Report filtering
- Export functionality
- Report scheduling

### 7. **Change Password**
- Password change flow
- Password policy validation
- Session handling after password change

## 🔍 Monitoring & Alerting

```mermaid
graph LR
    A[Test Execution] --> B[Results Collection]
    B --> C[Success/Failure Analysis]
    C --> D[Performance Metrics]
    D --> E[Alert Generation]
    E --> F[Email Notifications]
    E --> G[Slack Notifications]
    E --> H[Dashboard Updates]
    
    F --> I[Team Awareness]
    G --> I
    H --> I
    I --> J[Quick Response]
```

This flow diagram provides a comprehensive overview of the automation testing framework architecture, execution flow, and integration points.