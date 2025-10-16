/**
 * Mock Data Service
 * Tạm thời lưu trữ data trong localStorage trước khi có API backend
 */

const STORAGE_KEYS = {
  USER_SITES: 'thirdwatch_user_sites',
  HEALTH_RESULTS: 'thirdwatch_health_results',
  USER_PREFERENCES: 'thirdwatch_user_preferences'
};

// Mock default sites cho demo
const DEFAULT_SITES = [
  {
    id: 1,
    name: 'Google',
    url: 'https://www.google.com',
    type: 'website',
    interval: 300,
    description: 'Google Search Engine',
    isActive: true,
    createdAt: new Date().toISOString(),
    tags: ['search', 'popular']
  },
  {
    id: 2,
    name: 'GitHub API',
    url: 'https://api.github.com',
    type: 'api',
    interval: 300,
    description: 'GitHub REST API',
    isActive: true,
    createdAt: new Date().toISOString(),
    tags: ['api', 'development']
  },
  {
    id: 3,
    name: 'JSONPlaceholder',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    type: 'api',
    interval: 600,
    description: 'Free fake API for testing',
    isActive: true,
    createdAt: new Date().toISOString(),
    tags: ['api', 'testing']
  }
];

export class MockDataService {
  /**
   * User Sites Management
   */
  static getUserSites() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_SITES);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // First time - set default sites
      this.saveUserSites(DEFAULT_SITES);
      return DEFAULT_SITES;
    } catch (error) {
      console.error('Error loading user sites:', error);
      return DEFAULT_SITES;
    }
  }

  static saveUserSites(sites) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_SITES, JSON.stringify(sites));
      return true;
    } catch (error) {
      console.error('Error saving user sites:', error);
      return false;
    }
  }

  static addUserSite(siteData) {
    const sites = this.getUserSites();
    const newSite = {
      id: Date.now(),
      ...siteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
    
    sites.push(newSite);
    this.saveUserSites(sites);
    return newSite;
  }

  static updateUserSite(siteId, updates) {
    const sites = this.getUserSites();
    const siteIndex = sites.findIndex(site => site.id === siteId);
    
    if (siteIndex !== -1) {
      sites[siteIndex] = {
        ...sites[siteIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveUserSites(sites);
      return sites[siteIndex];
    }
    
    return null;
  }

  static deleteUserSite(siteId) {
    const sites = this.getUserSites();
    const filteredSites = sites.filter(site => site.id !== siteId);
    this.saveUserSites(filteredSites);
    return filteredSites;
  }

  /**
   * Health Results Storage
   */
  static saveHealthResults(results) {
    try {
      const healthData = {
        results,
        timestamp: new Date().toISOString(),
        totalSites: results.length,
        healthySites: results.filter(r => r.status === 'healthy').length
      };
      
      localStorage.setItem(STORAGE_KEYS.HEALTH_RESULTS, JSON.stringify(healthData));
      
      // Also save to history (keep last 100 checks)
      this.addToHealthHistory(healthData);
      return true;
    } catch (error) {
      console.error('Error saving health results:', error);
      return false;
    }
  }

  static getLatestHealthResults() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HEALTH_RESULTS);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading health results:', error);
      return null;
    }
  }

  static addToHealthHistory(healthData) {
    try {
      const historyKey = `${STORAGE_KEYS.HEALTH_RESULTS}_history`;
      const stored = localStorage.getItem(historyKey);
      let history = stored ? JSON.parse(stored) : [];
      
      history.push({
        timestamp: healthData.timestamp,
        totalSites: healthData.totalSites,
        healthySites: healthData.healthySites,
        healthPercentage: (healthData.healthySites / healthData.totalSites) * 100
      });
      
      // Keep only last 100 entries
      if (history.length > 100) {
        history = history.slice(-100);
      }
      
      localStorage.setItem(historyKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving health history:', error);
    }
  }

  static getHealthHistory() {
    try {
      const historyKey = `${STORAGE_KEYS.HEALTH_RESULTS}_history`;
      const stored = localStorage.getItem(historyKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading health history:', error);
      return [];
    }
  }

  /**
   * User Preferences
   */
  static getUserPreferences() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Default preferences
      const defaultPrefs = {
        autoRefresh: true,
        refreshInterval: 30000, // 30 seconds
        notifications: {
          email: true,
          browser: false,
          sound: false
        },
        theme: 'light',
        defaultCheckInterval: 300 // 5 minutes
      };
      
      this.saveUserPreferences(defaultPrefs);
      return defaultPrefs;
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return {};
    }
  }

  static saveUserPreferences(preferences) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
  }

  /**
   * Statistics & Analytics
   */
  static getStatistics() {
    const sites = this.getUserSites();
    const history = this.getHealthHistory();
    const latest = this.getLatestHealthResults();
    
    return {
      totalSites: sites.length,
      activeSites: sites.filter(s => s.isActive).length,
      sitesBy: {
        type: this.groupSitesBy(sites, 'type'),
        interval: this.groupSitesBy(sites, 'interval')
      },
      uptime: {
        current: latest ? (latest.healthySites / latest.totalSites) * 100 : 0,
        average: history.length > 0 
          ? history.reduce((sum, h) => sum + h.healthPercentage, 0) / history.length 
          : 0,
        trend: this.calculateTrend(history)
      },
      lastCheck: latest?.timestamp || null
    };
  }

  static groupSitesBy(sites, field) {
    return sites.reduce((acc, site) => {
      const key = site[field];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  static calculateTrend(history) {
    if (history.length < 2) return 0;
    
    const recent = history.slice(-10); // Last 10 checks
    const older = history.slice(-20, -10); // 10 checks before that
    
    const recentAvg = recent.reduce((sum, h) => sum + h.healthPercentage, 0) / recent.length;
    const olderAvg = older.length > 0 
      ? older.reduce((sum, h) => sum + h.healthPercentage, 0) / older.length
      : recentAvg;
    
    return recentAvg - olderAvg; // Positive = improving, Negative = degrading
  }

  /**
   * Data Export/Import for backup
   */
  static exportData() {
    return {
      sites: this.getUserSites(),
      preferences: this.getUserPreferences(),
      healthHistory: this.getHealthHistory(),
      exportDate: new Date().toISOString()
    };
  }

  static importData(data) {
    try {
      if (data.sites) this.saveUserSites(data.sites);
      if (data.preferences) this.saveUserPreferences(data.preferences);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  /**
   * Clear all data (for testing/reset)
   */
  static clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_history`);
    });
  }
}

export default MockDataService;