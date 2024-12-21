import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CheckCircle, Circle } from "lucide-react";
import * as d3 from "d3";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SkillTree, ProgressTracking } from "@/lib/types";

interface Props {
  skillTree: SkillTree;
  progressData: ProgressTracking;
}

interface TreeNode {
  id: string;
  x: number;
  y: number;
}

const SkillTreeView = ({ skillTree, progressData }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });

  const nodeWidth = 200;
  const nodeHeight = 100;
  const levelGap = 150;

  // Calculate node positions in a tree layout
  const calculateTreeLayout = () => {
    const treeLayout = d3
      .tree<{ id: string }>()
      .nodeSize([nodeWidth + 20, nodeHeight + levelGap]);

    const root = d3
      .stratify<{ id: string }>()
      .id((d) => d.id)
      .parentId((d) => skillTree.edges.find((e) => e.target === d.id)?.source)(
      skillTree.nodes
    );

    return treeLayout(root);
  };

  // Initialize the tree visualization
  useEffect(() => {
    if (!svgRef.current || !skillTree.nodes.length) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select(".zoom-group");

    // Update zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);

    // Initial centering
    const initialTransform = d3.zoomIdentity
      .translate(dimensions.width / 2, 100)
      .scale(0.8);
    svg.call(zoom.transform, initialTransform);
  }, [skillTree, dimensions, calculateTreeLayout]);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById("skill-tree-container");
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const getNodeStatus = (nodeId: string) => {
    const node = skillTree.nodes.find((n) => n.id === nodeId);
    if (!node) return "locked";

    const dependencies = node.dependencies || [];
    const allDependenciesMet = dependencies.every(
      (dep) => progressData.skill_levels[dep]?.current_level === "expert"
    );

    if (!allDependenciesMet) return "locked";

    const skillLevel = progressData.skill_levels[nodeId];
    if (!skillLevel) return "available";

    return skillLevel.current_level === "expert" ? "completed" : "in-progress";
  };

  const renderNode = (node: TreeNode) => {
    const status = getNodeStatus(node.id);
    const skillLevel = progressData.skill_levels[node.id];
    const nodeData = skillTree.nodes.find((n) => n.id === node.id);

    return (
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        onClick={() => setSelectedNode(node.id)}
        style={{ cursor: "pointer" }}
      >
        {/* Node background */}
        <rect
          x={-nodeWidth / 2}
          y={-nodeHeight / 2}
          width={nodeWidth}
          height={nodeHeight}
          rx={8}
          className={`
            ${
              status === "locked"
                ? "fill-gray-100 dark:fill-gray-800"
                : status === "completed"
                ? "fill-green-50 dark:fill-green-900"
                : status === "in-progress"
                ? "fill-blue-50 dark:fill-blue-900"
                : "fill-white dark:fill-gray-700"
            }
          `}
          stroke={status === "locked" ? "#94a3b8" : "#60a5fa"}
          strokeWidth={2}
        />

        {/* Node content */}
        <text
          className="fill-gray-900 dark:fill-gray-100 text-sm"
          textAnchor="middle"
          y={-20}
        >
          {nodeData?.concept_id}
        </text>

        {/* Status icon */}
        <g
          transform={`translate(${nodeWidth / 2 - 24}, ${
            -nodeHeight / 2 + 16
          })`}
        >
          {status === "locked" && <Lock className="w-4 h-4 text-gray-400" />}
          {status === "completed" && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
          {status === "in-progress" && (
            <Circle className="w-4 h-4 text-blue-500" />
          )}
        </g>

        {/* Progress bar (if in progress) */}
        {status === "in-progress" && skillLevel && (
          <g
            transform={`translate(${-nodeWidth / 2 + 16}, ${
              nodeHeight / 2 - 24
            })`}
          >
            <rect
              width={nodeWidth - 32}
              height={6}
              rx={3}
              className="fill-gray-200 dark:fill-gray-600"
            />
            <rect
              width={(nodeWidth - 32) * (skillLevel.points / 100)}
              height={6}
              rx={3}
              className="fill-blue-500"
            />
          </g>
        )}
      </motion.g>
    );
  };

  return (
    <div id="skill-tree-container" className="w-full h-[800px] relative">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const svg = d3.select(svgRef.current);
            const g = svg.select(".zoom-group");
            g.transition()
              .duration(750)
              .attr(
                "transform",
                `translate(${dimensions.width / 2},100) scale(0.8)`
              );
          }}
        >
          Reset View
        </Button>
      </div>

      {/* Tree visualization */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="bg-white dark:bg-gray-900"
      >
        <g className="zoom-group">
          <g className="links" />
          <g className="nodes">
            {calculateTreeLayout()
              .descendants()
              .map((node) => renderNode(node as TreeNode))}
          </g>
        </g>
      </svg>

      {/* Node details panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-4 right-4 z-10 w-80"
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {
                    skillTree.nodes.find((n) => n.id === selectedNode)
                      ?.concept_id
                  }
                </CardTitle>
                <CardDescription>{getNodeStatus(selectedNode)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Prerequisites */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Prerequisites</h4>
                    <div className="space-y-2">
                      {skillTree.nodes
                        .find((n) => n.id === selectedNode)
                        ?.dependencies.map((dep) => (
                          <div
                            key={dep}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>{dep}</span>
                            {getNodeStatus(dep) === "completed" ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Progress */}
                  {progressData.skill_levels[selectedNode] && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Progress</h4>
                      <Progress
                        value={progressData.skill_levels[selectedNode].points}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>
                          Current:{" "}
                          {
                            progressData.skill_levels[selectedNode]
                              .current_level
                          }
                        </span>
                        <span>
                          Next:{" "}
                          {
                            progressData.skill_levels[selectedNode]
                              .next_milestone
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkillTreeView;
