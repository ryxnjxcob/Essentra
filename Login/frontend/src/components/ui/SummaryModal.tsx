import React from "react";

interface SummaryModalProps {
  open: boolean;
  summary: string;
  onClose: () => void;
}

const SummaryModal: React.FC<SummaryModalProps> = ({
  open,
  summary,
  onClose,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-white dark:bg-[#111113] w-full max-w-xl p-8 rounded-3xl shadow-2xl animate-scale-in border border-white/10">
        <h2 className="text-xl font-bold text-foreground mb-3">
          ✨ AI Summary
        </h2>

        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground opacity-90">
          {summary}
        </p>

        <button
          onClick={onClose}
          className="mt-6 px-6 py-2.5 rounded-xl font-semibold text-white bg-primary hover:bg-primary/80 transition-all w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SummaryModal;
