# 📋 MediTrack Application Flowchart

You can use the **Mermaid** code below to recreate this in [draw.io](https://app.diagrams.net/). 

### 🛠️ How to use in draw.io:
1. Open **draw.io**.
2. Click **+** (Insert) in the toolbar.
3. Select **Advanced** > **Mermaid**.
4. Paste the code below and click **Insert**.

```mermaid
flowchart TD
    %% Nodes
    Start([Start])
    Register[Register: Create Account]
    Login{Login}
    
    subgraph AuthMethods [Authentication Methods]
        PhonePass[Phone Number / Password]
        OTP[OTP Verification]
    end
    
    Entry[Medicine Entry By Shopkeeper]
    Sync[Data Synchronization]
    Display[Displays Medicine Information]
    
    Monitor{System Monitoring &<br/>Expiry Tracking}
    Expiring30{Expiring in<br/>30 days?}
    
    SMS[SMS Notification]
    Voice[Voice Call]
    Push[App Notification]
    
    ExpiredCheck{Medicine<br/>Expired?}
    ExpiredBox[Expired Medicine Status]
    
    Continue[Continue Monitoring]
    End([End Process])

    %% Connections
    Start --> Register
    Register --> Login
    
    Login -- Failed --> End
    Login -- Success --> PhonePass
    Login -- Success --> OTP
    
    PhonePass --> Entry
    OTP --> Entry
    
    Entry --> Sync
    Sync --> Display
    Display --> Monitor
    
    Monitor --> Expiring30
    
    Expiring30 -- YES --> SMS
    Expiring30 -- YES --> Voice
    Expiring30 -- YES --> Push
    Expiring30 -- NO --> Continue
    
    SMS --> ExpiredCheck
    Voice --> ExpiredCheck
    Push --> ExpiredCheck
    
    ExpiredCheck -- YES --> ExpiredBox
    ExpiredCheck -- NO --> Continue
    
    ExpiredBox --> End
    Continue --> Monitor

    %% Styling
    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style End fill:#f9f,stroke:#333,stroke-width:2px
    style Login fill:#fff4dd,stroke:#d4a017,stroke-width:2px
    style Monitor fill:#fff4dd,stroke:#d4a017,stroke-width:2px
    style Expiring30 fill:#fff4dd,stroke:#d4a017,stroke-width:2px
    style ExpiredCheck fill:#fff4dd,stroke:#d4a017,stroke-width:2px
    style SMS fill:#e1f5fe,stroke:#01579b
    style Voice fill:#e1f5fe,stroke:#01579b
    style Push fill:#e1f5fe,stroke:#01579b
```
