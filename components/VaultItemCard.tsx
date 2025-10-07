'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Eye, EyeOff, Edit, Trash2, Check, X, Save, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { ClipboardManager } from '@/lib/clipboard';

interface VaultItem {
  id: string;
  title: string;
  username?: string;
  password: string;
  website?: string;
  notes?: string;
  createdAt: string;
}

interface VaultItemCardProps {
  item: VaultItem;
  onEdit: (id: string, updates: Partial<VaultItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function VaultItemCard({ item, onEdit, onDelete }: VaultItemCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState(item);
  const [copied, setCopied] = useState<string | null>(null);
  const [copyTimer, setCopyTimer] = useState<number | null>(null);

  // Reset edit data when item changes
  useEffect(() => {
    setEditData(item);
  }, [item]);

  // Timer countdown effect
  useEffect(() => {
    if (copyTimer !== null && copyTimer > 0) {
      const timer = setTimeout(() => {
        setCopyTimer(prev => prev !== null ? prev - 1 : null);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (copyTimer === 0) {
      setCopied(null);
      setCopyTimer(null);
    }
  }, [copyTimer]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      const success = await ClipboardManager.copyWithAutoClear(text, type, 15000);
      
      if (success) {
        setCopied(type);
        setCopyTimer(15); // 15 seconds countdown
        toast.success(`${type} copied to clipboard! Auto-clearing in 15 seconds.`);
      } else {
        throw new Error('Copy failed');
      }
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleSave = async () => {
    if (!editData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsLoading(true);
    try {
      await onEdit(item.id, editData);
      setIsEditing(false);
      toast.success('Item updated successfully!');
    } catch (error) {
      toast.error('Failed to update item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(item);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      await onDelete(item.id);
      toast.success('Item deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete item');
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Title"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Username/Email</label>
            <Input
              value={editData.username || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Username"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={editData.password}
                  onChange={(e) => setEditData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Password"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Website</label>
            <Input
              value={editData.website || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://example.com"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={editData.notes || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
              rows={2}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleSave} 
              size="sm" 
              disabled={isLoading || !editData.title.trim()}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-1" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
            <Button 
              onClick={handleCancel} 
              variant="outline" 
              size="sm" 
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{item.title}</CardTitle>
            {item.website && (
              <CardDescription className="truncate">
                {item.website}
              </CardDescription>
            )}
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.username && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium w-20 shrink-0">Username:</span>
            <div className="flex-1 flex gap-2">
              <Input
                value={item.username}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(item.username!, 'username')}
                disabled={isLoading}
                className="relative"
              >
                {copied === 'username' ? (
                  <div className="flex items-center">
                    <Check className="h-4 w-4" />
                    {copyTimer !== null && (
                      <span className="absolute -top-1 -right-1 text-xs bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                        {copyTimer}
                      </span>
                    )}
                  </div>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium w-20 shrink-0">Password:</span>
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showPassword ? "text" : "password"}
                value={item.password}
                readOnly
                className="font-mono text-sm pr-20"
              />
              <div className="absolute right-0 top-0 flex">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(item.password, 'password')}
                  disabled={isLoading}
                  className="relative"
                >
                  {copied === 'password' ? (
                    <div className="flex items-center">
                      <Check className="h-4 w-4" />
                      {copyTimer !== null && (
                        <span className="absolute -top-1 -right-1 text-xs bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                          {copyTimer}
                        </span>
                      )}
                    </div>
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {item.notes && (
          <div>
            <span className="text-sm font-medium">Notes:</span>
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
              {item.notes}
            </p>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Created: {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}