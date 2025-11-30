import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { PenTool, Sparkles, Mail, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in."
      });
      navigate('/app');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          display_name: displayName,
        }
      }
    });
    
    if (error) {
      setError(error.message);
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setSignupEmail(email);
      setOtpStep(true);
      toast({
        title: "Verification code sent!",
        description: "Please check your email for the 6-digit code."
      });
    }
    
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await supabase.auth.verifyOtp({
      email: signupEmail,
      token: otp,
      type: 'signup'
    });

    if (error) {
      setError(error.message);
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Email verified!",
        description: "Your account has been created successfully."
      });
      navigate('/app');
    }

    setLoading(false);
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: signupEmail
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Code resent!",
        description: "Please check your email for the new verification code."
      });
    }

    setLoading(false);
  };

  const handleBackToSignup = () => {
    setOtpStep(false);
    setOtp('');
    setError('');
  };

  if (otpStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <div className="w-full max-w-md">
          <Button 
            variant="ghost" 
            onClick={handleBackToSignup} 
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign Up
          </Button>

          <Card className="border-elegant shadow-elegant">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Verify Your Email</CardTitle>
              <CardDescription>
                We sent a 6-digit code to <span className="font-medium text-foreground">{signupEmail}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button 
                onClick={handleVerifyOtp} 
                className="w-full" 
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn't receive the code?
                </p>
                <Button 
                  variant="link" 
                  onClick={handleResendOtp} 
                  disabled={loading}
                  className="text-primary"
                >
                  Resend Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')} 
          className="mb-6"
        >
          ← Return to Home Page
        </Button>
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <PenTool className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">QuickWrite AI</h1>
          </div>
          <p className="text-muted-foreground">
            Generate amazing content with AI-powered writing tools
          </p>
        </div>

        <Card className="border-elegant shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Get Started
            </CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Display Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
