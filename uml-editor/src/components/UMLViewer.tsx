import React, { useState, useEffect } from "react";
import { analyzeRequirements, generateCode } from "../services/api.service";
import { FileText, MoreHorizontal } from "lucide-react";

interface DiagramType {
  type:
    | "classDiagram"
    | "sequenceDiagram"
    | "useCaseDiagram"
    | "componentDiagram"
    | "packageDiagram";
  title: string;
  code: string;
}

interface AnalysisResponse {
  requirements: any[];
  diagrams: DiagramType[];
  generatedCode?: any;
}

interface UMLViewerProps {
  onAnalysisComplete?: (response: AnalysisResponse) => void;
}

const MermaidDiagram: React.FC<{ code: string }> = ({ code }) => {
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        // @ts-ignore
        if (window.mermaid) {
          console.log("Intentando renderizar diagrama");
          // @ts-ignore
          await window.mermaid.run();
          console.log("Diagrama renderizado exitosamente");
        } else {
          console.log("Mermaid no está disponible");
          setError("Mermaid no está cargado");
        }
      } catch (err) {
        console.error("Error al renderizar:", err);
        setError(`Error al renderizar: ${err}`);
      }
    };

    renderDiagram();
  }, [code]);

  return (
    <div className="border rounded p-4">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="mermaid bg-white">{code}</div>
      )}
    </div>
  );
};

const UMLViewer: React.FC<UMLViewerProps> = ({ onAnalysisComplete }) => {
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [diagrams, setDiagrams] = useState<DiagramType[]>([]);
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramType | null>(
    null
  );
  const [analysisResponse, setAnalysisResponse] =
    useState<AnalysisResponse | null>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  useEffect(() => {
    const loadMermaid = async () => {
      try {
        console.log("Intentando cargar Mermaid...");
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js";
        script.async = true;

        script.onload = () => {
          console.log("Script de Mermaid cargado");
          // @ts-ignore
          window.mermaid.initialize({
            startOnLoad: true,
            theme: "default",
          });
          setMermaidLoaded(true);
          console.log("Mermaid inicializado");
        };

        script.onerror = (e) => {
          console.error("Error al cargar Mermaid:", e);
          setError("Error al cargar la librería de diagramas");
        };

        document.head.appendChild(script);
      } catch (err) {
        console.error("Error en loadMermaid:", err);
        setError("Error al configurar la librería de diagramas");
      }
    };

    loadMermaid();
  }, []);

  const handleAnalyze = async () => {
    if (!requirements.trim()) {
      setError("Por favor ingresa los requerimientos");
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log("Enviando requerimientos al servidor...");

      const data = await analyzeRequirements(requirements.trim());
      console.log("Datos recibidos:", data);

      if (data.diagrams && Array.isArray(data.diagrams)) {
        setDiagrams(data.diagrams);
        setAnalysisResponse(data);
        if (data.diagrams.length > 0) {
          setSelectedDiagram(data.diagrams[0]);
        }
        if (onAnalysisComplete) {
          onAnalysisComplete(data);
        }
      } else {
        throw new Error("No se recibieron diagramas válidos");
      }
    } catch (err: any) {
      console.error("Error en handleAnalyze:", err);
      setError(err.message || "Error al analizar los requerimientos");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!analysisResponse?.diagrams || diagrams.length === 0) {
      setError("Primero debes generar los diagramas");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      console.log("Generando código...");

      const codeData = await generateCode(
        analysisResponse.diagrams,
        analysisResponse.requirements
      );

      console.log("Código generado:", codeData);

      // Actualizar el análisis con el código generado
      const updatedAnalysis = {
        ...analysisResponse,
        generatedCode: codeData,
      };

      setAnalysisResponse(updatedAnalysis);

      if (onAnalysisComplete) {
        onAnalysisComplete(updatedAnalysis);
      }
    } catch (err: any) {
      console.error("Error generando código:", err);
      setError(err.message || "Error al generar el código");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <p className="text-sm text-white mb-2">
          Estado de Mermaid: {mermaidLoaded ? "Cargado" : "No cargado"}
        </p>
      </div>

      <div className="mb-4">
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Ingresa los requerimientos aquí..."
          className="w-full p-2 border rounded min-h-[100px]"
        />
      </div>

      <div className="w-full">
        <div className="rounded-2xl bg-[#40414f] p-4 shadow-lg">
          {/* Action Buttons */}
          <div className="flex justify-center mb-4">
            <button
              onClick={handleAnalyze}
              disabled={loading || !mermaidLoaded}
              className="cursor-pointer flex items-center gap-2 px-4 py-3 rounded-lg text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 text-center me-2 mb-2"
            >
              <MoreHorizontal className="w-5 h-5" />
              {loading ? "Analizando..." : "Generar todos los diagramas"}
            </button>
            <button
              onClick={handleGenerateCode}
              disabled={
                generating ||
                !analysisResponse?.diagrams ||
                diagrams.length === 0
              }
              className="bg-green-500 text-white gap-2 px-4 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 me-2 mb-2"
            >
              {generating ? "Generando código..." : "Generar Código"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <button className="cursor-pointer flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
              <FileText className="w-5 h-5" />
              Genera diagrama de secuencia
            </button>
            <button className="cursor-pointer flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
              <FileText className="w-5 h-5" />
              Genera diagrama de clases
            </button>
            <button className="cursor-pointer flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
              <FileText className="w-5 h-5" />
              Genera diagrama de paquetes
            </button>
            <button className="cursor-pointer flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
              <FileText className="w-5 h-5" />
              Genera diagrama casos de uso
            </button>
            <button className="cursor-pointer flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
              <FileText className="w-5 h-5" />
              Genera diagrama de componentes
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-red-500 p-2 border border-red-300 rounded">
          {error}
        </div>
      )}

      {diagrams.length > 0 && (
        <div className="grid grid-cols-12 gap-4">
          {/* Lista de diagramas */}
          <div className="col-span-3">
            <h3 className="font-bold mb-2">Diagramas:</h3>
            <div className="space-y-2">
              {diagrams.map((diagram, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDiagram(diagram)}
                  className={`w-full text-left p-2 rounded ${
                    selectedDiagram === diagram
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {diagram.title}
                </button>
              ))}
            </div>
          </div>

          {/* Visualización del diagrama */}
          <div className="col-span-9">
            {selectedDiagram && (
              <div className="border rounded-lg p-4 bg-white">
                <h4 className="font-bold mb-2">{selectedDiagram.title}</h4>
                <MermaidDiagram code={selectedDiagram.code} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UMLViewer;
