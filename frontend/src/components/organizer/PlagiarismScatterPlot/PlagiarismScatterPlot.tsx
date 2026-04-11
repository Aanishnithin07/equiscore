// frontend/src/components/organizer/PlagiarismScatterPlot/PlagiarismScatterPlot.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3-zoom';
import * as d3Selection from 'd3-selection';

export interface SimNode {
  id: string;
  name: string;
  x: number;
  y: number;
  trackId: 'health' | 'ai' | 'open';
}

export interface SimLink {
  source: string;
  target: string;
  similarity: number; // 0.0 to 1.0
}

interface Props {
  nodes: SimNode[];
  links: SimLink[];
}

/**
 * @component PlagiarismScatterPlot
 * @description Native D3-zoom wrapper binding 2D t-SNE transformations natively bypassing Recharts completely.
 * Exposes WebGL-grade DOM projections cleanly interacting with standard React lifecycles.
 */
export const PlagiarismScatterPlot: React.FC<Props> = ({ nodes, links }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);

  const W = 600;
  const H = 400;

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    
    // Attach D3 zoom to the outer SVG wrapping node
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        setTransform(event.transform);
      });

    d3Selection.select(svgRef.current).call(zoomBehavior as any);
  }, []);

  const getColor = (trackId: string) => {
    if (trackId === 'health') return 'var(--teal-400)';
    if (trackId === 'ai') return 'var(--accent-400)';
    return 'var(--amber-400)';
  };

  const getLineColor = (sim: number) => {
    if (sim > 0.85) return 'var(--coral-400)';
    return 'var(--amber-400)';
  };

  return (
    <div className="w-full glass-2 rounded-xl border border-[var(--border-default)] p-6 relative flex flex-col" ref={containerRef}>
      <span className="microlabel text-[var(--accent-400)] block mb-4">EMBEDDING CLUSTER (t-SNE) & SIMILARITY NETWORK</span>
      
      <div className="w-full max-w-[600px] h-[400px] mx-auto bg-[var(--bg-void)] rounded-lg border border-[var(--border-subtle)] overflow-hidden relative shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
        <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} className="cursor-grab active:cursor-grabbing">
            {/* The transformed semantic group */}
            <g transform={transform.toString()}>
                
                {/* Connections (Links) */}
                {links.map((link, i) => {
                    const sourceNode = nodes.find(n => n.id === link.source);
                    const targetNode = nodes.find(n => n.id === link.target);
                    if (!sourceNode || !targetNode) return null;

                    // scale inputs (assuming inputs are natively roughly normalized around -50 to 50, map to 0-W, 0-H)
                    // For mock, lets assume inputs are 0-1
                    const sx = sourceNode.x * W;
                    const sy = sourceNode.y * H;
                    const tx = targetNode.x * W;
                    const ty = targetNode.y * H;

                    return (
                        <line 
                            key={`link-${i}`} x1={sx} y1={sy} x2={tx} y2={ty} 
                            stroke={getLineColor(link.similarity)} 
                            strokeWidth={link.similarity > 0.85 ? 3 : 1}
                            opacity={link.similarity} 
                            className={link.similarity > 0.85 ? 'shadow-[0_0_10px_var(--coral-glow)]' : ''}
                        />
                    );
                })}

                {/* Nodes (Teams) */}
                {nodes.map(node => {
                    const cx = node.x * W;
                    const cy = node.y * H;
                    const isHovered = hoveredNode?.id === node.id;
                    const isLinkedHovered = hoveredNode && links.some(l => (l.source === hoveredNode.id && l.target === node.id) || (l.target === hoveredNode.id && l.source === node.id));

                    return (
                        <circle 
                            key={node.id} 
                            cx={cx} 
                            cy={cy} 
                            r={isHovered ? 12 : isLinkedHovered ? 10 : 8} 
                            fill="var(--bg-void)" 
                            stroke={getColor(node.trackId)} 
                            strokeWidth="3"
                            className="transition-all duration-300 transform-origin-center cursor-pointer"
                            onMouseEnter={() => setHoveredNode(node)}
                            onMouseLeave={() => setHoveredNode(null)}
                            opacity={hoveredNode && !isHovered && !isLinkedHovered ? 0.3 : 1}
                        />
                    );
                })}
            </g>
        </svg>

        {/* Floating Tooltip mapped identically mimicking ScoreDistribution */}
        {hoveredNode && (
            <div className="absolute z-50 glass-4 p-3 rounded-lg border border-[var(--border-subtle)] shadow-xl pointer-events-none" style={{ left: '20px', top: '20px' }}>
                <span className="font-sans font-bold text-[14px] text-white block mb-1">{hoveredNode.name}</span>
                <span className="font-mono text-[10px] text-[var(--accent-400)] block mb-3">{hoveredNode.trackId.toUpperCase()} TRACK</span>
                
                {/* List high-similarity links */}
                <span className="font-mono text-[9px] text-[var(--text-tertiary)] tracking-wider">COLLISION NETWORK</span>
                <div className="flex flex-col gap-1 mt-1">
                    {links.filter(l => l.source === hoveredNode.id || l.target === hoveredNode.id).map(l => {
                        const target = nodes.find(n => n.id === (l.source === hoveredNode.id ? l.target : l.source));
                        return (
                            <div key={l.source + l.target} className="flex justify-between items-center gap-4">
                                <span className="text-[12px] text-[var(--text-secondary)] truncate w-[100px]">{target?.name}</span>
                                <span className={`font-bold font-mono text-[12px] ${l.similarity > 0.85 ? 'text-coral-400' : 'text-amber-400'}`}>{(l.similarity*100).toFixed(1)}%</span>
                            </div>
                        )
                    })}
                    {links.filter(l => l.source === hoveredNode.id || l.target === hoveredNode.id).length === 0 && (
                        <span className="text-teal-400 text-[11px]">No structural similarities detected natively.</span>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between w-full max-w-[600px] mx-auto px-2">
        <div className="flex gap-4">
            <span className="font-mono text-[10px] flex items-center gap-2"><span className="w-2 h-2 rounded-full border-2 border-[var(--teal-400)]" /> Healthcare</span>
            <span className="font-mono text-[10px] flex items-center gap-2"><span className="w-2 h-2 rounded-full border-2 border-[var(--accent-400)]" /> AI/ML</span>
            <span className="font-mono text-[10px] flex items-center gap-2"><span className="w-2 h-2 rounded-full border-2 border-[var(--amber-400)]" /> Open</span>
        </div>
        <div className="flex gap-4">
            <span className="font-mono text-[10px] text-coral-400 flex items-center gap-2"><span className="w-4 h-[2px] bg-coral-400" /> &gt;85% High Similar</span>
            <span className="font-mono text-[10px] text-amber-400 flex items-center gap-2"><span className="w-4 h-[1px] bg-amber-400" /> &gt;70% Moderate</span>
        </div>
      </div>
    </div>
  );
};
