'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { PALETTE_IDS } from '@/lib/constants';

const DEFAULT_PALETTE = 'pink'; // "Rose"
const PaletteContext = createContext({ palette: DEFAULT_PALETTE, setPalette: () => {} });
const STORAGE_KEY = 'cs_palette';

export function PaletteProvider({ children }) {
  const [palette, setPaletteState] = useState(DEFAULT_PALETTE);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial = PALETTE_IDS.includes(stored) ? stored : DEFAULT_PALETTE;
    setPaletteState(initial);
    document.documentElement.dataset.palette = initial;
  }, []);

  const setPalette = useCallback((id) => {
    if (!PALETTE_IDS.includes(id)) return;
    setPaletteState(id);
    document.documentElement.dataset.palette = id;
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  return (
    <PaletteContext.Provider value={{ palette, setPalette }}>
      {children}
    </PaletteContext.Provider>
  );
}

export const usePalette = () => useContext(PaletteContext);
