
"use client";

import { useState } from 'react';
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
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const target = e.target as typeof e.target & {
      displayName: { value: string };
      email: { value: string };
      password: { value: string };
    };
    const displayName = target.displayName.value;
    const email = target.email.value;
    const password = target.password.value;

    try {
      // 1. Create user with Firebase Auth on the client
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Update the user's profile with the display name
      await updateProfile(userCredential.user, { displayName });

      // 3. Get the ID token
      const idToken = await userCredential.user.getIdToken();

      // 4. Call the backend's register endpoint to create user in Firestore
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`, // Sending token for verification
        },
        body: JSON.stringify({ email, password, displayName }),
      });

      if (res.ok) {
        toast({
          title: "Account Created!",
          description: "You have been successfully registered. Please log in.",
        });
        router.push('/login');
      } else {
        const errorData = await res.json();
        console.error("Backend registration failed", errorData);
        toast({
            variant: "destructive",
            title: "Registration Failed",
            description: errorData.message || "An unexpected error occurred.",
        });
      }
    } catch (error: any) {
      console.error("Error during sign-up: ", error);
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: error.message || "Failed to create account.",
      });
    } finally {
        setIsLoading(false);
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
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>
            Enter your details below to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input id="displayName" type="text" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p>Already have an account? <a href="/login" className="text-primary hover:underline">Sign in</a></p>
        </CardFooter>
      </Card>
    </div>
  );
}
