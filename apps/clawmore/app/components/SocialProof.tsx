'use client';

export default function SocialProof() {
  return (
    <section className="py-16 bg-black/20 border-y border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black mb-4 tracking-tighter">
            Trusted by Development Teams
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Join hundreds of teams saving time and reducing costs with automated
            infrastructure management
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
          <div className="text-zinc-500 font-bold text-lg">Startup A</div>
          <div className="text-zinc-500 font-bold text-lg">Agency B</div>
          <div className="text-zinc-500 font-bold text-lg">Enterprise C</div>
          <div className="text-zinc-500 font-bold text-lg">Team D</div>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-4xl font-black text-cyber-blue mb-2">500+</div>
            <div className="text-zinc-400 text-sm">Repositories Managed</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-black text-cyber-blue mb-2">
              10,000+
            </div>
            <div className="text-zinc-400 text-sm">Issues Auto-Fixed</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-black text-cyber-blue mb-2">50+</div>
            <div className="text-zinc-400 text-sm">
              Hours Saved Per Team Monthly
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
