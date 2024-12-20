"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import { ChevronDown, Loader2, Trophy, BookOpen, Target } from "lucide-react";
import {
  ResponseType,
  PrimaryDoc,
  KeyConcept,
  Connection,
  DifficultyLevel,
} from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import SkillTreeVisualizer from "@/components/SkillTreeVisualizer";
import ProgressTracker from "@/components/ProgressTracker";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Move the random sorting out of the render cycle
const shuffledExamplePrompts = [
  "JSON parsing in Python",
  "Coroutines in Go",
  "Implementing Middleware in Express.js",
  "FastAPI nested Routing",
  "Stripe API checkout implementation",
  "React Context API usage",
  "MongoDB aggregation pipelines",
  "GraphQL schema design",
  "Redis caching strategies",
  "Docker multi-stage builds",
  "Kubernetes pod networking",
  "AWS Lambda functions",
  "OAuth2 authentication flow",
  "WebSocket real-time chat",
  "Elasticsearch query optimization",
  "React Server Components",
  "TypeScript generics",
  "Vue.js Composition API",
  "Django REST framework",
  "gRPC service implementation",
  "Kafka message streaming",
  "CI/CD pipeline setup",
  "Terraform infrastructure",
  "Microservices architecture",
  "JWT authentication",
  "Redux state management",
  "PostgreSQL indexing",
  "Nginx load balancing",
  "React Native navigation",
  "Socket.IO events",
  "Git workflow strategies",
  "Docker Compose networking",
  "AWS S3 bucket policies",
  "GraphQL resolvers",
  "Redis pub/sub patterns",
  "React hooks patterns",
  "Node.js clustering",
  "MongoDB sharding",
  "Kubernetes deployments",
  "OAuth2 refresh tokens",
  "WebRTC peer connections",
  "Elasticsearch mappings",
  "Next.js API routes",
  "TypeScript decorators",
  "Vue.js state management",
  "Django middleware",
  "Protocol buffers",
  "Apache Kafka partitions",
  "GitHub Actions workflows",
  "Azure DevOps pipelines",
  "Service mesh patterns",
].sort(() => Math.random() - 0.5);

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [response, setResponse] = useState<ResponseType | null>(null);
  const { theme, setTheme } = useTheme();
  const [graphData, setGraphData] = useState({
    nodes: [],
    links: [],
  });
  const { showAuthModal, setShowAuthModal, requireAuth, logout, user } =
    useAuth();
  const [activeTab, setActiveTab] = useState<
    "docs" | "progress" | "skill-tree"
  >("docs");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyLevel | null>(null);
  const [sortedPrompts] = useState(shuffledExamplePrompts);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const categoryColors = {
    core: "#2563eb", // Blue
    syntax: "#8b5cf6", // Purple
    architecture: "#0891b2", // Cyan
    patterns: "#0d9488", // Teal
    structure: "#059669", // Emerald
    data: "#ca8a04", // Yellow
    state: "#d97706", // Amber
    storage: "#ea580c", // Orange
    network: "#dc2626", // Red
    deployment: "#be123c", // Rose
    security: "#9f1239", // Dark Rose
    performance: "#16a34a", // Green
    runtime: "#15803d", // Dark Green
    testing: "#7c3aed", // Violet
    quality: "#6d28d9", // Purple
    ui: "#ec4899", // Pink
    interaction: "#db2777", // Dark Pink
    tooling: "#64748b", // Slate
    utility: "#475569", // Dark Slate
    default: "#6b7280", // Gray
  };

  const selectExamplePrompt = async (e: any, query: string) => {
    e.preventDefault();
    setSearchQuery(query);
    await handleSearch({ preventDefault: () => {} });
  };

  const handleSearch = async (e: any) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.post("/api/handle-search", {
        query: searchQuery,
      });

      if (!res.data?.response) {
        throw new Error("Invalid response format from server");
      }

      setResponse(res.data.response);

      if (res.data.response.key_concepts) {
        const nodes = res.data.response.key_concepts.map(
          (concept: KeyConcept) => ({
            id: concept.id,
            name: concept.name,
            category: concept.category || "default",
            docs: concept.docs,
            mastery_levels: concept.mastery_levels,
            value: 1,
          })
        );

        const links = res.data.response.key_concepts.flatMap(
          (concept: KeyConcept) =>
            (concept.connections ?? []).map((connection: Connection) => ({
              source: concept.id,
              target: connection.target,
              weight: connection.strength * 5,
              relationship: connection.relationship_type,
            }))
        );

        setGraphData({ nodes, links });
      }
    } catch (error: any) {
      setError(error.message || "An error occurred while fetching results");
      console.error(error);
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        requireAuth={requireAuth}
      />

      {/* Fixed Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <h1 className="font-bold text-xl text-gray-900 dark:text-gray-100">
              betterdocs
            </h1>
            <p className="font-light text-sm text-gray-600 dark:text-gray-300">
              actually understand your code
            </p>
          </motion.div>

          <div className="flex items-center gap-4">
            {/* Search bar that appears in header after search */}
            <AnimatePresence>
              {response && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "300px", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="flex gap-2"
                >
                  <input
                    className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Search again..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                  />
                  <Button size="sm" onClick={handleSearch} disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Search"
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {user?.name || "Menu"}{" "}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24">
        {/* Hero Section with Search (only shown before first search) */}
        <AnimatePresence>
          {!response && (
            <motion.section
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center mb-16"
            >
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ai is making you stupid and is going to take your dev role.
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  fight back by actually reading the docs
                </p>
              </div>

              <motion.div
                layout
                className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
              >
                <div className="flex gap-3 items-center">
                  <input
                    className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="What are you stuck on?"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                    value={searchQuery}
                  />
                  <Button
                    size="lg"
                    onClick={handleSearch}
                    disabled={loading}
                    className="min-w-[120px]"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Search"}
                  </Button>
                </div>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.p {...fadeIn} className="mt-4 text-red-500">
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                className="mt-2 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg text-left"
                layout
              >
                <div className="flex items-center overflow-x-auto space-x-2 py-3">
                  {sortedPrompts.slice(0, 10).map((prompt: string) => (
                    <p
                      key={prompt}
                      className="text-gray-800 dark:text-gray-100 p-3 shadow-md hover:shadow-lg duration-150 cursor-pointer text-sm whitespace-nowrap border border-gray-300 rounded-md"
                      onClick={(e) => selectExamplePrompt(e, prompt)}
                    >
                      {prompt}
                    </p>
                  ))}
                </div>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Enhanced Results Section */}
        <AnimatePresence mode="wait">
          {response && !loading && (
            <section className="mb-16">
              {/* Metadata Banner */}
              <motion.div
                {...fadeIn}
                className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {response.topic}
                    </h1>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {response?.metadata?.difficulty_level && (
                        <span>
                          Difficulty: {response.metadata.difficulty_level}
                        </span>
                      )}
                      {response?.metadata?.estimated_time && (
                        <span>
                          Est. Time: {response.metadata.estimated_time}
                        </span>
                      )}
                      {response?.metadata?.tags && (
                        <div className="flex gap-2">
                          {response.metadata.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Overview */}
                  {response.progress_tracking && (
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">
                          {response.progress_tracking.completion_percentage}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Complete
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-500">
                          {response.progress_tracking.total_points}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Points
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Main Content Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={(value: any) => setActiveTab(value)}
              >
                <TabsList className="mb-6">
                  <TabsTrigger value="docs" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Documentation
                  </TabsTrigger>
                  <TabsTrigger
                    value="progress"
                    className="flex items-center gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    Progress
                  </TabsTrigger>
                  <TabsTrigger value="skill-tree">Skill Tree</TabsTrigger>
                </TabsList>

                <TabsContent
                  value="docs"
                  className="grid lg:grid-cols-12 gap-8"
                >
                  {/* Main Content Column */}
                  <div className="lg:col-span-8 space-y-8">
                    {/* Documentation Section */}
                    <motion.div
                      {...fadeIn}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                    >
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Documentation Sources
                      </h2>

                      <div className="space-y-4">
                        {response.primary_docs.slice(0, 3).map((doc, i) => (
                          <motion.div
                            key={i}
                            variants={fadeIn}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-200"
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                  {doc.source}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {doc.section}
                                </p>

                                {/* Relevance and Category Badge */}
                                <div className="flex gap-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      doc.relevance === "critical"
                                        ? "bg-red-100 text-red-700"
                                        : doc.relevance === "high"
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {doc.relevance}
                                  </span>
                                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                                    {doc.category}
                                  </span>
                                </div>

                                {/* Learning Objectives */}
                                <div className="mt-3">
                                  <h4 className="text-sm font-medium mb-2">
                                    Learning Objectives:
                                  </h4>
                                  <ul className="space-y-1">
                                    {doc.learning_objectives.map((obj, j) => (
                                      <li
                                        key={j}
                                        className="text-sm flex items-center gap-2"
                                      >
                                        <Target className="w-4 h-4" />
                                        {obj.objective}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-4 inline-flex items-center text-blue-500 hover:text-blue-600"
                                >
                                  <BookOpen className="w-4 h-4 mr-2" />
                                  Read Documentation
                                </a>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Learning Path Section */}
                    <motion.div
                      {...fadeIn}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                    >
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Learning Path
                      </h2>
                      <div className="relative pl-4">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-900" />
                        {response.learning_path.map((step, i) => (
                          <motion.div
                            key={i}
                            variants={fadeIn}
                            className="mb-8 relative"
                          >
                            <div className="absolute -left-2 top-1.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800" />
                            <div className="ml-6">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {step.concept}
                              </h3>
                              <p className="mt-2 text-gray-600 dark:text-gray-400">
                                {step.description}
                              </p>
                              {step.prerequisites.length > 0 && (
                                <div className="mt-2 text-sm text-gray-500">
                                  Prerequisites: {step.prerequisites.join(", ")}
                                </div>
                              )}
                              <a
                                href={step.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center text-blue-500 hover:text-blue-600"
                              >
                                Learn more →
                              </a>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Sidebar Column */}
                  <div className="lg:col-span-4 space-y-8">
                    {/* Knowledge Graph */}
                    {graphData.nodes.length > 0 && (
                      <motion.div
                        {...fadeIn}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                      >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                          Knowledge Graph
                        </h2>
                        <div className="h-[400px] w-full">
                          <KnowledgeGraph data={graphData} />
                        </div>
                      </motion.div>
                    )}

                    {/* Key Concepts */}
                    {response.key_concepts && (
                      <motion.div
                        {...fadeIn}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                      >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                          Key Concepts
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {response.key_concepts.map((concept, i) => (
                            <motion.span
                              key={i}
                              variants={fadeIn}
                              whileHover={{ scale: 1.05 }}
                              className="px-3 py-1 rounded-full text-sm"
                              style={{
                                backgroundColor: `${
                                  categoryColors[concept.category]
                                }20`,
                                color: categoryColors[concept.category],
                              }}
                            >
                              {concept.name}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="progress">
                  <ProgressTracker
                    progressData={response.progress_tracking}
                    achievements={response.progress_tracking.achievements}
                    skillLevels={response.progress_tracking.skill_levels}
                  />
                </TabsContent>

                <TabsContent value="skill-tree">
                  <SkillTreeVisualizer
                    skillTree={response.skill_tree}
                    progressData={response.progress_tracking}
                  />
                </TabsContent>
              </Tabs>
            </section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
