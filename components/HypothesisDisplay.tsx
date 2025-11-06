import React from 'react';
import { GeneratedOutput } from '../types';

interface HypothesisDisplayProps {
  output: GeneratedOutput | null;
}

const HypothesisDisplay: React.FC<HypothesisDisplayProps> = ({ output }) => {
  if (!output) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-sky-700 mb-3">Hipótesis de Cambio (Explicativa-Operacional)</h3>
        <p className="text-slate-700 leading-relaxed">{output.changeHypothesis}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-rose-700 mb-3">Hipótesis Nula</h3>
        <p className="text-slate-700 leading-relaxed">{output.nullHypothesis}</p>
      </div>
    </div>
  );
};

export default HypothesisDisplay;
