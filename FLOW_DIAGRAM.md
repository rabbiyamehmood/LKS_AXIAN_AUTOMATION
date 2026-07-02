# AXIAN Automation Testing Framework - Flow Diagram

## 🎯 Overall Test Execution Flow

```mermaid
flowchart TD
    A[Start Test Execution] --> B[Environment Setup]
    B --> C[Load Configuration]
    C --> D[Initialize Playwright]
    D --> E[Load Test Data]
    E --> F{Select Test Suite}
    
    F --> G[Login Tests]
    F --> H[Aggregator Tests]
    F --> I[Role Management Tests]
    F --> J[Configuration Tests]
    F --> K[Bulk Onboarding Tests]
    F --> L[Reports Tests]
    F --> M[Change Password Tests]
    
    G --> N[Execute Tests]
    H --> N
    I --> N
    J --> N
    K --> N
    L --> N
    M --> N
    
    N --> O[Capture Results]
    O --> P[Generate Artifacts]
    P --> Q[Generate Reports]
    Q --> R[Cleanup]
    R --> S[End Test Execution]
```

## 🔐 Login Flow

```mermaid
sequenceDiagram
    participant T as Test Runner
    participant P as Playwright Browser
    participant S as MMP Server
    
    T->>P: Navigate to MMP Login Page
    P->>S: GET /login
    S-->>P: Login Page HTML
    P-->>T: Page Loaded
    
    T->>P: Enter Username
    T->>P: Enter Password
    T->>P: Click Login Button
    
    P->>S: POST /login (credentials)
    S-->>P: Authentication Response
    
    alt Successful Login
        P-->>T: Dashboard Page Loaded
        T->>T: Verify Dashboard Elements
        T->>T: Store Session Cookies
    else Failed Login
        P-->>T: Error Message Displayed
        T->>T: Verify Error Message
    end
```

## 👥 User Role-Based Test Flow

```mermaid
graph TB
    subgraph "Admin Maker Workflow"
        AM1[Login as Admin Maker] --> AM2[Navigate to Admin Panel]
        AM2 --> AM3[Create New Aggregator]
        AM3 --> AM4[Fill Aggregator Details]
        AM4 --> AM5[Submit for Approval]
        AM5 --> AM6[Verify Pending Status]
        
        AM2 --> AM7[Create New Role]
        AM7 --> AM8[Define Role Permissions]
        AM8 --> AM9[Submit Role for Approval]
        
        AM2 --> AM10[Configure System Settings]
        AM10 --> AM11[Save Configuration]
        
        AM2 --> AM12[Initiate Bulk Onboarding]
        AM12 --> AM13[Upload Excel File]
        AM13 --> AM14[Validate Data]
        AM14 --> AM15[Submit for Processing]
    end
    
    subgraph "Admin Checker Workflow"
        AC1[Login as Admin Checker] --> AC2[Review Pending Requests]
        AC2 --> AC3{Approve/Reject?}
        AC3 -->|Approve| AC4[Approve Request]
        AC3 -->|Reject| AC5[Reject with Comments]
        AC4 --> AC6[Verify Approval Status]
        AC5 --> AC7[Verify Rejection Status]
    end
    
    subgraph "Labesh Maker Workflow"
        LM1[Login as Labesh Maker] --> LM2[Access Labesh Module]
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