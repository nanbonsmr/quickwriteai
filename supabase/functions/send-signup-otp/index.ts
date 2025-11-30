import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OtpRequest {
  email: string;
  displayName: string;
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-signup-otp function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, displayName }: OtpRequest = await req.json();
    console.log("Processing OTP request for email:", email);

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if email is already registered
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.email === email);
    
    if (userExists) {
      console.log("Email already registered:", email);
      return new Response(
        JSON.stringify({ error: "This email is already registered. Please sign in instead." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate OTP
    const otpCode = generateOtp();
    console.log("Generated OTP for email:", email);

    // Delete any existing OTPs for this email
    await supabase
      .from("signup_otps")
      .delete()
      .eq("email", email);

    // Store OTP in database
    const { error: insertError } = await supabase
      .from("signup_otps")
      .insert({
        email,
        otp_code: otpCode,
        display_name: displayName,
      });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate verification code" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send OTP via email
    const emailResponse = await resend.emails.send({
      from: "QuickWrite AI <onboarding@resend.dev>",
      to: [email],
      subject: "Your Verification Code - QuickWrite AI",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .otp-box { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to QuickWrite AI!</h1>
            </div>
            <p>Hi ${displayName || "there"},</p>
            <p>Thank you for signing up! Please use the following verification code to complete your registration:</p>
            <div class="otp-box">${otpCode}</div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <div class="footer">
              <p>© 2024 QuickWrite AI. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Verification code sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-signup-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
