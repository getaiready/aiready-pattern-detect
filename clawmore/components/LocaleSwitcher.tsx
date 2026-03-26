'use client';

import { Globe, ChevronDown, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const locales = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'zh', label: '中文', short: 'ZH' },
];

export default function LocaleSwitcher() {
  const [currentLocale, setCurrentLocale] = useState('en');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Function to get cookie value client-side
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return 'en';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || 'en';
    return 'en';
  };

  useEffect(() => {
    const locale = getCookie('NEXT_LOCALE');
    if (locale && locale !== 'en') {
      const timeoutId = setTimeout(() => {
        setCurrentLocale(locale);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    setCurrentLocale(newLocale);
    setIsOpen(false);
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      // eslint-disable-next-line react-hooks/immutability
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      window.location.reload();
    }
  };

  const currentLocaleData =
    locales.find((l) => l.code === currentLocale) || locales[0];

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyber-blue/30 transition-all font-mono group cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-3.5 h-3.5 text-cyber-blue group-hover:text-cyber-blue transition-colors" />
        <span className="text-[10px] uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">
          {currentLocaleData.short}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-white/50 transition-all duration-200 ${
            isOpen ? 'rotate-180 text-cyber-blue' : 'group-hover:text-white/70'
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full right-0 mt-2 w-40 overflow-hidden rounded-sm border border-white/10 bg-black/95 backdrop-blur-2xl shadow-2xl shadow-black/50 z-50"
            role="listbox"
          >
            <div className="py-1">
              {locales.map((locale) => (
                <button
                  key={locale.code}
                  onClick={() => handleLocaleChange(locale.code)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-all ${
                    currentLocale === locale.code
                      ? 'bg-cyber-blue/10 text-cyber-blue'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                  role="option"
                  aria-selected={currentLocale === locale.code}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest">
                      {locale.short}
                    </span>
                    <span className="text-sm">{locale.label}</span>
                  </div>
                  {currentLocale === locale.code && (
                    <Check className="w-3.5 h-3.5 text-cyber-blue" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
