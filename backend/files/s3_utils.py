import boto3
from botocore.exceptions import ClientError
from django.conf import settings


def get_s3_client():
    """Get S3 client with credentials from environment or IAM role"""
    if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
        return boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
        )
    else:
        return boto3.client('s3', region_name=settings.AWS_S3_REGION_NAME)


def upload_file_to_s3(file, filename):
    """
    Upload a file to S3 and return the public URL

    Args:
        file: File object (from request.FILES or Django form)
        filename: The S3 key/path for the file

    Returns:
        str: Public URL of the uploaded file
    """
    if not settings.USE_S3 or not settings.AWS_STORAGE_BUCKET_NAME:
        # Return None or mock URL if S3 is not configured
        return None

    try:
        s3_client = get_s3_client()

        # Determine content type
        content_type = getattr(file, 'content_type', 'application/octet-stream')

        # Upload file to S3
        s3_client.upload_fileobj(
            file,
            settings.AWS_STORAGE_BUCKET_NAME,
            filename,
            ExtraArgs={
                'ContentType': content_type,
                'ACL': 'public-read',  # Make the file publicly accessible
            }
        )

        # Generate public URL
        if settings.AWS_S3_CUSTOM_DOMAIN:
            public_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{filename}"
        else:
            public_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{filename}"

        return public_url

    except ClientError as e:
        print(f"Error uploading file to S3: {str(e)}")
        raise Exception(f"Failed to upload file to S3: {str(e)}")
    except Exception as e:
        print(f"Unexpected error uploading file to S3: {str(e)}")
        raise Exception(f"Failed to upload file to S3: {str(e)}")
