import React, { useState } from "react";
import ChatInterface from "./components/chat-interface";

interface AnalysisResponse {
  requirements: any[];
  diagrams: any[];
  generatedCode?: any;
}

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <ChatInterface />
    </div>
  );
}

export default App;
