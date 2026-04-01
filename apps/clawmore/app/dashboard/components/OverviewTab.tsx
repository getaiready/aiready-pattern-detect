import React from 'react';
import { Layers, Zap, Activity, Clock, TrendingDown } from 'lucide-react';

interface OverviewTabProps {
  status: any;
}

export default function OverviewTab({ status }: OverviewTabProps) {
  // Aggregate ROI metrics
  const totalHoursSaved = status.recentMutations?.reduce(
    (sum: number, m: any) => sum + (m.estimatedHoursSaved || 0),
    0
  );
  const totalComplexityReduced = status.recentMutations?.reduce(
    (sum: number, m: any) => sum + (m.complexitySaved || 0),
    0
  );

  // Calculate average success rate
  const successRate =
    status.mutationCount > 0
      ? Math.round(
          (status.recentMutations.filter(
            (m: any) => m.mutationStatus === 'SUCCESS'
          ).length /
            status.recentMutations.length) *
            100
        )
      : 0;

  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h2 className="text-2xl font-black italic mb-10 tracking-tight text-white uppercase flex items-center gap-3">
        <Layers className="w-5 h-5 text-cyber-blue" />
        Evolution <span className="text-cyber-blue">ROI</span>
      </h2>

      <div className="space-y-8">
        {/* Row 1: ROI Value Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10">
              <Clock className="w-12 h-12 text-emerald-500" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/70 mb-2">
              Total Time Saved
            </p>
            <p className="text-4xl font-black text-emerald-500 italic">
              {totalHoursSaved.toFixed(1)}
              <span className="text-sm font-normal ml-1">hrs</span>
            </p>
            <p className="text-[9px] text-zinc-500 font-mono mt-4 uppercase">
              ≈ ${(totalHoursSaved * 120).toLocaleString()} Developer Value
            </p>
          </div>

          <div className="bg-cyber-blue/10 border border-cyber-blue/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10">
              <TrendingDown className="w-12 h-12 text-cyber-blue" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-cyber-blue/70 mb-2">
              Complexity Reduced
            </p>
            <p className="text-4xl font-black text-cyber-blue italic">
              -{totalComplexityReduced}
              <span className="text-sm font-normal ml-1">pts</span>
            </p>
            <p className="text-[9px] text-zinc-500 font-mono mt-4 uppercase">
              Entropy mitigation index
            </p>
          </div>

          <div className="bg-zinc-800/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10">
              <Activity className="w-12 h-12 text-white" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
              Success Velocity
            </p>
            <p className="text-4xl font-black text-white italic">
              {successRate}%
            </p>
            <p className="text-[9px] text-zinc-500 font-mono mt-4 uppercase">
              Reliable mutation across {status.mutationCount} events
            </p>
          </div>
        </div>

        {/* Row 2: Traditional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-black/40 border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-6">
              AWS Usage This Month
            </h3>
            <div className="flex items-end gap-3 mb-8">
              <span className="text-4xl font-black text-white italic">
                ${(status.awsSpendCents / 100).toFixed(2)}
              </span>
              <span className="text-zinc-500 text-sm mb-1 font-mono uppercase tracking-tighter">
                of ${(status.awsInclusionCents / 100).toFixed(2)} included
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyber-blue h-full shadow-[0_0_10px_rgba(0,224,255,0.5)] transition-all duration-1000"
                style={{
                  width: `${Math.min((status.awsSpendCents / status.awsInclusionCents) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-6">
              AI Auto-Fix Credits
            </h3>
            <div className="flex items-end gap-3 mb-8">
              <span className="text-4xl font-black text-amber-500 italic">
                ${(status.aiTokenBalanceCents / 100).toFixed(2)}
              </span>
              <span className="text-zinc-500 text-sm mb-1 font-mono uppercase tracking-tighter">
                remaining balance
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-1000"
                style={{
                  width: `${Math.min((status.aiTokenBalanceCents / 1000) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Row 3: Recent Fixes with ROI breakdown */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3 italic">
            <Activity className="w-5 h-5 text-cyber-blue" />
            Recent Evolution Events
          </h2>

          <div className="space-y-4">
            {status.recentMutations?.length > 0 ? (
              status.recentMutations.map((mutation: any, i: number) => (
                <div
                  key={mutation.mutationId || i}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-cyber-blue/20 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5 group-hover:bg-zinc-700 transition-colors">
                    <Zap
                      className={`w-5 h-5 ${mutation.mutationStatus === 'FAILURE' ? 'text-rose-500' : 'text-amber-500'}`}
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-black italic text-white uppercase tracking-tight">
                      {mutation.mutationType || 'Infrastructure Mutation'}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                        {mutation.mutationStatus === 'SUCCESS'
                          ? 'Successful Commit'
                          : 'Mutation Failed'}{' '}
                        • {new Date(mutation.createdAt).toLocaleDateString()}
                      </p>
                      {mutation.mutationStatus === 'SUCCESS' &&
                        mutation.estimatedHoursSaved > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-500 uppercase italic">
                            Saved {mutation.estimatedHoursSaved}hr
                          </span>
                        )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xs font-black italic uppercase ${mutation.mutationStatus === 'FAILURE' ? 'text-rose-500' : 'text-emerald-500'}`}
                    >
                      {mutation.mutationStatus === 'FAILURE'
                        ? 'RETRY'
                        : `+${mutation.complexitySaved || 1} SCR`}
                    </p>
                    <p className="text-[8px] text-zinc-700 font-mono tracking-tighter mt-1 group-hover:text-zinc-500 transition-colors">
                      ID: {mutation.mutationId?.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center bg-black/20 border border-white/5 border-dashed rounded-2xl">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                  No fixes applied yet
                </p>
                <p className="text-[9px] text-zinc-700 mt-2 font-mono">
                  Evolution ROI will appear here after your first mutation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
