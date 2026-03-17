"use client";

import React, { useState, useEffect } from "react";

export default function AIIntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    workflow_type: "",
    ai_process: "",
    business_unit: "",
    status: "pending",
    description: "",
    success_rate: 0
  });

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch("/api/ai-integrations");
      const data = await response.json();
      setIntegrations(data || []);
    } catch (error) {
      console.error("Failed to fetch AI integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = "/api/ai-integrations";
      const method = editingIntegration ? "PUT" : "POST";
      const body = editingIntegration 
        ? { id: editingIntegration.id, ...formData }
        : formData;
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      const result = await response.json();
      
      if (editingIntegration) {
        setIntegrations(integrations.map(item => 
          item.id === editingIntegration.id ? result : item
        ));
      } else {
        setIntegrations([result, ...integrations]);
      }
      
      resetForm();
    } catch (error) {
      console.error("Failed to save AI integration:", error);
    }
  };

  const handleEdit = (integration) => {
    setEditingIntegration(integration);
    setFormData({
      name: integration.name,
      workflow_type: integration.workflow_type,
      ai_process: integration.ai_process,
      business_unit: integration.business_unit,
      status: integration.status,
      description: integration.description,
      success_rate: integration.success_rate
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this AI integration?")) return;
    
    try {
      await fetch("/api/ai-integrations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      
      setIntegrations(integrations.filter(item => item.id !== id));
    } catch (error) {
      console.error("Failed to delete AI integration:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      workflow_type: "",
      ai_process: "",
      business_unit: "",
      status: "pending",
      description: "",
      success_rate: 0
    });
    setEditingIntegration(null);
    setShowForm(false);
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      testing: "bg-blue-100 text-blue-800"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
        {status}
      </span>
    );
  };

  const filteredIntegrations = integrations.filter(integration =>
    integration.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    integration.ai_process?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    integration.business_unit?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIntegrations = integrations.length;
  const activeIntegrations = integrations.filter(i => i.status === "active").length;
  const pendingIntegrations = integrations.filter(i => i.status === "pending").length;
  const avgSuccessRate = integrations.length > 0 
    ? (integrations.reduce((sum, i) => sum + (i.success_rate || 0), 0) / integrations.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Integrations</h1>
          <p className="text-gray-600">Manage AI-driven development processes in business workflows</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Integrations</p>
                <p className="text-2xl font-bold text-gray-900">{totalIntegrations}</p>
              </div>
              <div className="text-3xl">🤖</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeIntegrations}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingIntegrations}</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">{avgSuccessRate}%</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search AI integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showForm ? "Cancel" : "Add New Integration"}
              </button>
            </div>
          </div>

          {showForm && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">
                {editingIntegration ? "Edit Integration" : "Add New Integration"}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Type</label>
                  <select
                    value={formData.workflow_type}
                    onChange={(e) => setFormData({...formData, workflow_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select workflow type</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                    <option value="deployment">Deployment</option>
                    <option value="monitoring">Monitoring</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AI Process</label>
                  <select
                    value={formData.ai_process}
                    onChange={(e) => setFormData({...formData, ai_process: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select AI process</option>
                    <option value="code_generation">Code Generation</option>
                    <option value="automated_testing">Automated Testing</option>
                    <option value="deployment_optimization">Deployment Optimization</option>
                    <option value="performance_monitoring">Performance Monitoring</option>
                    <option value="quality_assurance">Quality Assurance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Unit</label>
                  <input
                    type="text"
                    value={formData.business_unit}
                    onChange={(e) => setFormData({...formData, business_unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="testing">Testing</option>
                    <option value="active">Active</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Success Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.success_rate}
                    onChange={(e) => setFormData({...formData, success_rate: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2 flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingIntegration ? "Update" : "Create"} Integration
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="p-6">
            {filteredIntegrations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No AI integrations found</h3>
                <p className="text-gray-500">Get started by creating your first AI integration.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Workflow Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">AI Process</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Business Unit</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Success Rate</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIntegrations.map((integration) => (
                      <tr key={integration.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{integration.name}</div>
                            {integration.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {integration.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{integration.workflow_type}</td>
                        <td className="py-3 px-4 text-gray-700">{integration.ai_process}</td>
                        <td className="py-3 px-4 text-gray-700">{integration.business_unit}</td>
                        <td className="py-3 px-4">{getStatusBadge(integration.status)}</td>
                        <td className="py-3 px-4 text-gray-700">{integration.success_rate}%</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(integration)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(integration.id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Delete
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
    </div>
  );
}