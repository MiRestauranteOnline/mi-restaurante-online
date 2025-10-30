# 📧 Complete Email System Guide

## Overview

This system implements a comprehensive email notification framework for Mi Restaurante Online, covering the entire customer lifecycle from registration to retention campaigns.

---

## 📬 Email Campaigns Summary

### Phase 1: Registration & Onboarding (✅ Complete)
- **Account Created** - Immediate welcome email with dashboard link
- **Registration Complete** - Sent after billing info submitted
- **Payment Success** - Confirms successful payment processing
- **Payment Failed** - Alerts user of payment issues with retry instructions
- **Site Live** - Celebrates site going live with links and next steps

### Phase 2: Operational Emails (✅ Complete)
- **Domain Verified** - Confirms custom domain is active
- **Domain Failed** - Notifies of domain verification issues
- **Reservation (Guest)** - Confirms/updates reservations for diners
- **Reservation (Restaurant)** - Notifies restaurant of new bookings

### Phase 3: Retention & Engagement (✅ Complete)
- **Re-engagement** - Sent 7 days after cancellation (with 30% one-time discount)
- **Cancellation Initiated** - Immediate confirmation when user cancels
- **Subscription Ended** - Sent when subscription actually expires

**Note:** Review requests are handled manually via WhatsApp/email campaigns rather than automated.

### Phase 4: Reactivation (✅ Complete)
- **Subscription Reactivated** - Confirms successful reactivation

---

## 🗄️ Database Schema

### Tracking Columns in `clients` table:

```sql
-- When site goes live (set via admin Control de Sitio tab)
site_live_at TIMESTAMP WITH TIME ZONE

-- When user clicks cancel (before actual deactivation)
cancelled_at TIMESTAMP WITH TIME ZONE

-- Prevents duplicate re-engagement emails (set after sending)
reengagement_sent_at TIMESTAMP WITH TIME ZONE
```

---

## 🔧 Edge Functions

### Transactional Emails (Manual Triggers)

#### `send-site-live-notification`
**When:** Admin toggles "Sitio en Vivo" in Control de Sitio tab
**Triggers:** Automatically when `site_live_at` is set to current timestamp
**Location:** `/admin/client-settings/{clientId}` → Control de Sitio tab

#### `send-reservation-email`
**When:** Customer makes/confirms/cancels a reservation
**Needs Integration:** Call from reservation management system
**Parameters:** 
```typescript
{
  reservationId: string,
  action: 'new' | 'confirmed' | 'cancelled'
}
```

#### `send-cancellation-initiated`
**When:** User clicks "Cancel Subscription"
**Triggers:** From `cancel-openpay-subscription` edge function
**Effect:** Sets `cancelled_at`, sends email explaining site stays active until end of billing cycle

#### `send-subscription-ended`
**When:** Subscription end date is reached
**Triggers:** From `deactivate-expired-subscriptions` cron job
**Effect:** Sent when site is actually deactivated, includes reactivation CTA

#### `reactivate-subscription`
**When:** User clicks "Reactivate" button in dashboard
**Location:** `/client/subscription` page
**Effect:** 
- Clears `cancelled_at`
- Sets new `subscription_end_date` (+1 month)
- Reactivates site (`is_deactivated = false`)
- Sends confirmation email

### Automated Campaign Emails (Cron Jobs)

#### `send-reengagement-email`
**Schedule:** Daily at 11:00 AM UTC
**Criteria:**
- `cancelled_at` is 7+ days ago
- `reengagement_sent_at` IS NULL
- `subscription_status` IN ('cancelled', 'expired')
- Processes up to 50 clients per run

**What it does:**
1. Generates unique discount code: `WINBACK30-{clientId}`
2. Creates 30% discount coupon (30 days validity, one-time use)
3. Sends win-back email with reactivation link
4. Updates `reengagement_sent_at` to prevent duplicates
5. Discount applied as one-time charge on first month when resubscribing

