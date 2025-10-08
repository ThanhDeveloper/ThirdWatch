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
  ServerIcon
} from "@heroicons/react/24/solid";
import { HealthCard } from '@/components/HealthCard';
import { 
  checkAllEndpoints, 
  calculateOverallStatus, 
  getStatusColor, 
  saveHealthCheckResults, 
  getStoredHealthCheckResults,
  formatTimestamp,
  HEALTH_STATUS
} from '@/services/healthCheckService';

/**
 * Health Check Dashboard
 * Trang kiểm tra tình trạng hoạt động của các endpoint với advanced metrics
 */
export function HealthCheckDashboard() {
  const [healthResults, setHealthResults] = useState([]);
  const [overallStatus, setOverallStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [healthHistory, setHealthHistory] = useState([]); // Lưu lịch sử health check

  /**
   * Thực hiện health check cho tất cả endpoint
   */
  const performHealthCheck = useCallback(async () => {
    setIsLoading(true);
    try {
      const results = await checkAllEndpoints();
      const overall = calculateOverallStatus(results);
      
      setHealthResults(results);
      setOverallStatus(overall);
      setLastCheck(new Date().toISOString());
      
      // Cập nhật lịch sử health check
      setHealthHistory(prev => {
        const newHistory = [...prev, ...results];
        // Giữ tối đa 50 records cho mỗi endpoint
        const limitedHistory = newHistory.slice(-250); // 50 records x 5 endpoints
        return limitedHistory;
      });
      
      // Lưu kết quả vào localStorage
      saveHealthCheckResults(results);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load dữ liệu từ localStorage khi component mount
   */
  useEffect(() => {
    const storedData = getStoredHealthCheckResults();
    if (storedData && storedData.results) {
      setHealthResults(storedData.results);
      setLastCheck(storedData.timestamp);
      setOverallStatus(calculateOverallStatus(storedData.results));
    } else {
      // Nếu không có dữ liệu stored, thực hiện check ngay
      performHealthCheck();
    }
  }, [performHealthCheck]);

  /**
   * Auto refresh mỗi 30 giây
   */
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      performHealthCheck();
    }, 30000); // 30 giây

    return () => clearInterval(interval);
  }, [autoRefresh, performHealthCheck]);

  /**
   * Lấy icon cho trạng thái tổng quan
   */
  const getOverallIcon = (status) => {
    const iconProps = { className: "h-6 w-6 lg:h-8 lg:w-8" };
    switch (status) {
      case HEALTH_STATUS.HEALTHY:
        return <CheckCircleIcon {...iconProps} className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />;
      case HEALTH_STATUS.WARNING:
        return <ExclamationTriangleIcon {...iconProps} className="h-6 w-6 lg:h-8 lg:w-8 text-amber-600" />;
      case HEALTH_STATUS.DOWN:
        return <XCircleIcon {...iconProps} className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />;
      default:
        return <ServerIcon {...iconProps} className="h-6 w-6 lg:h-8 lg:w-8 text-gray-600" />;
    }
  };

  const overallStatusConfig = getStatusColor(overallStatus?.status);

  return (
    <div className="mt-6 lg:mt-12 mb-8 flex flex-col gap-6 lg:gap-8 px-4 sm:px-6 lg:px-0">
      {/* Header với tổng quan */}
      <Card className="shadow-lg">
        <CardHeader variant="gradient" color="blue-gray" className="mb-6 lg:mb-8 p-4 lg:p-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <ServerIcon className="h-6 w-6 lg:h-8 lg:w-8 text-white drop-shadow-lg" />
              <div>
                <Typography variant="h5" color="white" className="lg:text-2xl font-bold drop-shadow-md">
                  Health Check Dashboard
                </Typography>
                <Typography variant="small" color="white" className="opacity-90 drop-shadow-sm text-xs lg:text-sm">
                  Real-time monitoring with advanced performance metrics
                </Typography>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Button
                variant="outlined"
                color="white"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center justify-center space-x-2 transition-all duration-200 ${autoRefresh ? 'bg-white/10 border-white/30' : 'hover:bg-white/10'}`}
              >
                <ClockIcon className="h-4 w-4" />
                <span className="font-medium">{autoRefresh ? 'Auto: ON' : 'Auto: OFF'}</span>
              </Button>
              
              <Button
                variant="filled"
                color="white"
                size="sm"
                onClick={performHealthCheck}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 text-blue-700 hover:text-blue-800 bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="font-medium">Check Now</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardBody className="pt-0 px-4 lg:px-6">
          {/* Trạng thái tổng quan */}
          {overallStatus && (
            <>
              {/* Main Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
                {/* Overall Status */}
                <div className={`col-span-1 sm:col-span-2 lg:col-span-2 p-4 lg:p-6 rounded-xl shadow-lg ${overallStatusConfig.bgColor} border-2 ${overallStatusConfig.borderColor} transition-all duration-300 hover:shadow-xl`}>
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    {getOverallIcon(overallStatus.status)}
                    <div>
                      <Typography variant="h6" className={`lg:text-xl font-bold ${overallStatusConfig.textColor}`}>
                        System {overallStatus.status === HEALTH_STATUS.HEALTHY ? 'Healthy' : 
                                overallStatus.status === HEALTH_STATUS.WARNING ? 'Warning' : 'Down'}
                      </Typography>
                      <Typography variant="small" className="text-gray-700 font-medium">
                        {overallStatus.healthy}/{overallStatus.total} services healthy
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="mt-3 lg:mt-4">
                    <div className="flex justify-between text-sm text-gray-700 mb-2 font-medium">
                      <span>Health Score</span>
                      <span>{overallStatus.healthyPercentage}%</span>
                    </div>
                    <Progress
                      value={overallStatus.healthyPercentage}
                      variant="gradient"
                      color={overallStatus.status === HEALTH_STATUS.HEALTHY ? "green" : 
                             overallStatus.status === HEALTH_STATUS.WARNING ? "amber" : "red"}
                      className="h-2 lg:h-3 shadow-sm"
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="col-span-1 p-4 lg:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <Typography variant="h4" className="lg:text-3xl font-bold text-green-700 mb-1">
                      {overallStatus.healthy}
                    </Typography>
                    <Typography variant="small" className="text-green-800 font-semibold">
                      Healthy
                    </Typography>
                  </div>
                </div>
                
                <div className="col-span-1 p-4 lg:p-6 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <Typography variant="h4" className="lg:text-3xl font-bold text-amber-700 mb-1">
                      {overallStatus.warning}
                    </Typography>
                    <Typography variant="small" className="text-amber-800 font-semibold">
                      Warning
                    </Typography>
                  </div>
                </div>
                
                <div className="col-span-1 p-4 lg:p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <Typography variant="h4" className="lg:text-3xl font-bold text-red-700 mb-1">
                      {overallStatus.down}
                    </Typography>
                    <Typography variant="small" className="text-red-800 font-semibold">
                      Down
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Advanced Metrics Row */}
              {healthResults.length > 0 && healthResults[0].metrics && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4">
                  {/* Average Uptime */}
                  <div className="p-3 lg:p-4 bg-blue-50 rounded-lg border border-blue-200 text-center hover:shadow-md transition-shadow">
                    <Typography variant="small" className="text-blue-700 font-bold text-lg">
                      {Math.round(healthResults.reduce((acc, result) => acc + (result.metrics?.uptime || 0), 0) / healthResults.length)}%
                    </Typography>
                    <Typography variant="small" className="text-blue-600 text-xs">
                      Avg Uptime
                    </Typography>
                  </div>

                  {/* Average Response Time */}
                  <div className="p-3 lg:p-4 bg-indigo-50 rounded-lg border border-indigo-200 text-center hover:shadow-md transition-shadow">
                    <Typography variant="small" className="text-indigo-700 font-bold text-lg">
                      {Math.round(healthResults.reduce((acc, result) => acc + result.responseTime, 0) / healthResults.length)}ms
                    </Typography>
                    <Typography variant="small" className="text-indigo-600 text-xs">
                      Avg Latency
                    </Typography>
                  </div>

                  {/* P99 Latency */}
                  <div className="p-3 lg:p-4 bg-purple-50 rounded-lg border border-purple-200 text-center hover:shadow-md transition-shadow">
                    <Typography variant="small" className="text-purple-700 font-bold text-lg">
                      {Math.round(healthResults.reduce((acc, result) => acc + (result.metrics?.latencyP99 || result.responseTime), 0) / healthResults.length)}ms
                    </Typography>
                    <Typography variant="small" className="text-purple-600 text-xs">
                      P99 Latency
                    </Typography>
                  </div>

                  {/* SSL Certificates */}
                  <div className="p-3 lg:p-4 bg-green-50 rounded-lg border border-green-200 text-center hover:shadow-md transition-shadow">
                    <Typography variant="small" className="text-green-700 font-bold text-lg">
                      {healthResults.filter(result => result.metrics?.sslExpiry).length}
                    </Typography>
                    <Typography variant="small" className="text-green-600 text-xs">
                      SSL Certs
                    </Typography>
                  </div>

                  {/* Total Redirects */}
                  <div className="p-3 lg:p-4 bg-orange-50 rounded-lg border border-orange-200 text-center hover:shadow-md transition-shadow">
                    <Typography variant="small" className="text-orange-700 font-bold text-lg">
                      {healthResults.reduce((acc, result) => acc + (result.metrics?.redirectChain || 0), 0)}
                    </Typography>
                    <Typography variant="small" className="text-orange-600 text-xs">
                      Redirects
                    </Typography>
                  </div>

                  {/* Total Payload */}
                  <div className="p-3 lg:p-4 bg-teal-50 rounded-lg border border-teal-200 text-center hover:shadow-md transition-shadow">
                    <Typography variant="small" className="text-teal-700 font-bold text-lg">
                      {Math.round(healthResults.reduce((acc, result) => acc + (result.metrics?.payloadSize || 0), 0) / 1024)}KB
                    </Typography>
                    <Typography variant="small" className="text-teal-600 text-xs">
                      Total Size
                    </Typography>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Last check info */}
          {lastCheck && (
            <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <ClockIcon className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                  <Typography variant="small" className="text-blue-800 font-medium">
                    Last checked at: {formatTimestamp(lastCheck)}
                  </Typography>
                </div>
                {autoRefresh && (
                  <Chip
                    variant="gradient"
                    color="blue"
                    value="Auto-refresh: 30s"
                    className="py-1 px-2 lg:px-3 text-xs font-medium shadow-md w-fit"
                  />
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Health Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
          // Loading skeletons
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

      {/* Loading overlay */}
      {isLoading && healthResults.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 lg:p-8 mx-4">
            <div className="flex items-center space-x-4">
              <ArrowPathIcon className="h-8 w-8 text-blue-600 animate-spin" />
              <div>
                <Typography variant="h6" className="font-bold text-gray-900">
                  Checking Endpoints
                </Typography>
                <Typography variant="small" className="text-gray-600">
                  Analyzing performance metrics...
                </Typography>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Enhanced Help Text */}
      <Card className="p-4 lg:p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-blue-100 shadow-md">
        <Typography variant="small" className="text-gray-700 text-center leading-relaxed">
          💡 <strong className="text-blue-700">Health Status Guide:</strong> 
          <span className="mx-1 lg:mx-2">❤️ <strong className="text-green-700">Healthy</strong> (&lt;500ms)</span> | 
          <span className="mx-1 lg:mx-2">💛 <strong className="text-amber-700">Warning</strong> (500-2000ms)</span> | 
          <span className="mx-1 lg:mx-2">💔 <strong className="text-red-700">Down</strong> (&gt;2000ms or error)</span>
          <br className="hidden sm:block" />
          <span className="text-blue-600 font-medium">
            📊 <strong>Advanced Metrics:</strong> Uptime %, Stability Index, P50/P90/P99 Latency, SSL Expiry, Payload Size, TTFB, Redirect Chain
          </span>
          <br className="hidden sm:block" />
          <span className="text-blue-600 font-medium">Auto-refresh every 30 seconds. Hover cards for detailed metrics and trend charts.</span>
        </Typography>
      </Card>
    </div>
  );
}

export default HealthCheckDashboard;