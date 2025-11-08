# AWS Migration Plan - CC Slack Integration + AAE Infrastructure

## Executive Summary

Migrate the entire Carla AI Automation Ecosystem (AAE) to AWS for:
- ✅ 24/7 availability (no laptop dependency)
- ✅ Remote access from anywhere
- ✅ Production-grade infrastructure
- ✅ Scalable and maintainable

## What Needs to Move to AWS

### 1. n8n (Workflow Automation)
**Current:** Docker on localhost:5678
**Target:** AWS EC2 or ECS with public domain

**Requirements:**
- Persistent storage for workflows
- Database for execution history
- Public HTTPS endpoint for webhooks
- Environment for credentials/secrets

### 2. Knowledge Lake API (port 5000)
**Current:** `api_server.py` on localhost:5000
**Target:** AWS EC2 or Lambda + API Gateway

**Requirements:**
- Python 3.9+ runtime
- Access to Mem0 knowledge base
- Notion API access
- DocsAutomator, Gamma API keys

### 3. CC Wake System (Task Scheduler)
**Current:** Windows Task Scheduler polling Notion
**Target:** AWS EventBridge + Lambda

**Requirements:**
- Cron/scheduled execution every 5 min
- Query Notion CC Inbox
- Trigger Claude Code API (if available) OR webhook to laptop

### 4. Notion-GitHub Sync
**Current:** Local n8n workflows
**Target:** AWS n8n instance

### 5. Mem0 Knowledge Base
**Current:** Local files + vector DB
**Target:** S3 + managed vector DB (Pinecone/Weaviate) OR EC2-hosted

---

## AWS Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ Route 53 (DNS)                                                  │
│ • n8n.carlorbiz.com → ALB                                       │
│ • api.carlorbiz.com → ALB                                       │
│ • knowledge.carlorbiz.com → API Gateway                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Application Load Balancer (ALB)                                 │
│ • SSL termination (ACM certificate)                             │
│ • Routes to ECS/EC2 services                                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ ECS: n8n     │    │ ECS: API     │    │ Lambda: CC   │
│              │    │ Server       │    │ Wake Check   │
│ Port 5678    │    │ Port 5000    │    │ (EventBridge)│
│              │    │              │    │              │
│ Workflows    │────▶ Knowledge    │    │ Notion Poll  │
│ Automation   │    │ Lake         │    │ Every 5 min  │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                    │
        └───────────────────┼────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Data Layer                                                      │
│ • RDS PostgreSQL (n8n database)                                 │
│ • S3 (Mem0 knowledge base, backups)                             │
│ • Secrets Manager (API keys, tokens)                            │
│ • Parameter Store (config)                                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ External Integrations                                           │
│ • Slack (webhooks)                                              │
│ • Notion (API)                                                  │
│ • GitHub (sync)                                                 │
│ • Google Drive (backups)                                        │
│ • DocsAutomator, Gamma, etc.                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Migration Phases

### Phase 1: Foundation (Week 1)
**Goal:** Set up AWS infrastructure basics

- [ ] Create AWS account/confirm existing setup
- [ ] Set up VPC with public/private subnets
- [ ] Configure Security Groups
- [ ] Set up RDS PostgreSQL for n8n
- [ ] Create S3 buckets for storage
- [ ] Set up AWS Secrets Manager
- [ ] Configure Route 53 domain (carlorbiz.com)
- [ ] Request SSL certificate via ACM

**Deliverable:** Network infrastructure ready

### Phase 2: n8n Migration (Week 2)
**Goal:** Get n8n running on AWS

- [ ] Create ECS cluster OR EC2 instance
- [ ] Deploy n8n container/application
- [ ] Configure ALB with SSL
- [ ] Point n8n.carlorbiz.com to ALB
- [ ] Migrate credentials to AWS Secrets Manager
- [ ] Export local workflows
- [ ] Import workflows to AWS n8n
- [ ] Test Slack webhook connectivity
- [ ] Test Notion API connectivity

**Deliverable:** n8n accessible at https://n8n.carlorbiz.com

### Phase 3: Knowledge Lake API (Week 2-3)
**Goal:** Move API server to AWS