#### `deactivate-expired-subscriptions`
**Schedule:** Daily at 2:00 AM UTC
**Criteria:**
- `subscription_status` = 'cancelled'
- `subscription_end_date` <= NOW()
- `is_deactivated` = false

**What it does:**
1. Sets `is_deactivated = true`
2. Changes `subscription_status` to 'expired'
3. Calls `send-subscription-ended` for each deactivated client

---

## 🔄 Customer Lifecycle Flows

### 1. Registration Flow
```
User signs up → send account-created email
User completes form → send registration-complete email
Payment succeeds (with optional coupon) → send payment-success email
  - If coupon provided: one-time discounted charge + trial subscription
  - Next month bills at full price
Admin marks site live → send site-live-notification email
```

### 2. Cancellation & Re-engagement Flow
```
User clicks "Cancel" → 
  - Set cancelled_at timestamp
  - Send cancellation-initiated email
  - Site stays active until subscription_end_date

When subscription_end_date reached →
  - Cron job deactivates site
  - Send subscription-ended email (with reactivation CTA)

7 days after cancelled_at →
  - Send re-engagement email (with 30% discount code)
  - If user resubscribes: discount applied as one-time charge
```

### 3. Reactivation Flow
```
User clicks "Reactivate" button →
  - Call reactivate-subscription edge function
  - Clear cancelled_at
  - Set new subscription_end_date (+1 month from now)
  - Reactivate site (is_deactivated = false)
  - Send reactivation confirmation email
  - Resume billing cycle
```

### 4. Reservation Flow
```
Customer makes reservation → 
  - Send reservation-guest email (confirmation)
  - Send reservation-restaurant email (new booking alert)

Restaurant confirms → send reservation-guest email (confirmed)
Restaurant cancels → send reservation-guest email (cancelled)
```

---

## 🎯 Admin Controls

### Control de Sitio Tab (Admin Only)
**Location:** `/admin/client-settings/{clientId}` → Control de Sitio

**Features:**
1. **Sitio en Vivo Toggle**
   - When turned ON: Sets `site_live_at` timestamp + sends site-live notification email
   - Tracks when site officially launched

2. **Sitio Desactivado Toggle**
   - Manual override to deactivate/reactivate sites
   - Shows subscription status badges

3. **Dashboard Desactivado Toggle**
   - Controls client dashboard access during setup/review

---

## 🔐 Email Configuration

### Sender Addresses
- **Registration/Account:** `info@mirestaurante.online`
- **Payments:** `pagos@mirestaurante.online`
- **Reservations:** `reservas@mirestaurante.online`
- **General:** `info@mirestaurante.online`

### RESEND_API_KEY
Already configured in Supabase secrets. All edge functions use this key.

---

## ⏰ Cron Jobs Schedule

All times in UTC:

| Job | Time | Frequency | Function |
|-----|------|-----------|----------|
| Re-engagement | 11:00 AM | Daily | `send-reengagement-email` |
| Deactivation | 2:00 AM | Daily | `deactivate-expired-subscriptions` |

**Note:** Review requests are handled manually, not via cron.

### Monitoring Cron Jobs

View all scheduled jobs:
```sql
SELECT * FROM cron.job ORDER BY jobname;
```

View job run history:
```sql
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 100;
```

---

## 🎁 Discount Codes

### Signup Coupon Codes
- **Applied at:** Registration (Step 2 - Payment)
- **How it works:** 
  - User enters coupon code during signup
  - System validates coupon via `validate_coupon()` function
  - Creates one-time charge for `(plan_price - discount)`
  - Creates subscription with 30-day trial
  - Next month bills at full price automatically

### Re-engagement Discount
- **Code Format:** `WINBACK30-{clientId}`
- **Discount:** 30%
- **Validity:** 30 days
- **Max Uses:** 1
- **Triggered:** 7 days after `cancelled_at`
- **How it works:** Same as signup - one-time discounted charge + trial subscription

