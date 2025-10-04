# Timezone and Country Configuration Setup Guide

## Overview
This document explains how timezone and country settings work in the restaurant management system and how to apply them to template sites for proper SEO and functionality.

## Database Fields

Three new fields have been added to the `clients` table:

1. **`timezone`** (text): IANA timezone identifier (e.g., "America/Lima", "America/New_York")
   - Default: "America/Lima"
   - Used for: Proper date/time handling in reservations and schedules

2. **`country_code`** (text): ISO 3166-1 alpha-2 country code (e.g., "PE", "US", "ES")
   - Default: "PE" (Peru)
   - Used for: SEO, regional settings, and Google Business Profile

3. **`locale`** (text): Locale for language/region (e.g., "es-PE", "en-US")
   - Default: "es-PE"
   - Used for: Language-specific formatting and content

## Configuration in Dashboard

### Admin Dashboard
Admins can set these fields in: **Client Settings** > **General Tab**

### Client Dashboard  
Clients can update their own settings in: **Settings** > **General Tab**

Both interfaces provide:
- **Country dropdown**: Select with flag emojis and country names
- **Timezone dropdown**: Select with UTC offset information
- The locale is automatically set based on the selected country

## How Timezone Conversion Works

### Problem Solved
Previously, dates were stored ambiguously, causing discrepancies:
- User selects October 20 at 7:00 PM in Lima timezone
- System stores it as UTC without conversion
- Dashboard shows October 19 at 12:00 AM (incorrect)

### Solution Implemented
All dates are now:
1. **Stored in UTC** in the database (best practice)
2. **Converted to client timezone** when displaying
3. **Converted from client timezone to UTC** when saving

### Reservation Flow Example

**User creates reservation:**
```
User inputs: October 20, 2025, 19:00 (Lima time)
↓
System converts to UTC: October 21, 2025, 00:00 UTC
↓
Stored in database as UTC
```

**Dashboard displays reservation:**
```
Database has: October 21, 2025, 00:00 UTC
↓
System converts using client timezone (America/Lima)
↓
Shows: October 20, 2025, 19:00
```

## Template Site Integration

### 1. Fetch Client Data with Timezone

When loading client data in your template, make sure to fetch the timezone:

```typescript
const { data: client } = await supabase
  .from('clients')
  .select('*, timezone, country_code, locale')
  .eq('subdomain', subdomain)
  .single();

const timezone = client?.timezone || 'America/Lima';
const countryCode = client?.country_code || 'PE';
const locale = client?.locale || 'es-PE';
```

### 2. SEO Meta Tags

Add these meta tags to your template's `<head>` section:

```html
<!-- Geo Location Meta Tags -->
<meta name="geo.region" content="{countryCode}" />
<meta name="geo.placename" content="{client.address}" />

<!-- If you have coordinates: -->
<meta name="geo.position" content="{lat};{lng}" />
<meta name="ICBM" content="{lat}, {lng}" />

<!-- Language and Region -->
<meta httpEquiv="content-language" content="{locale}" />
<link rel="alternate" hrefLang="{locale}" href="{currentUrl}" />

<!-- Open Graph -->
<meta property="og:locale" content="{locale}" />
<meta property="og:type" content="restaurant" />
<meta property="og:country-name" content="{countryName}" />
```

### 3. Structured Data (JSON-LD)

Add LocalBusiness schema with geographic information:

```typescript
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": client.restaurant_name,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": client.address,
    "addressCountry": countryCode,
    "addressLocality": "Lima" // Extract from address if possible
  },
  "geo": client.coordinates ? {
    "@type": "GeoCoordinates",
    "latitude": client.coordinates.lat,
    "longitude": client.coordinates.lng
  } : undefined,
  "telephone": `${client.phone_country_code}${client.phone}`,
  "openingHoursSpecification": [
    // Generate from client.opening_hours
  ],
  "servesCuisine": "Peruvian", // Customize based on restaurant type
  "priceRange": "$$", // Customize based on restaurant
  "inLanguage": locale
};
```

```html
<script type="application/ld+json">
  {JSON.stringify(structuredData)}
</script>
```

### 4. Reservation Form Integration

When creating a reservation form, use the timezone utilities:

```typescript
import { combineDateTimeToUtc } from '@/lib/timezone';
import { supabase } from '@/integrations/supabase/client';

// When user submits reservation form
const handleReservation = async (date: string, time: string, timezone: string) => {
  // Combine date and time, convert to UTC
  const utcDateTime = combineDateTimeToUtc(date, time, timezone);
  
  // Store in database as UTC
  const { error } = await supabase
    .from('reservations')
    .insert({
      client_id: clientId,
      reservation_date: format(utcDateTime, 'yyyy-MM-dd'),
      reservation_time: format(utcDateTime, 'HH:mm:ss'),
      // ... other fields
    });
};
```

### 5. Displaying Reservations

When showing reservations in the dashboard:

```typescript
import { extractDateTimeFromUtc } from '@/lib/timezone';
import { parseISO } from 'date-fns';

// When fetching reservations
const displayReservation = (reservation: any, timezone: string) => {
  // Combine database date and time into UTC Date
  const utcDate = parseISO(`${reservation.reservation_date}T${reservation.reservation_time}Z`);
  
  // Convert to client timezone
  const { date, time } = extractDateTimeFromUtc(utcDate, timezone);
  
  return {
    displayDate: date,  // e.g., "2025-10-20"
    displayTime: time   // e.g., "19:00"
  };
};
```

## Google Business Profile Integration

The country code and timezone are particularly important for:

1. **Google My Business**: Ensures your restaurant appears in local search results
2. **Google Maps**: Proper placement on maps
3. **Google Search Console**: Regional targeting settings
4. **Opening Hours**: Displayed in correct local time

### Recommended Setup

1. Set country code matching Google Business Profile location
2. Set timezone matching physical restaurant location
3. Keep opening hours in local time (system handles conversion)

## Testing Checklist

- [ ] Timezone dropdown shows in both admin and client dashboards
- [ ] Country dropdown shows in both admin and client dashboards
- [ ] Locale auto-updates when country changes
- [ ] Reservations created show correct date/time in dashboard
- [ ] Past reservations are cleaned up based on client timezone
- [ ] Template site includes SEO meta tags with country info
- [ ] Structured data includes geo coordinates and country
- [ ] Reservation form converts times correctly to UTC
- [ ] Dashboard displays reservations in client timezone

## Troubleshooting

**Q: Dates still showing incorrectly?**
- Verify the client has the correct timezone set in Settings
- Check that you're using the timezone conversion utilities
- Ensure dates are stored as UTC in the database

**Q: Different timezone showing in different parts of the app?**
- Make sure you're fetching and passing the client's timezone consistently
- Use the timezone from the `clients` table, not hardcoded values

**Q: SEO not picking up location?**
- Verify all meta tags are present in the template
- Check that structured data validates at schema.org
- Ensure coordinates are accurate if provided

## Code Examples

Check these files for reference implementations:
- `src/lib/timezone.ts` - Timezone conversion utilities
- `src/data/timezones.ts` - Timezone options
- `src/data/countries.ts` - Country options
- `src/pages/client/ClientSettings.tsx` - Client settings UI
- `src/pages/admin/ClientSettings.tsx` - Admin settings UI
