# Security Policy

## Reporting a Vulnerability

Please report security vulnerabilities to security@workflowos.dev. Do not create public issues for security-related bugs.

## Security Measures

1. **Authentication**
   - JWT tokens with 15-minute expiration
   - Refresh tokens with 7-day expiration
   - Passwords hashed with bcrypt (10 rounds)

2. **Authorization**
   - Role-based access control (RBAC)
   - Permission-based route protection
   - Workspace isolation

3. **Data Protection**
   - Input validation on all endpoints
   - SQL injection protection via Prisma ORM
   - CORS configuration

4. **Rate Limiting**
   - Global rate limiting: 60 requests/minute
   - Configurable per endpoint

5. **Audit Trail**
   - All CRUD operations logged
   - Login/logout events tracked
