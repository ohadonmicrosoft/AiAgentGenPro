# Deployment Strategy

## Overview

This document outlines the deployment strategy for the AI Agent Generator application, detailing the infrastructure, environments, CI/CD pipeline, and best practices for reliable and efficient deployments.

## Deployment Environments

The application uses a multi-environment deployment strategy:

1. **Development**: For active development and testing
2. **Staging**: For pre-production validation
3. **Production**: For end-user access

### Environment Configuration

Each environment has its own configuration:

```
├── environments/
│   ├── development.env
│   ├── staging.env
│   └── production.env
```

Example environment file:

```
# production.env
NODE_ENV=production
API_URL=https://api.aiagentgenerator.com
FIREBASE_API_KEY=xxx
FIREBASE_AUTH_DOMAIN=xxx
FIREBASE_PROJECT_ID=xxx
OPENAI_API_KEY=xxx
DATABASE_URL=xxx
LOGGING_LEVEL=info
```

## Infrastructure

### Cloud Provider

The application is deployed on Google Cloud Platform (GCP) with the following services:

- **Google Kubernetes Engine (GKE)**: For container orchestration
- **Cloud SQL**: For database hosting
- **Cloud Storage**: For static assets and file storage
- **Cloud CDN**: For content delivery
- **Cloud Logging**: For centralized logging
- **Cloud Monitoring**: For application monitoring

### Architecture Diagram

```
                                   ┌─────────────┐
                                   │ Cloud CDN   │
                                   └─────┬───────┘
                                         │
                                         ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ CI/CD       │───►│ Container   │───►│ Load        │
│ Pipeline    │    │ Registry    │    │ Balancer    │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                             │
                                             ▼
┌─────────────┐                       ┌─────────────┐
│ Cloud       │◄──────────────────────┤ Kubernetes  │
│ Monitoring  │                       │ Cluster     │
└─────────────┘                       └──────┬──────┘
                                             │
                   ┌─────────────┐          │
                   │ Cloud       │◄─────────┘
                   │ Storage     │          │
                   └─────────────┘          │
                                            │
                   ┌─────────────┐          │
                   │ Cloud SQL   │◄─────────┘
                   │ Database    │
                   └─────────────┘
```

## Containerization

### Docker Configuration

The application uses Docker for containerization:

```dockerfile
# Dockerfile
FROM node:16-alpine as builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:16-alpine

WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

### Docker Compose for Local Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    depends_on:
      - db

  db:
    image: postgres:14
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=aiagent
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Kubernetes Deployment

### Kubernetes Configuration

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aiagent-app
  namespace: aiagent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: aiagent-app
  template:
    metadata:
      labels:
        app: aiagent-app
    spec:
      containers:
      - name: aiagent-app
        image: gcr.io/aiagent-project/aiagent-app:${TAG}
        ports:
        - containerPort: 3000
        resources:
          limits:
            cpu: "1"
            memory: "1Gi"
          requests:
            cpu: "500m"
            memory: "512Mi"
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: aiagent-secrets
              key: database-url
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: aiagent-secrets
              key: openai-api-key
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 20
```

```yaml
# kubernetes/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: aiagent-service
  namespace: aiagent
spec:
  selector:
    app: aiagent-app
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

```yaml
# kubernetes/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: aiagent-ingress
  namespace: aiagent
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - app.aiagentgenerator.com
    secretName: aiagent-tls
  rules:
  - host: app.aiagentgenerator.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: aiagent-service
            port:
              number: 80
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches:
      - main
      - develop
  workflow_dispatch:

