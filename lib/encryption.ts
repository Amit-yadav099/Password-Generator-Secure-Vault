import CryptoJS from 'crypto-js';

export class VaultEncryption {
  /**
   * Generate stable encryption key from user's email and password
   * This key remains the same across sessions and token refreshes
   */
  private static generateKey(email: string, password: string): string {
    // Use email as salt and password as the key material
    // This creates a consistent key that doesn't change with JWT tokens
    return CryptoJS.PBKDF2(password, email, {
      keySize: 256 / 32,
      iterations: 100000, // High iterations for security
      hasher: CryptoJS.algo.SHA256
    }).toString();
  }

  static encryptData(data: string, email: string, password: string): string {
    try {
      if (!data || !email || !password) {
        throw new Error('Data, email, and password are required for encryption');
      }

      const key = this.generateKey(email, password);
      const iv = CryptoJS.lib.WordArray.random(128 / 8);
      
      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      });
      
      // Combine iv + encrypted data
      const combined = iv.toString() + encrypted.toString();
      return combined;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  static decryptData(encryptedData: string, email: string, password: string): string {
    try {
      if (!encryptedData || !email || !password) {
        throw new Error('Encrypted data, email, and password are required for decryption');
      }

      if (encryptedData.length < 32) {
        throw new Error('Invalid encrypted data format');
      }

      // Extract iv (32 chars) and the rest is encrypted data
      const iv = CryptoJS.enc.Hex.parse(encryptedData.substring(0, 32));
      const encrypted = encryptedData.substring(32);
      
      const key = this.generateKey(email, password);
      
      const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      });
      
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        throw new Error('Decryption failed - invalid credentials');
      }
      
      return decryptedText;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data. Please check your credentials.');
    }
  }

  /**
   * Test if encryption/decryption works with given credentials
   */
  static testEncryption(email: string, password: string): boolean {
    try {
      const testData = 'test-vault-data-' + Date.now();
      const encrypted = this.encryptData(testData, email, password);
      const decrypted = this.decryptData(encrypted, email, password);
      return decrypted === testData;
    } catch (error) {
      console.error('Encryption test failed:', error);
      return false;
    }
  }
}