DevOps & Deployment (AWS recommended)
====================================

Suggested architecture:
- Frontend (marketing + admin): Next.js on Vercel (SSR)
- Mobile backend API: AWS API Gateway -> AWS Fargate (containers) or Lambda (for smaller services)
- Postgres: Amazon RDS (Multi-AZ)
- File Storage: S3 + CloudFront
- Push: Amazon SNS/Pinpoint
- Realtime Chat: WebSocket on ECS or managed (Pusher/Stream)
- Monitoring: Sentry + CloudWatch + Prometheus + Grafana

CI/CD:
- GitHub Actions builds -> tests -> push Docker image to ECR -> deploy to ECS/Fargate
- Vercel deploys frontend from main branch

Security:
- Use AWS Secrets Manager / Parameter Store
- VPC for databases; private subnets
- WAF for API Gateway

