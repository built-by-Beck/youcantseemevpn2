'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Chrome, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { auth } from '@/lib/firebase';
import { firestore } from '@/lib/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  GithubAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useState } from 'react';

export default function AuthModal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleAuthError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleSocialLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider | GithubAuthProvider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists in Firestore, create if not
      const userRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email, // Email might be null for some providers
          membershipTier: 'none', // Default tier
          isActive: false, // Default status
        });
      }
      toast({
        title: 'Login Successful',
        description: 'Welcome back! You have been logged in.',
      });
      setError('');
    } catch (error: any) {
      handleAuthError(error.message);
    }
  };

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    handleSocialLogin(provider);
  };

  // You can add similar handlers for other providers like Facebook and GitHub

  const SocialButtons = () => (
    // ... existing SocialButtons component
    <>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={handleGoogleLogin}>
          <Chrome className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button variant="outline" onClick={() => alert('GitHub login not implemented yet')}>
          <Code className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>
    </>
  );

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        membershipTier: 'none', // Default tier
        isActive: false, // Default status
      });
      toast({
        title: 'Sign Up Successful',
        description: 'Welcome! Your account has been created.',
      });
      setError('');
    } catch (error: any) {
      handleAuthError(error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Login Successful',
        description: 'Welcome back! You have been logged in.',
      });
      setError('');
    } catch (error: any) {
      handleAuthError(error.message);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Login / Sign Up</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome Back</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your account.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email-login">Email</Label>
                <Input
                  id="email-login"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password-login">Password</Label>
                <Input
                  id="password-login"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full mt-2"
                onClick={handleLogin}
              >
                Login
              </Button>
              <SocialButtons />
            </div>
          </TabsContent>
          <TabsContent value="signup">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input
                  id="password-signup"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full mt-2"
                onClick={handleSignUp}
              >
                Create Account
              </Button>
              <SocialButtons />
            </div>
          </TabsContent>
          {error && <p className="text-red-500 text-center">{error}</p>}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
