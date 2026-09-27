import React, { useState } from 'react';
import { 
  Layers, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Server, 
  Code2, 
  Cpu, 
  CreditCard, 
  FileDown, 
  ArrowRight,
  Database,
  Lock,
  Globe
} from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '../../data/neuroData';
import { SubscriptionTier } from '../../types/neuro';

export const PlatformBlueprint: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState<SubscriptionTier | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'plan' | 'success'>('plan');

  const handleOpenCheckout = (tier: SubscriptionTier) => {
    setSelectedTierForCheckout(tier);
    setCheckoutStep('plan');
  };

  const handleCompleteSubscription = () => {
    setCheckoutStep('success');
    setTimeout(() => {
      setSelectedTierForCheckout(null);
      setCheckoutStep('plan');
    }, 2800);
  };

  const handleDownloadBlueprintSpec = () => {
    const spec = `========================================================================
SYNAPSYNC PLATFORM ARCHITECTURAL BLUEPRINT & IMPLEMENTATION SPEC
Target: High-Impact Gamified Scientific Cognitive Training & Rehab Platform
========================================================================

1. ARCHITECTURAL TOPOLOGY: HYBRID REACT + HEADLESS CMS
------------------------------------------------------------------------
- Core Applet / Frontend: React 19 + TypeScript + Vite + Tailwind CSS.
- Audio Synthesis: Web Audio API (real-time sine oscillators, stereo panners, buffer noise).
- Telemetry Engine: High-resolution millisecond latency tracking (performance.now() precision).
- Educational / Articles CMS: Headless Strapi or WordPress REST / GraphQL API.
- Data Storage & DB: PostgreSQL with Cloud SQL or Supabase for relational user telemetry.
- Compliance: HIPAA & GDPR-compliant encryption at rest (AES-256) for cognitive rehabilitation records.

2. SCIENTIFIC VALIDATION PARADIGMS
------------------------------------------------------------------------
- Stroop Color-Word Task: Evaluates Anterior Cingulate conflict gating.
- Dual N-Back (Jaeggi Paradigm): Multi-threaded working memory expansion.
- Go / No-Go Sustained Attention: Subthalamic nucleus prepotent motor inhibition.
- Trail Making Test B (TMT-B): Frontoparietal cognitive flexibility & set-shifting.

3. MONETIZATION ARCHITECTURE
------------------------------------------------------------------------
- Free Starter Tier: Basic cognitive challenges, 40Hz audio, public community.
- Pro Neuro-Athlete Tier ($19/mo / $180/yr): Unlimited paradigms, micro-latency telemetry, habit matrices.
- Clinical & Rehab Tier ($49/mo / $470/yr): 12-week clinical pathways, therapist portal, sub-symptom pacing.
- Payment Gateway Integration: Stripe Billing or Memberstack with webhooks.

For technical partnerships: dev@synapsync.neuro
========================================================================`;

    const blob = new Blob([spec], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SynapSync_Platform_Architectural_Blueprint.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Blueprint Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Full System Architecture & Product Blueprint</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform Blueprint & Monetization Framework
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Complete technical specification comparing CMS vs React application engines, 
              real-time audio synthesis pipelines, and tiered monetization models.
            </p>
          </div>

          <button
            onClick={handleDownloadBlueprintSpec}
            className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer self-start md:self-auto shadow-md"
          >
            <FileDown className="w-4 h-4" />
            Download Blueprint Spec (.txt)
          </button>
        </div>
      </div>

      {/* Tech Stack Comparison Matrix */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Recommended Technology Stack & Tradeoffs</h2>
          <p className="text-xs text-slate-400">Comparing content management vs custom cognitive applet engines</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Content & CMS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">1. Content & CMS Tier</h3>
            <span className="text-xs text-slate-400 block">WordPress / Webflow / Ghost</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ideal for SEO-driven educational hubs, science articles, blog publishing, and video masterclass landing pages.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800 pt-3">
              <li className="flex items-center gap-2 text-emerald-400">✓ Rapid content authoring</li>
              <li className="flex items-center gap-2 text-emerald-400">✓ Zero-code SEO metadata</li>
              <li className="flex items-center gap-2 text-rose-400">✕ Poor for millisecond cognitive timing</li>
            </ul>
          </div>

          {/* Card 2: Interactive Applet */}
          <div className="bg-slate-900 border border-cyan-500/50 rounded-xl p-6 space-y-4 relative shadow-lg shadow-cyan-500/5">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2. Interactive Cognitive Engine</h3>
            <span className="text-xs text-cyan-400 block font-mono">React 19 + TypeScript + Web Audio</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our active architecture: real-time state machine for Stroop, 2-Back, Web Audio oscillators, and millisecond event telemetry.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800 pt-3">
              <li className="flex items-center gap-2 text-emerald-400">✓ Sub-millisecond performance.now()</li>
              <li className="flex items-center gap-2 text-emerald-400">✓ In-browser Web Audio synthesis</li>
              <li className="flex items-center gap-2 text-emerald-400">✓ Dynamic state & trial randomization</li>
            </ul>
          </div>

          {/* Card 3: Monetization & Subscriptions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">3. Monetization Gateway</h3>
            <span className="text-xs text-slate-400 block">Stripe Billing / Memberstack</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tiered subscription gating for free users, pro cognitive athletes, and clinical rehabilitation therapist access.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800 pt-3">
              <li className="flex items-center gap-2 text-emerald-400">✓ Tiered subscription management</li>
              <li className="flex items-center gap-2 text-emerald-400">✓ Automated trial periods & upgrades</li>
              <li className="flex items-center gap-2 text-emerald-400">✓ HIPAA-ready provider billing</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Monetization Tier Matrix */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Subscription Architecture & Pricing</h2>
            <p className="text-xs text-slate-400">Turnkey monetization model with transparent feature gating</p>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-medium ${
                billingCycle === 'monthly' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-medium flex items-center gap-1 ${
                billingCycle === 'annual' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual (Save 20%)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTION_TIERS.map(tier => {
            const price = billingCycle === 'annual'
              ? Math.round(tier.priceAnnual / 12)
              : tier.priceMonthly;

            return (
              <div
                key={tier.id}
                className={`rounded-2xl p-6 flex flex-col justify-between space-y-6 transition ${
                  tier.popular
                    ? 'bg-slate-900 border-2 border-cyan-500 shadow-xl shadow-cyan-500/10 relative'
                    : 'bg-slate-900 border border-slate-800'
                }`}
              >
                <div className="space-y-4">
                  {tier.badge && (
                    <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block font-semibold">
                      {tier.badge}
                    </span>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {tier.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white font-mono">
                      ${price}
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                    {billingCycle === 'annual' && tier.priceAnnual > 0 && (
                      <span className="text-[10px] text-slate-500 ml-2">
                        (${tier.priceAnnual} billed annually)
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 border-t border-slate-800 pt-4">
                    <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                      Included Capabilities:
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {tier.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenCheckout(tier)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                    tier.popular
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  <span>{tier.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulated Checkout Modal */}
      {selectedTierForCheckout && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Subscription Checkout</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedTierForCheckout.name}</h3>
              </div>
              <button
                onClick={() => setSelectedTierForCheckout(null)}
                className="text-slate-400 hover:text-white p-1 rounded text-xs"
              >
                ✕
              </button>
            </div>

            {checkoutStep === 'success' ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Access Granted</h4>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  Your account has been upgraded to the {selectedTierForCheckout.name}. 
                  All executive challenges and clinician modules unlocked.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Plan:</span>
                    <strong className="text-white">{selectedTierForCheckout.name}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Cycle:</span>
                    <span className="capitalize">{billingCycle}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-2 font-mono">
                    <span className="font-bold text-white">Total Due Today:</span>
                    <strong className="text-cyan-400 text-sm">
                      ${billingCycle === 'annual' ? selectedTierForCheckout.priceAnnual : selectedTierForCheckout.priceMonthly}
                    </strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-400">Payment Simulation (Sandbox Mode)</label>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-slate-400 font-mono">
                    <span>•••• •••• •••• 4242</span>
                    <span>12/28</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSelectedTierForCheckout(null)}
                    className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompleteSubscription}
                    className="flex-1 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer transition shadow-md"
                  >
                    Confirm Subscription
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
