import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Progress,
} from "@material-tailwind/react";
import { 
  ArrowPathIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ClockIcon,
  ServerIcon,
  CogIcon
} from "@heroicons/react/24/solid";
import { 
  PlusIcon
} from "@heroicons/react/24/outline";
import { HealthCard } from '@/components/HealthCard';
import SiteManager from '@/components/health-check/SiteManager';
import HealthStatistics from '@/components/health-check/HealthStatistics';
import MockDataService from '@/services/mockDataService';
import { 
  checkAllEndpoints, 
  calculateOverallStatus, 
  getStatusColor, 
  saveHealthCheckResults, 
  getStoredHealthCheckResults,
  formatTimestamp,
  HEALTH_STATUS
} from '@/services/healthCheckService';

export function HealthCheckDashboard() {
  const [healthResults, setHealthResults] = useState([]);
  const [overallStatus, setOverallStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [healthHistory, setHealthHistory] = useState([]);
  const [userSites, setUserSites] = useState([]);
  const [showSiteManager, setShowSiteManager] = useState(false);
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);

  // Mock user sites for demo - in real app this would come from API
  const loadUserSites = useCallback(() => {
    try {
      const sites = MockDataService.getUserSites();
      setUserSites(sites);
    } catch (error) {
      console.error('Error loading user sites:', error);
      // Fallback to default sites
      const defaultSites = [
        {
          id: 1,
          name: 'Google',
          url: 'https://www.google.com',
          type: 'website',
          interval: 300,
          description: 'Google Search Engine',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'GitHub API',
          url: 'https://api.github.com',
          type: 'api',
          interval: 300,
          description: 'GitHub REST API',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
      setUserSites(defaultSites);
      MockDataService.saveUserSites(defaultSites);
    }
  }, []);

  const performHealthCheck = useCallback(async () => {
    if (userSites.length === 0) return;
    
    setIsLoading(true);
    try {
      // Use userSites URLs for health check
      const siteUrls = userSites.filter(site => site.isActive).map(site => site.url);
      const results = await checkAllEndpoints(siteUrls);
      const overall = calculateOverallStatus(results);
      
      setHealthResults(results);
      setOverallStatus(overall);
      setLastCheck(new Date().toISOString());
      
      setHealthHistory(prev => {
        const newHistory = [...prev, ...results];
        const limitedHistory = newHistory.slice(-250);
        return limitedHistory;
      });
      
      // Save results using MockDataService
      MockDataService.saveHealthResults(results);
      saveHealthCheckResults(results);
      
      // Trigger stats refresh
      setStatsRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userSites]);

  const handleSitesUpdated = useCallback((updatedSites) => {
    if (updatedSites) {
      // Save updated sites using MockDataService
      MockDataService.saveUserSites(updatedSites);
      setUserSites(updatedSites);
    } else {
      // Reload from MockDataService
      loadUserSites();
    }
    setShowSiteManager(false);
    // Trigger health check for updated sites
    setTimeout(() => {
      performHealthCheck();
    }, 500);
  }, [loadUserSites, performHealthCheck]);

  useEffect(() => {
    loadUserSites();
  }, []); // Remove loadUserSites dependency to avoid infinite loop

  useEffect(() => {
    if (userSites.length > 0) {
      const storedData = getStoredHealthCheckResults();
      if (storedData && storedData.results) {
        setHealthResults(storedData.results);
        setLastCheck(storedData.timestamp);
        setOverallStatus(calculateOverallStatus(storedData.results));
      } else {
        performHealthCheck();
      }
    }
  }, [userSites]); // Only depend on userSites

  useEffect(() => {
    if (!autoRefresh || userSites.length === 0) return;

    const interval = setInterval(() => {
      performHealthCheck();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, performHealthCheck]);

  const getOverallIcon = (status) => {
    const iconProps = { className: "h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" };
    switch (status) {
      case HEALTH_STATUS.HEALTHY:
        return <CheckCircleIcon {...iconProps} className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-green-600" />;
      case HEALTH_STATUS.WARNING:
        return <ExclamationTriangleIcon {...iconProps} className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-amber-600" />;
      case HEALTH_STATUS.DOWN:
        return <XCircleIcon {...iconProps} className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-red-600" />;
      default:
        return <ServerIcon {...iconProps} className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-gray-600" />;
    }
  };

  const overallStatusConfig = getStatusColor(overallStatus?.status);

  return (
    <div className="mt-4 md:mt-8 lg:mt-12 mb-8 flex flex-col gap-4 md:gap-6 lg:gap-8 px-4 md:px-6 lg:px-8 xl:px-0">
      {/* Header với tổng quan */}
      <Card className="shadow-lg">
        <CardHeader variant="gradient" color="blue-gray" className="mb-4 md:mb-6 lg:mb-8 p-4 md:p-5 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            <div className="flex items-center space-x-3 md:space-x-4">
              <ServerIcon className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-white" />
              <div>
                <Typography variant="h5" color="white" className="md:text-xl lg:text-2xl font-bold">
                  Health Check Dashboard
                </Typography>
                <Typography variant="small" color="white" className="opacity-90 text-xs md:text-sm">
                  Real-time monitoring with performance metrics
                </Typography>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 md:space-x-4">
              <Button
                variant="outlined"
                color="white"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center justify-center space-x-2 transition-all duration-200 text-xs md:text-sm ${autoRefresh ? 'bg-white/20 border-white/40' : 'hover:bg-white/10'}`}
              >
                <ClockIcon className="h-4 w-4" />
                <span className="font-medium">{autoRefresh ? 'Auto: ON' : 'Auto: OFF'}</span>
              </Button>
              
              <Button
                variant="outlined"
                color="white"
                size="sm"
                onClick={() => setShowSiteManager(true)}
                className="flex items-center justify-center space-x-2 text-white hover:bg-white hover:text-blue-700 transition-all duration-200 text-xs md:text-sm"
              >
                <CogIcon className="h-4 w-4" />
                <span className="font-medium">Manage Sites</span>
              </Button>
              
              <Button
                variant="filled"
                color="white"
                size="sm"
                onClick={performHealthCheck}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 text-blue-700 hover:text-blue-800 bg-white hover:bg-gray-50 transition-all duration-200 text-xs md:text-sm"
              >
                <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="font-medium">Check Now</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardBody className="pt-0 px-4 md:px-5 lg:px-6">
          {userSites.length === 0 ? (
            <div className="text-center py-12">
              <ServerIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <Typography variant="h6" className="text-gray-600 mb-2">
                No sites configured for monitoring
              </Typography>
              <Typography variant="small" className="text-gray-500 mb-6">
                Add websites, APIs, or servers to start monitoring their health status
              </Typography>
              <Button
                variant="gradient"
                color="blue"
                onClick={() => setShowSiteManager(true)}
                className="flex items-center space-x-2 mx-auto"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Your First Site</span>
              </Button>
            </div>
          ) : overallStatus && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 lg:gap-6">
                <div className={`col-span-1 md:col-span-3 lg:col-span-2 p-4 md:p-5 lg:p-6 rounded-xl border ${overallStatusConfig.borderColor} transition-all duration-300 hover:shadow-md bg-white`}>
                  <div className="flex items-center space-x-3 md:space-x-4">
                    {getOverallIcon(overallStatus.status)}
                    <div>
                      <Typography variant="h6" className={`md:text-lg lg:text-xl font-bold ${overallStatusConfig.textColor}`}>
                        System {overallStatus.status === HEALTH_STATUS.HEALTHY ? 'Healthy' : 
                                overallStatus.status === HEALTH_STATUS.WARNING ? 'Warning' : 'Down'}
                      </Typography>
                      <Typography variant="small" className="text-gray-600 font-medium text-xs md:text-sm">
                        {overallStatus.healthy}/{overallStatus.total} services healthy
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="mt-3 md:mt-4">
                    <div className="flex justify-between text-xs md:text-sm text-gray-600 mb-2 font-medium">
                      <span>Health Score</span>
                      <span>{overallStatus.healthyPercentage}%</span>
                    </div>
                    <Progress
                      value={overallStatus.healthyPercentage}
                      variant="gradient"
                      color={overallStatus.status === HEALTH_STATUS.HEALTHY ? "green" : 
                             overallStatus.status === HEALTH_STATUS.WARNING ? "amber" : "red"}
                      className="h-2 md:h-2.5 lg:h-3"
                    />
                  </div>
                </div>
                <div className="col-span-1 p-3 md:p-4 lg:p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
                  <div className="text-center">
                    <Typography variant="h4" className="md:text-2xl lg:text-3xl font-bold text-green-600 mb-1">
                      {overallStatus.healthy}
                    </Typography>
                    <Typography variant="small" className="text-gray-600 font-semibold text-xs md:text-sm">
                      Healthy
                    </Typography>
                  </div>
                </div>
                
                <div className="col-span-1 p-3 md:p-4 lg:p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
                  <div className="text-center">
                    <Typography variant="h4" className="md:text-2xl lg:text-3xl font-bold text-amber-600 mb-1">
                      {overallStatus.warning}
                    </Typography>
                    <Typography variant="small" className="text-gray-600 font-semibold text-xs md:text-sm">
                      Warning
                    </Typography>
                  </div>
                </div>
                
                <div className="col-span-1 p-3 md:p-4 lg:p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
                  <div className="text-center">
                    <Typography variant="h4" className="md:text-2xl lg:text-3xl font-bold text-red-600 mb-1">
                      {overallStatus.down}
                    </Typography>
                    <Typography variant="small" className="text-gray-600 font-semibold text-xs md:text-sm">
                      Down
                    </Typography>
                  </div>
                </div>
              </div>

              {healthResults.length > 0 && healthResults[0].metrics && (
                <div className="mt-4 md:mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-3 md:gap-4">
                  <div className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow">
                    <Typography variant="small" className="text-gray-700 font-bold text-sm md:text-lg">
                      {Math.round(healthResults.reduce((acc, result) => acc + (result.metrics?.uptime || 0), 0) / healthResults.length)}%
                    </Typography>
                    <Typography variant="small" className="text-gray-500 text-xs">
                      Avg Uptime
                    </Typography>
                  </div>

                  <div className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow">
                    <Typography variant="small" className="text-gray-700 font-bold text-sm md:text-lg">
                      {Math.round(healthResults.reduce((acc, result) => acc + result.responseTime, 0) / healthResults.length)}ms
                    </Typography>
                    <Typography variant="small" className="text-gray-500 text-xs">
                      Avg Latency
                    </Typography>
                  </div>

                  <div className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow">
                    <Typography variant="small" className="text-gray-700 font-bold text-sm md:text-lg">
                      {Math.round(healthResults.reduce((acc, result) => acc + (result.metrics?.latencyP99 || result.responseTime), 0) / healthResults.length)}ms
                    </Typography>
                    <Typography variant="small" className="text-gray-500 text-xs">
                      P99 Latency
                    </Typography>
                  </div>

                  <div className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow">
                    <Typography variant="small" className="text-gray-700 font-bold text-sm md:text-lg">
                      {healthResults.filter(result => result.metrics?.sslExpiry).length}
                    </Typography>
                    <Typography variant="small" className="text-gray-500 text-xs">
                      SSL Certs
                    </Typography>
                  </div>

                  <div className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow">
                    <Typography variant="small" className="text-gray-700 font-bold text-sm md:text-lg">
                      {healthResults.reduce((acc, result) => acc + (result.metrics?.redirectChain || 0), 0)}
                    </Typography>
                    <Typography variant="small" className="text-gray-500 text-xs">
                      Redirects
                    </Typography>
                  </div>

                  <div className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow">
                    <Typography variant="small" className="text-gray-700 font-bold text-sm md:text-lg">
                      {Math.round(healthResults.reduce((acc, result) => acc + (result.metrics?.payloadSize || 0), 0) / 1024)}KB
                    </Typography>
                    <Typography variant="small" className="text-gray-500 text-xs">
                      Total Size
                    </Typography>
                  </div>
                </div>
              )}
            </>
          )}

          {lastCheck && (
            <div className="mt-4 md:mt-5 lg:mt-6 p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <ClockIcon className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                  <Typography variant="small" className="text-gray-600 font-medium text-xs md:text-sm">
                    Last checked at: {formatTimestamp(lastCheck)}
                  </Typography>
                </div>
                {autoRefresh && (
                  <Chip
                    variant="gradient"
                    color="blue"
                    value="Auto-refresh: 30s"
                    className="py-1 px-2 md:px-3 text-xs font-medium w-fit"
                  />
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
        {healthResults.length > 0 ? (
          healthResults.map((result, index) => (
            <HealthCard
              key={result.id || index}
              healthData={result}
              isLoading={isLoading}
              healthHistory={healthHistory}
            />
          ))
        ) : (
          Array.from({ length: 5 }).map((_, index) => (
            <HealthCard
              key={index}
              healthData={null}
              isLoading={true}
              healthHistory={[]}
            />
          ))
        )}
      </div>

      {isLoading && healthResults.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-4 md:p-6 lg:p-8 mx-4">
            <div className="flex items-center space-x-4">
              <ArrowPathIcon className="h-6 w-6 md:h-8 md:w-8 text-blue-600 animate-spin" />
              <div>
                <Typography variant="h6" className="font-bold text-gray-900 text-sm md:text-base">
                  Checking Endpoints
                </Typography>
                <Typography variant="small" className="text-gray-600 text-xs md:text-sm">
                  Analyzing performance metrics...
                </Typography>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Health Statistics */}
      {userSites.length > 0 && (
        <HealthStatistics refreshTrigger={statsRefreshTrigger} />
      )}

      <Card className="p-4 md:p-5 lg:p-6 bg-gray-50 border border-gray-200">
        <Typography variant="small" className="text-gray-600 text-center leading-relaxed text-xs md:text-sm">
          <strong className="text-gray-700">Health Status Guide:</strong> 
          <span className="mx-1 md:mx-2"><strong className="text-green-600">Healthy</strong> (&lt;500ms)</span> | 
          <span className="mx-1 md:mx-2"><strong className="text-amber-600">Warning</strong> (500-2000ms)</span> | 
          <span className="mx-1 md:mx-2"><strong className="text-red-600">Down</strong> (&gt;2000ms or error)</span>
          <br className="hidden sm:block" />
          <span className="text-gray-600 font-medium">
            <strong>Advanced Metrics:</strong> Uptime %, Stability Index, P50/P90/P99 Latency, SSL Expiry, Payload Size, TTFB, Redirect Chain
          </span>
          <br className="hidden md:block" />
          <span className="text-gray-600 font-medium">Auto-refresh every 30 seconds. Hover cards for detailed metrics and trend charts.</span>
        </Typography>
      </Card>

      {/* Site Manager Modal */}
      {showSiteManager && (
        <div className="mt-8">
          <SiteManager 
            userSites={userSites}
            onSitesUpdated={handleSitesUpdated}
            onClose={() => setShowSiteManager(false)}
          />
        </div>
      )}
    </div>
  );
}

export default HealthCheckDashboard;