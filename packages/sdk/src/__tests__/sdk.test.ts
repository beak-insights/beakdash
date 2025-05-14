import { BeakDashSDK } from '../index';
import { Dashboard, Widget } from '../types';
import axios from 'axios';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

describe('BeakDashSDK', () => {
  let sdk: BeakDashSDK;
  const mockConfig = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.test.com/v1'
  };

  beforeEach(() => {
    sdk = new BeakDashSDK(mockConfig);
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: mockConfig.baseUrl,
        headers: {
          'Authorization': `Bearer ${mockConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
    });
  });

  describe('getDashboards', () => {
    const mockDashboards: Dashboard[] = [
      {
        id: '1',
        name: 'Test Dashboard',
        widgets: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ];

    it('should return dashboards', async () => {
      mockedAxios.create().get.mockResolvedValueOnce({
        data: { data: mockDashboards }
      });

      const result = await sdk.getDashboards();
      expect(result).toEqual(mockDashboards);
      expect(mockedAxios.create().get).toHaveBeenCalledWith('/dashboards');
    });
  });

  describe('getDashboard', () => {
    const mockDashboard: Dashboard = {
      id: '1',
      name: 'Test Dashboard',
      widgets: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    };

    it('should return a dashboard', async () => {
      mockedAxios.create().get.mockResolvedValueOnce({
        data: { data: mockDashboard }
      });

      const result = await sdk.getDashboard('1');
      expect(result).toEqual(mockDashboard);
      expect(mockedAxios.create().get).toHaveBeenCalledWith('/dashboards/1');
    });
  });

  describe('createDashboard', () => {
    const mockDashboardData = {
      name: 'New Dashboard',
      widgets: []
    };

    const mockCreatedDashboard: Dashboard = {
      id: '1',
      ...mockDashboardData,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    };

    it('should create a dashboard', async () => {
      mockedAxios.create().post.mockResolvedValueOnce({
        data: { data: mockCreatedDashboard }
      });

      const result = await sdk.createDashboard(mockDashboardData);
      expect(result).toEqual(mockCreatedDashboard);
      expect(mockedAxios.create().post).toHaveBeenCalledWith('/dashboards', mockDashboardData);
    });
  });

  describe('getWidgets', () => {
    const mockWidgets: Widget[] = [
      {
        id: '1',
        type: 'chart',
        title: 'Test Widget',
        config: {}
      }
    ];

    it('should return widgets', async () => {
      mockedAxios.create().get.mockResolvedValueOnce({
        data: { data: mockWidgets }
      });

      const result = await sdk.getWidgets('1');
      expect(result).toEqual(mockWidgets);
      expect(mockedAxios.create().get).toHaveBeenCalledWith('/dashboards/1/widgets');
    });
  });

  describe('error handling', () => {
    it('should handle authentication error', async () => {
      mockedAxios.create().get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: {
            code: 'AUTH_ERROR',
            message: 'Invalid API key'
          }
        }
      });

      await expect(sdk.getDashboards()).rejects.toThrow('Invalid API key');
    });

    it('should handle not found error', async () => {
      mockedAxios.create().get.mockRejectedValueOnce({
        response: {
          status: 404,
          data: {
            code: 'NOT_FOUND',
            message: 'Dashboard not found'
          }
        }
      });

      await expect(sdk.getDashboard('999')).rejects.toThrow('Dashboard not found');
    });
  });
}); 