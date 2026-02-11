import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IVendiWelcome } from "@/components/IVendiWelcome";
import logo from "@/assets/logo.png";

const Auth = () => {
  const { signIn, signUp, enterDemoMode } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ email: "", password: "", confirmPassword: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginData.email, loginData.password);
    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(signupData.email, signupData.password);
    if (error) {
      toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We've sent a confirmation link to verify your account." });
    }
    setLoading(false);
  };

  const handleDemoBypass = useCallback(() => setShowWelcome(true), []);
  const handleWelcomeComplete = useCallback(() => {
    setShowWelcome(false);
    enterDemoMode();
  }, [enterDemoMode]);

  if (showWelcome) return <IVendiWelcome onComplete={handleWelcomeComplete} />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <img src={logo} alt="Logo" className="h-12 w-auto" />
          <h1 className="text-xl font-semibold text-foreground">Compliance Dashboard</h1>
          <p className="text-sm text-muted-foreground text-center">Sign in to access your dealer compliance portfolio</p>
        </div>

        <Tabs defaultValue="login" className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" required value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" required value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" required value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" type="password" required minLength={6} value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <Input id="signup-confirm" type="password" required value={signupData.confirmPassword} onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account…" : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or</span></div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleDemoBypass}>
          View Demo
        </Button>
      </div>
    </div>
  );
};

export default Auth;
