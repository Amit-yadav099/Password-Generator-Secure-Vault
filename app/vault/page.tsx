'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import PasswordGenerator from '@/components/passwordGenerator';
import VaultItemForm from '@/components/VaultItemForm';
import VaultItemCard from '@/components/VaultItemCard';
import { Search, LogOut, Shield, RefreshCw, Key } from 'lucide-react';
import { toast } from 'sonner';
import { VaultEncryption } from '@/lib/encryption';
import { PasswordManager } from '@/lib/passwordManager';
import { ThemeToggle } from '@/components/theme-toggle';

interface VaultItem {
  id: string;
  title: string;
  username?: string;
  password: string;
  website?: string;
  notes?: string;
  createdAt: string;
}

export default function VaultPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Load vault items function with useCallback to fix dependency issue
  const loadVaultItems = useCallback(async (email: string) => {
    const password = PasswordManager.getPassword();
    if (!password) {
      toast.error('Authentication required');
      router.push('/auth');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Not authenticated');
      return;
    }

    try {
      setIsRefreshing(true);
      const response = await fetch('/api/vault/items', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load vault items');
      }

      const data = await response.json();
      
      if (data.success && data.items) {
        const decryptedItems: VaultItem[] = [];
        let decryptionErrors = 0;
        
        for (const item of data.items) {
          try {
            const decryptedItem: VaultItem = {
              id: item.id,
              title: VaultEncryption.decryptData(item.encryptedTitle, email, password),
              username: item.encryptedUsername ? 
                VaultEncryption.decryptData(item.encryptedUsername, email, password) : undefined,
              password: VaultEncryption.decryptData(item.encryptedPassword, email, password),
              website: item.encryptedWebsite ? 
                VaultEncryption.decryptData(item.encryptedWebsite, email, password) : undefined,
              notes: item.encryptedNotes ? 
                VaultEncryption.decryptData(item.encryptedNotes, email, password) : undefined,
              createdAt: item.createdAt
            };
            decryptedItems.push(decryptedItem);
          } catch (decryptError) {
            console.error(`Failed to decrypt item ${item.id}:`, decryptError);
            decryptionErrors++;
          }
        }
        
        setVaultItems(decryptedItems);
        if (decryptionErrors > 0) {
          toast.warning(`${decryptionErrors} items could not be decrypted`);
        }
      }
    } catch (error: unknown) {
      console.error('Error loading vault items:', error);
      const message = error instanceof Error ? error.message : 'Failed to load vault items';
      toast.error(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router]);

  // Check authentication and get user info
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedEmail = sessionStorage.getItem('userEmail');
    const hasPassword = PasswordManager.hasPassword();
    
    if (!token) {
      console.log('No auth token found');
      router.push('/auth');
      return;
    }

    if (storedEmail && hasPassword) {
      loadVaultItems(storedEmail);
    } else {
      console.log('Password not available, redirecting to auth');
      PasswordManager.clearPassword();
      router.push('/auth');
    }
  }, [router, loadVaultItems]);

  const handleSaveItem = async (itemData: Omit<VaultItem, 'id' | 'createdAt'>) => {
    const email = sessionStorage.getItem('userEmail');
    const password = PasswordManager.getPassword();
    
    if (!email || !password) {
      toast.error('Authentication required');
      router.push('/auth');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Not authenticated');
      return;
    }

    try {
      // Encrypt all data before sending to server
      const encryptedData = {
        encryptedTitle: VaultEncryption.encryptData(itemData.title, email, password),
        encryptedUsername: itemData.username ? 
          VaultEncryption.encryptData(itemData.username, email, password) : undefined,
        encryptedPassword: VaultEncryption.encryptData(itemData.password, email, password),
        encryptedWebsite: itemData.website ? 
          VaultEncryption.encryptData(itemData.website, email, password) : undefined,
        encryptedNotes: itemData.notes ? 
          VaultEncryption.encryptData(itemData.notes, email, password) : undefined,
      };

      const response = await fetch('/api/vault/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(encryptedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save item');
      }

      const data = await response.json();
      
      if (data.success) {
        const newItem: VaultItem = {
          ...itemData,
          id: data.item.id,
          createdAt: data.item.createdAt
        };
        
        setVaultItems(prev => [newItem, ...prev]);
        toast.success('Item saved to vault!');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save item';
      console.error('Error saving item:', error);
      toast.error(message);
    }
  };

  const handleEditItem = async (id: string, updates: Partial<VaultItem>) => {
    const email = sessionStorage.getItem('userEmail');
    const password = PasswordManager.getPassword();
    
    if (!email || !password) {
      toast.error('Authentication required');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Not authenticated');
      return;
    }

    try {
      // Encrypt updated data before sending to server
      const encryptedUpdates: Record<string, string | null> = {};
      
      if (updates.title !== undefined) {
        encryptedUpdates.encryptedTitle = VaultEncryption.encryptData(updates.title, email, password);
      }
      if (updates.username !== undefined) {
        encryptedUpdates.encryptedUsername = updates.username 
          ? VaultEncryption.encryptData(updates.username, email, password)
          : null;
      }
      if (updates.password !== undefined) {
        encryptedUpdates.encryptedPassword = VaultEncryption.encryptData(updates.password, email, password);
      }
      if (updates.website !== undefined) {
        encryptedUpdates.encryptedWebsite = updates.website 
          ? VaultEncryption.encryptData(updates.website, email, password)
          : null;
      }
      if (updates.notes !== undefined) {
        encryptedUpdates.encryptedNotes = updates.notes 
          ? VaultEncryption.encryptData(updates.notes, email, password)
          : null;
      }

      const response = await fetch(`/api/vault/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(encryptedUpdates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update item');
      }

      setVaultItems(prev => 
        prev.map(item => item.id === id ? { ...item, ...updates } : item)
      );
    } catch (error: unknown) {
      console.error('Error updating item:', error);
      const message = error instanceof Error ? error.message : 'Failed to update item';
      throw new Error(message);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Not authenticated');
      return;
    }

    try {
      const response = await fetch(`/api/vault/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete item');
      }

      setVaultItems(prev => prev.filter(item => item.id !== id));
    } catch (error: unknown) {
      console.error('Error deleting item:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete item';
      throw new Error(message);
    }
  };

  const handleGeneratePassword = () => {
    return generatedPassword;
  };

  const handleRefresh = () => {
    const email = sessionStorage.getItem('userEmail');
    if (email) {
      loadVaultItems(email);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('userEmail');
    PasswordManager.clearPassword();
    router.push('/auth');
  };

  const filteredItems = vaultItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.website?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading your secure vault...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Secure Vault
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  End-to-end encrypted with your credentials
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Key className="h-4 w-4" />
                <span>Stable Encryption</span>
              </div>
              <ThemeToggle />
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <PasswordGenerator onPasswordGenerate={setGeneratedPassword} />
            <VaultItemForm 
              onSave={handleSaveItem}
              onGeneratePassword={handleGeneratePassword}
            />
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Your Encrypted Vault</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      {vaultItems.length} secure items • Stable encryption key
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search vault..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {vaultItems.length === 0 ? 'Your vault is empty' : 'No matching items found'}
                      </h3>
                      <p className="text-slate-500">
                        {vaultItems.length === 0 
                          ? 'Add your first password using the form on the left'
                          : 'Try adjusting your search terms'
                        }
                      </p>
                    </div>
                  ) : (
                    filteredItems.map(item => (
                      <VaultItemCard
                        key={item.id}
                        item={item}
                        onEdit={handleEditItem}
                        onDelete={handleDeleteItem}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}