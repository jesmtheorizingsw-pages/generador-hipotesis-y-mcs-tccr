import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import MapDisplay from './components/MapDisplay';
import HypothesisDisplay from './components/HypothesisDisplay';
import CycleInfoDisplay from './components/CycleInfoDisplay';
import type { CaseData, GeneratedOutput, CDCBlock, PMBlock } from './types';

const placeholderData: CaseData = {
  cycleStage: 'Línea base inicial',
  customCycleStage: '',
  previousCycleDescription: 'Se observa una mejora en la asistencia a reuniones (78%) pero la percepción de confianza no supera el 3.8/5. Los apoderados solicitan mayor incidencia en los temas de la minuta, que actualmente solo representa el 20% de sus propuestas.',
  hypothesisQ1: 'Desalineación norma-práctica en reuniones escolares, con baja trazabilidad de acuerdos y fricciones constantes.',
  hypothesisQ2: 'Implementación de Puentes de Mediación (PM1, PM2, PM3).',
  hypothesisQ3: 'Equipo Directivo, nivel meso.',
  hypothesisQ4: 'Ordena la interacción, traduce la norma a la práctica y mejora la trazabilidad de acuerdos.',
  hypothesisQ5: 'Aumentará la coherencia inter-niveles y mejorará la eficacia vincular y la justicia relacional (ICOR/VIRE).',
  hypothesisQ6: 'Indicadores de asistencia, cumplimiento de acuerdos, confianza y quejas; en 4-6 semanas.',
  actors: {
    micro: ["Docentes", "Estudiantes", "Madres/Padres/Apoderados"],
    meso: ["Equipo Directivo"],
    macro: ["Lineamientos ministeriales de participación escolar"],
  },
  pms: [
    { id: 'pm1', level: 'meso', stage: 'Línea base inicial', name: "Protocolo de reunión", description: "PM1" },
    { id: 'pm2', level: 'meso', stage: 'Línea base inicial', name: "Guion de apertura", description: "PM2" },
    { id: 'pm3', level: 'meso', stage: 'Ciclo 1', name: "Minuta pública", description: "PM3" },
  ],
  cdc: [
    { id: '1', level: 'micro', stage: 'Línea base inicial', data: "Interrupciones", sense: "Desalineación de expectativas", decision: "Aplicar PM2", effect: "Menos interrupciones" },
    { id: '2', level: 'meso', stage: 'Línea base inicial', data: "Acuerdos no registrados", sense: "Baja trazabilidad", decision: "Combinar PM1+PM3", effect: "Mejora coordinación" },
    { id: '3', level: 'macro', stage: 'Ciclo 1', data: "Norma poco conocida", sense: "Brecha norma-práctica", decision: "Difusión clara", effect: "Aumenta la adherencia" },
  ],
  frictions: [
      {from: "Docentes", to: "Equipo Directivo", label: "expectativas"},
      {from: "Estudiantes", to: "Equipo Directivo", label: "participación"},
      {from: "Madres/Padres/Apoderados", to: "Equipo Directivo", label: "información"},
  ],
  indicators: "asistencia ≥75%; acuerdos cumplidos ≥75%; disminución ≥ 40% de interrupciones; confianza ≥ 3,5/5; quejas ≤2/mes",
  timespan: "4–6 semanas",
};

const initialCdcBlock: CDCBlock = { id: `cdc-${Date.now()}`, level: 'micro', stage: 'Línea base inicial', data: '', sense: '', decision: '', effect: ''};
const initialPmBlock: PMBlock = { id: `pm-${Date.now()}`, level: 'meso', stage: 'Línea base inicial', name: '', description: ''};

const initialCaseData: CaseData = {
  cycleStage: 'Línea base inicial',
  customCycleStage: '',
  previousCycleDescription: '',
  hypothesisQ1: '',
  hypothesisQ2: '',
  hypothesisQ3: '',
  hypothesisQ4: '',
  hypothesisQ5: '',
  hypothesisQ6: '',
  actors: { micro: ["Docentes", "Estudiantes", "Madres/Padres/Apoderados"], meso: ["Equipo Directivo"], macro: ["Lineamientos ministeriales de participación escolar"]},
  pms: [initialPmBlock],
  cdc: [initialCdcBlock],
  frictions: [{from: "Docentes", to: "Equipo Directivo", label: "expectativas"}, {from: "Estudiantes", to: "Equipo Directivo", label: "participación"}, {from: "Madres/Padres/Apoderados", to: "Equipo Directivo", label: "información"}],
  indicators: "",
  timespan: "",
};


