import UMLViewer from './components/UMLViewer'
import ChatInterface from './components/chat-interface';
import './index.css'

function App() {
  return (
    <ChatInterface />
    // <div className="min-h-screen bg-gray-100">
    //   <header className="bg-white shadow">
    //     <div className="max-w-7xl mx-auto py-6 px-4">
    //       <h1 className="text-3xl font-bold text-gray-900">
    //         Generador de Diagramas UML
    //       </h1>
    //     </div>
    //   </header>
    //   <main>
    //     <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    //       <UMLViewer />
    //     </div>
    //   </main>
    // </div>
  );
}

export default App;