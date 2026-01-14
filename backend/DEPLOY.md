# Deploy Backend to Google Cloud Run

This guide will help you deploy the Dots backend to Google Cloud Run.

## Prerequisites

1. Google Cloud SDK (gcloud CLI) installed and authenticated
2. GCP Project "dots" created and billing enabled
3. Docker installed (for local testing)

## Step 1: Set up GCP Project

```bash
# Set your project
gcloud config set project dots

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## Step 2: Build and Push Docker Image

```bash
# Navigate to backend directory
cd backend

# Set your GCP project ID
export PROJECT_ID=dots
export SERVICE_NAME=dots-backend
export REGION=us-central1  # Change to your preferred region

# Build and push the Docker image
gcloud builds submit --tag gcr.io/${PROJECT_ID}/${SERVICE_NAME}

# Or using Docker directly:
docker build -t gcr.io/${PROJECT_ID}/${SERVICE_NAME} .
docker push gcr.io/${PROJECT_ID}/${SERVICE_NAME}
```

## Step 3: Deploy to Cloud Run

```bash
# Deploy the service
gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${SERVICE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars "PORT=8080" \
  --set-secrets "SUPABASE_URL=supabase-url:latest,SUPABASE_KEY=supabase-key:latest"
```

## Step 4: Set Environment Variables

You can set environment variables using the Cloud Console or gcloud CLI:

```bash
# Update environment variables
gcloud run services update ${SERVICE_NAME} \
  --region ${REGION} \
  --update-env-vars "SUPABASE_URL=https://your-project.supabase.co,SUPABASE_KEY=your-service-role-key,DEBUG=False"

# Or set them individually
gcloud run services update ${SERVICE_NAME} \
  --region ${REGION} \
  --update-env-vars "SUPABASE_URL=https://your-project.supabase.co"
```

## Step 5: Get the Service URL

After deployment, get your service URL:

```bash
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)'
```

## Recommended: Use Secret Manager for Sensitive Data

For better security, store sensitive values in Secret Manager:

```bash
# Create secrets
echo -n "https://your-project.supabase.co" | gcloud secrets create supabase-url --data-file=-
echo -n "your-service-role-key" | gcloud secrets create supabase-key --data-file=-

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding supabase-url \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding supabase-key \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Deploy with secrets
gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${SERVICE_NAME} \
  --platform managed \
  --region ${REGION} \
  --update-secrets SUPABASE_URL=supabase-url:latest,SUPABASE_KEY=supabase-key:latest
```

## Quick Deploy Script

Save this as `deploy.sh` in the backend directory:

```bash
#!/bin/bash
set -e

PROJECT_ID=dots
SERVICE_NAME=dots-backend
REGION=us-central1

echo "Building Docker image..."
gcloud builds submit --tag gcr.io/${PROJECT_ID}/${SERVICE_NAME}

echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${SERVICE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars "PORT=8080,DEBUG=False"

echo "Getting service URL..."
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')
echo "Backend deployed at: ${SERVICE_URL}"
```

Make it executable: `chmod +x deploy.sh`

## Update Frontend

After deployment, update your frontend `.env.local`:

```
NEXT_PUBLIC_API_URL=https://dots-backend-xxxxx-uc.a.run.app
```

Replace `xxxxx` with your actual service URL from Cloud Run.
