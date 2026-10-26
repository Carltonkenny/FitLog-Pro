import React from 'react';
import {
  Check,
  X,
  Sparkles,
} from 'lucide-react';

export default function ComparisonMatrix() {
  const rows = [
    {
      feature: 'Sub-2-Second Thumb Zone Set Logging',
      fitlog: true,
      hevy: false,
      strong: false,
      rp: false,
    },
    {
      feature: 'Works offline, zero lag',
      fitlog: true,
      hevy: true,
      strong: true,
      rp: false,
    },
    {
      feature: 'Live Gemini Biomechanics & Form Coach',
      fitlog: true,
      hevy: false,
      strong: false,
      rp: false,
    },
    {
      feature: 'Visual 2D Barbell Plate Sleeve Engine',
      fitlog: true,
      hevy: false,
      strong: false,
      rp: false,
    },
    {
      feature: 'Automatic Epley 1RM PR Telemetry',
      fitlog: true,
      hevy: true,
      strong: true,
      rp: true,
    },
    {
      feature: 'Anatomy Muscle Map & Hypertrophy Science',
      fitlog: true,
      hevy: false,
      strong: false,
      rp: true,
    },
    {
      feature: 'No Forced Social Network Feed Bloat',
      fitlog: true,
      hevy: false,
      strong: true,
      rp: true,
    },
  ];

  return (
    <section id="comparison" className="py-20 border-t border-[#242836] bg-[#0E1015]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1D26] border border-[#2B3040] text-xs font-mono text-[#00D4FF] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>UNCOMPROMISING COMPARISON</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
            Engineered for Serious Lifters
          </h2>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">
            Why athletes are switching from clunky, social-bloated apps to FitLog Pro.
          </p>
        </div>

        {/* Matrix Table */}
        <div className="max-w-4xl mx-auto overflow-x-auto rounded-2xl border border-[#242836] bg-[#12141A] shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-[#242836] bg-[#181B24]">
                <th className="py-4 px-6 text-xs font-mono uppercase text-slate-400">Features</th>
                <th className="py-4 px-4 text-center font-['Outfit'] font-extrabold text-sm text-[#00F59B] bg-[#00F59B]/10 border-x border-[#00F59B]/20">
                  FitLog Pro
                </th>
                <th className="py-4 px-4 text-center font-mono text-xs text-slate-400">Hevy</th>
                <th className="py-4 px-4 text-center font-mono text-xs text-slate-400">Strong</th>
                <th className="py-4 px-4 text-center font-mono text-xs text-slate-400">RP Strength</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F232E] text-xs sm:text-sm">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#161821] transition-colors">
                  <td className="py-3.5 px-6 font-medium text-slate-300">
                    {row.feature}
                  </td>
                  <td className="py-3.5 px-4 text-center bg-[#00F59B]/5 border-x border-[#00F59B]/20">
                    {row.fitlog ? (
                      <Check className="w-5 h-5 text-[#00F59B] mx-auto stroke-[2.5]" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {row.hevy ? (
                      <Check className="w-4 h-4 text-slate-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {row.strong ? (
                      <Check className="w-4 h-4 text-slate-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {row.rp ? (
                      <Check className="w-4 h-4 text-slate-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}
