# Deployment Steps for Stripe Payment Integration

## Files Changed:
1. `backend/payments/serializers.py` - Updated PlanSerializer to return both `price_monthly` and `price` fields
2. `backend/users/management/commands/create_plans.py` - NEW: Management command to create plans
3. `mobile/services/api/payment.service.ts` - Updated API endpoints from `/billing/` to `/payments/`

## Deployment Steps:

### 1. Deploy Backend Code
```bash
# SSH into your production server
# Or use your deployment pipeline to push these changes

# Navigate to backend directory
cd /home/binary/Desktop/membership-auto/backend

# Commit and push changes
git add .
git commit -m "Add Stripe payment integration and fix plans API"
git push origin main

# Deploy to production (your deployment method)
```

### 2. Create Plans in Production Database
After deploying the backend code, run this command on your production server:

```bash
# SSH into production server
ssh your-server

# Navigate to backend directory
cd /path/to/backend

# Activate virtual environment
source env/bin/activate

# Run management command to create plans
python manage.py create_plans
```

**Expected output:**
```
Created plan: Basic
Created plan: Plus
Created plan: Premium
Created plan: Elite
Total plans in database: 4
```

### 3. Verify Plans API
Test the API endpoint:

```bash
curl https://api.membershipauto.com/api/payments/plans/
```

**Expected response:**
```json
[
  {
    "id": "uuid-here",
    "name": "Basic",
    "price_monthly": 59,
    "price": 59.00,
    "tier": "compact",
    "interval": "month",
    "features": [
      "All basic maintenance",
      "Oil changes",
      "Tire rotations",
      "Basic diagnostics"
    ],
    "stripePriceId": "",
    "popular": false
  },
  ...
]
```

### 4. Test Mobile App
After deployment:
1. Open mobile app
2. Navigate to Plans page
3. Verify all 4 plans are displayed
4. Test selecting a plan and navigating to checkout

## Notes:

- The `create_plans` command is idempotent - it won't create duplicates if plans already exist
- The serializer now returns both `price_monthly` (for website) and `price` (for mobile app)
- The `popular` field automatically marks the "Premium" tier as popular
- The `stripePriceId` field is currently empty - add Stripe Price IDs later when setting up Stripe

## Troubleshooting:

If plans don't show in the mobile app:
1. Check API response: `curl https://api.membershipauto.com/api/payments/plans/`
2. Verify plans exist in database: `python manage.py shell -c "from users.models import Plan; print(Plan.objects.count())"`
3. Check mobile app logs for API errors
4. Verify mobile app is calling the correct API URL (should be `/payments/plans/` not `/billing/plans/`)
