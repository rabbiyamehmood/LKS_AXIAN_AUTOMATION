# LKS AXIAN Automation Testing Framework - Portal Flow Diagram

## 🎯 LKS Portal Test Execution Flow

```mermaid
flowchart TD
    A[Start Test Suite] --> B[Login to LKS Portal]
    B --> C{User Access Level}
    
    C -->|Admin| D[Admin Dashboard]
    C -->|Merchant| E[Merchant Dashboard]
    
    D --> F{Portal Module}
    
    F --> G[Dashboard]
    F --> H[Incoming]
    F --> I[Handler Management]
    F --> J[Terminal Management]
    F --> K[Outgoing]
    F --> L[Transactions History]
    F --> M[Merchant Hierarchy]
    F --> N[Settings]
    
    G --> O[Verify Dashboard Data]
    H --> P[Test Incoming Transactions]
    I --> Q[Test Handler Operations]
    J --> R[Test Terminal Operations]
    K --> S[Test Outgoing Transactions]
    L --> T[Test Transaction Filters]
    M --> U[Test Merchant Management]
    N --> V[Test Configuration Settings]
    
    O --> W[Generate Reports]
    P --> W
    Q --> W
    R --> W
    S --> W
    T --> W
    U --> W
    V --> W
    
    W --> X[Allure Reporting]
    X --> Y[Test Completion]
```

## 🔐 Portal Login Flow

```mermaid
sequenceDiagram
    participant Test as Test Runner
    participant Browser as Playwright Browser
    participant LKSServer as LKS Server
    
    Test->>Browser: Navigate to LKS Portal
    Browser->>LKSServer: GET /portal/login
    LKSServer-->>Browser: Login Page HTML
    Browser-->>Test: Login Page Loaded
    
    Test->>Browser: Enter Admin Credentials
    Test->>Browser: Click Login Button
    
    Browser->>LKSServer: POST /api/auth/login
    LKSServer-->>Browser: Authentication Response
    
    alt Login Successful
        Browser-->>Test: Redirected to Dashboard
        Test->>Test: Verify Admin Access
        Test->>Test: Store Session Token
    else Login Failed
        Browser-->>Test: Error Message Displayed
        Test->>Test: Verify Error Handling
    end
```

## 📊 Portal Navigation Flows

```mermaid
graph TB
    subgraph "Dashboard Module"
        D1[Navigate to Dashboard] --> D2[Load Dashboard Widgets]
        D2 --> D3[Display Key Metrics]
        D3 --> D4[Verify Data Accuracy]
        D4 --> D5[Test Export Functionality]
    end
    
    subgraph "Incoming Module"
        I1[Navigate to Incoming] --> I2[Load Incoming Transactions]
        I2 --> I3[Apply Filters]
        I3 --> I4[Search Transactions]
        I4 --> I5[View Transaction Details]
        I5 --> I6[Verify Transaction Status]
    end
    
    subgraph "Handler Management"
        HM1[Navigate to Handler Management] --> HM2[View Active Handlers]
        HM2 --> HM3[Create New Handler]
        HM3 --> HM4[Fill Handler Details]
        HM4 --> HM5[Assign Permissions]
        HM5 --> HM6[Verify Handler Created]
        HM2 --> HM7[Edit Existing Handler]
        HM7 --> HM8[Update Details]
        HM8 --> HM9[Verify Changes]
    end
    
    subgraph "Terminal Management"
        TM1[Navigate to Terminal Management] --> TM2[View Active Terminals]
        TM2 --> TM3[Register New Terminal]
        TM3 --> TM4[Enter Terminal Details]
        TM4 --> TM5[Assign to Handler]
        TM5 --> TM6[Verify Terminal Status]
        TM2 --> TM7[Manage Terminal Settings]
        TM7 --> TM8[Update Configuration]
        TM8 --> TM9[Verify Settings Applied]
    end
    
    subgraph "Outgoing Module"
        O1[Navigate to Outgoing] --> O2[Load Outgoing Transactions]
        O2 --> O3[Apply Filters]
        O3 --> O4[Search Transactions]
        O4 --> O5[View Transaction Details]
        O5 --> O6[Verify Transaction Status]
    end
    
    subgraph "Transactions History"
        TH1[Navigate to Transactions History] --> TH2[Load All Transactions]
        TH2 --> TH3[Apply Date Range Filter]
        TH3 --> TH4[Search by Reference]
        TH4 --> TH5[View Transaction Details]
        TH5 --> TH6[Export Transaction Report]
    end
    
    subgraph "Merchant Hierarchy"
        MH1[Navigate to Merchant Hierarchy] --> MH2[View Merchant Tree]
        MH2 --> MH3[View Merchant Details]
        MH3 --> MH4{Action}
        MH4 -->|Create| MH5[Create New Merchant]
        MH4 -->|Edit| MH6[Edit Merchant Info]
        MH4 -->|Approve| MH7[Approve Pending Merchant]
        MH5 --> MH8[Fill Merchant Details]
        MH8 --> MH9[Verify Merchant Created]
    end
    
    subgraph "Settings Module"
        S1[Navigate to Settings] --> S2{Settings Type}
        S2 -->|General| S3[Update General Settings]
        S2 -->|Security| S4[Configure Security Settings]
        S2 -->|Notification| S5[Setup Notifications]
        S3 --> S6[Save Configuration]
        S4 --> S6
        S5 --> S6
        S6 --> S7[Verify Settings Applied]
    end
```

