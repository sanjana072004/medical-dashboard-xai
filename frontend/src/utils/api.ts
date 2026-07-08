/**
 * Utility functions for API communication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

let authToken: string | null = null;

const buildHeaders = (contentType = 'application/json') => {
  const headers: Record<string, string> = {
    'Content-Type': contentType,
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
};

export const apiClient = {
  setToken(token: string | null) {
    authToken = token;
  },

  clearToken() {
    authToken = null;
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: buildHeaders('application/x-www-form-urlencoded'),
      body: new URLSearchParams({ username: email, password }).toString(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Invalid login credentials' }));
      throw new Error(error.detail || 'Invalid login credentials');
    }
    return response.json();
  },

  async register(email: string, password: string, full_name: string, role: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ email, password, full_name, role }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(error.detail || 'Registration failed');
    }
    return response.json();
  },

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: buildHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return response.json();
  },

  async listPatients(query?: string, page = 1, pageSize = 20) {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    params.append('page', String(page));
    params.append('page_size', String(pageSize));
    const response = await fetch(`${API_BASE_URL}/patients/?${params.toString()}`, {
      method: 'GET',
      headers: buildHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to load patients');
    }
    return response.json();
  },

  async createPatient(data: any) {
    const response = await fetch(`${API_BASE_URL}/patients/`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to create patient' }));
      throw new Error(error.detail || 'Failed to create patient');
    }
    return response.json();
  },

  async updatePatient(patientId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to update patient' }));
      throw new Error(error.detail || 'Failed to update patient');
    }
    return response.json();
  },

  async deletePatient(patientId: number) {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to delete patient' }));
      throw new Error(error.detail || 'Failed to delete patient');
    }
    return response.json();
  },

  async getPatient(patientId: number) {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      method: 'GET',
      headers: buildHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to load patient');
    }
    return response.json();
  },

  async listPredictions(patientId?: number, page = 1, pageSize = 20) {
    const params = new URLSearchParams();
    if (patientId) params.append('patient_id', String(patientId));
    params.append('page', String(page));
    params.append('page_size', String(pageSize));
    const response = await fetch(`${API_BASE_URL}/predictions/?${params.toString()}`, {
      method: 'GET',
      headers: buildHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to load prediction history');
    }
    return response.json();
  },

  async getPrediction(predictionId: number) {
    const response = await fetch(`${API_BASE_URL}/predictions/${predictionId}`, {
      method: 'GET',
      headers: buildHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to load prediction');
    }
    return response.json();
  },
  async createPrediction(data: any) {
    const response = await fetch(`${API_BASE_URL}/predictions/`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to save prediction' }));
      throw new Error(error.detail || 'Failed to save prediction');
    }
    return response.json();
  },
  async analyticsSummary() {
    const response = await fetch(`${API_BASE_URL}/analytics/summary`, {
      method: 'GET',
      headers: buildHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to load analytics summary');
    }
    return response.json();
  },
  async downloadReport(predictionId: number) {
    const response = await fetch(`${API_BASE_URL}/reports/${predictionId}/generate`, {
      method: 'POST',
      headers: buildHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to generate report');
    }
    const blob = await response.blob();
    return blob;
  },
  async predict(modelType: string, features: number[]) {
    const response = await fetch(`${API_BASE_URL}/inference/predict`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ model_type: modelType, features }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Prediction failed' }));
      throw new Error(error.detail || 'Prediction failed');
    }
    return response.json();
  },

  async explain(modelType: string, features: number[], method = 'shap') {
    const response = await fetch(`${API_BASE_URL}/explanation/explain`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ model_type: modelType, features, method }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Explanation failed' }));
      throw new Error(error.detail || 'Explanation failed');
    }
    return response.json();
  },
};
