'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
// import CryptoJS from 'crypto-js';
import { PasswordManager } from '@/lib/passwordManager';
import { VaultEncryption } from '@/lib/encryption';

export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

  try {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'signup failed');

    // Test encryption before proceeding
    const encryptionWorks = VaultEncryption.testEncryption(email, password);
    if (!encryptionWorks) {
      throw new Error('Encryption setup failed. Please try again.');
    }

    toast.success('signed up successfully!');
    
    // Store credentials securely
    localStorage.setItem('authToken', data.token);
    sessionStorage.setItem('userEmail', email);
    PasswordManager.storePassword(password); // Securely store password
    
    router.push('/vault');
  } catch (error: any) {
    toast.error(error.message || 'Failed to signed up');
  } finally {
    setLoading(false);
  }
};

const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Login failed');

    // Test encryption before proceeding
    const encryptionWorks = VaultEncryption.testEncryption(email, password);
    if (!encryptionWorks) {
      throw new Error('Encryption setup failed. Please try again.');
    }

    toast.success('Logged in successfully!');
    
    // Store credentials securely
    localStorage.setItem('authToken', data.token);
    sessionStorage.setItem('userEmail', email);
    PasswordManager.storePassword(password); // Securely store password
    
    router.push('/vault');
  } catch (error: any) {
    toast.error(error.message || 'Failed to sign in');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-slate-900 dark:bg-slate-100 rounded-lg">
              <Lock className="h-8 w-8 text-white dark:text-slate-900" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Secure Vault</CardTitle>
          <CardDescription>
            Generate strong passwords and store them securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 6 characters
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}