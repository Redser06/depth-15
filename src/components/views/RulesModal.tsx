import React from 'react';
import { X, ShieldCheck, Scale, BookOpen, AlertCircle } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0D6938] text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Pub Selection Rules &amp; Rating Scale
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Agreed consensus framework for Depth 15
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <div>
            <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
              <Scale className="w-4 h-4 text-[#0D6938]" />
              <span>1. The 0–100 Quality Rating Bands</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 font-mono">90–100 · World Class</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">Lions starter standard, top 3 on the planet in their position (e.g. Doris, Gibson-Park, Sheehan).</p>
              </div>
              <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800">
                <span className="font-bold text-green-900 dark:text-green-200 font-mono">80–89 · International</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">Proven Six Nations test performer; trusted starter in test rugby.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <span className="font-bold text-amber-900 dark:text-amber-200 font-mono">70–79 · Squad Player</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">Reliable matchday 23 cover; high European standard; fills in without disaster.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800">
                <span className="font-bold text-orange-900 dark:text-orange-200 font-mono">60–69 · Fringe</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">Provincial regular; potential touring squad cover; unproven at top test tier.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 sm:col-span-2">
                <span className="font-bold text-red-900 dark:text-red-200 font-mono">&lt;60 · Emerging</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">Academy graduate, U20 standout, or developmental squad player.</p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-4 h-4 text-[#0D6938]" />
              <span>2. The Propose &amp; Challenge Rules</span>
            </h4>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-600 dark:text-slate-300">
              <li><strong>No naked numbers:</strong> Re-rate proposals require a brief reasoned argument (min 15 chars). Retired or unavailable players require no essay.</li>
              <li><strong>Quorum:</strong> 50% of active group members must vote before a proposal can close.</li>
              <li><strong>The Median Rule:</strong> When a proposal passes, the new rating is the <em>median of all submitted counter-values</em>, including the proposer's. No single loud voice can warp a rating.</li>
              <li><strong>Contested Ratings:</strong> If challenges equal or exceed support, the rating is flagged as Contested for 30 days with a visible hatched bar.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
              <AlertCircle className="w-4 h-4 text-[#0D6938]" />
              <span>3. Eligibility &amp; Conventions</span>
            </h4>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-600 dark:text-slate-300">
              <li>Players based overseas outside IRFU policy are marked ineligible unless grandfathered or special dispensation applies.</li>
              <li>Secondary position entries are first-class cover ratings.</li>
              <li>Uncapped players carry an asterisk (<code>*</code>) following convention until awarded their first test cap.</li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0D6938] hover:bg-emerald-800 text-white transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
