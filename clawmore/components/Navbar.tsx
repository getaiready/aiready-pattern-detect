'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  RefreshCcw,
  Zap,
  Activity,
  ArrowLeft,
  Menu,
  X,
  User,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signIn, signOut } from 'next-auth/react';
import LocaleSwitcher from './LocaleSwitcher';

interface NavbarProps {
  variant?: 'home' | 'post';
  dict?: any;
}

export default function Navbar({ variant = 'home', dict }: NavbarProps) {
  const pathname = usePathname();
  const isBlog = pathname?.startsWith('/blog');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const { body } = document;
    const previousOverflow = body.style.overflow;

    if (isMobileMenuOpen) {
      body.style.overflow = 'hidden';
    }

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/5 pt-[env(safe-area-inset-top)]">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-3 sm:gap-4 group shrink-0"
        >
          <Image
            src="/logo.png"
            alt="ClawMore Logo"
            width={40}
            height={40}
            className={`transition-all ${
              variant === 'post' ? 'opacity-80 group-hover:opacity-100' : ''
            } ${!isBlog ? 'drop-shadow-[0_0_12px_rgba(0,224,255,0.8)]' : 'drop-shadow-[0_0_8px_rgba(0,224,255,0.2)] group-hover:drop-shadow-[0_0_12px_rgba(0,224,255,0.6)]'}`}
          />
          <div className="flex flex-col min-w-0">
            <span
              className={`text-lg sm:text-xl font-bold tracking-tight leading-none group-hover:text-cyber-blue transition-colors truncate ${!isBlog ? 'glow-text' : ''}`}
            >
              ClawMore
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-10 text-[11px] font-mono uppercase tracking-widest text-zinc-500 min-w-0">
          {variant === 'home' ? (
            <div className="hidden lg:flex items-center gap-10">
              <Link
                href="/#features"
                className="hover:text-cyber-blue hover:glow-blue transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-3 h-3" />{' '}
                {dict?.navbar?.features || 'Features'}
              </Link>
              <Link
                href="/#evolution"
                className="hover:text-cyber-blue hover:glow-blue transition-colors flex items-center gap-1.5"
              >
                <RefreshCcw className="w-3 h-3" />{' '}
                {dict?.navbar?.evolution || 'Evolution'}
              </Link>
              <Link
                href="/#pricing"
                className="hover:text-cyber-blue hover:glow-blue transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3 h-3" /> {dict?.navbar?.pricing || 'Pricing'}
              </Link>
              <Link
                href="/blog"
                className={`transition-colors flex items-center gap-1.5 ${
                  isBlog
                    ? 'text-cyber-purple glow-purple font-black'
                    : 'hover:text-cyber-purple hover:glow-purple'
                }`}
              >
                <Activity className="w-3 h-3" /> {dict?.navbar?.blog || 'Blog'}
              </Link>
            </div>
          ) : (
            <Link
              href="/blog"
              className="hidden lg:flex hover:text-cyber-purple hover:glow-purple transition-colors items-center gap-2 text-zinc-300"
            >
              <ArrowLeft className="w-3 h-3" />{' '}
              {dict?.navbar?.backToJournal || 'Back to Journal'}
            </Link>
          )}

          <div className="hidden sm:flex items-center gap-2 pl-2 sm:pl-3 lg:pl-4 border-l border-white/10">
            <LocaleSwitcher />
          </div>

          <div className="flex items-center gap-2">
            {session ? (
              <div className="flex items-center gap-2">
                {(session.user as any)?.isAdmin && (
                  <Link
                    href="/admin/users"
                    className="flex items-center gap-2 px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 transition-all text-[10px] font-bold uppercase tracking-wider"
                  >
                    <ShieldCheck className="w-3 h-3" /> Portal
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all text-[10px] font-bold uppercase tracking-wider"
                >
                  <LogOut className="w-3 h-3" />{' '}
                  {dict?.navbar?.signOut || 'Sign Out'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn(undefined, { callbackUrl: '/dashboard' })}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-cyber-blue/10 hover:bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/20 transition-all text-[10px] font-bold uppercase tracking-wider"
              >
                <User className="w-3 h-3" /> {dict?.navbar?.signIn || 'Sign In'}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-sm border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute top-full left-0 w-full lg:hidden border-t border-white/10 bg-black/95 backdrop-blur-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 pb-[max(2rem,env(safe-area-inset-bottom))] space-y-3">
              {variant === 'home' ? (
                <>
                  <Link
                    href="/#features"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 px-3 py-3 rounded-sm border border-white/10 bg-white/3 text-zinc-200 hover:text-cyber-blue transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />{' '}
                    {dict?.navbar?.features || 'Features'}
                  </Link>
                  <Link
                    href="/#evolution"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 px-3 py-3 rounded-sm border border-white/10 bg-white/3 text-zinc-200 hover:text-cyber-blue transition-colors"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />{' '}
                    {dict?.navbar?.evolution || 'Evolution'}
                  </Link>
                  <Link
                    href="/#pricing"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 px-3 py-3 rounded-sm border border-white/10 bg-white/3 text-zinc-200 hover:text-cyber-blue transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5" />{' '}
                    {dict?.navbar?.pricing || 'Pricing'}
                  </Link>
                  <Link
                    href="/blog"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-2 px-3 py-3 rounded-sm border border-white/10 bg-white/3 transition-colors ${
                      isBlog
                        ? 'text-cyber-purple glow-purple font-black'
                        : 'text-zinc-200 hover:text-cyber-purple'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />{' '}
                    {dict?.navbar?.blog || 'Blog'}
                  </Link>
                </>
              ) : (
                <Link
                  href="/blog"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2 px-3 py-3 rounded-sm border border-white/10 bg-white/3 text-zinc-200 hover:text-cyber-purple transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />{' '}
                  {dict?.navbar?.backToJournal || 'Back to Journal'}
                </Link>
              )}

              <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-3">
                <LocaleSwitcher />
                {session ? (
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      signOut({ callbackUrl: '/' });
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-sm border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-colors font-bold uppercase text-[10px] tracking-widest"
                  >
                    <LogOut className="w-3.5 h-3.5" />{' '}
                    {dict?.navbar?.signOut || 'Sign Out'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      signIn(undefined, { callbackUrl: '/dashboard' });
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-sm border border-cyber-blue/20 bg-cyber-blue/5 text-cyber-blue hover:bg-cyber-blue/10 transition-colors font-bold uppercase text-[10px] tracking-widest"
                  >
                    <User className="w-3.5 h-3.5" />{' '}
                    {dict?.navbar?.signIn || 'Sign In'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