const App: React.FC = () => {
  const [caseData, setCaseData] = useState<CaseData>(initialCaseData);
  const [output, setOutput] = useState<GeneratedOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cycleOptions = ['Línea base inicial', ...Array.from({ length: 10 }, (_, i) => `Ciclo ${i + 1}`), 'Otro'];

  const generateHypotheses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setOutput(null);

    const ENDPOINT = "https://timely-hummingbird-fa79a0.netlify.app/.netlify/functions/gemini";
    
    const prompt = `
      Actúa como un experto en la Teoría Cognosistémica de la Construcción Relacional (TCCR) para el Trabajo Social.
      Tu tarea es tomar los siguientes datos estructurados de un caso y redactar una "Hipótesis de Cambio" (explicativa-operacional) y una "Hipótesis Nula" que sean técnicamente precisas, coherentes y con una redacción fluida y profesional.

      Utiliza los datos de las 6 preguntas del formulario como base principal para la estructura de la hipótesis de cambio, siguiendo el formato TCCR: "Si [acción] es implementado por [quién], entonces [cambio esperado] porque [mecanismo], medido por [medición]".
      Utiliza el resto de los datos (PMs, CDCs, indicadores) para dar contexto y enriquecer la redacción.
      La Hipótesis Nula debe negar el efecto de la acción sobre los indicadores mencionados.

      El resultado DEBE ser un objeto JSON válido con la siguiente estructura:
      {
        "changeHypothesis": "...",
        "nullHypothesis": "..."
      }

      DATOS DEL CASO:
      ${JSON.stringify(caseData, null, 2)}
    `;

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`La API respondió con un error ${response.status}: ${errorBody}`);
      }
      
      const result = await response.json();
      // La respuesta de la IA viene como un string de texto que contiene JSON, por lo que necesita ser parseado.
      const parsedResult: GeneratedOutput = JSON.parse(result.text);

      setOutput(parsedResult);

    } catch (e: any) {
      console.error("Error al contactar la API de Gemini:", e);
      setError(`No se pudo generar la hipótesis. Error: ${e.message || 'Error de red.'}`);
    } finally {
      setIsLoading(false);
    }
  }, [caseData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCaseData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'cycleStage') {
        if (value !== 'Otro') {
          newData.customCycleStage = '';
        }
        if (value === 'Línea base inicial') {
          newData.previousCycleDescription = '';
        }
      }
      return newData;
    });
  };
  
  const handleCdcChange = (id: string, field: keyof Omit<CDCBlock, 'id'>, value: string) => {
    setCaseData(prev => ({
        ...prev,
        cdc: prev.cdc.map(item =>
            item.id === id ? { ...item, [field]: value as any } : item
        )
    }));
  };
  
  const handlePmChange = (id: string, field: keyof Omit<PMBlock, 'id'>, value: string) => {
    setCaseData(prev => ({
        ...prev,
        pms: prev.pms.map(item =>
            item.id === id ? { ...item, [field]: value as any } : item
        )
    }));
  };

  const addCdcBlock = () => {
    setCaseData(prev => ({
        ...prev,
        cdc: [...prev.cdc, { id: `cdc-${Date.now()}`, level: 'micro', stage: caseData.cycleStage, data: '', sense: '', decision: '', effect: ''}]
    }));
  };
  
  const removeCdcBlock = (id: string) => {
     setCaseData(prev => ({
        ...prev,
        cdc: prev.cdc.length > 1 ? prev.cdc.filter(item => item.id !== id) : prev.cdc
    }));
  };
  
  const addPmBlock = () => {
    setCaseData(prev => ({
        ...prev,
        pms: [...prev.pms, { id: `pm-${Date.now()}`, level: 'meso', stage: caseData.cycleStage, name: '', description: ''}]
    }));
  };
  
  const removePmBlock = (id: string) => {
     setCaseData(prev => ({
        ...prev,
        pms: prev.pms.length > 1 ? prev.pms.filter(item => item.id !== id) : prev.pms
    }));
  };
  
  const isDescriptionDisabled = caseData.cycleStage === 'Línea base inicial';

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">1. Ingrese Datos del Caso</h2>
            <p className="text-sm text-slate-600 mb-6">Complete los siguientes campos para generar los instrumentos. El texto de ejemplo del "Caso Escuela" sirve como guía.</p>
            
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cycleStage" className="block text-sm font-medium text-slate-700">Etapa</label>
                    <select name="cycleStage" id="cycleStage" value={caseData.cycleStage} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500">
                      {cycleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                   {caseData.cycleStage === 'Otro' && (
                    <div>
                      <label htmlFor="customCycleStage" className="block text-sm font-medium text-slate-700">Especificar "Otro"</label>
                      <input type="text" name="customCycleStage" id="customCycleStage" value={caseData.customCycleStage} onChange={handleInputChange} placeholder="Ej: Cierre Final" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                    </div>
                  )}
                </div>
                
                 <div>
                  <label htmlFor="previousCycleDescription" className="block text-sm font-medium text-slate-700">Descripción de la Etapa Anterior</label>
                  <textarea name="previousCycleDescription" id="previousCycleDescription" value={caseData.previousCycleDescription} onChange={handleInputChange} rows={3} placeholder={placeholderData.previousCycleDescription} disabled={isDescriptionDisabled} className={`mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 ${isDescriptionDisabled ? 'bg-slate-50 cursor-not-allowed' : ''}`} />
                </div>

                <div className="p-4 border rounded-md space-y-4 bg-slate-50/50">
                    <h3 className="font-semibold text-slate-800 text-md">Formulario para Hipótesis de Cambio</h3>
                    
                    <div>
                        <label htmlFor="hypothesisQ1" className="block text-sm font-medium text-slate-700">1. ¿Cuál es el problema que quieres cambiar?</label>
                        <textarea name="hypothesisQ1" id="hypothesisQ1" value={caseData.hypothesisQ1} onChange={handleInputChange} rows={2} placeholder={placeholderData.hypothesisQ1} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                    </div>
                     <div>
                        <label htmlFor="hypothesisQ2" className="block text-sm font-medium text-slate-700">2. ¿Qué acción o dispositivo implementarás?</label>
                        <input type="text" name="hypothesisQ2" id="hypothesisQ2" value={caseData.hypothesisQ2} onChange={handleInputChange} placeholder={placeholderData.hypothesisQ2} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                    </div>
                    <div>
                        <label htmlFor="hypothesisQ3" className="block text-sm font-medium text-slate-700">3. ¿Quién lo va a implementar y en qué nivel?</label>
                        <input type="text" name="hypothesisQ3" id="hypothesisQ3" value={caseData.hypothesisQ3} onChange={handleInputChange} placeholder={placeholderData.hypothesisQ3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                    </div>
                    <div>
                        <label htmlFor="hypothesisQ4" className="block text-sm font-medium text-slate-700">4. ¿Por qué crees que esa acción producirá el cambio?</label>
                        <textarea name="hypothesisQ4" id="hypothesisQ4" value={caseData.hypothesisQ4} onChange={handleInputChange} rows={2} placeholder={placeholderData.hypothesisQ4} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                    </div>
                     <div>
                        <label htmlFor="hypothesisQ5" className="block text-sm font-medium text-slate-700">5. ¿Qué cambio observable esperas que ocurra?</label>
                        <input type="text" name="hypothesisQ5" id="hypothesisQ5" value={caseData.hypothesisQ5} onChange={handleInputChange} placeholder={placeholderData.hypothesisQ5} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                    </div>
                     <div>
                        <label htmlFor="hypothesisQ6" className="block text-sm font-medium text-slate-700">6. ¿Cómo lo vas a medir y en cuánto tiempo?</label>
                        <input type="text" name="hypothesisQ6" id="hypothesisQ6" value={caseData.hypothesisQ6} onChange={handleInputChange} placeholder={placeholderData.hypothesisQ6} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                    </div>
                </div>

                <div className="p-4 border rounded-md space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-slate-700">Puentes de Mediación (PM) totales en esta Etapa</h3>
                        <button type="button" onClick={addPmBlock} className="bg-sky-500 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-lg hover:bg-sky-600">+</button>
                    </div>
                     {caseData.pms.map((pmItem, index) => (
                      <div key={pmItem.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-2 border-t">
                          <div className="md:col-span-1">
                              <label htmlFor={`pm-level-${pmItem.id}`} className="block text-xs font-medium text-slate-600">Nivel</label>
                              <select id={`pm-level-${pmItem.id}`} value={pmItem.level} onChange={(e) => handlePmChange(pmItem.id, 'level', e.target.value)} className="mt-1 block w-full px-2 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 focus:outline-none focus:border-sky-500">
                                  <option value="micro">Micro</option>
                                  <option value="meso">Meso</option>
                                  <option value="macro">Macro</option>
                              </select>
                          </div>
                          <div className="md:col-span-1">
                              <label htmlFor={`pm-stage-${pmItem.id}`} className="block text-xs font-medium text-slate-600">Etapa</label>
                              <select id={`pm-stage-${pmItem.id}`} value={pmItem.stage} onChange={(e) => handlePmChange(pmItem.id, 'stage', e.target.value)} className="mt-1 block w-full px-2 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 focus:outline-none focus:border-sky-500">
                                  {cycleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                          </div>
                          <div className="md:col-span-2">
                            <label htmlFor={`pm-name-${pmItem.id}`} className="block text-xs font-medium text-slate-600">Nombre PM (Ej: PM1)</label>
                            <input id={`pm-name-${pmItem.id}`} type="text" placeholder={placeholderData.pms[index]?.description || '...'} value={pmItem.description} onChange={(e) => handlePmChange(pmItem.id, 'description', e.target.value)} className="mt-1 w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400"/>
                          </div>
                           <div className="md:col-span-2">
                            <label htmlFor={`pm-desc-${pmItem.id}`} className="block text-xs font-medium text-slate-600">Descripción</label>
                            <input id={`pm-desc-${pmItem.id}`} type="text" placeholder={placeholderData.pms[index]?.name || '...'} value={pmItem.name} onChange={(e) => handlePmChange(pmItem.id, 'name', e.target.value)} className="mt-1 w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400"/>
                          </div>
                          {caseData.pms.length > 1 && <button type="button" onClick={() => removePmBlock(pmItem.id)} className="text-rose-500 text-xs hover:text-rose-700 md:col-start-1">Quitar</button>}
                      </div>
                    ))}
                </div>


                <div className="p-4 border rounded-md space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-slate-700">Cadenas de Decisión Cognosistémica (CDC) totales en esta Etapa</h3>
                        <button type="button" onClick={addCdcBlock} className="bg-sky-500 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-lg hover:bg-sky-600">+</button>
                    </div>
                    {caseData.cdc.map((cdcItem, index) => (
                      <div key={cdcItem.id} className="grid grid-cols-1 md:grid-cols-7 gap-2 p-2 border-t">
                          <div className="md:col-span-1">
                              <label htmlFor={`cdc-level-${cdcItem.id}`} className="block text-xs font-medium text-slate-600">Nivel</label>
                              <select id={`cdc-level-${cdcItem.id}`} value={cdcItem.level} onChange={(e) => handleCdcChange(cdcItem.id, 'level', e.target.value)} className="mt-1 block w-full px-2 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 focus:outline-none focus:border-sky-500">
                                  <option value="micro">Micro</option>
                                  <option value="meso">Meso</option>
                                  <option value="macro">Macro</option>
                              </select>
                          </div>
                          <div className="md:col-span-1">
                              <label htmlFor={`cdc-stage-${cdcItem.id}`} className="block text-xs font-medium text-slate-600">Etapa</label>
                              <select id={`cdc-stage-${cdcItem.id}`} value={cdcItem.stage} onChange={(e) => handleCdcChange(cdcItem.id, 'stage', e.target.value)} className="mt-1 block w-full px-2 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 focus:outline-none focus:border-sky-500">
                                  {cycleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                          </div>
                          <div className="md:col-span-5 grid grid-cols-2 md:grid-cols-4 gap-2">
                            <input type="text" placeholder={`Dato (${placeholderData.cdc[index]?.data || '...'})`} value={cdcItem.data} onChange={(e) => handleCdcChange(cdcItem.id, 'data', e.target.value)} className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400"/>
                            <input type="text" placeholder={`Sentido (${placeholderData.cdc[index]?.sense || '...'})`} value={cdcItem.sense} onChange={(e) => handleCdcChange(cdcItem.id, 'sense', e.target.value)} className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400"/>
                            <input type="text" placeholder={`Decisión (${placeholderData.cdc[index]?.decision || '...'})`} value={cdcItem.decision} onChange={(e) => handleCdcChange(cdcItem.id, 'decision', e.target.value)} className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400"/>
                            <input type="text" placeholder={`Efecto (${placeholderData.cdc[index]?.effect || '...'})`} value={cdcItem.effect} onChange={(e) => handleCdcChange(cdcItem.id, 'effect', e.target.value)} className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400"/>
                          </div>
                          {caseData.cdc.length > 1 && <button type="button" onClick={() => removeCdcBlock(cdcItem.id)} className="text-rose-500 text-xs hover:text-rose-700 md:col-start-1">Quitar</button>}
                      </div>
                    ))}
                </div>

                 <div>
                  <label htmlFor="indicators" className="block text-sm font-medium text-slate-700">Indicadores y Metas (separados por ;)</label>
                  <textarea name="indicators" id="indicators" value={caseData.indicators} onChange={handleInputChange} rows={3} placeholder={placeholderData.indicators} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                </div>
                 <div>
                    <label htmlFor="timespan" className="block text-sm font-medium text-slate-700">Plazo de Observación</label>
                    <input type="text" name="timespan" id="timespan" value={caseData.timespan} onChange={handleInputChange} placeholder={placeholderData.timespan} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                </div>

              <div className="pt-4 border-t">
                <button 
                  type="button" 
                  onClick={generateHypotheses} 
                  disabled={isLoading}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:bg-sky-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generando...
                    </>
                  ) : (
                    'Generar Instrumentos'
                  )}
                </button>
                {error && <p className="text-sm text-rose-600 mt-2 text-center">{error}</p>}
              </div>
            </form>
          </div>
          
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">2. Instrumentos Generados</h2>
               {(output || isLoading || error) && <CycleInfoDisplay data={caseData} />}
               <div className="mt-8">
                <HypothesisDisplay output={output} />
               </div>
            </div>
             {(output && caseData.hypothesisQ1) && <MapDisplay data={caseData} />}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;