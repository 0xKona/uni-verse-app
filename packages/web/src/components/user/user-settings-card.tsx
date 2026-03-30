'use client';

import { useState, useEffect } from 'react';
import { LogOut, Settings, Globe } from 'lucide-react';
import { getCurrentUser } from 'aws-amplify/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { logout } from '@/lib/auth';
import { LANGUAGES } from '@/lib/languages';
import { useUserProfile } from '@/hooks/useProfileQuery';
import { useSetUserProfile } from '@/hooks/useProfileMutation';

export function UserSettingsCard() {
  const [username, setUsername] = useState('');
  const { data: profile } = useUserProfile();
  const setProfile = useSetUserProfile();

  useEffect(() => {
    getCurrentUser()
      .then((u) => setUsername(u.username))
      .catch(console.error);
  }, []);

  const initials = username[0]?.toUpperCase() ?? '?';
  const currentLang = profile?.language ?? 'en';
  const translationOn = profile?.translationEnabled ?? false;

  const handleLanguageChange = (code: string | null) => {
    if (!code) return;
    setProfile.mutate({ language: code, translationEnabled: translationOn });
  };

  const handleTranslationToggle = () => {
    setProfile.mutate({ language: currentLang, translationEnabled: !translationOn });
  };

  return (
    <Popover>
      <PopoverTrigger>
        <button className="flex items-center gap-2 w-full rounded-md px-2 py-2 hover:bg-background/60 transition-colors cursor-pointer">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium truncate hidden">{username}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" className="w-64 p-0">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{username}</span>
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>

        <Separator />

        {/* Language settings */}
        <div className="px-3 py-3 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Globe size={14} />
            Translation
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="translation-toggle" className="text-xs">
              Auto-translate
            </Label>
            <button
              id="translation-toggle"
              role="switch"
              aria-checked={translationOn}
              onClick={handleTranslationToggle}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                translationOn ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${
                  translationOn ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Language</Label>
            <Select value={currentLang} onValueChange={handleLanguageChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(({ code, label }) => (
                  <SelectItem key={code} value={code} className="text-xs">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="p-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-xs text-destructive hover:text-destructive"
            onClick={() => logout()}
          >
            <LogOut size={14} />
            Log out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