env:
  GCP_PROJECT_ID: aiagent-project
  GKE_CLUSTER: aiagent-cluster
  GKE_ZONE: us-central1-a

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Google Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          project_id: ${{ env.GCP_PROJECT_ID }}
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          export_default_credentials: true
      
      - name: Configure Docker
        run: gcloud auth configure-docker
      
      - name: Set environment variables
        run: |
          if [[ $GITHUB_REF == 'refs/heads/main' ]]; then
            echo "ENVIRONMENT=production" >> $GITHUB_ENV
            echo "DEPLOYMENT_NAME=aiagent-app-prod" >> $GITHUB_ENV
          else
            echo "ENVIRONMENT=staging" >> $GITHUB_ENV
            echo "DEPLOYMENT_NAME=aiagent-app-staging" >> $GITHUB_ENV
          fi
          echo "IMAGE_TAG=${GITHUB_SHA::8}" >> $GITHUB_ENV
      
      - name: Build and push Docker image
        run: |
          docker build -t gcr.io/${{ env.GCP_PROJECT_ID }}/aiagent-app:${{ env.IMAGE_TAG }} .
          docker push gcr.io/${{ env.GCP_PROJECT_ID }}/aiagent-app:${{ env.IMAGE_TAG }}
      
      - name: Get GKE credentials
        run: |
          gcloud container clusters get-credentials ${{ env.GKE_CLUSTER }} --zone ${{ env.GKE_ZONE }}
      
      - name: Deploy to GKE
        run: |
          envsubst < kubernetes/deployment.yaml | kubectl apply -f -
          kubectl apply -f kubernetes/service.yaml
          kubectl apply -f kubernetes/ingress.yaml
          kubectl set image deployment/${{ env.DEPLOYMENT_NAME }} aiagent-app=gcr.io/${{ env.GCP_PROJECT_ID }}/aiagent-app:${{ env.IMAGE_TAG }}
      
      - name: Verify deployment
        run: |
          kubectl rollout status deployment/${{ env.DEPLOYMENT_NAME }}
```

## Database Migrations

### Migration Strategy

The application uses a database migration tool (e.g., Prisma Migrate) to manage database schema changes:

```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  agents    Agent[]
}

model Agent {
  id          String   @id @default(uuid())
  name        String
  description String?
  prompt      String
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Migration Workflow

1. **Development**: Create and test migrations locally
2. **CI/CD**: Apply migrations automatically during deployment
3. **Rollback**: Support for reverting migrations if needed

```yaml
# Migration step in CI/CD pipeline
- name: Run database migrations
  run: |
    npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Monitoring and Logging

### Application Monitoring

The application uses Prometheus and Grafana for monitoring:

```yaml
# kubernetes/prometheus.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: aiagent-monitor
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: aiagent-app
  endpoints:
  - port: metrics
    interval: 15s
```

### Logging Configuration

The application uses structured logging with Winston:

```typescript
// server/lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOGGING_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'aiagent-app' },
  transports: [
    new winston.transports.Console(),
    // In production, add additional transports like Google Cloud Logging
    ...(process.env.NODE_ENV === 'production'
      ? [new winston.transports.File({ filename: '/var/log/app.log' })]
      : []),
  ],
});

export default logger;
```

## Scaling Strategy

### Horizontal Pod Autoscaling

```yaml
# kubernetes/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: aiagent-hpa
  namespace: aiagent
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: aiagent-app
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Vertical Pod Autoscaling

```yaml
# kubernetes/vpa.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: aiagent-vpa
  namespace: aiagent
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: aiagent-app
  updatePolicy:
    updateMode: Auto
  resourcePolicy:
    containerPolicies:
    - containerName: '*'
      minAllowed:
        cpu: 100m
        memory: 256Mi
      maxAllowed:
        cpu: 2
        memory: 2Gi
```

## Backup and Disaster Recovery

### Database Backups

```yaml
# kubernetes/backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
  namespace: aiagent
spec:
  schedule: "0 2 * * *"  # Run at 2 AM every day
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:14
            command:
            - /bin/sh
            - -c
            - |
              pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > /backups/backup-$(date +%Y%m%d).sql.gz
              gsutil cp /backups/backup-$(date +%Y%m%d).sql.gz gs://aiagent-backups/
            env:
            - name: DB_HOST
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: host
            - name: DB_USER
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: username
            - name: DB_NAME
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: database
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: password
            volumeMounts:
            - name: backup-volume
              mountPath: /backups
          volumes:
          - name: backup-volume
            emptyDir: {}
          restartPolicy: OnFailure
```

### Disaster Recovery Plan

1. **Regular Backups**: Daily database backups stored in Cloud Storage
2. **Multi-Region Deployment**: Critical services deployed across multiple regions
3. **Recovery Testing**: Regular testing of restore procedures
4. **Incident Response**: Documented procedures for handling outages

