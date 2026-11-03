import React from 'react';
import EscapeClose from '../../../../components/EscapeClose';
import { RotateCcw } from 'lucide-react';

export default function RestartModal({
  isOpen,
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Restart session" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <EscapeClose onClose={onClose} />
      <div className="bg-[#12141a] border border-white/[0.1] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-popIn">
        <div className="flex items-center gap-2.5 text-amber-400">
          <RotateCcw className="w-5 h-5" />
          <h3 className="font-bold text-white text-base">Restart Current Session?</h3>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          This will reset the elapsed session clock back to 00:00 and uncheck all completed sets in this workout.
        </p>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition active:scale-95 shadow-md shadow-amber-500/20"
          >
            Confirm Restart
          </button>
        </div>
      </div>
    </div>
  );
}
