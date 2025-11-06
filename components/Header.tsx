import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-sky-600 rounded-lg flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Generador de Hipótesis de Cambio y MCS (TCCR) para Trabajo Social</h1>
                <p className="text-slate-600 mt-1">Automatice la creación de instrumentos TCCR clave a partir de los datos de su caso.</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
