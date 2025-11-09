/**
 * Knowledge Graph Component
 * 
 * Interactive D3.js visualization showing relationships between symptoms,
 * diseases, and treatments with force-directed graph layout.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Loader2, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { GraphData, GraphNode, GraphEdge } from '@/lib/types';

interface KnowledgeGraphProps {
  symptoms: string[];
  diseases: string[];
  className?: string;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ 
  symptoms, 
  diseases, 
  className = '' 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Colors for different node types
  const nodeColors = {
    symptom: '#3B82F6',  // Blue
    disease: '#EF4444',  // Red
    treatment: '#10B981' // Green
  };

  /**
   * Fetch graph data when symptoms or diseases change
   */
  useEffect(() => {
    if (symptoms.length > 0 || diseases.length > 0) {
      fetchGraphData();
    }
  }, [symptoms, diseases]);

  /**
   * Fetch graph data from API
   */
  const fetchGraphData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.generateGraph(symptoms, diseases);
      setGraphData(data);
    } catch (error) {
      console.error('Error fetching graph data:', error);
      setError('Failed to generate knowledge graph');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Initialize D3.js visualization
   */
  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = svg.select('.graph-container');
    
    // Clear previous content
    container.selectAll('*').remove();

    // Use fixed dimensions that match the viewBox
    const width = 800;
    const height = 400;

    // Create zoom behavior with constraints
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .extent([[0, 0], [width, height]])
      .translateExtent([[-100, -100], [width + 100, height + 100]])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Define margins for containment
    const margin = 50;
    const innerWidth = width - 2 * margin;
    const innerHeight = height - 2 * margin;

    // Create force simulation with containment
    const simulation = d3.forceSimulation<GraphNode>(graphData.nodes)
      .force('link', d3.forceLink<GraphNode, GraphEdge>(graphData.edges)
        .id(d => d.id)
        .distance(d => Math.min(80, 100 - (d.weight * 30)))
        .strength(d => Math.min(1, d.weight))
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => (d as GraphNode).size + 15))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1));

    // Create links
    const links = container
      .selectAll('.link')
      .data(graphData.edges)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.weight * 3));

    // Create nodes
    const nodes = container
      .selectAll('.node')
      .data(graphData.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Add circles to nodes
    nodes
      .append('circle')
      .attr('r', d => d.size)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('click', (event, d) => {
        setSelectedNode(d);
      })
      .on('mouseover', function(event, d) {
        // Highlight connected nodes
        const connectedNodeIds = new Set<string>();
        graphData.edges.forEach(edge => {
          if (edge.source === d.id || (typeof edge.source === 'object' && edge.source.id === d.id)) {
            connectedNodeIds.add(typeof edge.target === 'string' ? edge.target : edge.target.id);
          }
          if (edge.target === d.id || (typeof edge.target === 'object' && edge.target.id === d.id)) {
            connectedNodeIds.add(typeof edge.source === 'string' ? edge.source : edge.source.id);
          }
        });

        // Dim non-connected nodes
        nodes.select('circle')
          .attr('opacity', node => 
            node.id === d.id || connectedNodeIds.has(node.id) ? 1 : 0.3
          );

        // Highlight connected links
        links.attr('opacity', edge => {
          const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
          const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
          return sourceId === d.id || targetId === d.id ? 1 : 0.1;
        });

        // Show tooltip
        d3.select('body')
          .append('div')
          .attr('class', 'graph-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
          .text(`${d.type.toUpperCase()}: ${d.label}`);
      })
      .on('mouseout', function() {
        // Reset opacity
        nodes.select('circle').attr('opacity', 1);
        links.attr('opacity', 0.6);

        // Remove tooltip
        d3.selectAll('.graph-tooltip').remove();
      });

    // Add labels to nodes
    nodes
      .append('text')
      .text(d => d.label)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.size + 15)
      .attr('fill', '#000000')
      .style('pointer-events', 'none');

    // Update positions on simulation tick with boundary constraints
    simulation.on('tick', () => {
      // Constrain nodes within boundaries
      graphData.nodes.forEach(d => {
        const nodeRadius = d.size + 5;
        d.x = Math.max(nodeRadius + margin, Math.min(width - nodeRadius - margin, d.x!));
        d.y = Math.max(nodeRadius + margin, Math.min(height - nodeRadius - margin, d.y!));
      });

      links
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      nodes.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Cleanup function
    return () => {
      simulation.stop();
      d3.selectAll('.graph-tooltip').remove();
    };

  }, [graphData]);

  if (symptoms.length === 0 && diseases.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-8 ${className}`}>
        <div className="text-center text-gray-500">
          <Info className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Knowledge Graph</h3>
          <p>Start chatting to see the interactive visualization of symptom-disease relationships</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-black">Knowledge Graph</h2>
            <p className="text-sm text-gray-800">Interactive visualization of medical relationships</p>
          </div>
          {graphData && (
            <div className="text-sm text-black">
              {graphData.stats.total_nodes} nodes, {graphData.stats.total_edges} connections
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="p-3 border-b bg-gray-50 flex-shrink-0">
        <div className="flex justify-center flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
            <span className="text-xs text-black">Symptoms</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
            <span className="text-xs text-black">Diseases</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
            <span className="text-xs text-black">Treatments</span>
          </div>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="relative flex-1 min-h-0">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-gray-600">Generating knowledge graph...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={fetchGraphData}
              className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        <div className="w-full h-full max-h-96 overflow-hidden bg-white">
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            className="block w-full h-full"
            style={{ minHeight: '300px', maxHeight: '400px' }}
            viewBox="0 0 800 400"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <clipPath id="graph-clip">
                <rect x="0" y="0" width="800" height="400" />
              </clipPath>
            </defs>
            <g className="graph-container" clipPath="url(#graph-clip)"></g>
          </svg>
        </div>

        {/* Instructions - Always visible at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs text-black bg-gray-50 bg-opacity-95 border-t flex-shrink-0">
          <div className="flex flex-wrap justify-center gap-3 text-center">
            <span className="flex items-center whitespace-nowrap">
              <span className="mr-1">🖱️</span>
              <span>Drag nodes</span>
            </span>
            <span className="flex items-center whitespace-nowrap">
              <span className="mr-1">🔍</span>
              <span>Scroll to zoom</span>
            </span>
            <span className="flex items-center whitespace-nowrap">
              <span className="mr-1">👆</span>
              <span>Click for details</span>
            </span>
            <span className="flex items-center whitespace-nowrap">
              <span className="mr-1">↕️</span>
              <span>Hover for connections</span>
            </span>
          </div>
        </div>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="p-4 border-t bg-blue-50">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-black">
                {selectedNode.type.toUpperCase()}: {selectedNode.label}
              </h4>
              <p className="text-sm text-gray-800 mt-1">
                {selectedNode.type === 'symptom' && 'A medical symptom that may indicate various conditions'}
                {selectedNode.type === 'disease' && 'A medical condition that may be associated with the reported symptoms'}
                {selectedNode.type === 'treatment' && 'A potential treatment approach for the associated condition'}
              </p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph;
