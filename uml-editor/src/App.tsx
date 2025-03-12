import React, { useState } from 'react';
import UMLViewer from './components/UMLViewer';
import CodeViewer from './components/CodeViewer';
// Si el archivo se llama DescargarCodigo.tsx
import ExportarCodigo from "./components/ExportarCodigo";

interface AnalysisResponse {
  requirements: any[];
  diagrams: any[];
  generatedCode?: any;
}

function App() {
  const [activeTab, setActiveTab] = useState<'diagrams' | 'code'>('diagrams');
  const [analysisResponse, setAnalysisResponse] = useState<AnalysisResponse | null>(null);

  const handleAnalysisComplete = (response: AnalysisResponse) => {
    console.log('Análisis completado:', response);
    setAnalysisResponse(response);
    
    // Si hay código generado, permitir cambiar a la pestaña de código
    if (response.generatedCode) {
      setActiveTab('code');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Generador de Diagramas UML
          </h1>
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => setActiveTab('diagrams')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'diagrams'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Diagramas
            </button>
            <button
              onClick={() => setActiveTab('code')}
              disabled={!analysisResponse?.generatedCode}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'code'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              } ${!analysisResponse?.generatedCode ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Código Generado
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {activeTab === 'diagrams' ? (
            <UMLViewer 
              onAnalysisComplete={handleAnalysisComplete} 
            />
          ) : (
            <CodeViewer 
              generatedCode={analysisResponse?.generatedCode} 
            />
          )}
        </div>
        {activeTab === 'code' && analysisResponse?.generatedCode && (
  <DescargarCodigo />
)}
      </main>
    </div>
  );
}

export default App;