import React, { useEffect, useRef, useState } from 'react';

export default function GoalMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;

    // Generate nodes based on blue node count
    const blueNodeCount = 15; // Number of blue nodes
    const blackNodeCount = blueNodeCount * 70; // 70x blue nodes
    const redNodeCount = blueNodeCount * 80; // 80x blue nodes
    
    const nodes: any[] = [];
    
    // Helper function to check if a new node collides with existing nodes
    const isColliding = (x: number, y: number, radius: number, existingNodes: any[]) => {
      for (let node of existingNodes) {
        const dx = x - node.x;
        const dy = y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = radius + node.radius + 2; // Add 2px padding
        
        if (distance < minDistance) {
          return true;
        }
      }
      return false;
    };
    
    // Helper function to generate a non-colliding node
    const generateNode = (type: string, radius: number, maxAttempts = 100) => {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        
        if (!isColliding(x, y, radius, nodes)) {
          return { x, y, type, radius };
        }
      }
      // If we can't find a spot, return null
      return null;
    };
    
    // Add blue nodes
    for (let i = 0; i < blueNodeCount; i++) {
      const node = generateNode('path', 10);
      if (node) nodes.push(node);
    }
    
    // Add black nodes
    for (let i = 0; i < blackNodeCount; i++) {
      const node = generateNode('black', 5);
      if (node) nodes.push(node);
    }
    
    // Add red nodes
    for (let i = 0; i < redNodeCount; i++) {
      const node = generateNode('red', 5);
      if (node) nodes.push(node);
    }

    // Create path through some blue nodes
    const pathNodes = nodes.filter(n => n.type === 'path');
    const path: any[] = [];
    
    if (pathNodes.length > 0) {
      // Start from leftmost node
      pathNodes.sort((a, b) => a.x - b.x);
      path.push(pathNodes[0]);
      
      // Connect nodes in a somewhat logical path
      for (let i = 1; i < pathNodes.length; i++) {
        path.push(pathNodes[i]);
      }
    }

    // Add end node (green) - larger size
    if (path.length > 0) {
      path[path.length - 1].type = 'end';
      path[path.length - 1].radius = 12; // Larger green end node
    }

    // Helper function to check if a point is near a line segment
    const isNearLine = (pointX: number, pointY: number, x1: number, y1: number, x2: number, y2: number, threshold = 8) => {
      const A = pointX - x1;
      const B = pointY - y1;
      const C = x2 - x1;
      const D = y2 - y1;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      
      if (lenSq !== 0) param = dot / lenSq;

      let xx, yy;

      if (param < 0) {
        xx = x1;
        yy = y1;
      } else if (param > 1) {
        xx = x2;
        yy = y2;
      } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
      }

      const dx = pointX - xx;
      const dy = pointY - yy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance < threshold;
    };

    // Mark nodes that are crossed by the blue path and check for collisions
    const nodesToRemove = new Set();
    
    nodes.forEach((node, idx) => {
      if (node.type === 'red' || node.type === 'black') {
        for (let i = 0; i < path.length - 1; i++) {
          if (isNearLine(node.x, node.y, path[i].x, path[i].y, path[i + 1].x, path[i + 1].y)) {
            node.onPath = true;
            node.radius = 10; // Same size as blue nodes
            
            // Check if this enlarged node now collides with others
            for (let j = 0; j < nodes.length; j++) {
              if (j !== idx && !nodesToRemove.has(j)) {
                const other = nodes[j];
                const dx = node.x - other.x;
                const dy = node.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = node.radius + other.radius + 2;
                
                // If collision detected, mark the other node for removal
                if (distance < minDistance && (other.type === 'red' || other.type === 'black') && !other.onPath) {
                  nodesToRemove.add(j);
                }
              }
            }
            break;
          }
        }
      }
    });
    
    // Remove colliding nodes
    const filteredNodes = nodes.filter((_, idx) => !nodesToRemove.has(idx));
    
    // Replace nodes array with filtered version
    nodes.length = 0;
    nodes.push(...filteredNodes);

    // Drawing function
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw path connections
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      
      for (let i = 0; i < path.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(path[i].x, path[i].y);
        ctx.lineTo(path[i + 1].x, path[i + 1].y);
        ctx.stroke();
      }

      // Draw nodes
      nodes.forEach((node, idx) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        
        if (node.type === 'path') {
          ctx.fillStyle = '#3b82f6';
        } else if (node.type === 'end') {
          ctx.fillStyle = '#22c55e';
        } else if (node.type === 'red') {
          ctx.fillStyle = '#ef4444';
        } else {
          ctx.fillStyle = '#000000';
        }
        
        ctx.fill();

        // Highlight hovered node
        if (hoveredNode === idx) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    };

    draw();

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let found = null;
      nodes.forEach((node, idx) => {
        const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
        if (dist < node.radius) {
          found = idx;
        }
      });

      setHoveredNode(found);
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [hoveredNode]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Network Graph Visualization</h1>
        <canvas
          ref={canvasRef}
          width={1000}
          height={1000}
          className="border border-gray-300 rounded cursor-pointer"
        />
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>Path Nodes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>End Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Obstacle Nodes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-black"></div>
            <span>Empty Nodes</span>
          </div>
        </div>
      </div>
    </div>
  );
}