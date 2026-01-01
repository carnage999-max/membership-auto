# Real Stripe Payment Integration Guide

## Current Status
❌ **Mock payments only** - No real money is charged
✅ Backend has Stripe API endpoints ready
✅ Plans are configured in database

---

## Steps to Enable Real Payments

### 1. Install Stripe React Native SDK

```bash
cd mobile
npx expo install @stripe/stripe-react-native
```

### 2. Wrap App with Stripe Provider

**File**: `mobile/app/_layout.tsx`

```typescript
import { StripeProvider } from '@stripe/stripe-react-native';

export default function RootLayout() {
  return (
    <StripeProvider 
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
      merchantIdentifier="merchant.com.membershipauto.app" // iOS only
    >
      {/* Rest of your app */}
    </StripeProvider>
  );
}
```

### 3. Update Checkout Screen

**File**: `mobile/app/(authenticated)/checkout.tsx`

Replace the current `subscribeMutation` with:

```typescript
import { useStripe, CardField } from '@stripe/stripe-react-native';

const CheckoutScreen = () => {
  const { confirmPayment, createPaymentMethod } = useStripe();
  const [cardComplete, setCardComplete] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPlan) throw new Error('Plan not found');

      // Step 1: Create payment intent on backend
      console.log('Creating payment intent...');
      const { clientSecret, paymentId } = await paymentService.createPaymentIntent(selectedPlan.id);

      // Step 2: Collect payment method from card field
      console.log('Creating payment method...');
      const { paymentMethod, error: pmError } = await createPaymentMethod({
        paymentMethodType: 'Card',
      });

      if (pmError || !paymentMethod) {
        throw new Error(pmError?.message || 'Failed to create payment method');
      }

      // Step 3: Confirm payment with Stripe
      console.log('Confirming payment...');
      const { error: confirmError, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            name: nameOnCard,
          },
        },
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Step 4: Confirm with backend
      console.log('Confirming with backend...');
      await paymentService.confirmPayment(paymentId);

      return paymentIntent;
    },
    onSuccess: async () => {
      showToast('success', 'Payment successful!');
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      router.replace('/(authenticated)' as any);
    },
    onError: (error: any) => {
      console.error('Payment error:', error);
      showToast('error', error.message || 'Payment failed');
    },
  });

  return (
    <View>
      {/* Replace TextInput cards with Stripe CardField */}
      <CardField
        postalCodeEnabled={false}
        placeholders={{
          number: '4242 4242 4242 4242',
        }}
        cardStyle={{
          backgroundColor: '#1a1a1a',
          textColor: '#ffffff',
        }}
        style={{
          width: '100%',
          height: 50,
          marginVertical: 16,
        }}
        onCardChange={(cardDetails) => {
          setCardComplete(cardDetails.complete);
        }}
      />
      
      {/* Rest of your UI */}
    </View>
  );
};
```

### 4. Backend Configuration

**File**: `backend/.env`

Add your Stripe keys:

```bash
# Get these from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_xxxxx  # or sk_test_xxxxx for testing
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx  # or pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**File**: `mobile/.env`

```bash
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx  # or pk_test_xxxxx
```

### 5. Create Stripe Products & Prices

In Stripe Dashboard:

1. Go to **Products** → **Add Product**
2. Create products for each plan:
   - Basic - $59/month
   - Plus - $79/month
   - Premium - $99/month
   - Elite - $159/month

3. Copy the **Price IDs** (e.g., `price_xxxxxxxxxxxxx`)

4. Update your database:

```sql
UPDATE users_plan SET stripe_price_id = 'price_xxxxx' WHERE name = 'Basic';
UPDATE users_plan SET stripe_price_id = 'price_xxxxx' WHERE name = 'Plus';
UPDATE users_plan SET stripe_price_id = 'price_xxxxx' WHERE name = 'Premium';
UPDATE users_plan SET stripe_price_id = 'price_xxxxx' WHERE name = 'Elite';
```

### 6. Update Backend Payment Intent Endpoint

**File**: `backend/payments/views.py`

The `create_payment_intent` function is already implemented! Just ensure:

```python
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    # ... existing code creates PaymentIntent
    # Returns client_secret for mobile app
```

### 7. Testing with Stripe Test Cards

Use these test cards in development:

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Declined |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |

**Expiry**: Any future date (e.g., 12/34)
**CVV**: Any 3 digits (e.g., 123)

### 8. Webhook Setup (Production)

1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Add endpoint: `https://api.membershipauto.com/api/payments/webhook/`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.succeeded`

4. Copy webhook signing secret to `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

---

## Payment Flow (Real Stripe)

```
1. User selects plan
2. Frontend: Call backend to create PaymentIntent
   ↓
3. Backend: Stripe.PaymentIntent.create() → returns client_secret
   ↓
4. Frontend: Stripe CardField collects card details
   ↓
5. Frontend: confirmPayment(client_secret) → charges card
   ↓
6. Stripe: Processes payment, sends webhook
   ↓
7. Backend webhook: Creates/activates membership
   ↓
8. Frontend: Confirms with backend, refreshes profile
```

---

## Security Notes

✅ **DO**:
- Use `pk_live_` and `sk_live_` keys in production
- Use `pk_test_` and `sk_test_` keys in development
- Store secret keys in environment variables (never in code)
- Validate webhook signatures
- Use HTTPS for all API calls

❌ **DON'T**:
- Never expose `sk_live_` or `sk_test_` keys in frontend code
- Don't store card details in your database
- Don't skip webhook signature verification

---

## Current vs Real Implementation

### Current (Mock):
```typescript
// Generates fake payment method ID
const mockPaymentMethodId = `pm_${Math.random().toString(36).substring(7)}`;

// Creates membership without charging
await paymentService.subscribe(planId, mockPaymentMethodId);
```

### Real Stripe:
```typescript
// Stripe collects real card details
const { paymentMethod } = await createPaymentMethod({ paymentMethodType: 'Card' });

// Stripe charges the card
const { paymentIntent } = await confirmPayment(clientSecret);

// Backend confirms payment via webhook
// Membership created only after successful charge
```

---

## Costs

**Stripe Fees**:
- 2.9% + $0.30 per successful card charge (US)
- No monthly fees
- No setup fees

**Example**: $99 subscription = $2.87 + $0.30 = $3.17 fee → You receive $95.83

---

## Migration Path

### Phase 1: Current (Mock) ✅
- Users can "subscribe" (no charge)
- Good for UI testing
- Good for building features

### Phase 2: Test Mode (Recommended Next)
- Install Stripe SDK
- Use test API keys
- Test with Stripe test cards
- Verify entire flow works

### Phase 3: Live Mode (Production)
- Switch to live API keys
- Create real products in Stripe
- Enable webhook
- Process real payments

---

## Quick Start (Test Mode)

1. Get Stripe test keys: https://dashboard.stripe.com/test/apikeys
2. Add to `.env` files
3. Install `@stripe/stripe-react-native`
4. Update checkout screen code (above)
5. Test with card `4242 4242 4242 4242`

**Time estimate**: 2-3 hours for full integration

---

## Need Help?

- Stripe Docs: https://stripe.com/docs/payments/accept-a-payment
- Stripe React Native: https://github.com/stripe/stripe-react-native
- Testing: https://stripe.com/docs/testing