### Coupon Storage
All discount codes are stored in the `coupons` table for validation and usage tracking.

**Note:** Review request discounts are handled manually via WhatsApp/email campaigns.

---

## 🚀 Manual Integration Points

### 1. Site Live Notification
**Status:** ✅ Automated
**Trigger:** Admin toggles "Sitio en Vivo" in Control de Sitio tab
**Implementation:** Automatically called in `src/pages/admin/ClientSettings.tsx`

### 2. Reservation Emails
**Status:** ⚠️ Needs Integration
**Location:** Reservation management system (when reservations are created/updated)
**How to integrate:**
```typescript
await supabase.functions.invoke('send-reservation-email', {
  body: { 
    reservationId: 'uuid-here',
    action: 'new' // or 'confirmed' or 'cancelled'
  }
});
```

---

## 📊 Monitoring & Debugging

### Edge Function Logs

View logs for each function in Supabase Dashboard:
- [send-site-live-notification](https://supabase.com/dashboard/project/ptzcetvcccnojdbzzlyt/functions/send-site-live-notification/logs)
- [send-reservation-email](https://supabase.com/dashboard/project/ptzcetvcccnojdbzzlyt/functions/send-reservation-email/logs)
- [send-reengagement-email](https://supabase.com/dashboard/project/ptzcetvcccnojdbzzlyt/functions/send-reengagement-email/logs)
- [send-cancellation-initiated](https://supabase.com/dashboard/project/ptzcetvcccnojdbzzlyt/functions/send-cancellation-initiated/logs)
- [send-subscription-ended](https://supabase.com/dashboard/project/ptzcetvcccnojdbzzlyt/functions/send-subscription-ended/logs)
- [reactivate-subscription](https://supabase.com/dashboard/project/ptzcetvcccnojdbzzlyt/functions/reactivate-subscription/logs)
- [create-openpay-subscription](https://supabase.com/dashboard/project/ptzcetvcccnojdbzzlyt/functions/create-openpay-subscription/logs)

### Check Email Delivery

Monitor email delivery in [Resend Dashboard](https://resend.com/emails)

### Common Issues

**Emails not sending:**
1. Check RESEND_API_KEY is configured
2. Verify domain is verified in Resend
3. Check edge function logs for errors
4. Verify client has valid email address in database

**Coupon not applying discount:**
1. Check coupon exists in `coupons` table and is active
2. Verify coupon validity dates
3. Check `create-openpay-subscription` logs for discount processing
4. Ensure coupon hasn't exceeded max_uses

**Reactivation not working:**
1. Check client has `openpay_subscription_id`
2. Verify subscription status is 'cancelled' or 'expired'
3. Check edge function logs for OpenPay API errors

---

## 🧪 Testing

### Test Signup with Discount

1. Create a test coupon in admin dashboard
2. Go through signup flow at `/registro`
3. Enter coupon code in Step 2 (Payment)
4. Verify discount shows correctly
5. Complete payment
6. Check `create-openpay-subscription` logs
7. Verify one-time charge and trial subscription created in OpenPay

### Test Re-engagement Manually

```sql
-- Set cancelled_at to 8 days ago for testing
UPDATE clients 
SET cancelled_at = NOW() - INTERVAL '8 days',
    reengagement_sent_at = NULL,
    subscription_status = 'cancelled'
WHERE id = 'your-test-client-id';
```

### Test Cancellation Flow

1. Go to `/client/subscription`
2. Click "Cancelar Suscripción"
3. Verify `cancelled_at` is set
4. Check you received cancellation-initiated email
5. Manually advance `subscription_end_date` to test deactivation email

### Test Reactivation

1. Cancel a subscription first
2. Go to `/client/subscription`
3. Click "Reactivar Suscripción" button
4. Verify site reactivates and confirmation email is sent

---

## 📋 Complete Checklist

### ✅ Completed
- [x] Database schema (all timestamp columns)
- [x] Phase 1 emails (registration, payment, site live)
- [x] Phase 2 emails (domain verification, reservations)
- [x] Phase 3 emails (review request, re-engagement)
- [x] Cancellation flow emails
- [x] Reactivation system with email
- [x] Cron jobs for automated campaigns
- [x] Admin Control de Sitio tab with site live toggle
- [x] Frontend reactivation button
- [x] Integration: site-live notification trigger
- [x] Integration: cancellation email triggers
- [x] Integration: deactivation email triggers

### ⚠️ Needs Integration
- [ ] **Reservation emails**: Integrate `send-reservation-email` calls in your reservation system when bookings are created/updated

---

## 🎨 Email Design

All emails use consistent branding:
- **Colors:** Purple gradient (#667eea to #764ba2)
- **Font:** Arial, Segoe UI
- **Structure:** Header, content boxes, CTAs, footer
- **Mobile:** Responsive table-based layout
- **Language:** Spanish (es-ES locale)

---

## 🔄 Subscription State Machine

```
┌─────────────────────────────────────────────────────────┐
│                    SUBSCRIPTION STATES                   │
└─────────────────────────────────────────────────────────┘

[pending] 
   │
   └─> Payment Success → [active] ✅
          │                  │
          ├─> User Cancels ──┴─> [cancelled] (site still active)
          │                       │
          │                       └─> End Date Reached → [expired] (site deactivated)
          │                                                │
          │                                                └─> User Reactivates → [active] ✅
          │
          └─> Payment Fails → [payment_failed] ⚠️
```

### State Transitions & Emails

| From State | Action | To State | Email Sent | Site Status |
|------------|--------|----------|------------|-------------|
| active | User cancels | cancelled | `send-cancellation-initiated` | Active until end_date |
| cancelled | End date reached | expired | `send-subscription-ended` | Deactivated |
| expired | User reactivates | active | `reactivate-subscription` | Reactivated |
| cancelled | User reactivates | active | `reactivate-subscription` | Reactivated |
| - | 7 days after cancelled_at | - | `send-reengagement-email` | - |

---

## 💡 Key Features

### Duplicate Prevention
All campaign emails use tracking timestamps to prevent sending multiple times:
- `reengagement_sent_at` - Only send once per cancellation

**Note:** Review requests handled manually to maintain personal touch.

### Graceful Degradation
If emails fail to send, the system continues operating:
- Subscription changes still process
- Site status updates correctly
- Errors logged for monitoring

### Batch Processing
Campaign emails process up to 50 clients per cron run to avoid timeouts and rate limits.

---

## 🆘 Support & Troubleshooting

### Email Not Received?

1. **Check Spam Folder**
2. **Verify Email in Database:** `SELECT email FROM clients WHERE id = 'client-id'`
3. **Check Edge Function Logs** (links above)
4. **Verify Resend Delivery:** [Resend Dashboard](https://resend.com/emails)

### Cron Job Not Running?

```sql
-- Check if job exists
SELECT * FROM cron.job WHERE jobname LIKE '%review%' OR jobname LIKE '%reengagement%';

-- Check recent runs
SELECT * FROM cron.job_run_details 
WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname LIKE '%review%')
ORDER BY start_time DESC 
LIMIT 10;
```

### Reactivation Button Not Working?

1. Check client has `openpay_subscription_id` in database
2. Verify `subscription_status` is 'cancelled' or 'expired'
3. Check browser console for errors
4. Check `reactivate-subscription` edge function logs

---

## 📞 Contact

**Email System Issues:** info@mirestaurante.online  
**Technical Support:** Developer team  
**Resend Account:** Check secrets for RESEND_API_KEY

---

## 🎯 Next Steps

The email system is now **fully operational**! 

**Only remaining task:**
- Integrate `send-reservation-email` calls into your reservation booking/management system

**Optional enhancements:**
- Add email preview in admin dashboard
- Create email analytics dashboard
- A/B test email subject lines
- Add SMS notifications via Twilio
