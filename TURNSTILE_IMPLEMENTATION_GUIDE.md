# Guía de Implementación: Cloudflare Turnstile Protection

## 📋 Resumen

Esta guía explica cómo implementar la protección Cloudflare Turnstile en formularios de sitios web de clientes. Cada cliente tiene su propio widget Turnstile único creado automáticamente durante el registro.

## 🎯 ¿Qué es Turnstile?

Turnstile es el CAPTCHA de Cloudflare que:
- ✅ Protege formularios contra bots y spam
- ✅ Es invisible para usuarios reales (sin clicks en imágenes)
- ✅ Gratuito hasta 1M de requests/mes
- ✅ Mejor UX que reCAPTCHA tradicional
- ✅ Integración automática con nuestro sistema

## 🔑 Información Clave

Cada cliente tiene 3 campos únicos en la tabla `clients`:
- `turnstile_site_key` - Clave pública (frontend)
- `turnstile_secret_key` - Clave privada (backend)
- `turnstile_widget_id` - ID del widget en Cloudflare

Estos se crean automáticamente al registrar un nuevo cliente.

---

## 🚀 Implementación Frontend

### Paso 1: Importar el Componente

```tsx
import { ClientTurnstileWidget } from '@/components/ClientTurnstileWidget';
import { useState } from 'react';
import { toast } from 'sonner';
```

### Paso 2: Agregar Estado para el Token

```tsx
function ContactForm({ clientId }: { clientId: string }) {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptchaWarning, setShowCaptchaWarning] = useState(false);
  
  // ... resto del componente
}
```

### Paso 3: Agregar el Widget al Formulario

Coloca el widget **antes del botón de envío**:

```tsx
<form onSubmit={handleSubmit}>
  {/* Campos del formulario */}
  <Input name="name" placeholder="Nombre" />
  <Input name="email" type="email" placeholder="Email" />
  <Textarea name="message" placeholder="Mensaje" />
  
  {/* Advertencia si no se completó */}
  {showCaptchaWarning && (
    <Alert variant="destructive">
      <Shield className="h-4 w-4" />
      <AlertDescription>
        Por favor, completa la verificación de seguridad.
      </AlertDescription>
    </Alert>
  )}
  
  {/* Widget Turnstile */}
  <ClientTurnstileWidget
    clientId={clientId}
    onVerify={(token) => {
      setCaptchaToken(token);
      setShowCaptchaWarning(false);
    }}
    onError={() => {
      setCaptchaToken(null);
      toast.error('Error en verificación de seguridad');
    }}
    onExpire={() => {
      setCaptchaToken(null);
      toast.warning('La verificación expiró. Por favor, complétala nuevamente.');
    }}
    theme="light" // o "dark" o "auto"
    size="normal" // o "compact"
  />
  
  <Button type="submit" disabled={!captchaToken}>
    Enviar Formulario
  </Button>
</form>
```

### Paso 4: Validar el Token Antes de Enviar

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validar que se completó el CAPTCHA
  if (!captchaToken) {
    setShowCaptchaWarning(true);
    toast.error('Por favor completa la verificación de seguridad');
    return;
  }
  
  // Recopilar datos del formulario
  const formData = new FormData(e.currentTarget as HTMLFormElement);
  
  // Enviar al backend con el token
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
        turnstile_token: captchaToken, // ✅ Incluir el token
        client_id: clientId
      })
    });
    
    if (!response.ok) throw new Error('Error al enviar');
    
    toast.success('Formulario enviado exitosamente');
    setCaptchaToken(null); // Reset para nuevo envío
  } catch (error) {
    toast.error('Error al enviar el formulario');
  }
};
```

---

## 🔒 Validación Backend (Edge Functions)

### Función de Validación Reutilizable

```typescript
interface TurnstileValidationResult {
  success: boolean;
  error?: string;
  challenge_ts?: string;
  hostname?: string;
}