## 🔄 Handler Management Flow

```mermaid
graph LR
    A[Start] --> B[Navigate Handler Management]
    B --> C{Operation}
    C -->|Create| D[Fill Handler Form]
    C -->|Edit| E[Load Handler Details]
    C -->|Delete| F[Confirm Deletion]
    
    D --> G[Set Handler Name]
    G --> H[Assign Permissions]
    H --> I[Set Status]
    I --> J[Save Handler]
    
    E --> K[Update Handler Info]
    K --> J
    
    F --> L[Verify Handler Deleted]
    J --> M[Verify in List]
    L --> M
    M --> N[End]
```

## 💳 Terminal Management Flow

```mermaid
graph LR
    A[Start] --> B[Navigate Terminal Management]
    B --> C{Operation}
    C -->|Register| D[Fill Terminal Form]
    C -->|Configure| E[Load Terminal Settings]
    C -->|Monitor| F[View Terminal Status]
    
    D --> G[Enter Terminal ID]
    G --> H[Assign Handler]
    H --> I[Set Terminal Type]
    I --> J[Configure Settings]
    J --> K[Save Terminal]
    
    E --> L[Update Configuration]
    L --> K
    
    F --> M[Check Terminal Status]
    M --> N[View Last Transaction]
    N --> O[Verify Terminal Health]
    K --> P[Verify in List]
    O --> P
    P --> Q[End]
```

## 📈 Transactions Processing Flow

```mermaid
graph TB
    subgraph "Incoming Process"
        II[Incoming Transaction Arrives] --> IP1[System Receives]
        IP1 --> IP2[Validate Transaction]
        IP2 --> IP3{Valid?}
        IP3 -->|Yes| IP4[Store in Database]
        IP3 -->|No| IP5[Mark as Failed]
        IP4 --> IP6[Update Dashboard]
        IP5 --> IP6
        IP6 --> IP7[Display in Portal]
    end
    
    subgraph "Outgoing Process"
        OO[Create Outgoing Request] --> OP1[Validate Details]
        OP1 --> OP2{Valid?}
        OP2 -->|Yes| OP3[Queue for Processing]
        OP2 -->|No| OP4[Show Error]
        OP3 --> OP5[Send to Handler]
        OP5 --> OP6[Track Status]
        OP4 --> OP7[Allow Retry]
        OP6 --> OP8[Update Portal]
    end
```

## 📋 Test Data & Configuration Flow

```mermaid
graph TB
    A[Load Test Configuration] --> B{Configuration Type}
    B -->|Portal URLs| C[Set Base URL]
    B -->|Credentials| D[Load Admin Credentials]
    B -->|Test Data| E[Load Merchant/Handler/Terminal Data]
    
    C --> F[Configure Environment]
    D --> F
    E --> F
    
    F --> G[Initialize Playwright]
    G --> H[Start Test Execution]
    H --> I{Test Category}
    
    I -->|Dashboard Tests| J[Dashboard Validation]
    I -->|Handler Tests| K[Handler CRUD Operations]
    I -->|Terminal Tests| L[Terminal Management]
    I -->|Transaction Tests| M[Transaction Processing]
    I -->|Merchant Tests| N[Merchant Operations]
    I -->|Settings Tests| O[Configuration Management]
    
    J --> P[Capture Results]
    K --> P
    L --> P
    M --> P
    N --> P
    O --> P
    
    P --> Q[Generate Test Report]
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