- [ ] Containerize api_server.py (Docker)
- [ ] Deploy to ECS OR EC2
- [ ] Configure ALB routing for /ai/* endpoints
- [ ] Migrate Mem0 knowledge base to S3
- [ ] Test all API endpoints
- [ ] Update n8n workflows with new API URLs

**Deliverable:** Knowledge Lake API at https://api.carlorbiz.com

### Phase 4: CC Wake System (Week 3)
**Goal:** Replace Windows Task Scheduler

**Option A: Full Cloud (No Laptop Dependency)**
- [ ] Create Lambda function for wake check
- [ ] Configure EventBridge (cron every 5 min)
- [ ] Query Notion CC Inbox
- [ ] Process requests in Lambda (if CC can run serverless)
- [ ] OR trigger webhook back to laptop (hybrid approach)

**Option B: Hybrid (Laptop Still Needed for CC Execution)**
- [ ] Lambda checks Notion for wake flags
- [ ] Lambda triggers webhook to laptop (via Cloudflare tunnel)
- [ ] Laptop-based CC processes request
- [ ] CC responds via Slack using Zapier MCP

**Decision Point:** Can Claude Code run in AWS Lambda/ECS?

**Deliverable:** CC wake system operational

### Phase 5: Testing & Validation (Week 4)
**Goal:** Ensure everything works end-to-end

- [ ] Test Slack → n8n → Notion flow
- [ ] Test CC wake → process → respond flow
- [ ] Test Knowledge Lake API endpoints
- [ ] Test Notion-GitHub sync workflows
- [ ] Load testing
- [ ] Backup/restore procedures
- [ ] Monitoring setup (CloudWatch)
- [ ] Cost optimization review

**Deliverable:** Production-ready system

### Phase 6: Cutover (Week 5)
**Goal:** Go live

- [ ] Final data sync
- [ ] Update DNS to AWS
- [ ] Decommission local services
- [ ] Update documentation
- [ ] Train/document for maintenance

**Deliverable:** Fully migrated AAE on AWS

---

## Cost Estimate (Monthly)

### Conservative Estimate
| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| EC2 (t3.medium) | n8n + API server | $30-40 |
| RDS PostgreSQL (db.t3.micro) | n8n database | $15-20 |
| ALB | Load balancer | $20-25 |
| S3 | Storage (100GB) | $2-3 |
| Route 53 | Hosted zone + queries | $1-2 |
| Secrets Manager | ~20 secrets | $1 |
| Lambda + EventBridge | CC wake function | $0-1 |
| Data Transfer | Moderate usage | $5-10 |
| **TOTAL** | | **~$75-100/month** |

### Optimized (After Testing)
- Use ECS Fargate Spot for cost savings
- Right-size instances
- Potential: **$50-75/month**

---

## Domain Strategy

**Primary Domain:** carlorbiz.com (or carla-ai.com?)

**Subdomains:**
- `n8n.carlorbiz.com` - Workflow automation UI
- `api.carlorbiz.com` - Knowledge Lake API
- `webhooks.carlorbiz.com` - Slack/GitHub webhooks
- `knowledge.carlorbiz.com` - Future knowledge portal

---

## Critical Decisions Needed

### 1. Claude Code Hosting
**Question:** Can CC run in AWS, or must it stay on laptop?

**If CC can run in AWS:**
- Container-based deployment
- Full cloud autonomy
- No laptop dependency

**If CC must stay on laptop:**
- Hybrid architecture
- Cloudflare tunnel from laptop
- AWS triggers laptop via webhook

**Action:** Research Claude Code deployment options

### 2. Vector Database for Mem0
**Options:**
- **Pinecone:** Managed, $70/month, easy
- **Weaviate on EC2:** Self-hosted, ~$20/month, more setup
- **pgvector in RDS:** Cheapest, limited features
- **Qdrant:** Self-hosted, good performance

**Action:** Decide based on Mem0 requirements

### 3. Backup Strategy
**Current:** rclone to Google Drive
**AWS Options:**
- S3 lifecycle policies
- S3 → Glacier for archives
- Continue Google Drive sync from AWS?
- AWS Backup service

**Action:** Define retention policy and budget

---

## Security Considerations

### Secrets Management
- [ ] All API keys in AWS Secrets Manager
- [ ] No secrets in code/Docker images
- [ ] Rotate credentials regularly
- [ ] IAM roles for service-to-service auth

### Network Security
- [ ] Private subnets for databases
- [ ] Security groups with least privilege
- [ ] WAF rules for public endpoints
- [ ] CloudTrail logging enabled

### Access Control
- [ ] MFA on AWS account
- [ ] Separate IAM users for admin/dev
- [ ] Read-only dashboards for monitoring
- [ ] VPN for admin access (optional)

---

## Monitoring & Alerting

### CloudWatch Dashboards
- n8n workflow execution success/failure
- API endpoint latency/errors
- Lambda invocation counts
- RDS connections/performance
- Cost tracking

### Alerts (SNS → Email/Slack)
- Workflow failures
- API 500 errors
- High latency (>2s)
- Cost threshold exceeded ($100/month)
- Security group changes

---

## Rollback Plan

**If migration fails:**
1. DNS points back to localhost (via Cloudflare tunnel)
2. Local n8n remains functional
3. Local Knowledge Lake API stays up
4. No data loss (S3 backups)
5. Maximum downtime: 15 minutes

---

## Next Steps (This Week)

1. **Confirm AWS account access**
2. **Choose domain** (carlorbiz.com vs carla-ai.com)
3. **Decide on CC hosting strategy** (AWS vs laptop hybrid)
4. **Review this plan** and adjust timeline
5. **Kick off Phase 1** (foundation setup)

---

**Questions for Carla:**

1. Do you already have an AWS account? If so, what region preference?
2. Which domain do you want to use? (or register a new one?)
3. What's your comfort level with AWS? (I can handle setup, just checking)
4. Timeline flexibility - can we stretch to 6 weeks if needed?
5. Budget approval for ~$75-100/month AWS costs?

**This is your permanent infrastructure. Let's build it right.** 🚀
