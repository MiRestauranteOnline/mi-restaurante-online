# Multi-Location Field Update Guide

## Overview
The signup form and dashboard now support multiple restaurant locations. This guide explains how to update your template project to work with the new field structure.

## Database Schema Changes

### Before
```sql
-- clients table
address TEXT -- Single address string
```

### After
```sql
-- clients table  
address TEXT -- Now stores JSON array of addresses OR single string (backward compatible)
```

**Important:** The `address` field is now **backward compatible**:
- **Old data**: Single strings like `"Av. Principal 123"` still work
- **New data**: JSON arrays like `["Av. Principal 123", "Calle Secundaria 456"]`

## Code Changes Required

### 1. Update SignupData Interface

**File:** `src/pages/Signup.tsx`

```typescript
export interface SignupData {
  email: string;
  password: string;
  restaurantName: string;
  subdomain: string;
  phone: string;
  phone_country_code?: string;
  whatsapp_country_code?: string;
  address: string | string[]; // ✅ Now accepts string OR array
  ruc?: string;
  razonSocial?: string;
  // ... rest of fields
}
```

### 2. Update Validation Schema

**File:** `src/components/signup/SignupStep1.tsx`

```typescript
const signupSchema = z.object({
  // ... other fields
  address: z.array(z.string()).min(1, "Debes agregar al menos una ubicación")
    .refine((addresses) => addresses[0] && addresses[0].trim().length >= 5, {
      message: "La primera dirección debe tener al menos 5 caracteres"
    }), // ✅ Validates array with first item mandatory
  // ... rest of fields
});
```

### 3. Update Form Default Values

**File:** `src/components/signup/SignupStep1.tsx`

```typescript
const form = useForm<SignupFormData>({
  resolver: zodResolver(signupSchema),
  defaultValues: {
    // ... other fields
    address: Array.isArray(initialData.address) 
      ? initialData.address 
      : initialData.address 
        ? [initialData.address] 
        : [""], // ✅ Convert to array
    // ... rest of fields
  }
});
```

### 4. Replace Address Input with MultiLocationInput

**File:** `src/components/signup/SignupStep1.tsx`

```typescript
import { MultiLocationInput } from "@/components/MultiLocationInput";

// Inside your form JSX, replace the address FormField with:
<FormField
  control={form.control}
  name="address"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Dirección</FormLabel>
      <FormControl>
        <MultiLocationInput
          locations={Array.isArray(field.value) ? field.value : [field.value || ""]}
          onChange={field.onChange}
          placeholder="Ej: Av. Principal 123, Distrito, Ciudad"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 5. Update Dashboard Settings

**File:** `src/pages/dashboard/RestaurantSettings.tsx`

**Schema Update:**
```typescript
const settingsSchema = z.object({
  // ... other fields
  address: z.array(z.string()).optional(), // ✅ Changed to array
  // ... rest of fields
});
```

**Default Values Update:**
```typescript
const form = useForm<SettingsFormData>({
  resolver: zodResolver(settingsSchema),
  defaultValues: {
    // ... other fields
    address: [], // ✅ Empty array
    // ... rest of fields
  },
});
```

**Data Fetching Update:**
```typescript
// In fetchRestaurantData function:
form.reset({
  // ... other fields
  address: Array.isArray(client.address) 
    ? client.address 
    : client.address 
      ? [client.address] 
      : [], // ✅ Convert to array
  // ... rest of fields
});
```

**Form Submission Update:**
```typescript
const onSubmit = async (data: SettingsFormData) => {
  setSaving(true);
  try {
    const { error } = await supabase
      .from('clients')
      .update({
        // ... other fields
        address: data.address, // ✅ Save as array
        // ... rest of fields
      })
      .eq('id', selectedClientId);
    
    // ... rest of submission logic
  }
};
```

**Replace Address Input:**
```typescript
import { MultiLocationInput } from "@/components/MultiLocationInput";

// Replace the address FormField in your form JSX:
<FormField
  control={form.control}
  name="address"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Dirección</FormLabel>
      <FormControl>
        <MultiLocationInput
          locations={field.value || []}
          onChange={field.onChange}
          placeholder="Av. Principal 123, Distrito, Ciudad"
          useTextarea={true}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Edge Function Updates

### File: `supabase/functions/signup-client/index.ts`

```typescript
// When inserting into database:
const { data: newClient, error: insertError } = await supabaseAdmin
  .from('clients')
  .insert({
    // ... other fields
    address: Array.isArray(address) ? address : [address], // ✅ Ensure array
    // ... rest of fields
  });
```

## Testing Checklist

- [ ] Test signup with single location
- [ ] Test signup with multiple locations  
- [ ] Test adding/removing locations in signup form
- [ ] Test dashboard settings with existing single address (should convert to array)
- [ ] Test dashboard settings with multiple addresses
- [ ] Test saving multiple locations in dashboard
- [ ] Verify backward compatibility with existing string addresses in database

## Migration Strategy

No database migration is needed! The field is **backward compatible**:

1. Old records with string addresses will be auto-converted to arrays in the UI
2. New records will be saved as JSON arrays
3. When old records are updated, they'll be converted to arrays on save

## Component API

### MultiLocationInput Props

```typescript
interface MultiLocationInputProps {
  locations: string[];           // Array of location strings
  onChange: (locations: string[]) => void;  // Callback when locations change
  placeholder?: string;          // Placeholder text
  useTextarea?: boolean;         // Use textarea (true) or input (false)
}
```

## Notes

- **First location mandatory:** The first location field cannot be removed and must be filled
- **Secondary locations optional:** Additional locations (2nd, 3rd, etc.) are optional and can be removed
- **Add button:** Shows below all location fields
- **Remove button:** Only shows for locations after the first one (index > 0)
- **Backward compatible:** Old single-string addresses automatically converted to arrays
