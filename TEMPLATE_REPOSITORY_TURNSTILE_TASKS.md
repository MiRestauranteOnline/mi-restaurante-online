# Template Repository: Turnstile Implementation Tasks

**Repository**: https://github.com/MiRestauranteOnline/restaurant-template-1

## ⚠️ CRITICAL: All Forms Need Turnstile

This document outlines exactly which files in the template repository need Turnstile protection added.

## 🔍 How to Find Forms

Forms typically have:
- `handleSubmit` or `onSubmit` functions
- `supabase.functions.invoke()` calls
- Input fields collecting user data

## 📝 Forms Requiring Implementation

### 1. Reservation Forms (HIGHEST PRIORITY)

**Location**: Search for `ReservationBooking` components

Likely files:
- `src/components/ReservationBookingRustic.tsx`
- `src/components/ReservationBooking.tsx`
- `src/components/ReservationBookingMinimalistic.tsx`
- Any other reservation form variants

**Implementation**:
```tsx
import { ClientTurnstileWidget } from '@/components/ClientTurnstileWidget';
import { useClient } from '@/contexts/ClientContext';

const [captchaToken, setCaptchaToken] = useState<string | null>(null);
const { client } = useClient();

// In your form JSX, before submit button:
<ClientTurnstileWidget
  clientId={client?.id || ''}
  onVerify={(token) => setCaptchaToken(token)}
  onError={() => {
    toast.error('Error en verificación de seguridad');
    setCaptchaToken(null);
  }}
  onExpire={() => {
    toast.warning('Verificación expirada');
    setCaptchaToken(null);
  }}
/>

// In handleSubmit:
if (!captchaToken) {
  toast.error('Por favor completa la verificación de seguridad');
  return;
}

// Include in API call:
const response = await supabase.functions.invoke('your-function', {
  body: {
    // ... other data
    turnstile_token: captchaToken,
    client_id: client?.id
  }
});
```

### 2. ReclamacionesForm (Complaint Book)

**Location**: `src/components/ReclamacionesForm.tsx` or similar

This is a legal requirement form in Peru, definitely needs protection.

**Implementation**: Same as reservation forms above

### 3. Newsletter Subscription Forms

**Location**: Look in:
- Footer components (`Footer.tsx`, `FooterRustic.tsx`, etc.)
- Newsletter sections
- Email subscription components

**Implementation**: Use `size="compact"` for footer forms:
```tsx
<ClientTurnstileWidget
  clientId={client?.id || ''}
  size="compact"
  onVerify={(token) => setCaptchaToken(token)}
/>
```

### 4. Contact Forms (If Form-Based)

**Location**: Check Contact components

**Note**: Many contact sections just have WhatsApp/phone buttons (no form needed). Only implement if there's an actual form with inputs.

## 🔧 Edge Functions That Need Updates

For each form that submits to an edge function, that function needs to:

1. Accept `turnstile_token` and `client_id` in the request body
2. Fetch the client's `turnstile_secret_key` from the database
3. Validate the token with Cloudflare
4. Return error if validation fails

### Example Edge Function Update

```typescript
// At the start of your edge function:
const { turnstile_token, client_id, ...otherData } = await req.json();

if (!turnstile_token || !client_id) {
  return new Response(
    JSON.stringify({ error: 'Faltan campos de seguridad' }),
    { status: 400, headers: corsHeaders }
  );
}

// Fetch client's secret key
const { data: client } = await supabase
  .from('clients')
  .select('turnstile_secret_key')
  .eq('id', client_id)
  .single();

if (!client?.turnstile_secret_key) {
  return new Response(
    JSON.stringify({ error: 'Configuración de seguridad no encontrada' }),
    { status: 500, headers: corsHeaders }
  );
}

// Validate token
const validation = await validateTurnstileToken(
  turnstile_token,
  client.turnstile_secret_key
);

if (!validation.success) {
  return new Response(
    JSON.stringify({ error: 'Verificación de seguridad fallida' }),
    { status: 403, headers: corsHeaders }
  );
}

// Continue with normal processing...
```

## ✅ Testing Checklist (Per Form)

For each form you implement:

- [ ] Widget displays correctly on desktop
- [ ] Widget displays correctly on mobile
- [ ] Submit button is disabled until verification
- [ ] Clear error message if trying to submit without verification
- [ ] Token is sent to backend
- [ ] Backend validation works
- [ ] Proper error handling if validation fails
- [ ] Success flow works end-to-end

## 🚀 Implementation Order

1. **First**: Add Turnstile script to HTML (if not already there)
2. **Second**: Implement in ReservationBooking forms (all variants)
3. **Third**: Implement in ReclamacionesForm
4. **Fourth**: Find and implement in newsletter forms
5. **Last**: Any other forms discovered

## 📞 Questions to Answer While Implementing

While going through the template, document:

1. **Forms Found**:
   - [ ] List exact file paths of all forms
   - [ ] Note which edge functions they call
   
2. **Edge Functions to Update**:
   - [ ] List all edge functions that receive form data
   - [ ] Note which ones already validate or need validation added

3. **Testing Results**:
   - [ ] Document any issues found
   - [ ] Note any UX improvements needed

## 🔗 Resources

- Main guide: `TURNSTILE_IMPLEMENTATION_GUIDE.md` (this repo)
- Admin monitoring: `/admin/cloudflare-monitoring` (this repo)
- Cloudflare docs: https://developers.cloudflare.com/turnstile/
