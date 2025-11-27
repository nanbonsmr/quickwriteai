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

    const { planId, userId } = await req.json();

    console.log('Creating Paddle checkout:', { 
      planId, 
      userId,
      timestamp: new Date().toISOString()
    });

    if (!userId || !planId) {
      throw new Error('Missing required fields');
    }

    const paddleApiKey = Deno.env.get('PADDLE_API_KEY');
    
    if (!paddleApiKey) {
      throw new Error('Paddle API key not configured');
    }

    // Get user email from Supabase
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
    
    if (userError || !userData) {
      throw new Error('Failed to get user data');
    }

    // Map plan IDs to Paddle price IDs (you'll need to replace these with your actual Paddle price IDs)
    const priceMap: Record<string, string> = {
      'basic': Deno.env.get('PADDLE_BASIC_PRICE_ID') || 'pri_basic',
      'pro': Deno.env.get('PADDLE_PRO_PRICE_ID') || 'pri_pro',
      'enterprise': Deno.env.get('PADDLE_ENTERPRISE_PRICE_ID') || 'pri_enterprise'
    };

    const priceId = priceMap[planId];
    if (!priceId) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }

    // Return the client token and price ID for Paddle.js to handle checkout
    const clientToken = Deno.env.get('PADDLE_CLIENT_TOKEN');

    return new Response(
      JSON.stringify({ 
        success: true,
        clientToken,
        priceId,
        customData: {
          user_id: userId,
          plan_id: planId
        },
        customerEmail: userData.user.email
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
