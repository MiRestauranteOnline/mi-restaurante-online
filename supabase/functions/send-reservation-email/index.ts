import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { Resend } from 'https://esm.sh/resend@4.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { reservationId, action } = await req.json();

    if (!reservationId) {
      throw new Error('Missing required field: reservationId');
    }

    console.log(`Processing reservation email for ${reservationId}, action: ${action || 'new'}`);

    // Get reservation details
    const { data: reservation, error: reservationError } = await supabaseClient
      .from('reservations')
      .select('*, clients(*)')
      .eq('id', reservationId)
      .single();

    if (reservationError || !reservation) {
      throw new Error('Reservation not found');
    }

    const client = reservation.clients;
    
    // Format date for display
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' } as const;
    const formattedDate = new Date(reservation.reservation_date + 'T00:00:00').toLocaleDateString('es-ES', dateOptions);

    // Determine which emails to send based on action
    const sendGuestEmail = action === 'new' || action === 'confirmed' || action === 'cancelled';
    const sendRestaurantEmail = action === 'new';

    // Build guest email HTML
    if (sendGuestEmail) {
      try {
        const statusText = 
          reservation.status === 'confirmed' ? 'confirmada' :
          reservation.status === 'cancelled' ? 'cancelada' :
          'recibida';
        
        const statusEmoji = 
          reservation.status === 'confirmed' ? '✅' :
          reservation.status === 'cancelled' ? '❌' :
          '⏳';

        let guestHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; padding: 40px 20px;">
      <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; margin: 0 0 30px; line-height: 1.3;">
        ${statusEmoji} Reserva ${statusText}
      </h1>
      
      <p style="color: #484848; font-size: 16px; line-height: 26px; margin: 16px 0;">
        Hola ${reservation.customer_name},
      </p>`;

        if (reservation.status === 'confirmed') {
          guestHtml += `
      <p style="color: #484848; font-size: 16px; line-height: 26px; margin: 16px 0;">
        ¡Excelentes noticias! Tu reserva en <strong>${client.restaurant_name}</strong> ha sido confirmada.
      </p>`;
        } else if (reservation.status === 'pending') {
          guestHtml += `
      <p style="color: #484848; font-size: 16px; line-height: 26px; margin: 16px 0;">
        Hemos recibido tu solicitud de reserva en <strong>${client.restaurant_name}</strong>. Te confirmaremos pronto.
      </p>`;
        } else if (reservation.status === 'cancelled') {
          guestHtml += `
      <p style="color: #484848; font-size: 16px; line-height: 26px; margin: 16px 0;">
        Lamentablemente, tu reserva en <strong>${client.restaurant_name}</strong> ha sido cancelada.
      </p>`;
          if (reservation.decline_reason) {
            guestHtml += `
      <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <p style="color: #78350f; font-size: 16px; line-height: 24px; margin: 0;">
          <strong>Motivo:</strong> ${reservation.decline_reason}
        </p>
      </div>`;
          }
          guestHtml += `
      <p style="color: #484848; font-size: 16px; line-height: 26px; margin: 16px 0;">
        Por favor, contacta con el restaurante para más información o para hacer una nueva reserva en otra fecha.
      </p>`;
        }

        if (reservation.status !== 'cancelled') {
          guestHtml += `
      <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <p style="color: #166534; font-size: 18px; font-weight: bold; margin: 0 0 12px 0;">Detalles de la Reserva</p>
        <p style="color: #166534; font-size: 16px; line-height: 24px; margin: 0;">
          <strong>Fecha:</strong> ${formattedDate}<br>
          <strong>Hora:</strong> ${reservation.reservation_time}<br>
          <strong>Número de personas:</strong> ${reservation.party_size}<br>
          ${reservation.special_requests ? `<strong>Solicitudes especiales:</strong> ${reservation.special_requests}<br>` : ''}
        </p>
      </div>`;
        }

        guestHtml += `
      <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 30px 0;">
      
      <p style="color: #484848; font-size: 16px; line-height: 26px; margin: 16px 0;">
        <strong>Información de contacto:</strong>
      </p>
      <p style="color: #484848; font-size: 16px; line-height: 26px; margin: 16px 0;">
        📍 ${client.address}<br>
        📞 <a href="tel:${client.phone}" style="color: #e11d48; text-decoration: underline;">${client.phone}</a><br>
        ✉️ <a href="mailto:${client.email}" style="color: #e11d48; text-decoration: underline;">${client.email}</a>
      </p>`;

        if (reservation.status === 'confirmed') {
          guestHtml += `
      <p style="color: #484848; font-size: 16px; line-height: 26px; margin: 16px 0;">
        ¡Esperamos verte pronto! Si necesitas modificar o cancelar tu reserva, por favor contacta con nosotros.
      </p>`;
        }

        guestHtml += `
      <p style="color: #898989; font-size: 14px; line-height: 22px; margin-top: 32px; text-align: center;">
        <strong>${client.restaurant_name}</strong><br>
        ${client.address}
      </p>
    </div>
  </div>
</body>
</html>`;

        await resend.emails.send({
          from: 'MiRestaurante Reservas <reservas@mirestaurante.online>',
          to: [reservation.customer_email],
          subject: 
            reservation.status === 'confirmed' 
              ? `Reserva confirmada en ${client.restaurant_name}`
              : reservation.status === 'cancelled'
              ? `Reserva cancelada - ${client.restaurant_name}`
              : `Reserva recibida en ${client.restaurant_name}`,
          html: guestHtml,
        });

        console.log('Guest email sent successfully');
      } catch (emailError) {
        console.error('Error sending guest email:', emailError);
      }
    }

    // Build restaurant email HTML
    if (sendRestaurantEmail) {
      try {
        // Use reservations_email if set, otherwise use general email
        const restaurantEmail = client.reservations_email || client.email;

        const restaurantHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; padding: 40px 20px;">
      <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; margin: 0 0 30px; line-height: 1.3;">
        📋 Nueva Reserva Recibida
      </h1>
      
      <p style="color: #484848; font-size: 16px; line-height: 26px; margin: 16px 0;">
        Hola ${client.restaurant_name},
      </p>

      <p style="color: #484848; font-size: 16px; line-height: 26px; margin: 16px 0;">
        Has recibido una nueva solicitud de reserva. Por favor, revisa los detalles y confirma o rechaza la reserva desde tu panel.
      </p>

      <div style="background-color: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <p style="color: #1e3a8a; font-size: 18px; font-weight: bold; margin: 0 0 12px 0;">Detalles de la Reserva</p>
        <p style="color: #1e3a8a; font-size: 16px; line-height: 24px; margin: 0;">
          <strong>Cliente:</strong> ${reservation.customer_name}<br>
          <strong>Email:</strong> <a href="mailto:${reservation.customer_email}" style="color: #1e3a8a; text-decoration: underline;">${reservation.customer_email}</a><br>
          <strong>Teléfono:</strong> <a href="tel:${reservation.customer_phone}" style="color: #1e3a8a; text-decoration: underline;">${reservation.customer_phone}</a><br>
          <strong>Fecha:</strong> ${formattedDate}<br>
          <strong>Hora:</strong> ${reservation.reservation_time}<br>
          <strong>Número de personas:</strong> ${reservation.party_size}<br>
          ${reservation.special_requests ? `<strong>Solicitudes especiales:</strong> ${reservation.special_requests}<br>` : ''}
        </p>
      </div>

      <div style="margin: 32px 0; text-align: center;">
        <a href="https://mirestaurante.online/client/${client.id}/reservations" style="background-color: #e11d48; border-radius: 6px; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
          Ver y Gestionar Reserva
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 30px 0;">

      <p style="color: #484848; font-size: 16px; line-height: 26px; margin: 16px 0;">
        <strong>Importante:</strong> Responde lo antes posible para confirmar o rechazar esta reserva. Una respuesta rápida mejora la experiencia de tus clientes.
      </p>

      <p style="color: #484848; font-size: 16px; line-height: 26px; margin: 16px 0;">
        Puedes gestionar todas tus reservas desde el panel de control.
      </p>

      <p style="color: #898989; font-size: 14px; line-height: 22px; margin-top: 32px; text-align: center;">
        <a href="https://mirestaurante.online" target="_blank" style="color: #e11d48; text-decoration: underline;">MiRestaurante.online</a><br>
        Panel de Gestión de Reservas
      </p>
    </div>
  </div>
</body>
</html>`;

        await resend.emails.send({
          from: 'MiRestaurante Reservas <reservas@mirestaurante.online>',
          to: [restaurantEmail],
          subject: `Nueva reserva de ${reservation.customer_name} - ${reservation.party_size} personas`,
          html: restaurantHtml,
        });

        console.log('Restaurant email sent successfully');
      } catch (emailError) {
        console.error('Error sending restaurant email:', emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Emails sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-reservation-email:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
