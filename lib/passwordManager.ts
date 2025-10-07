import CryptoJS from 'crypto-js';

export class PasswordManager {
  /**
   * Securely store the user's password in sessionStorage
   * Encrypted with a session-specific key
   */
  static storePassword(password: string): void {
    try {
      // Generate a random session key
      const sessionKey = CryptoJS.lib.WordArray.random(256/8).toString();
      
      // Encrypt the password with the session key
      const encryptedPassword = CryptoJS.AES.encrypt(password, sessionKey).toString();
      
      // Store both (session key is never sent to server)
      sessionStorage.setItem('encryptedPassword', encryptedPassword);
      sessionStorage.setItem('sessionKey', sessionKey);
    } catch (error) {
      console.error('Password storage error:', error);
      throw new Error('Failed to secure password storage');
    }
  }

  /**
   * Retrieve and decrypt the user's password
   */
  static getPassword(): string | null {
    try {
      const encryptedPassword = sessionStorage.getItem('encryptedPassword');
      const sessionKey = sessionStorage.getItem('sessionKey');
      
      if (!encryptedPassword || !sessionKey) {
        return null;
      }

      // Decrypt the password
      const decrypted = CryptoJS.AES.decrypt(encryptedPassword, sessionKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Password retrieval error:', error);
      this.clearPassword();
      return null;
    }
  }

  /**
   * Clear stored password (on logout)
   */
  static clearPassword(): void {
    sessionStorage.removeItem('encryptedPassword');
    sessionStorage.removeItem('sessionKey');
  }

  /**
   * Check if password is available
   */
  static hasPassword(): boolean {
    return this.getPassword() !== null;
  }
}