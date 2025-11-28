import uuid
import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import File


def get_s3_client():
    """Get S3 client with credentials from environment or IAM role"""
    # If credentials are provided via environment variables, use them
    if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
        return boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
        )
    else:
        # If no credentials provided, boto3 will use:
        # 1. IAM role (if running on EC2/ECS/Lambda)
        # 2. AWS credentials file (~/.aws/credentials)
        # 3. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
        return boto3.client('s3', region_name=settings.AWS_S3_REGION_NAME)


class FilePresignView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Request S3 presigned PUT URL"""
        filename = request.data.get("filename")
        content_type = request.data.get("contentType", "application/octet-stream")

        if not filename:
            return Response(
                {"error": "filename is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Generate S3 key
        file_id = str(uuid.uuid4())
        s3_key = f"uploads/{request.user.id}/{file_id}/{filename}"

        # Use S3 if configured, otherwise return mock for development
        if settings.USE_S3 and settings.AWS_STORAGE_BUCKET_NAME:
            try:
                s3_client = get_s3_client()
                
                # Generate presigned URL for PUT operation
                presigned_url = s3_client.generate_presigned_url(
                    'put_object',
                    Params={
                        'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
                        'Key': s3_key,
                        'ContentType': content_type,
                    },
                    ExpiresIn=settings.AWS_S3_PRESIGNED_URL_EXPIRATION,
                )

                # Generate public URL
                if settings.AWS_S3_CUSTOM_DOMAIN:
                    public_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{s3_key}"
                else:
                    public_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{s3_key}"

            except ClientError as e:
                return Response(
                    {"error": f"Failed to generate presigned URL: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            except Exception as e:
                return Response(
                    {"error": f"Configuration error: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        else:
            # Mock response for development (when S3 is not configured)
            presigned_url = f"https://s3.example.com/{s3_key}?presigned=true"
            public_url = f"https://s3.example.com/{s3_key}"

        # Store file metadata
        file_obj = File.objects.create(
            user=request.user,
            filename=filename,
            url=public_url,
            metadata={"s3_key": s3_key, "content_type": content_type},
        )

        return Response(
            {
                "url": presigned_url,
                "method": "PUT",
                "publicUrl": public_url,
                "fileId": str(file_obj.id),
            },
            status=status.HTTP_200_OK,
        )
