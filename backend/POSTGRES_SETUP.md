# PostgreSQL Setup Guide

This guide explains how to switch from SQLite to PostgreSQL for the Membership Auto backend.

## Prerequisites

1. Install PostgreSQL:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql
```

2. Install Python PostgreSQL adapter:
```bash
cd backend
./env/bin/pip install psycopg2-binary
```

## Database Setup

1. Create PostgreSQL database and user:
```bash
# Access PostgreSQL as postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE membership_auto;
CREATE USER membership_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE membership_auto TO membership_user;
ALTER USER membership_user CREATEDB;  # For running tests
\q
```

## Configuration

1. Update `.env` file in the backend directory:
```env
# Database Configuration
DB_ENGINE=postgresql
DB_NAME=membership_auto
DB_USER=membership_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
```

2. Update `settings.py` to use environment variables:
```python
DATABASES = {
    'default': {
        'ENGINE': os.getenv('DB_ENGINE', 'django.db.backends.sqlite3'),
        'NAME': os.getenv('DB_NAME', BASE_DIR / 'db.sqlite3'),
        'USER': os.getenv('DB_USER', ''),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', ''),
        'PORT': os.getenv('DB_PORT', ''),
    }
}

# For PostgreSQL specifically, update to:
if os.getenv('DB_ENGINE') == 'postgresql':
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'membership_auto'),
        'USER': os.getenv('DB_USER', 'membership_user'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
```

## Migration

1. Run migrations on the new PostgreSQL database:
```bash
cd backend
./env/bin/python manage.py migrate
```

2. Create a superuser:
```bash
./env/bin/python manage.py createsuperuser
```

3. (Optional) Transfer data from SQLite:
```bash
# Export from SQLite
./env/bin/python manage.py dumpdata --natural-foreign --natural-primary --exclude contenttypes --exclude auth.permission > data.json

# Switch to PostgreSQL in .env

# Import to PostgreSQL
./env/bin/python manage.py loaddata data.json
```

## Backup Configuration

The backup system automatically detects your database type:

- **SQLite**: Creates a file copy (`.sqlite3`)
- **PostgreSQL**: Uses `pg_dump` to create compressed backups (`.sql`)

### Manual PostgreSQL Backup
```bash
pg_dump -h localhost -U membership_user -F c membership_auto > backup.sql
```

### Manual PostgreSQL Restore
```bash
pg_restore -h localhost -U membership_user -d membership_auto backup.sql
```

## Testing the Setup

1. Start the server:
```bash
cd backend
./env/bin/daphne -b 0.0.0.0 -p 8000 membership_auto.asgi:application
```

2. Test database connection:
```bash
./env/bin/python manage.py dbshell
# Should connect to PostgreSQL
```

3. Test backup from admin dashboard:
- Login to admin dashboard
- Go to Settings page
- Click "Run Database Backup"
- Check `backend/backups/` for `.sql` file

## Performance Optimization

For production PostgreSQL, consider:

1. **Connection Pooling**:
```python
DATABASES['default']['CONN_MAX_AGE'] = 600  # 10 minutes
```

2. **Indexes**: Already configured in models with `db_index=True`

3. **PostgreSQL-specific settings**:
```python
DATABASES['default']['OPTIONS'] = {
    'connect_timeout': 10,
}
```

## Troubleshooting

### Connection refused
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql
```

### Authentication failed
```bash
# Reset password
sudo -u postgres psql
ALTER USER membership_user WITH PASSWORD 'new_password';
```

### pg_dump not found
```bash
# Install PostgreSQL client tools
sudo apt install postgresql-client
```

## Environment Variables Reference

| Variable | SQLite | PostgreSQL |
|----------|--------|------------|
| DB_ENGINE | sqlite3 | postgresql |
| DB_NAME | path/to/db.sqlite3 | membership_auto |
| DB_USER | (not used) | membership_user |
| DB_PASSWORD | (not used) | your_password |
| DB_HOST | (not used) | localhost |
| DB_PORT | (not used) | 5432 |

## Notes

- Backup files are stored in `backend/backups/`
- PostgreSQL backups use custom compressed format (smaller size)
- Email notifications are sent when backups complete (if enabled in settings)
- The system automatically detects database type and adjusts backup method
