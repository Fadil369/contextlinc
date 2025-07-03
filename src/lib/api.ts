const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://contextlinc-api.fadil.workers.dev'
  : 'http://localhost:8787';

export class APIClient {
  private baseUrl: string;
  private sessionId: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';
    
    let sessionId = localStorage.getItem('contextlinc-session-id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('contextlinc-session-id', sessionId);
    }
    return sessionId;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Session-ID': this.sessionId,
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    return await response.json();
  }

  // Chat API methods
  async sendMessage(message: string, files: string[] = []): Promise<any> {
    return await this.makeRequest('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify({
        message,
        files,
        contextOptions: {
          model: 'gpt-4',
          maxTokens: 2048,
          temperature: 0.7
        }
      }),
    });
  }

  async getChatHistory(limit: number = 50, offset: number = 0): Promise<any> {
    return await this.makeRequest(`/api/chat/history?limit=${limit}&offset=${offset}`);
  }

  async clearChat(): Promise<any> {
    return await this.makeRequest('/api/chat/clear', {
      method: 'DELETE',
    });
  }

  async getChatStats(): Promise<any> {
    return await this.makeRequest('/api/chat/stats');
  }

  // File API methods
  async uploadFiles(files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return await this.makeRequest('/api/files/upload', {
      method: 'POST',
      headers: {
        'X-Session-ID': this.sessionId,
        // Don't set Content-Type for FormData
      },
      body: formData,
    });
  }

  async getFileStatus(fileId: string): Promise<any> {
    return await this.makeRequest(`/api/files/${fileId}/status`);
  }

  async getFileList(): Promise<any> {
    return await this.makeRequest('/api/files/list');
  }

  async downloadFile(fileId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/files/${fileId}/download`, {
      headers: {
        'X-Session-ID': this.sessionId,
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    return await response.blob();
  }

  // Context API methods
  async getContextState(): Promise<any> {
    return await this.makeRequest('/api/context/state');
  }

  async getLayerData(layerId: number): Promise<any> {
    return await this.makeRequest(`/api/context/layers/${layerId}`);
  }

  async updateLayerConfig(layerId: number, updates: any): Promise<any> {
    return await this.makeRequest(`/api/context/layers/${layerId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getMemoryStatus(): Promise<any> {
    return await this.makeRequest('/api/context/memory');
  }

  async searchMemory(query: string, memoryType: string = 'all', limit: number = 10): Promise<any> {
    return await this.makeRequest('/api/context/memory/search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        memoryType,
        limit,
      }),
    });
  }

  async getContextAnalytics(timeframe: string = '7d'): Promise<any> {
    return await this.makeRequest(`/api/context/analytics?timeframe=${timeframe}`);
  }

  async optimizeContext(targetSize: number, preserveLayers: number[] = []): Promise<any> {
    return await this.makeRequest('/api/context/optimize', {
      method: 'POST',
      body: JSON.stringify({
        targetSize,
        preserveLayers,
      }),
    });
  }

  async resetContext(preserveMemory: boolean = false): Promise<any> {
    return await this.makeRequest('/api/context/reset', {
      method: 'POST',
      body: JSON.stringify({
        preserveMemory,
      }),
    });
  }

  // Health check
  async healthCheck(): Promise<any> {
    return await this.makeRequest('/health');
  }

  // Utility methods
  getSessionId(): string {
    return this.sessionId;
  }

  clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('contextlinc-session-id');
      this.sessionId = this.getOrCreateSessionId();
    }
  }

  setApiUrl(url: string): void {
    this.baseUrl = url;
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export individual API functions for easier use
export const api = {
  // Chat
  sendMessage: (message: string, files?: string[]) => apiClient.sendMessage(message, files),
  getChatHistory: (limit?: number, offset?: number) => apiClient.getChatHistory(limit, offset),
  clearChat: () => apiClient.clearChat(),
  getChatStats: () => apiClient.getChatStats(),

  // Files
  uploadFiles: (files: File[]) => apiClient.uploadFiles(files),
  getFileStatus: (fileId: string) => apiClient.getFileStatus(fileId),
  getFileList: () => apiClient.getFileList(),
  downloadFile: (fileId: string) => apiClient.downloadFile(fileId),

  // Context
  getContextState: () => apiClient.getContextState(),
  getLayerData: (layerId: number) => apiClient.getLayerData(layerId),
  updateLayerConfig: (layerId: number, updates: any) => apiClient.updateLayerConfig(layerId, updates),
  getMemoryStatus: () => apiClient.getMemoryStatus(),
  searchMemory: (query: string, memoryType?: string, limit?: number) => 
    apiClient.searchMemory(query, memoryType, limit),
  getContextAnalytics: (timeframe?: string) => apiClient.getContextAnalytics(timeframe),
  optimizeContext: (targetSize: number, preserveLayers?: number[]) => 
    apiClient.optimizeContext(targetSize, preserveLayers),
  resetContext: (preserveMemory?: boolean) => apiClient.resetContext(preserveMemory),

  // Utilities
  healthCheck: () => apiClient.healthCheck(),
  getSessionId: () => apiClient.getSessionId(),
  clearSession: () => apiClient.clearSession(),
};