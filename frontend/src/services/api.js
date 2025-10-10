// API service layer - handles all API calls
import { mockAPI, USE_MOCK_DATA } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// API service
const api = {
  // Emergency Cases
  getCases: async (params = {}) => {
    if (USE_MOCK_DATA) return mockAPI.getCases(params);
    
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/cases?${queryString}`);
    return handleResponse(response);
  },

  getCaseById: async (id) => {
    if (USE_MOCK_DATA) return mockAPI.getCaseById(id);
    
    const response = await fetch(`${API_BASE_URL}/api/cases/${id}`);
    return handleResponse(response);
  },

  getStats: async () => {
    if (USE_MOCK_DATA) return mockAPI.getStats();
    
    // Backend doesn't have stats endpoint yet, calculate from cases
    try {
      const casesResponse = await fetch(`${API_BASE_URL}/api/cases`);
      const casesData = await handleResponse(casesResponse);
      
      // Calculate stats from cases data
      const cases = casesData.data || [];
      const stats = {
        total: cases.length,
        verified: cases.filter(c => c.verificationStatus?.isVerified).length,
        pending: cases.filter(c => !c.verificationStatus?.isVerified).length,
        bySeverity: {},
        byType: {}
      };
      
      return { success: true, data: stats };
    } catch (error) {
      // If stats calculation fails, return empty stats
      return {
        success: true,
        data: {
          total: 0,
          verified: 0,
          pending: 0,
          bySeverity: {},
          byType: {}
        }
      };
    }
  },

  // Resources
  getResources: async () => {
    if (USE_MOCK_DATA) return mockAPI.getResources();
    
    const response = await fetch(`${API_BASE_URL}/api/resources`);
    return handleResponse(response);
  },

  createResource: async (data) => {
    if (USE_MOCK_DATA) return mockAPI.createResource(data);
    
    const response = await fetch(`${API_BASE_URL}/api/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateResource: async (id, data) => {
    if (USE_MOCK_DATA) return mockAPI.updateResource(id, data);
    
    const response = await fetch(`${API_BASE_URL}/api/resources/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteResource: async (id) => {
    if (USE_MOCK_DATA) return mockAPI.deleteResource(id);
    
    const response = await fetch(`${API_BASE_URL}/api/resources/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  },

  // Export
  exportCases: async (format = 'csv') => {
    if (USE_MOCK_DATA) return mockAPI.exportCases();
    
    const response = await fetch(`${API_BASE_URL}/api/cases/export?format=${format}`);
    if (!response.ok) {
      throw new Error('Export failed');
    }
    return response.blob();
  },

  // Submit report for a case
  submitReport: async (caseId, reportData) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: 'Report submitted successfully' };
    }
    
    const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    return handleResponse(response);
  }
};

export default api;
