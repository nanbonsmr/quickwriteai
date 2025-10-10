import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, paddle-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const signature = req.headers.get('paddle-signature');
    const rawBody = await req.text();
    
    console.log('Received Paddle webhook:', {
      hasSignature: !!signature,
      bodyLength: rawBody.length,
      timestamp: new Date().toISOString()
    });

    // Verify webhook signature
    const webhookSecret = Deno.env.get('PADDLE_WEBHOOK_SECRET');
    if (webhookSecret && signature) {
      const parts = signature.split(';');
      const timeStamp = parts.find(p => p.startsWith('ts='))?.substring(3);
      const receivedSignature = parts.find(p => p.startsWith('h1='))?.substring(3);
      
      if (timeStamp && receivedSignature) {
        const payload = `${timeStamp}:${rawBody}`;
        const hmac = createHmac('sha256', webhookSecret);
        hmac.update(payload);
        const expectedSignature = hmac.digest('hex');
        
        if (expectedSignature !== receivedSignature) {
          console.error('Invalid webhook signature');
          throw new Error('Invalid webhook signature');
        }
      }
    }

    const event = JSON.parse(rawBody);
    console.log('Paddle event type:', event.event_type);

    // Handle transaction.completed event
    if (event.event_type === 'transaction.completed') {
      const customData = event.data?.custom_data;
      const userId = customData?.user_id;
      const planId = customData?.plan_id;

      if (!userId || !planId) {
        console.error('Missing user_id or plan_id in custom_data');
        throw new Error('Missing required custom data');
      }

      console.log('Processing completed transaction:', { userId, planId });

      // Plan configurations
      const planConfigs: Record<string, { words_limit: number; subscription_plan: string }> = {
        basic: { words_limit: 10000, subscription_plan: 'basic' },
        pro: { words_limit: 50000, subscription_plan: 'pro' },
        enterprise: { words_limit: 200000, subscription_plan: 'enterprise' }
      };

      const config = planConfigs[planId];
      if (!config) {
        throw new Error(`Invalid plan ID: ${planId}`);
      }

      // Calculate subscription dates
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);

      console.log('Updating user subscription:', {
        userId,
        plan: config.subscription_plan,
        wordsLimit: config.words_limit
      });

      // Update user profile with new subscription
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          subscription_plan: config.subscription_plan,
          words_limit: config.words_limit,
          words_used: 0,
          subscription_start_date: now.toISOString(),
          subscription_end_date: endDate.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw new Error(`Failed to update subscription: ${updateError.message}`);
      }

      console.log('Subscription updated successfully');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Webhook processing failed' 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
