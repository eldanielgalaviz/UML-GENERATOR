import React, { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface UMLClassData {
  label: string;
  attributes: string[];
  methods: string[];
}

const UMLClassNode = ({ data }: { data: UMLClassData }) => {
  return (
    <div className="bg-white border-2 border-gray-300 rounded p-2 shadow-md min-w-[200px]">
      <div className="font-bold border-b pb-2 text-center">{data.label}</div>
      <div className="border-b py-2">
        {data.attributes.map((attr, i) => (
          <div key={i} className="text-sm px-2">{attr}</div>
        ))}
      </div>
      <div className="pt-2">
        {data.methods.map((method, i) => (
          <div key={i} className="text-sm px-2">{method}</div>
        ))}
      </div>
    </div>
  );
};

// Definición de nodos iniciales
const initialNodes: Node<UMLClassData>[] = [
  {
    id: '1',
    type: 'umlClass',
    position: { x: 250, y: 100 },
    data: {
      label: 'Usuario',
      attributes: ['+ nombre: String', '+ email: String'],
      methods: ['+ login()', '+ logout()']
    },
  },
  {
    id: '2',
    type: 'umlClass',
    position: { x: 550, y: 100 },
    data: {
      label: 'Producto',
      attributes: ['+ nombre: String', '+ precio: Number'],
      methods: ['+ getDetalles()']
    },
  },
];

// Definición de conexiones iniciales
const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    label: 'compra',
    type: 'smoothstep',
  },
];

const nodeTypes: NodeTypes = {
  umlClass: UMLClassNode,
};

const UMLEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection) => 
    setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds)), 
    []
  );

  const addNewClass = () => {
    const newNode: Node<UMLClassData> = {
      id: `${nodes.length + 1}`,
      type: 'umlClass',
      position: { 
        x: Math.random() * 500, 
        y: Math.random() * 500 
      },
      data: {
        label: 'Nueva Clase',
        attributes: ['+ atributo1: String'],
        methods: ['+ metodo1()']
      },
    };
    setNodes(nodes => [...nodes, newNode]);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={addNewClass}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Agregar Clase
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default UMLEditor;