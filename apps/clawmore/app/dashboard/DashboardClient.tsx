'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Zap } from 'lucide-react';
import ProvisioningConsole from './ProvisioningConsole';
import { useDashboardStatus } from './hooks/useDashboardStatus';
import OverviewTab from './components/OverviewTab';
import NodesTab from './components/NodesTab';
import SettingsTab from './components/SettingsTab';
import AccountTab from './components/AccountTab';
import IntegrationsTab from './components/IntegrationsTab';

interface DashboardClientProps {
  user: any;
  isAdmin?: boolean;
  pendingCheckout?: boolean;
  status: any;
}

export default function DashboardClient({
  user,
  status,
  pendingCheckout,
}: DashboardClientProps) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const { provisionStatus, provisionAccountId, pollCount } =
    useDashboardStatus(status);

  const [isCoevolutionEnabled, setIsCoevolutionEnabled] = React.useState(
    status.coEvolutionOptIn
  );
  const [isAutoTopupEnabled, setIsAutoTopupEnabled] = React.useState(
    status.autoTopupEnabled
  );
  const [topupThresholdCents, setTopupThresholdCents] = React.useState(
    status.aiRefillThresholdCents
  );
  const [topupAmountCents, setTopupAmountCents] = React.useState(1000);
  const [enabledSkills, setEnabledSkills] = React.useState<string[]>(
    status.enabledSkills || ['refactor', 'validation']
  );
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);

  // Persistence logic
  const saveSettings = async (updates: any) => {
    try {
      await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleCoevolutionToggle = (enabled: boolean) => {
    setIsCoevolutionEnabled(enabled);
    saveSettings({ coEvolutionOptIn: enabled });
  };

  const handleAutoTopupToggle = (enabled: boolean) => {
    setIsAutoTopupEnabled(enabled);
    saveSettings({ autoTopupEnabled: enabled });
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = enabledSkills.includes(skill)
      ? enabledSkills.filter((s) => s !== skill)
      : [...enabledSkills, skill];
    setEnabledSkills(newSkills);
    saveSettings({ enabledSkills: newSkills });
  };

  React.useEffect(() => {
    if (topupThresholdCents === status.aiRefillThresholdCents) return;
    const timer = setTimeout(() => {
      saveSettings({ aiRefillThresholdCents: topupThresholdCents });
    }, 1000);
    return () => clearTimeout(timer);
  }, [topupThresholdCents, status.aiRefillThresholdCents]);

  const handleCheckout = async () => {
    if (isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const res = await fetch('/api/billing/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsCheckingOut(true);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Portal error:', err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const [detectedRegion, setDetectedRegion] = React.useState('ap-southeast-2');
  React.useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const regionMap: Record<string, string> = {
      'Australia/Sydney': 'ap-southeast-2',
      'America/New_York': 'us-east-1',
      'America/Los_Angeles': 'us-west-2',
      'Europe/London': 'eu-west-2',
      'Asia/Tokyo': 'ap-northeast-1',
    };
    const region =
      Object.entries(regionMap).find(([key]) => tz.includes(key))?.[1] ||
      'ap-southeast-2';
    setDetectedRegion(region);
  }, []);

  if (pendingCheckout) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-12 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-center mb-8 mx-auto">
            <Zap className="w-8 h-8 text-cyber-blue" />
          </div>
          <h1 className="text-3xl font-black italic tracking-tight mb-4 uppercase">
            Complete Your <span className="text-cyber-blue">Setup</span>
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed mb-10 max-w-md mx-auto">
            Your account is ready. Subscribe to the Managed Platform to activate
            your dedicated AWS infrastructure and unlock autonomous code
            evolution.
          </p>
          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Plan
              </span>
              <span className="text-sm font-black text-white italic uppercase">
                Managed Platform
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Monthly
              </span>
              <span className="text-2xl font-black text-cyber-blue italic">
                $29<span className="text-sm text-zinc-500">/mo</span>
              </span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="w-full py-4 bg-cyber-blue hover:bg-white text-black rounded-2xl text-sm font-black uppercase italic tracking-widest transition-all shadow-[0_0_30px_rgba(0,224,255,0.2)] hover:shadow-white/20 disabled:opacity-50"
          >
            {isCheckingOut ? 'Redirecting...' : 'Subscribe Now'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 md:py-16 px-6 sm:px-10 font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic">
            Dashboard <span className="text-cyber-blue">Core</span>
          </h1>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em]">
            Welcome back, {user.name || 'Developer'} • {activeTab.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900/40 border border-white/5 p-4 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyber-blue to-purple-600 flex items-center justify-center font-bold text-lg shadow-[0_0_20px_rgba(0,224,255,0.3)]">
            {user.name?.[0] || user.email?.[0] || 'U'}
          </div>
          <div>
            <p className="text-sm font-black italic tracking-tight">
              {user.name || 'Developer'}
            </p>
            <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest truncate max-w-[150px]">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full space-y-12">
        {(provisionStatus === 'provisioning' ||
          provisionStatus === 'failed' ||
          (provisionStatus === 'complete' && pollCount < 5)) && (
          <ProvisioningConsole
            status={provisionStatus as any}
            error={
              status.provisioningStatus === 'failed'
                ? (status.provisioningError ?? undefined)
                : undefined
            }
          />
        )}

        {activeTab === 'overview' && <OverviewTab status={status} />}
        {activeTab === 'nodes' && <NodesTab detectedRegion={detectedRegion} />}
        {activeTab === 'integrations' && <IntegrationsTab />}
        {activeTab === 'settings' && (
          <SettingsTab
            isCoevolutionEnabled={isCoevolutionEnabled}
            onCoevolutionToggle={handleCoevolutionToggle}
            enabledSkills={enabledSkills}
            onSkillToggle={handleSkillToggle}
          />
        )}
        {activeTab === 'account' && (
          <AccountTab
            user={user}
            status={status}
            provisionAccountId={provisionAccountId}
            detectedRegion={detectedRegion}
            provisionStatus={provisionStatus}
            isCheckingOut={isCheckingOut}
            onManageSubscription={handleManageSubscription}
            isAutoTopupEnabled={isAutoTopupEnabled}
            onAutoTopupToggle={handleAutoTopupToggle}
            topupThresholdCents={topupThresholdCents}
            setTopupThresholdCents={setTopupThresholdCents}
            topupAmountCents={topupAmountCents}
            setTopupAmountCents={setTopupAmountCents}
          />
        )}
      </div>
    </div>
  );
}
