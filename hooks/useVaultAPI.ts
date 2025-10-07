'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { encryptData, decryptData } from '@/utils/encryption';

interface VaultItem {
  id: string;
  title: string;
  username?: string;
  password: string;
  website?: string;
  notes?: string;
  createdAt: string;
}

interface EncryptedVaultItem {
  _id: string;
  encryptedTitle: string;
  encryptedUsername?: string;
  encryptedPassword: string;
  encryptedWebsite?: string;
  encryptedNotes?: string;
  createdAt: string;
}

export const useVaultAPI = () => {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getEncryptionKey = () => {
    return sessionStorage.getItem('encryptionKey');
  };

  const fetchItems = async () => {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      throw new Error('No auth token');
    }

    const res = await fetch('/api/vault/items', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch vault items');
    }

    const encryptedItems: EncryptedVaultItem[] = await res.json();
    const key = getEncryptionKey();
    if (!key) {
      throw new Error('No encryption key');
    }

    // Decrypt each item
    const decryptedItems: VaultItem[] = encryptedItems.map(item => ({
      id: item._id,
      title: decryptData(item.encryptedTitle, key),
      username: item.encryptedUsername ? decryptData(item.encryptedUsername, key) : undefined,
      password: decryptData(item.encryptedPassword, key),
      website: item.encryptedWebsite ? decryptData(item.encryptedWebsite, key) : undefined,
      notes: item.encryptedNotes ? decryptData(item.encryptedNotes, key) : undefined,
      createdAt: item.createdAt,
    }));

    setVaultItems(decryptedItems);
  };

  useEffect(() => {
    fetchItems().finally(() => setIsLoading(false));
  }, []);

  const handleSaveItem = async (itemData: Omit<VaultItem, 'id' | 'createdAt'>) => {
    const key = getEncryptionKey();
    if (!key) {
      toast.error('No encryption key found');
      return;
    }

    const encryptedItem = {
      encryptedTitle: encryptData(itemData.title, key),
      encryptedUsername: itemData.username ? encryptData(itemData.username, key) : undefined,
      encryptedPassword: encryptData(itemData.password, key),
      encryptedWebsite: itemData.website ? encryptData(itemData.website, key) : undefined,
      encryptedNotes: itemData.notes ? encryptData(itemData.notes, key) : undefined,
    };

    const token = sessionStorage.getItem('authToken');
    const res = await fetch('/api/vault/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(encryptedItem),
    });

    if (!res.ok) {
      toast.error('Failed to save item');
      return;
    }

    // Refetch the items to update the list
    await fetchItems();
    toast.success('Item saved to vault!');
  };

  // Similarly, implement handleEditItem and handleDeleteItem

  return {
    vaultItems,
    isLoading,
    handleSaveItem,
    // handleEditItem,
    // handleDeleteItem,
  };
};