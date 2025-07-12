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

export default function AuthModal() {
  const { toast } = useToast();

  const handleAuthAction = (action: 'Login' | 'Sign Up') => {
    toast({
      title: `${action} Successful`,
      description: `Welcome! You have successfully ${action.toLowerCase() === 'login' ? 'logged in' : 'signed up'}.`,
    });
  };

  const SocialButtons = () => (
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
        <Button variant="outline">
          <Chrome className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button variant="outline">
          <Code className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>
    </>
  );

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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password-login">Password</Label>
                <Input id="password-login" type="password" />
              </div>
              <Button
                type="submit"
                className="w-full mt-2"
                onClick={() => handleAuthAction('Login')}
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input id="password-signup" type="password" />
              </div>
              <Button
                type="submit"
                className="w-full mt-2"
                onClick={() => handleAuthAction('Sign Up')}
              >
                Create Account
              </Button>
              <SocialButtons />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
