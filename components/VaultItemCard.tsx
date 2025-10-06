'use-client';
import {useState} from 'react';
import { Button } from '@/components/ui/button';
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Copy,Eye, EyeOff,Edit,Trash2,Check} from 'lucide-react';
import {toast} from 'sonner';


interface VaultItem{
    id:string,
    title:string,
    username?:string,
    password?:string,
    website?:string,
    notes?:string,
}

interface VaultItemCardProps{
    item:VaultItem;
    onEdit: (id:string, updates: Partial<VaultItem>)=>void;
    onDelete:(id:string)=>void;
}

export default function VaultItemCard({item, onEdit, onDelete}:VaultItemCardProps){

    const [showPassword,setShowPassword]=useState(false);
    const [isEditing,setIsEditing] = useState(false);
    const [editData,setEditData]= useState(item);
    const [copied, setCopied] = useState<string | null> (null);

    const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(`${type} copied to clipboard!`);
      
      setTimeout(() => {
        setCopied(null);
      }, 2000);
     }

    catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleSave=()=>{
    onEdit(item.id,editData);
    setIsEditing(false);
  };

  const handleCancel=()=>{
     setEditData(item);
     setIsEditing(false);
  };

  if(isEditing){
    return(
     <Card>
        <CardContent className="p-4 space-y-3">
          <Input
            value={editData.title}
            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Title"
          />
          <Input
            value={editData.username || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
            placeholder="Username"
          />
          <Input
            value={editData.password}
            onChange={(e) => setEditData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Password"
          />
          <Input
            value={editData.website || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))}
            placeholder="Website"
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm">Save</Button>
            <Button onClick={handleCancel} variant="outline" size="sm">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
//  else we need to return the common content
return(
  <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{item.title}</CardTitle>
            {item.website && (
              <CardDescription className="break-all">{item.website}</CardDescription>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.username && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium w-20">Username:</span>
            <Input
              value={item.username}
              readOnly
              className="flex-1 font-mono text-sm"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(item.username!, 'Username')}
            >
              {copied === 'username' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium w-20">Password:</span>
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
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(item.password, 'Password')}
              >
                {copied === 'password' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {item.notes && (
          <div>
            <span className="text-sm font-medium">Notes:</span>
            <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}