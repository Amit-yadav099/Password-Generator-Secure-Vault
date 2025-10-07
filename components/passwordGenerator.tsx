'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, RefreshCw, Check, Zap, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { ClipboardManager } from '@/lib/clipboard';

interface PasswordGeneratorProps {
  onPasswordGenerate?: (password: string) => void;
}

export default function PasswordGenerator({ onPasswordGenerate }: PasswordGeneratorProps) {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copyTimer, setCopyTimer] = useState<number | null>(null);
  const [strength, setStrength] = useState<'weak' | 'medium' | 'strong' | 'very-strong'>('weak');

  // Calculate password strength
  useEffect(() => {
    let score = 0;
    
    // Length score
    if (length >= 8) score += 1;
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;
    
    // Character variety score
    const types = [includeUppercase, includeLowercase, includeNumbers, includeSymbols];
    const typeCount = types.filter(Boolean).length;
    score += typeCount - 1;
    
    // Determine strength
    if (score >= 5) setStrength('very-strong');
    else if (score >= 4) setStrength('strong');
    else if (score >= 3) setStrength('medium');
    else setStrength('weak');
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const generatePassword = useCallback(() => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude I, O
    const lowercase = 'abcdefghijkmnpqrstuvwxyz'; // Exclude l, o
    const numbers = '23456789'; // Exclude 0, 1
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const similarChars = 'Il1O0';
    
    let characters = '';
    if (includeUppercase) characters += uppercase;
    if (includeLowercase) characters += lowercase;
    if (includeNumbers) characters += numbers;
    if (includeSymbols) characters += symbols;

    if (characters.length === 0) {
      toast.error('Please select at least one character type');
      return;
    }

    // Remove similar characters if requested
    if (excludeSimilar) {
      characters = characters.split('').filter(char => !similarChars.includes(char)).join('');
    }

    let newPassword = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      const randomIndex = array[i] % characters.length;
      newPassword += characters[randomIndex];
    }

    setPassword(newPassword);
    onPasswordGenerate?.(newPassword);
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, onPasswordGenerate]);

  // Auto-generate on first load
  useEffect(() => {
    generatePassword();
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (copyTimer !== null && copyTimer > 0) {
      const timer = setTimeout(() => {
        setCopyTimer(prev => prev !== null ? prev - 1 : null);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (copyTimer === 0) {
      setCopied(false);
      setCopyTimer(null);
    }
  }, [copyTimer]);

  const copyToClipboard = async () => {
    if (!password) return;

    try {
      const success = await ClipboardManager.copyWithAutoClear(password, 'generated-password', 15000);
      
      if (success) {
        setCopied(true);
        setCopyTimer(15);
        toast.success('Password copied! Auto-clearing in 15 seconds.');
      } else {
        throw new Error('Copy failed');
      }
    } catch (err) {
      toast.error('Failed to copy password');
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 'very-strong': return 'bg-green-500';
      case 'strong': return 'bg-green-400';
      case 'medium': return 'bg-yellow-500';
      case 'weak': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthText = () => {
    switch (strength) {
      case 'very-strong': return 'Very Strong';
      case 'strong': return 'Strong';
      case 'medium': return 'Medium';
      case 'weak': return 'Weak';
      default: return 'Very Weak';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Password Generator
        </CardTitle>
        <CardDescription>
          Create strong, secure passwords instantly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Password Display */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={password}
              readOnly
              placeholder="Your generated password"
              className="font-mono text-sm"
            />
            <Button
              onClick={copyToClipboard}
              disabled={!password}
              variant="outline"
              size="icon"
              className="relative"
            >
              {copied ? (
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
          
          {/* Strength Indicator */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Strength:</span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-white text-xs ${getStrengthColor()}`}>
                {getStrengthText()}
              </span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i <= 
                      (strength === 'very-strong' ? 4 : 
                       strength === 'strong' ? 3 : 
                       strength === 'medium' ? 2 : 1)
                        ? getStrengthColor()
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Length Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Password Length: {length}</Label>
            <span className="text-xs text-muted-foreground">
              {length <= 8 ? 'Short' : length <= 12 ? 'Good' : length <= 16 ? 'Strong' : 'Very Strong'}
            </span>
          </div>
          <Slider
            value={[length]}
            onValueChange={(value) => setLength(value[0])}
            min={6}
            max={32}
            step={1}
          />
        </div>

        {/* Character Options */}
        <div className="space-y-3">
          <Label>Character Types</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="uppercase"
                checked={includeUppercase}
                onCheckedChange={(checked) => setIncludeUppercase(checked as boolean)}
              />
              <label htmlFor="uppercase" className="text-sm">Uppercase (A-Z)</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowercase"
                checked={includeLowercase}
                onCheckedChange={(checked) => setIncludeLowercase(checked as boolean)}
              />
              <label htmlFor="lowercase" className="text-sm">Lowercase (a-z)</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="numbers"
                checked={includeNumbers}
                onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)}
              />
              <label htmlFor="numbers" className="text-sm">Numbers (2-9)</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="symbols"
                checked={includeSymbols}
                onCheckedChange={(checked) => setIncludeSymbols(checked as boolean)}
              />
              <label htmlFor="symbols" className="text-sm">Symbols</label>
            </div>
          </div>
          
          {/* Advanced Options */}
          <div className="pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="exclude-similar"
                checked={excludeSimilar}
                onCheckedChange={(checked) => setExcludeSimilar(checked as boolean)}
              />
              <label htmlFor="exclude-similar" className="text-sm">
                Exclude similar characters (I, l, 1, O, 0)
              </label>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button onClick={generatePassword} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate New Password
        </Button>
      </CardContent>
    </Card>
  );
}