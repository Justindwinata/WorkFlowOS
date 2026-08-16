# WorkFlowOS PII Data Classification

## Purpose

Classify Personally Identifiable Information (PII) across the WorkFlowOS data model to guide encryption, masking, retention, and access policies.

## Classification Levels

- **Level 0 - Public**: Non-sensitive data
- **Level 1 - Internal**: Internal but not sensitive
- **Level 2 - Confidential**: Sensitive; restricted access
- **Level 3 - Restricted**: Highly sensitive; encryption + strict access

## PII Inventory

### User
| Field | Classification | Notes |
|-------|---------------|-------|
| email | Level 2 - Confidential | PII identifier |
| username | Level 1 - Internal | Login alias |
| password (hash) | Level 3 - Restricted | bcrypt hashed; never log |
| firstName | Level 2 - Confidential | PII |
| lastName | Level 2 - Confidential | PII |
| avatar | Level 1 - Internal | Image URL |
| status | Level 1 - Internal | Account state |

### Credentials & Tokens
| Field | Classification | Notes |
|-------|---------------|-------|
| accessToken | Level 3 - Restricted | Never log |
| refreshToken | Level 3 - Restricted | Never log |
| JWT payload (sub, email) | Level 2 | Minimal data |

### Audit Log
| Field | Classification | Notes |
|-------|---------------|-------|
| actor (userId) | Level 2 | References user |
| summary | Level 1 | May contain entity refs |
| entity/entityId | Level 1 | Action metadata |

### Notification
| Field | Classification | Notes |
|-------|---------------|-------|
| title/message | Level 1 | May reference user info |
| userId | Level 2 | PII reference |

### Request / Incident / Task body fields
| Field | Classification | Notes |
|-------|---------------|-------|
| description | Level 1 | May contain PII in free text; review |

## Handling Requirements

| Classification | Encryption | Masking in Logs | Access |
|----------------|-----------|-----------------|--------|
| Level 1 | Not required | No | Workspace-scoped |
| Level 2 | At rest recommended | Mask on display | Workspace-scoped + auth |
| Level 3 | Required at rest | Never retained | Auth + privileged |

## Current Status

- Passwords: bcrypt hashed ✅
- Tokens: not persisted in DB (JWT) ✅
- PII in logs: reviewed - no email/password/token logged ✅
- Field-level encryption at rest: NOT implemented ⚠️

## Recommended Roadmap

1. Add field-level encryption (AES-256-GCM) for Level 2 PII (email, names)
2. Add email masking in UI (e.g., j***@example.com)
3. Add PII retention policy
4. Add data export/deletion endpoint (GDPR-style)