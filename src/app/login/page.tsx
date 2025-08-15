
"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PiggyBank } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" className="h-4 w-4 mr-2"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-5.12 1.9-4.4 0-7.99-3.59-7.99-7.99s3.59-7.99 7.99-7.99c2.4 0 4.13.87 5.2 1.82l2.75-2.75C19.02 1.39 16.14 0 12.48 0 5.88 0 0 5.88 0 12.48s5.88 12.48 12.48 12.48c7.34 0 12.04-5.02 12.04-12.04 0-.76-.07-1.52-.2-2.28H12.48z"/></svg>
)

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
    };
    const email = target.email.value;
    const password = target.password.value;

    try {
      // 1. Sign in with Firebase on the client
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Get the ID token
      const idToken = await userCredential.user.getIdToken();

      // 3. Send the token to your backend to verify and create a session
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (res.ok) {
        console.log("Login successful, redirecting to dashboard...");
        router.push('/dashboard');
      } else {
        const errorData = await res.json();
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: errorData.message || "Please check your credentials.",
        });
      }
    } catch (error) {
      console.error("Error during email/password sign-in: ", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please check your credentials.",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (res.ok) {
        console.log("Login successful, redirecting to dashboard...");
        router.push('/dashboard');
      } else {
        const errorData = await res.json();
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: errorData.message || "Google Sign-In failed.",
        });
      }
    } catch (error) {
      console.error("Error during Google sign-in: ", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Google Sign-In failed.",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-primary text-primary-foreground rounded-full p-3">
              <PiggyBank className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Claim It!</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
            <GoogleIcon />
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p>Don't have an account? <a href="/signup" className="text-primary hover:underline">Sign up</a></p>
        </CardFooter>
      </Card>
    </div>
  );
}
