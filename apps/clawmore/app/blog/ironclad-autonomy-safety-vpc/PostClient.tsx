'use client';

import { ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';
import BlogLayout from '../_components/BlogLayout';
import SystemFlow from '../../../components/SystemFlow';

const SAFETY_NODES = [
  {
    id: 'mutation',
    data: { label: '[MUTATION_INTENT]', type: 'event' },
    position: { x: 0, y: 0 },
  },
  {
    id: 'guard',
    data: { label: 'RECURSION_GUARD', type: 'bus' },
    position: { x: 200, y: 0 },
  },
  {
    id: 'approval',
    data: { label: 'HUMAN_GATE (IF_HIGH_RISK)', type: 'agent' },
    position: { x: 450, y: -50 },
  },
  {
    id: 'vpc',
    data: { label: 'VPC_ISOLATION_ZONE', type: 'bus' },
    position: { x: 450, y: 50 },
  },
  {
    id: 'aws',
    data: { label: '[SECURE_AWS_TARGET]', type: 'agent' },
    position: { x: 700, y: 0 },
  },
];

const SAFETY_EDGES = [
  {
    id: 'e1',
    source: 'mutation',
    target: 'guard',
    label: 'Check Limit',
    animated: true,
  },
  {
    id: 'e2',
    source: 'guard',
    target: 'approval',
    label: 'Escalate',
    animated: true,
  },
  {
    id: 'e3',
    source: 'guard',
    target: 'vpc',
    label: 'Execute',
    animated: true,
  },
  {
    id: 'e4',
    source: 'approval',
    target: 'vpc',
    label: 'Approve',
    animated: true,
  },
  { id: 'e5', source: 'vpc', target: 'aws', label: 'Deploy', animated: true },
];

export default function BlogPost() {
  return (
    <BlogLayout
      metadata={{
        title: 'Ironclad Autonomy: Safety & VPCs',
        description:
          '"What if it deletes my production database?" Explaining our multi-layered approach to recursion guards and context isolation.',
        date: '2026-03-18',
        image: '/blog-assets/ironclad-autonomy-safety-vpc.png',
        slug: 'ironclad-autonomy-safety-vpc',
      }}
      header={{
        category: 'SAFETY_GUARDS',
        hash: 'bd95a79',
        readTime: '06 MIN READ',
        title: (
          <>
            Ironclad Autonomy: <br />
            <span className="text-cyber-purple">Safety & VPCs</span>
          </>
        ),
        subtitle: 'Recursion Guards',
        description:
          '"What if it deletes my production database?" Explaining our multi-layered approach to recursion guards and context isolation.',
        image: '/blog-assets/ironclad-autonomy-safety-vpc.png',
      }}
      breadcrumbItems={[
        { label: 'BLOG', href: '/blog' },
        {
          label: 'IRONCLAD AUTONOMY',
          href: '/blog/ironclad-autonomy-safety-vpc',
        },
      ]}
    >
      <section>
        <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
          <span className="text-cyber-purple font-mono text-sm">01</span>
          The Fear of the Runaway Loop
        </h2>
        <p className="text-zinc-200 leading-relaxed text-lg">
          The biggest challenge in autonomous infrastructure isn't
          intelligence—it's **Control**. If an agent identifies a gap and
          attempts a mutation that introduces a new gap, you risk a "Recursion
          Storm" where the machine burns your AWS budget in a circular attempt
          to fix itself.
        </p>
        <p className="text-zinc-200 leading-relaxed text-lg mt-6">
          ClawMore solves this through three non-negotiable safety layers:
          Recursion Guards, Approval Gates, and VPC Isolation.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
          <span className="text-cyber-purple font-mono text-sm">02</span>
          The Recursion Guard
        </h2>
        <p className="text-zinc-200 leading-relaxed text-lg">
          Every mutation event is tracked by a global limiter. The **Recursion
          Guard** monitors the depth and frequency of mutations per resource. If
          the engine attempts to mutate the same Lambda function more than 3
          times in a 60-minute window, the guard pulses a `HALT_AND_REFLECT`
          event, locking the resource until a human intervenes.
        </p>
      </section>

      <SystemFlow nodes={SAFETY_NODES} edges={SAFETY_EDGES} height="350px" />

      <section className="mt-16">
        <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
          <span className="text-cyber-purple font-mono text-sm">03</span>
          Context Isolation (BYOC)
        </h2>
        <p className="text-zinc-200 leading-relaxed text-lg">
          With **Bring Your Own Cloud (BYOC)**, the engine's execution weights
          are kept within your own VPC. We use strict IAM boundaries and VPC
          endpoints to ensure that the agent can only "see" and "mutate" the
          resources you have explicitly whitelisted.
        </p>
        <div className="mt-8 p-6 bg-zinc-900/50 border border-white/10 rounded-sm font-mono text-[11px] text-zinc-200">
          <div className="flex items-center gap-2 text-cyber-purple mb-2">
            <Lock className="w-3 h-3" />
            <span>BOUNDARY_POLICY.json</span>
          </div>
          {`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Action": ["rds:DeleteDBInstance", "s3:DeleteBucket"],
      "Resource": "*",
      "Condition": {"Bool": {"aws:MultiFactorAuthPresent": "false"}}
    }
  ]
}`}
        </div>
      </section>

      <div className="mt-24 pt-12 border-t border-white/5 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-purple/10 border border-cyber-purple/20 text-cyber-purple text-[10px] font-mono uppercase tracking-[0.3em] mb-8">
          <ShieldCheck className="w-4 h-4" />
          <span>Series_Complete // Logic_Synchronized</span>
        </div>
        <h3 className="text-3xl font-black italic mb-8 text-white">
          Ready to Evolve?
        </h3>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="https://github.com/serverlessclaw/serverlessclaw"
            className="px-10 py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] hover:bg-cyber-blue transition-all"
          >
            Deploy OSS Node
          </Link>
        </div>
      </div>
    </BlogLayout>
  );
}