async function validateTurnstileToken(
  token: string,
  secretKey: string,
  remoteIp?: string
): Promise<TurnstileValidationResult> {
  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
          remoteip: remoteIp, // Opcional pero recomendado
        }),
      }
    );

    const data = await response.json();
    
    if (!data.success) {
      console.error('Turnstile validation failed:', data['error-codes']);
      return {
        success: false,
        error: data['error-codes']?.join(', ') || 'Validation failed'
      };
    }

    return {
      success: true,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
    };
  } catch (error) {
    console.error('Error validating Turnstile token:', error);
    return {
      success: false,
      error: 'Failed to validate token'
    };
  }
}
```

### Ejemplo de Edge Function Completo

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      name, 
      email, 
      message, 
      turnstile_token, 
      client_id 
    } = await req.json();

    // 1. Validar campos requeridos
    if (!name || !email || !message || !turnstile_token || !client_id) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Obtener Secret Key del cliente
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('turnstile_secret_key, restaurant_name')
      .eq('id', client_id)
      .single();

    if (clientError || !client?.turnstile_secret_key) {
      console.error('Client not found or missing Turnstile config:', clientError);
      return new Response(
        JSON.stringify({ error: 'Configuración de seguridad no encontrada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Validar el token Turnstile
    const clientIp = req.headers.get('CF-Connecting-IP') || 
                     req.headers.get('X-Forwarded-For')?.split(',')[0];

    const validation = await validateTurnstileToken(
      turnstile_token,
      client.turnstile_secret_key,
      clientIp
    );

    if (!validation.success) {
      console.error('Turnstile validation failed:', validation.error);
      return new Response(
        JSON.stringify({ 
          error: 'Verificación de seguridad fallida',
          details: validation.error 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. ✅ Token validado - Procesar el formulario
    console.log('Turnstile validation successful for client:', client_id);

    // Aquí va tu lógica de negocio (guardar en BD, enviar email, etc.)
    // ... tu código ...

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Formulario procesado exitosamente' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

// Función de validación (incluir en el mismo archivo)
async function validateTurnstileToken(
  token: string,
  secretKey: string,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
          remoteip: remoteIp,
        }),
      }
    );

    const data = await response.json();
    
    if (!data.success) {
      return {
        success: false,
        error: data['error-codes']?.join(', ') || 'Validation failed'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error validating Turnstile token:', error);
    return { success: false, error: 'Failed to validate token' };
  }
}

serve(handler);
```

---

## 📝 Formularios Recomendados para Proteger

### 1. **Formulario de Contacto** (Alta prioridad)
```tsx
<ClientTurnstileWidget clientId={clientId} onVerify={setCaptchaToken} />
```

### 2. **Formulario de Reservas** (Alta prioridad)
```tsx
<ClientTurnstileWidget clientId={clientId} onVerify={setCaptchaToken} />
```

### 3. **Formulario de Newsletter/Suscripción**
```tsx
<ClientTurnstileWidget clientId={clientId} size="compact" onVerify={setCaptchaToken} />
```

### 4. **Formulario de Libro de Reclamaciones** (Perú)
```tsx
<ClientTurnstileWidget clientId={clientId} onVerify={setCaptchaToken} />
```

### 5. **Comentarios/Reviews**
```tsx
<ClientTurnstileWidget clientId={clientId} theme="auto" onVerify={setCaptchaToken} />
```

---

## ⚙️ Opciones de Configuración

### Temas Disponibles
```tsx
theme="light"  // Fondo claro
theme="dark"   // Fondo oscuro
theme="auto"   // Se adapta al sistema
```

### Tamaños Disponibles
```tsx
size="normal"   // Tamaño estándar (300x65px)
size="compact"  // Tamaño reducido (150x140px) - mejor para mobile
```

### Callbacks
```tsx
onVerify={(token) => {
  // Token recibido - usuario verificado
  console.log('Verificado:', token);
}}

onError={() => {
  // Error durante la verificación
  console.error('Error en Turnstile');
}}

onExpire={() => {
  // Token expiró (después de ~5 minutos)
  console.warn('Token expirado');
}}
```

---

## 🔍 Solución de Problemas

### Widget no se muestra
1. Verificar que el script de Turnstile esté cargado en `index.html`:
```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

2. Verificar que el cliente tenga `turnstile_site_key` en la BD:
```sql
SELECT id, restaurant_name, turnstile_site_key 
FROM clients 
WHERE turnstile_site_key IS NULL;
```

### Error "Site key not found"
- El cliente no tiene widget Turnstile creado
- Ir a Admin → Cloudflare → Turnstile Protection
- Usar botón "Reintentar" para crear el widget

### Token de verificación no válido
- Verificar que estés usando la `turnstile_secret_key` correcta del cliente
- El token expira después de ~5 minutos
- No reutilices tokens ya validados

### Widget aparece en inglés
- Turnstile detecta automáticamente el idioma del navegador
- Para forzar español, el usuario debe tener `es` o `es-*` en su navegador

---

## 📊 Límites y Cuotas

- **Free Plan**: 1,000,000 verificaciones/mes
- **Sin costo adicional** para uso normal
- **Renovación**: Se resetea el 1ro de cada mes
- **Monitoreo**: Disponible en Cloudflare Dashboard

---

## 🎯 Checklist de Implementación

- [ ] Script de Turnstile agregado a `index.html`
- [ ] `ClientTurnstileWidget` importado en el componente
- [ ] Estado `captchaToken` creado
- [ ] Widget agregado antes del botón submit
- [ ] Botón submit deshabilitado sin token
- [ ] Validación del token incluida en `handleSubmit`
- [ ] Token enviado al backend en el request
- [ ] Backend valida token con `turnstile_secret_key`
- [ ] Mensajes de error claros para el usuario
- [ ] Tested en desktop y móvil

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs en Cloudflare Dashboard
2. Verificar Edge Function logs en Supabase
3. Contactar al equipo de desarrollo

---

## 🔗 Referencias

- [Cloudflare Turnstile Docs](https://developers.cloudflare.com/turnstile/)
- [Validation API](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Best Practices](https://developers.cloudflare.com/turnstile/best-practices/)
