import React from 'react';
import { CaseData } from '../types';

interface MapDisplayProps {
  data: CaseData | null;
}

const MapNode: React.FC<{ title: string; isPM?: boolean; className?: string; description?: string }> = ({ title, isPM = false, className = '', description }) => (
  <div className={`bg-white border-2 border-slate-500 rounded-md p-2 text-center text-sm shadow-md text-slate-800 flex flex-col justify-center items-center ${isPM ? 'border-dashed border-sky-600 bg-sky-50' : ''} ${className}`}>
    {isPM && <span className="text-sky-600 font-semibold text-xs block">{`<<${description || 'PM'}>>`}</span>}
    <span className="font-semibold">{title}</span>
  </div>
);

const Arrow = ({ id, x1, y1, x2, y2, dashed = false, color = 'black' }) => (
    <line
      x1={x1} y1={y1}
      x2={x2} y2={y2}
      stroke={color}
      strokeWidth="1.5"
      strokeDasharray={dashed ? "5, 5" : "none"}
      markerEnd={`url(#${id})`}
    />
);

const FrictionLabel = ({ x, y, text }) => (
  <div className="absolute px-1 py-0.5 bg-rose-100 border border-rose-200 text-rose-700 text-[10px] rounded" style={{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)' }}>
    fricción: {text}
  </div>
);


const MapDisplay: React.FC<MapDisplayProps> = ({ data }) => {
  if (!data) return null;
  
  const microActorsX = {
    "Docentes": 240,
    "Estudiantes": 400,
    "Madres/Padres/Apoderados": 560
  }

  const pmsByLevel = {
      macro: data.pms.filter(p => p.level === 'macro'),
      meso: data.pms.filter(p => p.level === 'meso'),
      micro: data.pms.filter(p => p.level === 'micro'),
  }

  return (
    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">Mapa de Circulación de Sentido (MCS)</h3>
      <div className="relative min-w-[800px] h-[750px] bg-slate-50/50 rounded-lg p-4">
        {/* Lanes */}
        <div className="absolute top-4 left-4 right-4 h-[120px] border-2 border-slate-300 rounded-lg flex items-center justify-center pt-4">
            <span className="font-bold text-slate-500 bg-white px-2 -mt-28">MACRO (normas)</span>
        </div>
        <div className="absolute top-[160px] left-4 right-4 h-[200px] border-2 border-slate-300 rounded-lg flex items-center justify-center">
            <span className="font-bold text-slate-500 bg-white px-2 -mt-[216px]">MESO (dispositivos e instituciones)</span>
        </div>
        <div className="absolute top-[390px] left-4 right-4 h-[120px] border-2 border-slate-300 rounded-lg flex items-center justify-center">
            <span className="font-bold text-slate-500 bg-white px-2 -mt-[136px]">MICRO (interacciones)</span>
        </div>

        {/* Nodes */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 flex gap-4">
             {pmsByLevel.macro.map(pm => <MapNode key={pm.id} title={pm.name} description={pm.description} isPM className="w-32 h-16"/>)}
        </div>
        <MapNode title={data.actors.macro[0] || 'Actor Macro'} className="absolute top-12 left-1/4 -translate-x-1/2 w-52" />
        
        <MapNode title={data.actors.meso[0] || 'Actor Meso'} className="absolute top-[230px] left-1/4 -translate-x-1/2 w-36" />
        <div className="absolute top-[210px] left-1/2 -translate-x-1/4 flex gap-4">
            {pmsByLevel.meso.map(pm => <MapNode key={pm.id} title={pm.name} description={pm.description} isPM className="w-32 h-16"/>)}
        </div>

        <div className="absolute top-[400px] left-1/2 -translate-x-1/2 flex gap-4">
             {pmsByLevel.micro.map(pm => <MapNode key={pm.id} title={pm.name} description={pm.description} isPM className="w-32 h-16"/>)}
        </div>

        <div className="absolute top-[440px] left-1/2 -translate-x-1/2 flex justify-center w-full space-x-4">
          {data.actors.micro.map(actor => <MapNode key={actor} title={actor} className="w-32"/>)}
        </div>
        
        {/* Arrows SVG Overlay */}
        <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
            <defs>
                <marker id="arrowhead-black" markerWidth="8" markerHeight="5" refX="8" refY="2.5" orient="auto"><polygon points="0 0, 8 2.5, 0 5" fill="black" /></marker>
                <marker id="arrowhead-red" markerWidth="8" markerHeight="5" refX="8" refY="2.5" orient="auto"><polygon points="0 0, 8 2.5, 0 5" fill="red" /></marker>
            </defs>
            {/* Sense Flow - Simplified for dynamic display */}
            <Arrow id="arrowhead-black" x1={200} y1={80} x2={200} y2={230} /> 
            <Arrow id="arrowhead-black" x1={200} y1={260} x2={400} y2={400} />
            <Arrow id="arrowhead-black" x1={400} y1={470} x2={200} y2={260} />
            
            {/* Frictions */}
            <Arrow id="arrowhead-red" x1={microActorsX[data.actors.micro[0]]} y1={440} x2={200} y2={260} dashed />
            <Arrow id="arrowhead-red" x1={microActorsX[data.actors.micro[1]]} y1={440} x2={200} y2={260} dashed />
            <Arrow id="arrowhead-red" x1={microActorsX[data.actors.micro[2]]} y1={440} x2={200} y2={260} dashed />
        </svg>

        {/* Friction Labels */}
        <FrictionLabel x={240} y={350} text={data.frictions[0]?.label} />
        <FrictionLabel x={330} y={350} text={data.frictions[1]?.label} />
        <FrictionLabel x={420} y={350} text={data.frictions[2]?.label} />


        {/* CDC & Legend */}
         <div className="absolute top-12 right-8 w-[280px] bg-yellow-100 border border-yellow-300 p-2 rounded-lg shadow-md text-yellow-900">
            <h4 className="font-bold text-center text-sm mb-2 text-yellow-800">CDC por nivel</h4>
            {['macro', 'meso', 'micro'].map(level => {
                const items = data.cdc.filter(c => c.level === level);
                if (items.length === 0) return null;
                return (
                    <div key={level} className="mb-2">
                        <strong className="text-xs uppercase block">{level}:</strong>
                        {items.map(item => (
                            <p key={item.id} className="text-[11px] ml-1 leading-tight">D: {item.data}, S: {item.sense}, D: {item.decision}, E: {item.effect}.</p>
                        ))}
                    </div>
                )
            })}
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 bg-slate-200 border border-slate-300 p-2 rounded-lg shadow-md grid grid-cols-2 gap-2">
            <h4 className="font-bold text-center text-sm text-slate-700 col-span-2">LEYENDA e INDICADORES</h4>
            <div className="text-xs text-slate-700">
                <p><strong>Flecha sólida:</strong> flujo de sentido</p>
                <p><strong>Flecha discontinua (roja):</strong> fricción/tensión</p>
                <p><strong>{'<<PMx>>'}:</strong> Puente de Mediación</p>
            </div>
            <div className="text-xs text-slate-700 bg-white p-2 rounded">
               <p className="font-semibold">Indicadores ({data.timespan || 'N/A'})</p>
               <ul className="list-disc list-inside">
                 {(data.indicators || '').split(';').map((i, idx) => i.trim() && <li key={idx}>{i.trim()}</li>)}
               </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MapDisplay;