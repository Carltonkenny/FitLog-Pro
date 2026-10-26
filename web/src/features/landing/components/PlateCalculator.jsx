import React, { useState, useMemo } from 'react';
import {
  Calculator,
} from 'lucide-react';

export default function PlateCalculator() {
  const [weight, setWeight] = useState(100);
  const [reps, setReps] = useState(5);
  const [barWeight, setBarWeight] = useState(20);

  // Epley 1RM Formula
  const oneRepMax = useMemo(() => {
    if (reps === 1) return weight;
    return Math.round((weight * (1 + reps / 30)) * 10) / 10;
  }, [weight, reps]);

  // Plate calculation per side
  const platesPerSide = useMemo(() => {
    let remainder = (weight - barWeight) / 2;
    if (remainder <= 0) return [];

    const availablePlates = [
      { weight: 25, color: '#EF4444', label: '25kg', height: 76 },
      { weight: 20, color: '#3B82F6', label: '20kg', height: 74 },
      { weight: 15, color: '#EAB308', label: '15kg', height: 68 },
      { weight: 10, color: '#22C55E', label: '10kg', height: 60 },
      { weight: 5, color: '#F8FAFC', label: '5kg', height: 48, textColor: '#000' },
      { weight: 2.5, color: '#1E293B', label: '2.5kg', height: 38 },
      { weight: 1.25, color: '#94A3B8', label: '1.25kg', height: 30, textColor: '#000' },
    ];

    const result = [];
    for (const plate of availablePlates) {
      while (remainder >= plate.weight - 0.001) {
        result.push(plate);
        remainder -= plate.weight;
      }
    }
    return result;
  }, [weight, barWeight]);

  const adjustWeight = (delta) => {
    setWeight((prev) => Math.max(barWeight, Math.round((prev + delta) * 10) / 10));
  };

  return (
    <section id="calculator" className="py-20 border-t border-[#242836] bg-[#0E1015] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1D26] border border-[#2B3040] text-xs font-mono text-[#00D4FF] mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>INSTANT BIOMECHANICS ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
            Epley 1RM & Visual Plate Loader
          </h2>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">
            Never second-guess what plates to slap on the bar. Real-time Epley 1RM estimates with IWF standard color-coded plate breakdowns.
          </p>
        </div>

        {/* Calculator Widget */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-[#14161D] border border-[#242836] p-6 sm:p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Controls */}
            <div className="md:col-span-5 space-y-6">
              {/* Weight Controller */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-mono uppercase text-slate-400">Total Bar Weight</label>
                  <span className="font-mono text-xl font-bold text-white tabular-nums">{weight.toFixed(1)} kg</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => adjustWeight(-5)}
                    className="min-w-11 h-11 px-2 rounded-lg bg-[#1F232E] hover:bg-[#2A2F3E] text-slate-200 border border-[#2B3040] text-xs font-mono"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => adjustWeight(-2.5)}
                    className="min-w-11 h-11 px-2 rounded-lg bg-[#1F232E] hover:bg-[#2A2F3E] text-slate-200 border border-[#2B3040] text-xs font-mono"
                  >
                    -2.5
                  </button>
                  <input
                    type="range"
                    min="20"
                    max="250"
                    step="2.5"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value))}
                    aria-label="Total weight in kilograms" className="flex-1 accent-[#00F59B] h-6 cursor-pointer"
                  />
                  <button
                    onClick={() => adjustWeight(2.5)}
                    className="min-w-11 h-11 px-2 rounded-lg bg-[#1F232E] hover:bg-[#2A2F3E] text-slate-200 border border-[#2B3040] text-xs font-mono"
                  >
                    +2.5
                  </button>
                  <button
                    onClick={() => adjustWeight(5)}
                    className="min-w-11 h-11 px-2 rounded-lg bg-[#1F232E] hover:bg-[#2A2F3E] text-slate-200 border border-[#2B3040] text-xs font-mono"
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* Reps Controller */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-mono uppercase text-slate-400">Completed Reps</label>
                  <span className="font-mono text-xl font-bold text-[#00F59B] tabular-nums">{reps} reps</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={reps}
                  onChange={(e) => setReps(parseInt(e.target.value))}
                  aria-label="Reps" className="w-full accent-[#00F59B] h-6 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>1 (Max)</span>
                  <span>5 (Strength)</span>
                  <span>8 (Hypertrophy)</span>
                  <span>12 (Endurance)</span>
                </div>
              </div>

              {/* Bar Type Selector */}
              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block mb-2">Barbell Tare</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBarWeight(20)}
                    className={`min-h-11 px-4 rounded-lg text-xs font-semibold border transition-all ${
                      barWeight === 20
                        ? 'bg-[#00F59B]/10 border-[#00F59B] text-[#00F59B]'
                        : 'bg-[#181B24] border-[#282C3B] text-slate-400'
                    }`}
                  >
                    Olympic Men's (20 kg)
                  </button>
                  <button
                    onClick={() => setBarWeight(15)}
                    className={`min-h-11 px-4 rounded-lg text-xs font-semibold border transition-all ${
                      barWeight === 15
                        ? 'bg-[#00F59B]/10 border-[#00F59B] text-[#00F59B]'
                        : 'bg-[#181B24] border-[#282C3B] text-slate-400'
                    }`}
                  >
                    Technique (15 kg)
                  </button>
                </div>
              </div>

            </div>

            {/* Visual Barbell & Output Display */}
            <div className="md:col-span-7 bg-[#101217] rounded-xl border border-[#242836] p-5 space-y-5">
              {/* Estimated 1RM Callout */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#181C26] to-[#12141A] border border-[#32384D]">
                <div>
                  <span className="text-xs font-mono text-slate-400 block uppercase">Theoretical 1RM (Epley)</span>
                  <div className="text-3xl font-black text-white font-['Outfit'] mt-0.5">
                    {oneRepMax} <span className="text-sm font-normal text-[#00F59B]">kg</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400 block uppercase">Per Side Weight</span>
                  <div className="text-xl font-bold text-[#00D4FF] font-mono mt-0.5">
                    {((weight - barWeight) / 2).toFixed(2)} kg
                  </div>
                </div>
              </div>

              {/* Dynamic 2D SVG Barbell Sleeve */}
              <div className="p-4 rounded-xl bg-[#08090C] border border-[#1C1F2B] overflow-x-auto">
                <div className="text-[11px] font-mono text-slate-400 mb-3 flex items-center justify-between">
                  <span>Visual Sleeve Loading (Per Side)</span>
                  <span className="text-[#00F59B]">{platesPerSide.length} Plates Loaded</span>
                </div>

                <div className="min-w-[320px] h-28 flex items-center justify-center relative">
                  {/* Shaft / Bar */}
                  <div className="absolute left-0 w-24 h-5 bg-gradient-to-b from-[#8B92A2] to-[#454B59] rounded-l-md shadow-inner" />
                  {/* Collar */}
                  <div className="absolute left-24 w-4 h-16 bg-[#2B3040] border-r-2 border-[#181A22] rounded-sm" />
                  
                  {/* Sleeve with Plates */}
                  <div className="ml-28 flex items-center gap-1.5 h-full pl-2">
                    {platesPerSide.map((plate, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: plate.color,
                          height: `${plate.height}px`,
                          color: plate.textColor || '#FFF',
                        }}
                        className="w-7 rounded-sm shadow-md flex items-center justify-center font-mono font-bold text-[9px] border border-black/20 select-none transition-all duration-300 transform hover:scale-105"
                        title={`${plate.label} Plate`}
                      >
                        <span className="rotate-90">{plate.weight}</span>
                      </div>
                    ))}
                    {/* Empty Barbell Sleeve Tip */}
                    <div className="w-16 h-6 bg-gradient-to-b from-[#A0A8B8] to-[#606775] rounded-r-md border border-slate-700/50" />
                  </div>
                </div>

                {/* Plate Legend */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-3 border-t border-[#1C1F2B]">
                  {platesPerSide.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">Only the bare bar. Add weight to see plates.</span>
                  ) : (
                    platesPerSide.map((plate, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold"
                        style={{ backgroundColor: plate.color + '25', color: plate.color }}
                      >
                        {plate.label}
                      </span>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
