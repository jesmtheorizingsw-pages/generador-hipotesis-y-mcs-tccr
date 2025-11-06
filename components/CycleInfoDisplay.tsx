import React from 'react';
import { CaseData } from '../types';

interface CycleInfoDisplayProps {
  data: CaseData;
}

const CycleInfoDisplay: React.FC<CycleInfoDisplayProps> = ({ data }) => {
  const isBaseline = data.cycleStage === 'Línea base inicial';
  const cycleTitle = data.cycleStage === 'Otro' ? data.customCycleStage || 'Otro' : data.cycleStage;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-700 mb-3">Resumen de Etapa</h3>
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-slate-600">Ciclo Actual:</p>
          <p className="text-slate-800 font-semibold">{cycleTitle}</p>
        </div>
        {!isBaseline && data.previousCycleDescription && (
          <div>
            <p className="text-sm font-medium text-slate-600">Descripción de la Etapa Anterior:</p>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{data.previousCycleDescription}</p>
          </div>
        )}
         {isBaseline && (
          <div>
             <p className="text-sm text-slate-500 italic">Esta es la línea base inicial; no hay intervenciones previas registradas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CycleInfoDisplay;