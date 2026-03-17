"use client";

import React, { useState, useEffect } from "react";

interface Pipeline {
  id: string;
  name: string;
  status: string;
  current_stage: string;
  dev_ai_status: string;
  build_plan_status: string;
  build_deploy_status: string;
  repository_url: string;
  deployment_url?: string;
  error_message?: string;
  created_at: string;
  updated_at?: string;
}

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    repository_url: "",
    deployment_url: ""
  });

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = async () => {
    try {
      const response = await fetch("/api/pipelines");
      const data = await response.json();
      setPipelines(data);
    } catch (error) {
      console.error("Failed to fetch pipelines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        status: "pending",
        current_stage: "dev_ai",
        dev_ai_status: "pending",
        build_plan_status: "waiting",
        build_deploy_status: "waiting"
      };

      if (editingPipeline) {
        const response = await fetch("/api/pipelines", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPipeline.id, ...payload })
        });
        const updatedPipeline = await response.json();
        setPipelines(pipelines.map(p => p.id === editingPipeline.id ? updatedPipeline : p));
      } else {
        const response = await fetch("/api/pipelines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const newPipeline = await response.json();
        setPipelines([newPipeline, ...pipelines]);
      }

      setShowForm(false);
      setEditingPipeline(null);
      setFormData({ name: "", repository_url: "", deployment_url: "" });
    } catch (error) {
      console.error("Failed to save pipeline:", error);
    }
  };

  const handleEdit = (pipeline: Pipeline) => {
    setEditingPipeline(pipeline);
    setFormData({
      name: pipeline.name,
      repository_url: pipeline.repository_url,
      deployment_url: pipeline.deployment_url || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pipeline?")) return;
    
    try {
      await fetch(`/api/pipelines?id=${id}`, { method: "DELETE" });
      setPipelines(pipelines.filter(p => p.id !== id));
    } catch (error) {
      console.error("Failed to delete pipeline:", error);
    }
  };

  const filteredPipelines = pipelines.filter(pipeline =>
    pipeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pipeline.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pipeline.current_stage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPipelines = pipelines.length;
  const runningPipelines = pipelines.filter(p => p.status === "running").length;
  const completedPipelines = pipelines.filter(p => p.status === "completed").length;
  const failedPipelines = pipelines.filter(p => p.status === "failed").length;

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      running: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      waiting: "bg-gray-100 text-gray-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pipeline Automation 🚀</h1>
          <p className="text-gray-600">Manage automated deployment pipelines from development to production</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                📊
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pipelines</p>
                <p className="text-2xl font-bold text-gray-900">{totalPipelines}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                ⚡
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Running</p>
                <p className="text-2xl font-bold text-blue-600">{runningPipelines}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                ✅
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedPipelines}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                ❌
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedPipelines}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <input
              type="text"
              placeholder="Search pipelines..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              ➕ Add New Pipeline
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingPipeline ? "Edit Pipeline" : "Add New Pipeline"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Repository URL</label>
                <input
                  type="url"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.repository_url}
                  onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Deployment URL (Optional)</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.deployment_url}
                  onChange={(e) => setFormData({ ...formData, deployment_url: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPipeline ? "Update" : "Create"} Pipeline
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPipeline(null);
                    setFormData({ name: "", repository_url: "", deployment_url: "" });
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pipelines List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredPipelines.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No pipelines found</h3>
              <p className="text-gray-600 mb-6">Create your first automated deployment pipeline</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Pipeline
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pipeline</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repository</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPipelines.map((pipeline) => (
                    <tr key={pipeline.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{pipeline.name}</div>
                          {pipeline.deployment_url && (
                            <div className="text-sm text-gray-500">
                              <a href={pipeline.deployment_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">🔗 View Deployment</a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(pipeline.status)}`}>
                          {pipeline.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(pipeline.current_stage)}`}>
                          {pipeline.current_stage.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs">Dev AI:</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(pipeline.dev_ai_status)}`}>
                              {pipeline.dev_ai_status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">Build Plan:</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(pipeline.build_plan_status)}`}>
                              {pipeline.build_plan_status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">Deploy:</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(pipeline.build_deploy_status)}`}>
                              {pipeline.build_deploy_status}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a href={pipeline.repository_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          📁 Repository
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(pipeline.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(pipeline)}
                            className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(pipeline.id)}
                            className="text-red-600 hover:text-red-900 px-2 py-1 rounded"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}