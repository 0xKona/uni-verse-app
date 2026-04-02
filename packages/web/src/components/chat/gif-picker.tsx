'use client';

import { useState } from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { IGif } from '@giphy/js-types';

const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY ?? '');

interface GifPickerProps {
  onSelect: (url: string) => void;
}

export function GifPicker({ onSelect }: GifPickerProps) {
  const [query, setQuery] = useState('');

  const fetchGifs = (offset: number) =>
    query.trim()
      ? gf.search(query, { offset, limit: 10 })
      : gf.trending({ offset, limit: 10 });

  const handleClick = (gif: IGif, e: React.SyntheticEvent) => {
    e.preventDefault();
    const url = gif.images.original.url;
    onSelect(url);
  };

  return (
    <div className="flex flex-col w-80 h-80">
      <div className="p-2">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search GIFs…"
            className="pl-7 h-8 text-xs"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <Grid
          key={query}
          width={288}
          columns={2}
          fetchGifs={fetchGifs}
          onGifClick={handleClick}
          noLink
          hideAttribution
        />
      </div>
      <div className="px-2 pb-1">
        <p className="text-[9px] text-muted-foreground text-right">Powered by GIPHY</p>
      </div>
    </div>
  );
}
