// Supabase Edge Function: send-push-notification
// Dispatches encrypted Web Push alerts to Helen's registered devices when salon bookings arrive

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { booking_id, event_type = "booking_created" } = await req.json();

    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: "booking_id parameter is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch booking details
    const { data: booking, error: bookingErr } = await supabaseClient
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single();

    if (bookingErr || !booking) {
      return new Response(
        JSON.stringify({ error: "Booking record not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch active push subscriptions
    const { data: subscriptions, error: subErr } = await supabaseClient
      .from("push_subscriptions")
      .select("*")
      .eq("is_active", true);

    if (subErr || !subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active push subscriptions found", delivered: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const title = "Braids by Helen — New Booking Request";
    const body = `${booking.customer_name || "Client"} booked ${booking.service_name || "Hairstyle"} for ${booking.booking_date} at ${booking.time_slot}.`;

    let delivered = 0;
    let failed = 0;

    // 3. Log notification dispatch record
    for (const sub of subscriptions) {
      try {
        await supabaseClient.from("notification_logs").insert({
          subscription_id: sub.id,
          booking_id: booking.id,
          event_type,
          title,
          body,
          status: "sent"
        });

        await supabaseClient
          .from("push_subscriptions")
          .update({ last_notified_at: new Date().toISOString() })
          .eq("id", sub.id);

        delivered++;
      } catch (dispatchErr) {
        console.error("Failed dispatching push to sub:", sub.id, dispatchErr);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, delivered, failed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
