# OpenPay Production Migration Guide

## Quick Switch: Sandbox ↔ Production

### Single Toggle Method

To switch between sandbox and production, you only need to update **ONE** Supabase secret:

```
OPENPAY_ENVIRONMENT = "sandbox"  // or "production"
```

All edge functions and client code will automatically use the correct credentials.

---

## Initial Production Setup (One-Time)

### 1. Add Production Secrets to Supabase

Go to: https://supabase.com/dashboard/project/ptzcetvcccnojdbzzlyt/settings/functions

Add these new secrets:

```bash
# Environment Toggle (THIS IS THE SWITCH)
OPENPAY_ENVIRONMENT=sandbox

# Production Credentials
OPENPAY_MERCHANT_ID_PROD=your_production_merchant_id
OPENPAY_PRIVATE_KEY_PROD=your_production_private_key
OPENPAY_PUBLIC_KEY_PROD=your_production_public_key
OPENPAY_PLAN_BASIC_ID_PROD=your_production_basic_plan_id
OPENPAY_PLAN_ADVANCED_ID_PROD=your_production_advanced_plan_id
```

**Keep existing sandbox secrets** - don't delete them:
- `OPENPAY_MERCHANT_ID_SANDBOX`
- `OPENPAY_PRIVATE_KEY_SANDBOX`
- `OPENPAY_PUBLIC_KEY_SANDBOX`
- `OPENPAY_PLAN_BASIC_ID_SANDBOX`
- `OPENPAY_PLAN_ADVANCED_ID_SANDBOX`

### 2. Production OpenPay Setup

In your OpenPay production dashboard:

1. **Create Plans:**
   - Create "Plan Básico" (monthly, S/297 or your price)
   - Create "Plan Avanzado" (monthly, S/497 or your price)
   - Copy the plan IDs to the secrets above

2. **Configure Webhooks:**
   - Add webhook URL: `https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/openpay-webhook`
   - Enable events: `charge.succeeded`, `charge.failed`, `subscription.cancelled`, etc.

3. **Get API Keys:**
   - Copy your production Merchant ID, Private Key, and Public Key
   - Add them to Supabase secrets

---

## Switching to Production

### When OpenPay Approves Production Access:

1. **Update the environment secret:**
   ```bash
   OPENPAY_ENVIRONMENT=production
   ```

2. **Update client-side config:**
   Edit `src/config/openpay.ts`:
   ```typescript
   export const OPENPAY_CONFIG = {
     environment: 'production' as 'sandbox' | 'production',
     // ... rest stays the same
   };
   ```

3. **Test thoroughly:**
   - Use OpenPay production test cards first
   - Test all subscription flows
   - Verify webhooks are received
   - Check charges appear in production dashboard

4. **Go live:**
   - Monitor first real transactions
   - Keep sandbox available for testing

---

## Switching Back to Sandbox (for testing)

1. Update secret: `OPENPAY_ENVIRONMENT=sandbox`
2. Update `src/config/openpay.ts`: `environment: 'sandbox'`
3. All systems revert to sandbox immediately

---

## Configuration Architecture

### Backend (Edge Functions)
Each edge function reads `OPENPAY_ENVIRONMENT` and selects credentials:

```typescript
const environment = Deno.env.get('OPENPAY_ENVIRONMENT') || 'sandbox';
const suffix = environment === 'production' ? '_PROD' : '_SANDBOX';

const merchantId = Deno.env.get(`OPENPAY_MERCHANT_ID${suffix}`)!;
const privateKey = Deno.env.get(`OPENPAY_PRIVATE_KEY${suffix}`)!;
const planBasicId = Deno.env.get(`OPENPAY_PLAN_BASIC_ID${suffix}`)!;
// etc.
```

### Frontend (Client Components)
Reads from centralized config file:

```typescript
import { OPENPAY_CONFIG } from '@/config/openpay';

// Automatically uses correct credentials
OpenPay.setId(OPENPAY_CONFIG.merchantId);
OpenPay.setApiKey(OPENPAY_CONFIG.publicKey);
OpenPay.setSandboxMode(OPENPAY_CONFIG.isSandbox);
```

---

## Affected Files

### Edge Functions (auto-configured):
- ✅ `create-openpay-subscription/index.ts`
- ✅ `upgrade-openpay-plan/index.ts`
- ✅ `change-openpay-plan/index.ts`
- ✅ `cancel-openpay-subscription/index.ts`
- ✅ `pause-openpay-subscription/index.ts`
- ✅ `sync-openpay-plan-prices/index.ts`

### Client Components:
- ✅ `src/components/client/SubscriptionManagement.tsx`
- ✅ `src/config/openpay.ts` (new config file)

---

## Troubleshooting

### "Credentials not found" error
- Verify `OPENPAY_ENVIRONMENT` is set correctly
- Check that production secrets exist in Supabase
- Ensure secret names match exactly (with `_PROD` suffix)

### Charges going to wrong account
- Check `src/config/openpay.ts` environment setting
- Verify `OPENPAY_ENVIRONMENT` secret in Supabase
- Clear browser cache and reload

### Webhooks not received
- Confirm webhook URL in OpenPay production dashboard
- Check OpenPay webhook logs for delivery status
- Verify edge function is deployed

---

## Security Notes

- ✅ Private keys never exposed to client
- ✅ Public keys safe in client code
- ✅ Environment switching requires server access
- ✅ No credentials hardcoded in codebase

---

## Quick Reference

| What | Sandbox | Production |
|------|---------|------------|
| Supabase Secret | `OPENPAY_ENVIRONMENT=sandbox` | `OPENPAY_ENVIRONMENT=production` |
| Client Config | `environment: 'sandbox'` | `environment: 'production'` |
| API Base | `https://sandbox-api.openpay.mx` | `https://api.openpay.mx` |
| Test Cards | Work | Work |
| Real Cards | Don't work | Work |

---

**Need Help?** Contact OpenPay support or check logs at:
- Edge Functions: https://supabase.com/dashboard/project/ptzcetvcccnojdbzzlyt/functions
- OpenPay Dashboard: https://dashboard.openpay.mx
