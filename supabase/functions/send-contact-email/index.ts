import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactEmailRequest = await req.json();

    // Validate input
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "QuickWrite AI <onboarding@resend.dev>",
      to: [email],
      subject: "We received your message!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Thank you for contacting us, ${name}!</h1>
          <p style="color: #666;">We have received your message and will get back to you as soon as possible.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; font-size: 16px;">Your message:</h2>
            <p style="color: #666;"><strong>Subject:</strong> ${subject}</p>
            <p style="color: #666;">${message}</p>
          </div>
          
          <p style="color: #666;">
            If you have any urgent concerns, please don't hesitate to reach out to us directly at support@quickwriteai.com
          </p>
          
          <p style="color: #666;">
            Best regards,<br>
            The QuickWrite AI Team
          </p>
        </div>
      `,
    });

    // Send notification email to support team
    const supportEmailResponse = await resend.emails.send({
      from: "QuickWrite AI Contact Form <onboarding@resend.dev>",
      to: ["support@quickwriteai.com"], // Replace with your actual support email
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Contact Form Submission</h1>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #666;"><strong>Name:</strong> ${name}</p>
            <p style="color: #666;"><strong>Email:</strong> ${email}</p>
            <p style="color: #666;"><strong>Subject:</strong> ${subject}</p>
            <p style="color: #666;"><strong>Message:</strong></p>
            <p style="color: #666;">${message}</p>
          </div>
          
          <p style="color: #666;">
            Please respond to this inquiry as soon as possible.
          </p>
        </div>
      `,
      replyTo: email,
    });

    console.log("Emails sent successfully:", { userEmailResponse, supportEmailResponse });

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
