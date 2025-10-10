import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { planId, userId, amount, discount } = await req.json();

    console.log('Creating Paddle checkout:', { 
      planId, 
      userId, 
      amount,
      discount,
      timestamp: new Date().toISOString()
    });

    if (!userId || !planId || !amount) {
      throw new Error('Missing required fields');
    }

    const paddleApiKey = Deno.env.get('PADDLE_API_KEY');
    if (!paddleApiKey) {
      throw new Error('Paddle API key not configured');
    }

    // Map plan IDs to Paddle price IDs (you need to create these in Paddle dashboard)
    const priceMap: Record<string, string> = {
      'basic': 'pri_basic_monthly',     // Replace with your actual Paddle price ID
      'pro': 'pri_pro_monthly',         // Replace with your actual Paddle price ID
      'enterprise': 'pri_enterprise_monthly' // Replace with your actual Paddle price ID
    };

    const priceId = priceMap[planId];
    if (!priceId) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }

    // Create a transaction in Paddle
    const paddleResponse = await fetch('https://sandbox-api.paddle.com/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paddleApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [{
          price_id: priceId,
          quantity: 1
        }],
        custom_data: {
          user_id: userId,
          plan_id: planId,
          discount_percent: discount
        }
      })
    });

    if (!paddleResponse.ok) {
      const errorData = await paddleResponse.json();
      console.error('Paddle API error:', errorData);
      throw new Error(`Paddle API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const paddleData = await paddleResponse.json();
    console.log('Paddle transaction created:', paddleData);

    return new Response(
      JSON.stringify({ 
        success: true,
        priceId,
        transactionId: paddleData.data?.id
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Checkout creation error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to create checkout' 
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
