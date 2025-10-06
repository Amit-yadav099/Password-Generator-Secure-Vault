'use-client';

import {useState, useCallback} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import {Copy, RefreshCw, Check} from 'lucide-react';
import {toast} from 'sonner';

interface PasswordGeneratorProps {
  onPasswordGenerate?: (password: string) => void;
}

export default function PasswordGenerator({onPasswordGenerate}:PasswordGeneratorProps){
    const [password,setPassword]=useState('');
    const [length,setLength]=useState(16);
    const [includeUppercase,setIncludeUppercase]=useState(true);
    const [includeLowercase, setIncludeLowercase]=useState(true);
    const [includeNumbers,setIncludeNumbers] =useState(true);
    const [includeSymbols,setIncludeSymbols]=useState(true);
    const [copied,setCopied]=useState(false);

    const generatePassword= useCallback( ()=> {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let characters='';
    if (includeUppercase) characters += uppercase;
    if (includeLowercase) characters += lowercase;
    if (includeNumbers) characters += numbers;
    if (includeSymbols) characters += symbols;

    if(characters.length===0){
        toast.error("please select at least one character");
        return;
    }

    let newPassword='';
   for(let i=0;i<length;i++){
    const randomIndex=Math.floor(Math.random()*characters.length);
    newPassword+=characters[randomIndex];
   }
   setPassword(newPassword);
   onPasswordGenerate?.(newPassword);
   }
   ,[length,includeUppercase,includeLowercase,includeNumbers,includeSymbols,onPasswordGenerate]);


   const copyToClipboard= async() => {
    
    if(!password) return;

    try{
        await navigator.clipboard.writeText(password);
        setCopied(true);
        toast.success('password copied to the clipboard');

        // now we are going to do auot-clear after the 15 seconds
        setTimeout(async ()=> {
            await navigator.clipboard.writeText('');
            setCopied(false);
            console.log('Clipboard cleared for security');
        },15000);
    }
    catch(err){
    toast.error('failed to copy password');
    }
};

    return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Password Generator
        </CardTitle>
        <CardDescription>
          Create strong, secure passwords instantly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Password Display */}
        <div className="flex gap-2">
          <Input
            value={password}
            readOnly
            placeholder="Your generated password"
            className="font-mono"
          />
          <Button
            onClick={copyToClipboard}
            disabled={!password}
            variant="outline"
            size="icon"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        {/* Length Slider */}
        <div className="space-y-2">
          <Label>Password Length: {length}</Label>
          <Slider
            value={[length]}
            onValueChange={(value) => setLength(value[0])}
            min={8}
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
              <label htmlFor="uppercase" className="text-sm">Uppercase</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowercase"
                checked={includeLowercase}
                onCheckedChange={(checked) => setIncludeLowercase(checked as boolean)}
              />
              <label htmlFor="lowercase" className="text-sm">Lowercase</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="numbers"
                checked={includeNumbers}
                onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)}
              />
              <label htmlFor="numbers" className="text-sm">Numbers</label>
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
        </div>

        {/* Generate Button */}
        <Button onClick={generatePassword} className="w-full">
          Generate Password
        </Button>
      </CardContent>
    </Card>
  );
}