🛡️ SOC Command Center

> A practical Security Operations Center (SOC) investigation platform built around Microsoft Sentinel, Azure Log Analytics, Linux telemetry, KQL, and a modern Next.js dashboard.

![SOC Command Center](https://img.shields.io/badge/SOC-Command%20Center-06b6d4?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-3178C6?style=for-the-badge&logo=typescript)
![Microsoft Sentinel](https://img.shields.io/badge/Microsoft-Sentinel-0078D4?style=for-the-badge&logo=microsoft)
![Azure](https://img.shields.io/badge/Microsoft-Azure-0078D4?style=for-the-badge&logo=microsoftazure)

---

🎯 Overview

**SOC Command Center** is an end-to-end security monitoring and investigation platform designed to simulate a real-world Security Operations Center environment.

The project collects security telemetry from a Linux virtual machine, sends the data to **Azure Log Analytics**, uses **Microsoft Sentinel** for detection and incident management, and presents security intelligence through a custom **Next.js SOC dashboard**.

The objective is to demonstrate the complete SOC workflow:


Telemetry
    ↓
Collection
    ↓
Normalization
    ↓
Detection
    ↓
Alert
    ↓
Incident
    ↓
Investigation
    ↓
MITRE ATT&CK Mapping
    ↓
Analyst Response


🏗️ Architecture
                    ┌─────────────────────────┐
                    │     SOC Linux VM        │
                    │     Ubuntu 24.04 LTS    │
                    │                         │
                    │  SSH / Syslog / Events  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Azure Monitor Agent     │
                    │          AMA            │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Data Collection Rule    │
                    │    SOC-Syslog-DCR       │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Log Analytics Workspace │
                    │    soc-lab-workspace    │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
          ┌──────────────────┐      ┌──────────────────┐
          │ Microsoft        │      │       KQL        │
          │ Sentinel         │      │ Investigation    │
          └────────┬─────────┘      └──────────────────┘
                   │
          ┌────────┴──────────┐
          ▼                   ▼
   ┌──────────────┐    ┌──────────────┐
   │ Detections   │    │  Incidents   │
   └──────┬───────┘    └──────┬───────┘
          │                   │
          └─────────┬─────────┘
                    ▼
          ┌─────────────────────┐
          │ SOC Command Center  │
          │      Next.js        │
          └─────────────────────┘


📊 SOC Dashboard

🚀 Key Features
The Next.js dashboard provides a centralized security operations view containing:
- Total security events
- Failed SSH attempts
- Open Sentinel incidents
- Active security alerts
- Top SSH source IP addresses
- Security events over time
- Detection distribution
- Recent security events
- Alert investigation pages


🔎 Security Detection
The project currently implements detections for:
1. Repeated Invalid SSH User Attempts
Detects repeated unsuccessful SSH authentication attempts involving invalid usernames.
MITRE ATT&CK:
T1110 - Brute Force

Example investigation data:
Source IP
Attempt count
Username
First seen
Last seen
Hostname

2. Privileged Sudo Command Execution
Detects command execution through sudo with elevated privileges.
Example:
User: azureuser
Target: root
Command: /usr/bin/id

MITRE ATT&CK Tactic:
Privilege Escalation

3. Suspicious DNS Query Activity
Detects simulated suspicious DNS query patterns generated from the Linux telemetry source.
Example telemetry:
DNS_QUERY domain=example.com type=A
DNS_QUERY domain=a8f3k2m9.example.com type=A
DNS_QUERY domain=x7q9n2k4.example.com type=TXT

The telemetry is generated specifically for controlled SOC investigation and does not perform malicious DNS activity.
4. Suspicious Process Execution
Detects simulated process execution telemetry and extracts:
Executing user
Process
Parent process
Timestamp
Hostname

The project uses synthetic telemetry for controlled testing rather than executing potentially dangerous processes.


🧪 Detection Engineering
The detection layer is implemented using Kusto Query Language (KQL).
Example:
Syslog
| where Computer == "SOC-Linux-VM"
| where Facility in ("auth", "authpriv")
| where ProcessName == "sshd"
| where SyslogMessage has "Invalid user"
| extend
    Username = extract(@"Invalid user (\S+)", 1, SyslogMessage),
    SourceIP = extract(
        @"from ([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)",
        1,
        SyslogMessage
    )
| summarize
    Attempts = count(),
    FirstSeen = min(TimeGenerated),
    LastSeen = max(TimeGenerated),
    Usernames = make_set(Username)
    by SourceIP, Computer
| where Attempts >= 3

This demonstrates the process of:
Raw Logs
   ↓
Filtering
   ↓
Field Extraction
   ↓
Aggregation
   ↓
Threshold
   ↓
Detection


🧠 Investigation Workflow
When a detection generates an alert, the analyst can investigate it through the SOC dashboard.
The investigation page provides:
- Alert name
- Severity
- MITRE tactic
- MITRE technique
- Timestamp
- Provider
- Alert ID
- Affected entity
- Investigation summary
Example:
Alert
  │
  ├── Severity
  ├── Tactic
  ├── Technique
  ├── Timestamp
  └── Entity
        │
        ▼
     Investigation
        │
        ▼
   Linux Telemetry
        │
        ▼
   Source IP Analysis
        │
        ▼
   Attack Classification


🧩 MITRE ATT&CK
The project maps detections to the MITRE ATT&CK framework to provide security context.
Current mappings include:
Detection	Tactic	Technique
Repeated Invalid SSH User Attempts	Credential Access	T1110 - Brute Force
Privileged Sudo Command Execution	Privilege Escalation	Linux sudo activity
Suspicious Process Execution	Execution	T1059 - Command and Scripting Interpreter
Suspicious DNS Query Activity	Command and Control	DNS-based activity


MITRE mappings are used to provide investigation context and are refined according to the actual telemetry represented by each detection.


💻 Technology Stack
Frontend
- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Next.js App Router
Cloud & SIEM
- Microsoft Azure
- Microsoft Sentinel
- Azure Log Analytics
- Azure Monitor Agent
- Data Collection Rules
Security
- Kusto Query Language (KQL)
- Syslog
- Linux authentication telemetry
- MITRE ATT&CK
Authentication
- Kinde Authentication
- OAuth/OIDC-based authentication flow
Kinde integration is currently being completed and protected dashboard/session handling is part of the authentication workstream.


📁 Project Structure
soc-dashboard/
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [kindeAuth]/
│   │   │       └── route.ts
│   │   │
│   │   └── security/
│   │       ├── total-events/
│   │       ├── failed-ssh/
│   │       ├── open-incidents/
│   │       ├── active-alerts/
│   │       ├── top-ssh-ips/
│   │       ├── events-over-time/
│   │       ├── detection-distribution/
│   │       ├── recent-events/
│   │       └── alert/
│   │           └── [id]/
│   │
│   ├── auth/
│   │   └── page.tsx
│   │
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── events/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           └── page.tsx
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── public/
├── proxy.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md


📈 Dashboard Data Sources
The dashboard does not rely entirely on static/mock data.
Live security metrics are queried from Azure and Sentinel.
Dashboard Component	Data Source
Total Events	Azure Log Analytics
Failed SSH	Azure Log Analytics
Open Incidents	Microsoft Sentinel
Active Alerts	Microsoft Sentinel
Top SSH IPs	Azure Log Analytics
Events Over Time	Azure Log Analytics
Detection Distribution	Microsoft Sentinel
Recent Security Events	Microsoft Sentinel
Alert Investigation	Microsoft Sentinel


🛠️ Example SOC Queries
Total Events
Syslog
| where TimeGenerated > ago(24h)
| where Computer == "SOC-Linux-VM"
| summarize TotalEvents = count()

Failed SSH Attempts
Syslog
| where TimeGenerated > ago(24h)
| where Computer == "SOC-Linux-VM"
| where Facility in ("auth", "authpriv")
| where ProcessName == "sshd"
| where SyslogMessage has_any ("Failed password", "Invalid user")
| summarize FailedSSHAttempts = count()

Top SSH Source IPs
Syslog
| where TimeGenerated > ago(24h)
| where Computer == "SOC-Linux-VM"
| where Facility in ("auth", "authpriv")
| where ProcessName == "sshd"
| where SyslogMessage has_any ("Failed password", "Invalid user")
| extend SourceIP = extract(
    @"from ([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)",
    1,
    SyslogMessage
)
| where isnotempty(SourceIP)
| summarize Attempts = count() by SourceIP
| top 10 by Attempts desc


🔐 Security Considerations
This project is designed as a controlled security laboratory.
Credentials
Secrets are stored in environment variables and are intentionally excluded from version control.
.env.local

must never be committed to the repository.
Synthetic Security Events
Several detection scenarios use synthetic Linux log entries to safely reproduce SOC investigation workflows.
For example:
logger -p auth.info -t dns-simulator \
"DNS_QUERY domain=example.com type=A"

These events simulate telemetry and do not represent malicious activity.
External SSH Activity
The Azure Linux VM may receive unsolicited SSH probes from the public internet.
These events are treated as security telemetry for investigation, not as authorized attacks generated by the project.


⚙️ Local Development
Clone the repository and install dependencies:
npm install

Create a local environment file:
.env.local

Configure the required Azure and authentication environment variables.
Then start the development server:
npm run dev

Open:
http://localhost:3000


🧭 Project Roadmap
✅ Completed
- [x] Azure Linux SOC VM
- [x] Azure Monitor Agent
- [x] Syslog ingestion
- [x] Data Collection Rule
- [x] Log Analytics integration
- [x] Microsoft Sentinel integration
- [x] KQL investigation queries
- [x] SSH detection
- [x] Sudo detection
- [x] DNS telemetry detection
- [x] Process telemetry detection
- [x] Sentinel incidents
- [x] Live dashboard metrics
- [x] Security event timeline
- [x] Detection distribution
- [x] Top SSH source IP analysis
- [x] Alert investigation page
- [x] MITRE ATT&CK context
- [x] GitHub project repository


🚧 In Progress
- [ ] Complete Kinde authentication integration
- [ ] Protect SOC dashboard routes
- [ ] Implement logout/session handling
- [ ] Dedicated incident management page
- [ ] Advanced KQL investigation workspace
- [ ] MITRE ATT&CK visualization
- [ ] Final SOC UI polish
- [ ] Production deployment


🎓 What This Project Demonstrates
This project demonstrates practical experience with:
                                                SOC Operations
                                                      ↓
                                                     SIEM
                                                      ↓
                                                Log Collection
                                                      ↓
                                             Security Monitoring
                                                      ↓
                                             Detection Engineering
                                                      ↓
                                                     KQL
                                                      ↓
                                                Alert Triage
                                                      ↓
                                            Incident Investigation
                                                      ↓
                                                 MITRE ATT&CK
                                                      ↓
                                        Security Dashboard Development

It combines cloud security operations and software engineering into a single working laboratory environment.


📌 Future Enhancements
Potential future improvements include:
- Automated incident enrichment
- Threat intelligence integration
- IP reputation analysis
- Automated alert prioritization
- Security playbooks
- Analyst case management
- Real-time WebSocket updates
- Advanced MITRE ATT&CK visualization
- Machine-learning-assisted anomaly detection
- Automated investigation summaries
- Role-based SOC access
- Production cloud deployment

  
⚠️ Disclaimer
This project is intended for:
- Security education
- SOC engineering practice
- SIEM experimentation
- Defensive security research
- Controlled laboratory environments
All simulated security activity is performed in an environment controlled by the project owner.
Do not use the techniques or infrastructure demonstrated here against systems you do not own or have explicit authorization to test.

👨‍💻 Author
Krishna Patil
Cybersecurity & Software Engineering Projects
Areas of interest:
Cybersecurity
SOC Operations
SIEM
Cloud Security
Security Automation
Detection Engineering
Full-Stack Development
AI & Security

⭐ Project Status
Active Development
The core SOC monitoring and investigation pipeline is operational.
Authentication hardening, advanced investigation workflows, and additional SOC capabilities are currently being developed.

powershell:
git add README.md
git commit -m "Improve project documentation"
git push
