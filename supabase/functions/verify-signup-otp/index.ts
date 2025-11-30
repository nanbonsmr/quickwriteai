import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  email: string;
  otp: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("verify-signup-otp function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp, password }: VerifyRequest = await req.json();
    console.log("Verifying OTP for email:", email);

    if (!email || !otp || !password) {
      return new Response(
        JSON.stringify({ error: "Email, OTP, and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the OTP record
    const { data: otpRecord, error: fetchError } = await supabase
      .from("signup_otps")
      .select("*")
      .eq("email", email)
      .eq("otp_code", otp)
      .eq("verified", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (fetchError || !otpRecord) {
      console.log("Invalid or expired OTP for email:", email);
      return new Response(
        JSON.stringify({ error: "Invalid or expired verification code" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("OTP verified, creating user account");

    // Mark OTP as verified
    await supabase
      .from("signup_otps")
      .update({ verified: true })
      .eq("id", otpRecord.id);

    // Create the user with admin API (already verified)
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: otpRecord.display_name,
      },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("User created successfully:", userData.user?.id);

    // Clean up the OTP record
    await supabase
      .from("signup_otps")
      .delete()
      .eq("id", otpRecord.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Account created successfully",
        userId: userData.user?.id 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in verify-signup-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
