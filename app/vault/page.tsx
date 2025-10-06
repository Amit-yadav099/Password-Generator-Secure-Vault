'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import PasswordGenerator from '@/components/PasswordGenerator';
import VaultItemForm from '@/components/VaultItemForm';
import VaultItemCard from '@/components/VaultItemCard';
import { Search, LogOut, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface VaultItem {
  id: string;
  title: string;
  username?: string;
  password: string;
  website?: string;
  notes?: string;
  createdAt: string;
}

// Custom hook for vault persistence
const useVaultStorage = () => {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);

  // Load from localStorage on initial render
  useEffect(() => {
    const savedItems = localStorage.getItem('vaultItems');
    if (savedItems) {
      try {
        setVaultItems(JSON.parse(savedItems));
      } catch (error) {
        console.error('Error parsing vault items:', error);
      }
    }
  }, []);

  // Save to localStorage whenever vaultItems change
  const updateVaultItems = (newItems: VaultItem[]) => {
    setVaultItems(newItems);
    localStorage.setItem('vaultItems', JSON.stringify(newItems));
  };

  const handleSaveItem = (itemData: Omit<VaultItem, 'id' | 'createdAt'>) => {
    const newItem: VaultItem = {
      ...itemData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    updateVaultItems([newItem, ...vaultItems]);
    toast.success('Item saved to vault!');
  };

  const handleEditItem = (id: string, updates: Partial<VaultItem>) => {
    const updatedItems = vaultItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    updateVaultItems(updatedItems);
    toast.success('Item updated!');
  };

  const handleDeleteItem = (id: string) => {
    const filteredItems = vaultItems.filter(item => item.id !== id);
    updateVaultItems(filteredItems);
    toast.success('Item deleted!');
  };

  return {
    vaultItems,
    handleSaveItem,
    handleEditItem,
    handleDeleteItem
  };
};

export default function VaultPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  // Use the persistent storage hook
  const { 
    vaultItems, 
    handleSaveItem, 
    handleEditItem, 
    handleDeleteItem 
  } = useVaultStorage();

  // Check authentication - FIXED: All hooks declared at top level
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    console.log('Token found:', token);
    if (!token) {
      console.log('Token is not present');
      router.push('/auth');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleGeneratePassword = () => {
    return generatedPassword;
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('vaultItems'); // Optional: clear vault data on logout
    router.push('/auth');
  };

  const filteredItems = vaultItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.website?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
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
                  Your passwords are safe with us
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Generator & Add Form */}
          <div className="lg:col-span-1 space-y-6">
            <PasswordGenerator onPasswordGenerate={setGeneratedPassword} />
            <VaultItemForm 
              onSave={handleSaveItem}
              onGeneratePassword={handleGeneratePassword}
            />
          </div>

          {/* Right Column - Vault Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Your Vault</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      {vaultItems.length} saved items
                    </p>
                  </div>
                  
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

                <div className="space-y-4">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No items found</h3>
                      <p className="text-slate-500">
                        {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first password'}
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