# CI/CD Pipeline - GitHub Actions

Automated deployment pipeline for Membership Auto backend to AWS ECS.

## Overview

```
GitHub Push → GitHub Actions → Build Docker → Push to ECR → Update ECS Service
```

## Prerequisites

1. GitHub repository
2. AWS account with ECR and ECS access
3. AWS IAM user with deployment permissions

## Step 1: Create IAM User for CI/CD

### Create IAM User

```bash
aws iam create-user --user-name github-actions-deploy
```

### Attach Policies

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:RegisterTaskDefinition",
        "ecs:DescribeTaskDefinition"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole"
    }
  ]
}
```

### Create Access Keys

```bash
aws iam create-access-key --user-name github-actions-deploy
```

Save the Access Key ID and Secret Access Key.

## Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

- `AWS_ACCESS_KEY_ID`: Your IAM user access key
- `AWS_SECRET_ACCESS_KEY`: Your IAM user secret key
- `AWS_REGION`: `us-east-1` (or your region)
- `AWS_ECR_REPOSITORY`: `membership-auto-backend`
- `AWS_ECS_CLUSTER`: `membership-auto-cluster`
- `AWS_ECS_SERVICE`: `membership-auto-backend`
- `AWS_ECS_TASK_DEFINITION`: `membership-auto-backend`

## Step 3: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS ECS

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: membership-auto-backend
  ECS_CLUSTER: membership-auto-cluster
  ECS_SERVICE: membership-auto-backend
  ECS_TASK_DEFINITION: membership-auto-backend
  CONTAINER_NAME: membership-auto-backend

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    environment: production

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2

    - name: Build, tag, and push image to Amazon ECR
      id: build-image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        cd backend
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

    - name: Download task definition
      run: |
        aws ecs describe-task-definition \
          --task-definition $ECS_TASK_DEFINITION \
          --query taskDefinition > task-definition.json

    - name: Fill in the new image ID in the Amazon ECS task definition
      id: task-def
      uses: aws-actions/amazon-ecs-render-task-definition@v1
      with:
        task-definition: task-definition.json
        container-name: ${{ env.CONTAINER_NAME }}
        image: ${{ steps.build-image.outputs.image }}

    - name: Deploy Amazon ECS task definition
      uses: aws-actions/amazon-ecs-deploy-task-definition@v1
      with:
        task-definition: ${{ steps.task-def.outputs.task-definition }}
        service: ${{ env.ECS_SERVICE }}
        cluster: ${{ env.ECS_CLUSTER }}
        wait-for-service-stability: true

    - name: Run database migrations
      run: |
        TASK_ARN=$(aws ecs list-tasks \
          --cluster $ECS_CLUSTER \
          --service-name $ECS_SERVICE \
          --query 'taskArns[0]' \
          --output text)
        
        TASK_ID=$(echo $TASK_ARN | cut -d'/' -f3)
        
        aws ecs execute-command \
          --cluster $ECS_CLUSTER \
          --task $TASK_ID \
          --container $CONTAINER_NAME \
          --command "python manage.py migrate --noinput" \
          --interactive || echo "Migration command execution not available, run manually"
```

## Step 4: Add Testing Stage (Optional)

Update workflow to include tests:

```yaml
jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Set up Python
      uses: actions/setup-python@v5
      with:
        python-version: '3.12'

    - name: Install dependencies
      run: |
        cd backend
        python -m pip install --upgrade pip
        pip install -r requirements.txt

    - name: Run tests
      run: |
        cd backend
        python manage.py test

  deploy:
    name: Deploy
    needs: test
    runs-on: ubuntu-latest
    # ... rest of deployment steps
```

## Step 5: Add Environment-Specific Deployments

For staging and production:

```yaml
on:
  push:
    branches:
      - main  # Production
      - develop  # Staging

jobs:
  deploy:
    strategy:
      matrix:
        include:
          - branch: main
            environment: production
            cluster: membership-auto-cluster-prod
          - branch: develop
            environment: staging
            cluster: membership-auto-cluster-staging
    runs-on: ubuntu-latest
    if: github.ref == "refs/heads/${{ matrix.branch }}"
    environment: ${{ matrix.environment }}
    # ... deployment steps using matrix.cluster
```

## Step 6: Add Notifications (Optional)

Add Slack/Discord notifications:

```yaml
    - name: Notify deployment success
      if: success()
      uses: 8398a7/action-slack@v3
      with:
        status: custom
        custom_payload: |
          {
            text: "✅ Deployment successful: ${{ github.sha }}"
          }
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Step 7: Manual Deployment

You can also trigger deployments manually:

1. Go to Actions tab in GitHub
2. Select "Deploy to AWS ECS" workflow
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Rollback Procedure

If deployment fails, rollback:

```bash
# Get previous task definition revision
aws ecs describe-task-definition \
  --task-definition membership-auto-backend \
  --query 'taskDefinition.revision'

# Update service to previous revision
aws ecs update-service \
  --cluster membership-auto-cluster \
  --service membership-auto-backend \
  --task-definition membership-auto-backend:<previous-revision>
```

## Monitoring Deployments

- GitHub Actions: View deployment status in Actions tab
- AWS ECS: Monitor service events in ECS console
- CloudWatch: Set up alarms for deployment failures

## Best Practices

1. **Always test before deploying**: Tests run automatically
2. **Use feature branches**: Deploy to staging first
3. **Monitor after deployment**: Check logs and metrics
4. **Keep secrets secure**: Never commit AWS credentials
5. **Use environment-specific configs**: Different settings for staging/prod

