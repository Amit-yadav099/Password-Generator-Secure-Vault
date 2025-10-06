'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Eye, EyeOff, RefreshCw } from 'lucide-react';

interface VaultItemFormProps {
  onSave: (item: any) => void;
  onGeneratePassword: () => string;
}

export default function VaultItemForm({ onSave, onGeneratePassword }: VaultItemFormProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      title: titleRef.current?.value || '',
      username: usernameRef.current?.value || '',
      password: passwordRef.current?.value || '',
      website: websiteRef.current?.value || '',
      notes: notesRef.current?.value || ''
    };

    if (!formData.title) {
      alert('Title is required');
      return;
    }
    
    onSave(formData);
    
    // Reset form
    if (titleRef.current) titleRef.current.value = '';
    if (usernameRef.current) usernameRef.current.value = '';
    if (passwordRef.current) passwordRef.current.value = '';
    if (websiteRef.current) websiteRef.current.value = '';
    if (notesRef.current) notesRef.current.value = '';
  };

  const handleGeneratePassword = () => {
    const newPassword = onGeneratePassword();
    if (passwordRef.current) {
      passwordRef.current.value = newPassword;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Item</CardTitle>
        <CardDescription>Save a new password or secure note</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              ref={titleRef}
              id="title"
              placeholder="e.g., Gmail account"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username/Email</Label>
            <Input
              ref={usernameRef}
              id="username"
              placeholder="username@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={passwordRef}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password or generate one"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGeneratePassword}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input
              ref={websiteRef}
              id="website"
              type="url"
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              ref={notesRef}
              id="notes"
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save to Vault
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}