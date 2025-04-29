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
//import UMLViewer from './components/UMLViewer'
import './index.css'
import LoginAccess from './components/LoginSingUp/Login';
import Profile from './components/ProfileEditor/Profile';

function App() {
  return (
      <main>
          <LoginAccess />
      </main>
  );
}

export default App;
