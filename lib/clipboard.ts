'use client';

export class ClipboardManager {
  private static timeoutIds: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Copy text to clipboard with auto-clear after specified time
   */
  static async copyWithAutoClear(
    text: string, 
    type: string = 'text',
    clearAfterMs: number = 15000 // 15 seconds default
  ): Promise<boolean> {
    try {
      // Clear any existing timeout for this type
      this.clearExistingTimeout(type);

      // Copy to clipboard
      await navigator.clipboard.writeText(text);
      
      // Set timeout to clear clipboard
      const timeoutId = setTimeout(async () => {
        try {
          await navigator.clipboard.writeText('');
          console.log(`Clipboard cleared for ${type}`);
          this.timeoutIds.delete(type);
        } catch (error) {
          console.error('Failed to clear clipboard:', error);
        }
      }, clearAfterMs);

      this.timeoutIds.set(type, timeoutId);
      return true;
    } catch (error) {
      console.error('Copy failed:', error);
      return false;
    }
  }

  /**
   * Clear existing timeout for a specific type
   */
  private static clearExistingTimeout(type: string): void {
    const existingTimeout = this.timeoutIds.get(type);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.timeoutIds.delete(type);
    }
  }

  /**
   * Clear all pending timeouts
   */
  static clearAllTimeouts(): void {
    this.timeoutIds.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.timeoutIds.clear();
  }

  /**
   * Get remaining time for a specific clipboard clear
   */
  static getRemainingTime(type: string): number | null {
    // This is a simplified implementation
    // In a real app, you'd track the exact remaining time
    return this.timeoutIds.has(type) ? 15000 : null;
  }
}