## Security Measures

### Security Configuration

1. **Network Policies**:

```yaml
# kubernetes/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: aiagent-network-policy
  namespace: aiagent
spec:
  podSelector:
    matchLabels:
      app: aiagent-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: database
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - ipBlock:
        cidr: 0.0.0.0/0
        except:
        - 10.0.0.0/8
        - 172.16.0.0/12
        - 192.168.0.0/16
    ports:
    - protocol: TCP
      port: 443
```

2. **Secret Management**:

```yaml
# kubernetes/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: aiagent-secrets
  namespace: aiagent
type: Opaque
data:
  database-url: <base64-encoded-value>
  openai-api-key: <base64-encoded-value>
  firebase-api-key: <base64-encoded-value>
```

3. **Pod Security Policies**:

```yaml
# kubernetes/pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: aiagent-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  supplementalGroups:
    rule: 'MustRunAs'
    ranges:
      - min: 1
        max: 65535
  fsGroup:
    rule: 'MustRunAs'
    ranges:
      - min: 1
        max: 65535
  readOnlyRootFilesystem: true
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed
- [ ] Security scan completed
- [ ] Performance testing completed
- [ ] Database migration scripts tested
- [ ] Documentation updated

### Deployment

- [ ] Create deployment branch
- [ ] Tag release version
- [ ] Run CI/CD pipeline
- [ ] Monitor deployment progress
- [ ] Verify database migrations
- [ ] Check application health

### Post-Deployment

- [ ] Verify functionality in production
- [ ] Monitor application performance
- [ ] Monitor error rates
- [ ] Check logs for unexpected issues
- [ ] Notify stakeholders of successful deployment

## Rollback Strategy

### Automated Rollback

The CI/CD pipeline includes automated rollback if deployment fails:

```yaml
# Rollback step in CI/CD pipeline
- name: Rollback on failure
  if: failure()
  run: |
    kubectl rollout undo deployment/${{ env.DEPLOYMENT_NAME }}
```

### Manual Rollback

For manual rollback:

1. Identify the previous stable version
2. Update the deployment to use the previous image
3. Verify the rollback was successful

```bash
# Manual rollback command
kubectl rollout undo deployment/aiagent-app --to-revision=<revision-number>
```

## Blue-Green Deployment

For critical updates, the application uses a blue-green deployment strategy:

```yaml
# kubernetes/blue-green-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aiagent-app-blue
  namespace: aiagent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: aiagent-app
      version: blue
  template:
    metadata:
      labels:
        app: aiagent-app
        version: blue
    spec:
      containers:
      - name: aiagent-app
        image: gcr.io/aiagent-project/aiagent-app:${CURRENT_VERSION}
        # ... other configuration ...

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aiagent-app-green
  namespace: aiagent
spec:
  replicas: 0  # Initially set to 0
  selector:
    matchLabels:
      app: aiagent-app
      version: green
  template:
    metadata:
      labels:
        app: aiagent-app
        version: green
    spec:
      containers:
      - name: aiagent-app
        image: gcr.io/aiagent-project/aiagent-app:${NEW_VERSION}
        # ... other configuration ...

---
apiVersion: v1
kind: Service
metadata:
  name: aiagent-service
  namespace: aiagent
spec:
  selector:
    app: aiagent-app
    version: blue  # Initially points to blue
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

## Recommended Deployment Improvements

1. **Implement Canary Deployments**
   - Deploy new versions to a small subset of users
   - Gradually increase traffic to the new version
   - Automate rollback based on error rates

2. **Add Feature Flags**
   - Use feature flags to control feature rollout
   - Decouple deployment from feature release
   - Enable A/B testing capabilities

3. **Enhance Monitoring**
   - Implement distributed tracing
   - Add business metrics monitoring
   - Set up anomaly detection

4. **Improve Database Operations**
   - Implement zero-downtime migrations
   - Add database performance monitoring
   - Set up read replicas for scaling

5. **Optimize CI/CD Pipeline**
   - Reduce build times
   - Implement parallel testing
   - Add deployment approval gates for production 