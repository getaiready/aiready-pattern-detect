'use client';

import { Unplug } from 'lucide-react';
import BlogLayout from '../_components/BlogLayout';
import SystemFlow from '../../../components/SystemFlow';

const IDLE_NODES = [
  {
    id: 'request',
    data: { label: 'REQUEST IN', type: 'event' },
    position: { x: 0, y: 0 },
  },
  {
    id: 'bus',
    data: { label: 'AGENT BUS (WAIT)', type: 'bus' },
    position: { x: 200, y: 0 },
  },
  {
    id: 'agent',
    data: { label: 'COLD START (0.5s)', type: 'agent' },
    position: { x: 400, y: 0 },
  },
  {
    id: 'done',
    data: { label: 'SHUTDOWN ($0)', type: 'event' },
    position: { x: 600, y: 0 },
  },
];

const IDLE_EDGES = [
  { id: 'e1', source: 'request', target: 'bus', animated: true },
  { id: 'e2', source: 'bus', target: 'agent', animated: true },
  { id: 'e3', source: 'agent', target: 'done', animated: false },
];

export default function BlogPost() {
  return (
    <BlogLayout
      metadata={{
        title: 'Why $0 Idle is the Only Way to Scale',
        description:
          'The economics of the agentic era require a fundamental shift: from uptime to on-demand intelligence.',
        date: '2026-03-31',
        image: '/blog-assets/zero-idle-scaling.png',
        slug: 'zero-idle-scaling',
      }}
      header={{
        category: 'MINIMAL_IA',
        hash: 'zero-idle',
        readTime: '7 MIN READ',
        title: (
          <>
            $0 Idle: <br />
            <span className="text-cyber-blue text-stroke-white">
              The Scaling Law
            </span>
          </>
        ),
        subtitle: 'On-demand Intelligence',
        description:
          "The economics of the agentic era require a fundamental shift: from uptime to on-demand intelligence. If it isn't working, it shouldn't be costing.",
        image: '/blog-assets/zero-idle-scaling.png',
      }}
      breadcrumbItems={[
        { label: 'BLOG', href: '/blog' },
        {
          label: 'ZERO IDLE SCALING',
          href: '/blog/zero-idle-scaling',
        },
      ]}
    >
      <section className="mt-12">
        <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4 italic uppercase">
          <span className="text-cyber-blue font-mono text-sm not-italic border-b border-cyber-blue/50">
            01
          </span>
          The Fossil Fuel of Computing
        </h2>
        <p className="text-zinc-200 leading-relaxed text-lg italic">
          Traditional hosting is the fossil fuel of the digital age. You burn
          money (uptime) to keep a server idling on the off-chance it might be
          needed. In the <strong>Eclawnomy</strong>, where an agentic workforce
          might consist of 100+ specialized Claws, this &quot;Waiting Tax&quot;
          is the difference between a high-margin business and bankruptcy.
        </p>
      </section>

      <SystemFlow nodes={IDLE_NODES} edges={IDLE_EDGES} height="300px" />

      <section className="mt-16">
        <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4 italic uppercase">
          <span className="text-cyber-blue font-mono text-sm not-italic border-b border-cyber-blue/50">
            02
          </span>
          Decoupling Uptime from Utility
        </h2>
        <p className="text-zinc-200 leading-relaxed text-lg">
          ClawMore leverages a pure-serverless backbone. When an agent
          isn&apos;t planning a refactor or auditing a security flaw, its entire
          infrastructure—from compute to context memory—dissolves into cold
          storage.
        </p>
        <div className="p-8 bg-zinc-900 border border-white/5 rounded-sm my-10 relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
            <Unplug className="w-12 h-12 text-cyber-blue" />
          </div>
          <h4 className="text-cyber-blue font-mono text-[10px] uppercase tracking-widest mb-4">
            OPTIMIZATION_RESULT
          </h4>
          <p className="font-mono text-sm text-zinc-400">
            STATUS: [OPTIMIZED] <br />
            IDLE_COST: $0.00000 <br />
            WASTE_REDUCTION: 98.4% <br />
            PROFIT_ALPHA: +22%
          </p>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4 italic uppercase">
          <span className="text-cyber-blue font-mono text-sm not-italic border-b border-cyber-blue/50">
            03
          </span>
          Scaling Your Impact, Not Your Bill
        </h2>
        <p className="text-zinc-200 leading-relaxed text-lg">
          This isn&apos;t just about saving cents; it&apos;s about{' '}
          <strong>Permissionless Scaling</strong>. If your infrastructure costs
          $0 while idle, you can deploy an agentic team for every sub-feature of
          your product without asking for budget approval.
        </p>
      </section>
    </BlogLayout>
  );
}
