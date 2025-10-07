// hooks/useVaultStorage.ts
'use client';

import { useState, useEffect } from 'react';

interface VaultItem {
  id: string;
  title: string;
  username?: string;
  password: string;
  website?: string;
  notes?: string;
  createdAt: string;
}

export default function useVaultStorage () {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);

  // Load from localStorage on initial render only
  useEffect(() => {
    const savedItems = localStorage.getItem('vaultItems');
    if (savedItems) {
      try {
        setVaultItems(JSON.parse(savedItems));
      } catch (error) {
        console.error('Error parsing vault items:', error);
        setVaultItems([]); // Reset to empty array on error
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Save to localStorage whenever vaultItems change
  useEffect(() => {
    localStorage.setItem('vaultItems', JSON.stringify(vaultItems));
  }, [vaultItems]); // This runs every time vaultItems changes

  const handleSaveItem = (itemData: Omit<VaultItem, 'id' | 'createdAt'>) => {
    const newItem: VaultItem = {
      ...itemData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setVaultItems(prev => [newItem, ...prev]);
  };

  const handleEditItem = (id: string, updates: Partial<VaultItem>) => {
    setVaultItems(prev => 
      prev.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  };

  const handleDeleteItem = (id: string) => {
    setVaultItems(prev => prev.filter(item => item.id !== id));
  };

  return {
    vaultItems,
    handleSaveItem,
    handleEditItem,
    handleDeleteItem
  };
};
