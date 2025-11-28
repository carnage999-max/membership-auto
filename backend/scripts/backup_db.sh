#!/bin/bash
# Database backup script for Membership Auto
# Usage: ./backup_db.sh

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups}"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="membership_auto_${DATE}.sql"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Database connection parameters
DB_HOST="${DB_HOST:-localhost}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-membership_auto}"

echo "Starting database backup..."
echo "Database: $DB_NAME"
echo "Host: $DB_HOST"
echo "User: $DB_USER"

# Perform backup
PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" \
    --no-password \
    --format=plain \
    --file="$BACKUP_DIR/$FILENAME"

# Compress backup
gzip "$BACKUP_DIR/$FILENAME"
FILENAME="${FILENAME}.gz"

echo "Backup completed: $BACKUP_DIR/$FILENAME"

# Remove old backups (keep last N days)
if [ -n "$RETENTION_DAYS" ]; then
    echo "Removing backups older than $RETENTION_DAYS days..."
    find "$BACKUP_DIR" -name "membership_auto_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "Cleanup completed"
fi

# Upload to S3 (optional)
if [ -n "$AWS_STORAGE_BUCKET_NAME" ] && [ -n "$AWS_S3_BACKUP_PATH" ]; then
    echo "Uploading to S3..."
    aws s3 cp "$BACKUP_DIR/$FILENAME" "s3://$AWS_STORAGE_BUCKET_NAME/$AWS_S3_BACKUP_PATH/$FILENAME"
    echo "Upload completed"
fi

echo "Backup process finished successfully"

