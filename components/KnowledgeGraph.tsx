"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, ZoomIn, ZoomOut, Maximize2, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import debounce from "lodash/debounce";
import { AnimatePresence } from "framer-motion";

import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

import {
  Category,
  DifficultyLevel,
  RelationshipType,
  MasteryLevel,
} from "@/lib/types";

interface GraphNode {
  id: string;
  name: string;
  category: Category;
  docs?: string[];
  mastery_levels?: {
    [K in DifficultyLevel]: MasteryLevel;
  };
  current_mastery?: DifficultyLevel;
  progress?: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

interface GraphLink {
  source: string;
  target: string;
  weight: number;
  relationship_type: RelationshipType;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const KnowledgeGraph = ({ data }: { data: GraphData }) => {
  const graphRef = useRef<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isValidData, setIsValidData] = useState(true);

  useEffect(() => {
    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.links)) {
      console.error("Invalid graph data provided");
      setIsValidData(false);
      return;
    }
    setIsValidData(true);
  }, [data]);

  if (!isValidData) {
    return <div>Error: Invalid graph data</div>;
  }

  useEffect(() => {
    if (graphRef.current && data.nodes.length > 0) {
      // Initial zoom and center
      graphRef.current.zoom(0.8);
      graphRef.current.centerAt(0, 0, 1000);
    }
  }, [data.nodes]);

  // Enhanced color scheme with opacity variations for mastery levels
  const categoryColors: { [key in Category | "default"]: string } = {
    core: "#2563eb",
    syntax: "#8b5cf6",
    architecture: "#0891b2",
    patterns: "#0d9488",
    structure: "#059669",
    data: "#ca8a04",
    state: "#d97706",
    storage: "#ea580c",
    network: "#dc2626",
    deployment: "#be123c",
    security: "#9f1239",
    performance: "#16a34a",
    runtime: "#15803d",
    testing: "#7c3aed",
    quality: "#6d28d9",
    ui: "#ec4899",
    interaction: "#db2777",
    tooling: "#64748b",
    utility: "#475569",
    default: "#6b7280",
  };

  // Relationship type styles
  const relationshipStyles: {
    [key in RelationshipType]: { color: string; dashArray: number[] };
  } = {
    prerequisite: { color: "#ef4444", dashArray: [] },
    enhances: { color: "#22c55e", dashArray: [5, 5] },
    similar: { color: "#8b5cf6", dashArray: [2, 2] },
    uses: { color: "#f59e0b", dashArray: [10, 3] },
    implements: { color: "#06b6d4", dashArray: [15, 3, 3, 3] },
  };

  // Handle window resizing
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById("graph-container");
      if (!container) return;

      setDimensions({
        width: container.clientWidth || 800,
        height: Math.max(600, (window.innerHeight || 600) * 0.7),
      });
    };

    const debouncedUpdate = debounce(updateDimensions, 200);
    window.addEventListener("resize", debouncedUpdate);
    updateDimensions();

    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      debouncedUpdate.cancel();
    };
  }, []);

  // Graph physics configuration
  useEffect(() => {
    if (!graphRef.current) return;

    const charge = graphRef.current.d3Force("charge");
    if (charge) charge.strength(-400);

    const link = graphRef.current.d3Force("link");
    if (link) {
      link.distance((link: GraphLink) => {
        if (!link?.relationship_type) return 200;
        const baseDistance = 200;
        switch (link.relationship_type) {
          case "prerequisite":
            return baseDistance * 0.8;
          case "enhances":
            return baseDistance * 1.2;
          default:
            return baseDistance;
        }
      });
    }

    const timeoutId = setTimeout(() => {
      if (graphRef.current) {
        graphRef.current.zoomToFit(400, 50);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [data]);

  // Search functionality
  useEffect(() => {
    const matchedNodes = new Set<string>();
    if (searchTerm && Array.isArray(data.nodes)) {
      data.nodes.forEach((node) => {
        if (!node?.name || !node?.category) return;
        if (
          node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.category.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          matchedNodes.add(node.id);
        }
      });
    }
    setHighlightNodes(matchedNodes);
  }, [searchTerm, data.nodes]);

  const getMasteryColor = (node: GraphNode) => {
    if (!node?.category) return categoryColors.default || "#6b7280";
    const baseColor = categoryColors[node.category] || categoryColors.default;
    if (!node.current_mastery) return baseColor;

    const opacity = (() => {
      switch (node.current_mastery) {
        case "beginner":
          return "40";
        case "intermediate":
          return "70";
        case "advanced":
          return "90";
        case "expert":
          return "100";
        default:
          return "40";
      }
    })();

    return `${baseColor}${opacity}`;
  };

  // Enhanced node rendering with highlights and hover effects
  const renderNodeCanvas = (
    node: GraphNode,
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(label).width;
    const backgroundHeight = 24 / globalScale;
    const backgroundWidth = textWidth + 8 / globalScale;

    // Determine if node is highlighted
    const isHighlighted = searchTerm ? highlightNodes.has(node.id) : true;
    const isHovered = hoveredNode?.id === node.id;
    const nodeColor = categoryColors[node.category] || categoryColors.default;

    // Apply highlight/fade/hover effect
    const finalColor = isHighlighted
      ? isHovered
        ? `${nodeColor}FF` // Full opacity for hover
        : nodeColor
      : `${nodeColor}40`; // 40 = 25% opacity

    // Node circle with hover effect
    ctx.beginPath();
    ctx.fillStyle = finalColor;
    const nodeSize = isHovered
      ? 8 / globalScale
      : isHighlighted
      ? 6 / globalScale
      : 5 / globalScale;
    ctx.arc(node.x || 0, node.y || 0, nodeSize, 0, 2 * Math.PI);
    ctx.fill();

    // Hover ring
    if (isHovered) {
      ctx.beginPath();
      ctx.strokeStyle = finalColor;
      ctx.lineWidth = 1 / globalScale;
      ctx.arc(
        node.x || 0,
        node.y || 0,
        nodeSize + 2 / globalScale,
        0,
        2 * Math.PI
      );
      ctx.stroke();
    }

    // Label background with adjusted opacity
    ctx.fillStyle = isHovered
      ? "rgba(255, 255, 255, 0.95)"
      : isHighlighted
      ? "rgba(255, 255, 255, 0.8)"
      : "rgba(255, 255, 255, 0.4)";
    ctx.fillRect(
      (node.x || 0) - backgroundWidth / 2,
      (node.y || 0) + 8 / globalScale,
      backgroundWidth,
      backgroundHeight
    );

    // Label text with adjusted opacity
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = finalColor;
    ctx.fillText(
      label,
      node.x || 0,
      (node.y || 0) + 8 / globalScale + backgroundHeight / 2
    );
  };

  const renderLinkCanvas = (
    link: GraphLink,
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => {
    const start = (
      typeof link.source === "string"
        ? data.nodes.find((n) => n.id === link.source)
        : link.source
    ) as GraphNode;
    const end = (
      typeof link.target === "string"
        ? data.nodes.find((n) => n.id === link.target)
        : link.target
    ) as GraphNode;

    if (!start?.x || !start?.y || !end?.x || !end?.y) return;

    const style = relationshipStyles[link.relationship_type] || {
      color: "#94a3b8",
      dashArray: [],
    };

    // Determine if link should be highlighted
    const isHighlighted = searchTerm
      ? highlightNodes.has(start.id) && highlightNodes.has(end.id)
      : true;
    const isHovered =
      hoveredNode && (start.id === hoveredNode.id || end.id === hoveredNode.id);

    ctx.beginPath();
    ctx.strokeStyle = isHovered
      ? style.color
      : isHighlighted
      ? style.color
      : `${style.color}40`; // 40 = 25% opacity
    ctx.lineWidth =
      Math.sqrt(link.weight) * (isHovered ? 2 : isHighlighted ? 1 : 0.5);

    if (style.dashArray.length > 0) {
      ctx.setLineDash(style.dashArray);
    } else {
      ctx.setLineDash([]);
    }

    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  return (
    <div
      id="graph-container"
      className="w-full relative bg-white dark:bg-gray-900 rounded-lg shadow-lg"
    >
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
          <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-none focus:ring-0 bg-transparent w-40"
          />
        </div>
        <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => graphRef.current?.zoomIn()}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => graphRef.current?.zoomOut()}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              graphRef.current?.centerAt(0, 0, 1000);
              graphRef.current?.zoom(0.8, 1000);
            }}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Node Details Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-64"
          >
            <h3 className="font-semibold text-lg mb-2">{selectedNode.name}</h3>

            {/* Category */}
            <div className="mb-3">
              <span className="text-sm text-gray-500">Category:</span>
              <span
                className="ml-2 px-2 py-1 rounded text-sm"
                style={{
                  backgroundColor: `${categoryColors[selectedNode.category]}20`,
                  color: categoryColors[selectedNode.category],
                }}
              >
                {selectedNode.category}
              </span>
            </div>

            {/* Mastery Level */}
            {selectedNode.current_mastery && (
              <div className="mb-3">
                <span className="text-sm text-gray-500">Mastery Level:</span>
                <div className="mt-1">
                  <div className="flex justify-between text-sm">
                    <span>{selectedNode.current_mastery}</span>
                    <span>{selectedNode.progress}%</span>
                  </div>
                  <Progress value={selectedNode.progress} className="mt-1" />
                </div>
              </div>
            )}

            {/* Documentation Links */}
            {selectedNode.docs && selectedNode.docs.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium mb-2">Documentation:</h4>
                <div className="space-y-1">
                  {selectedNode.docs.map((doc, i) => (
                    <a
                      key={i}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-blue-500 hover:text-blue-600"
                    >
                      <Book className="w-3 h-3 mr-1" />
                      View Documentation {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg text-sm">
        <h4 className="font-medium mb-2">Relationship Types:</h4>
        <div className="space-y-1">
          {Object.entries(relationshipStyles).map(([type, style]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-8 h-0.5"
                style={{
                  backgroundColor: style.color,
                  borderStyle: style.dashArray.length ? "dashed" : "solid",
                }}
              />
              <span className="text-gray-600 dark:text-gray-400 capitalize">
                {type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Force Graph */}
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        width={dimensions.width || 800}
        height={dimensions.height || 600}
        nodeRelSize={6}
        nodeCanvasObject={(
          node: any,
          ctx: CanvasRenderingContext2D,
          globalScale: number
        ) => renderNodeCanvas(node as GraphNode, ctx, globalScale)}
        linkCanvasObject={(
          link: any,
          ctx: CanvasRenderingContext2D,
          globalScale: number
        ) => renderLinkCanvas(link as GraphLink, ctx, globalScale)}
        nodeLabel={(node: any) => (node as GraphNode)?.name || "Unnamed Node"}
        backgroundColor="transparent"
        onNodeClick={(node: any) =>
          setSelectedNode(
            selectedNode?.id === (node as GraphNode)?.id
              ? null
              : (node as GraphNode)
          )
        }
        onNodeHover={(node: any) => setHoveredNode(node as GraphNode | null)}
        onNodeDragEnd={(node: any) => {
          const typedNode = node as GraphNode;
          if (typedNode?.x != null && typedNode?.y != null) {
            typedNode.fx = typedNode.x;
            typedNode.fy = typedNode.y;
          }
        }}
        d3VelocityDecay={0.3}
        d3AlphaDecay={0.02}
        d3AlphaMin={0.001}
        // centerAt={[0, 0]}
        minZoom={0.5}
        maxZoom={5}
        cooldownTicks={100}
        warmupTicks={50}
        onEngineStop={() => {
          graphRef.current?.zoomToFit(400, 50);
        }}
      />
    </div>
  );
};

export default KnowledgeGraph;
