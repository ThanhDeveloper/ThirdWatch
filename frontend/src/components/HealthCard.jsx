import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Chip,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClockIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/solid";
import { getStatusColor, HEALTH_STATUS, formatTimestamp } from '@/services/healthCheckService';

/**
 * Component hiển thị trạng thái health của một endpoint
 * @param {object} healthData - Dữ liệu health check
 * @param {boolean} isLoading - Đang kiểm tra hay không
 * @param {Array} healthHistory - Lịch sử health check cho trend chart
 */
export function HealthCard({ healthData, isLoading = false, healthHistory = [] }) {
  const [animate, setAnimate] = useState(false);
  const statusConfig = getStatusColor(healthData?.status || HEALTH_STATUS.DOWN);

  // Animation heartbeat cho trạng thái healthy
  useEffect(() => {
    if (healthData?.status === HEALTH_STATUS.HEALTHY) {
      setAnimate(true);
      const interval = setInterval(() => {
        setAnimate(prev => !prev);
      }, 1500);
      return () => clearInterval(interval);
    } else {
      setAnimate(false);
    }
  }, [healthData?.status]);

  // Lấy icon theo trạng thái
  const getStatusIcon = (status) => {
    const iconProps = { className: "h-5 w-5" };
    
    switch (status) {
      case HEALTH_STATUS.HEALTHY:
        return <CheckCircleIcon {...iconProps} className={`h-5 w-5 text-green-600 ${animate ? 'animate-pulse' : ''}`} />;
      case HEALTH_STATUS.WARNING:
        return <ExclamationTriangleIcon {...iconProps} className="h-5 w-5 text-amber-600" />;
      case HEALTH_STATUS.DOWN:
        return <XCircleIcon {...iconProps} className="h-5 w-5 text-red-600" />;
      case HEALTH_STATUS.CHECKING:
        return <ArrowPathIcon {...iconProps} className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <XCircleIcon {...iconProps} className="h-5 w-5 text-gray-600" />;
    }
  };

  // Lấy text trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case HEALTH_STATUS.HEALTHY:
        return 'Healthy';
      case HEALTH_STATUS.WARNING:
        return 'Warning';
      case HEALTH_STATUS.DOWN:
        return 'Down';
      case HEALTH_STATUS.CHECKING:
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  // Hiển thị loading state
  if (isLoading || !healthData) {
    return (
      <Card className="health-card shadow-md">
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-shimmer"></div>
              <div>
                <div className="w-24 h-4 bg-gray-200 rounded animate-shimmer mb-2"></div>
                <div className="w-32 h-3 bg-gray-200 rounded animate-shimmer"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="w-16 h-6 bg-gray-200 rounded animate-shimmer mb-2"></div>
              <div className="w-20 h-3 bg-gray-200 rounded animate-shimmer"></div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full h-3 bg-gray-200 rounded animate-shimmer"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  const tooltipContent = healthData.error 
    ? `Error: ${healthData.error}`
    : `Last checked: ${formatTimestamp(healthData.timestamp)}
${healthData.metrics ? `
• Uptime: ${healthData.metrics.uptime}%
• Stability Index: ${healthData.metrics.stabilityIndex}/100
• P90 Latency: ${healthData.metrics.latencyP90}ms
• P99 Latency: ${healthData.metrics.latencyP99}ms
• Payload Size: ${(healthData.metrics.payloadSize / 1024).toFixed(1)}KB
• TTFB: ${healthData.metrics.ttfb}ms
${healthData.metrics.sslExpiry ? `• SSL Expires: ${healthData.metrics.sslExpiry} days` : ''}
${healthData.metrics.redirectChain > 0 ? `• Redirects: ${healthData.metrics.redirectChain}` : ''}` : ''}`;

  return (
    <Tooltip content={tooltipContent} placement="top">
      <Card className={`health-card shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 ${statusConfig.borderColor} ${
        healthData.status === HEALTH_STATUS.HEALTHY ? 'status-healthy' : 
        healthData.status === HEALTH_STATUS.WARNING ? 'status-warning' : 
        healthData.status === HEALTH_STATUS.DOWN ? 'status-down' : ''
      }`}>
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            {/* Thông tin endpoint */}
            <div className="flex items-center space-x-4">
              {/* Icon và emoji */}
              <div className={`w-12 h-12 rounded-lg ${statusConfig.bgColor} flex items-center justify-center relative overflow-hidden`}>
                <span className={`text-2xl ${animate ? 'animate-heartbeat' : ''}`}>
                  {statusConfig.icon}
                </span>
                {healthData.status === HEALTH_STATUS.HEALTHY && (
                  <div className="absolute inset-0 rounded-lg bg-green-200 animate-pulse-ring"></div>
                )}
              </div>

              {/* Tên và URL */}
              <div>
                <Typography variant="h6" color="blue-gray" className="font-bold mb-1">
                  {healthData.name}
                </Typography>
                <Typography variant="small" className="text-gray-600 truncate max-w-xs">
                  {healthData.url}
                </Typography>
              </div>
            </div>

            {/* Trạng thái và thời gian phản hồi */}
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(healthData.status)}
                <Chip
                  variant="ghost"
                  color={statusConfig.color}
                  value={getStatusText(healthData.status)}
                  className="py-0.5 px-3 text-xs font-medium"
                />
              </div>

              {/* Thời gian phản hồi */}
              <div className="flex flex-col items-end">
                <Typography variant="small" className="font-semibold text-blue-gray-600">
                  {healthData.responseTime}ms
                </Typography>
                <Typography variant="small" className="text-gray-500 text-xs">
                  {formatTimestamp(healthData.timestamp).split(' ')[1]}
                </Typography>
              </div>
            </div>
          </div>

          {/* Advanced Metrics */}
          {healthData.metrics && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {/* Uptime */}
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <Typography variant="small" className="text-blue-700 font-bold">
                  {healthData.metrics.uptime}%
                </Typography>
                <Typography variant="small" className="text-blue-600 text-xs">
                  Uptime
                </Typography>
              </div>

              {/* Stability Index */}
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <Typography variant="small" className="text-purple-700 font-bold">
                  {healthData.metrics.stabilityIndex}
                </Typography>
                <Typography variant="small" className="text-purple-600 text-xs">
                  Stability
                </Typography>
              </div>
            </div>
          )}

          {/* Latency bars */}
          {healthData.metrics && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Latency Distribution</span>
                <span>P50/P90/P99</span>
              </div>
              <div className="space-y-1">
                {/* P50 */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs w-8 text-gray-500">P50</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-green-500 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((healthData.metrics.latencyP50 / 1000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 w-12">{healthData.metrics.latencyP50}ms</span>
                </div>
                
                {/* P90 */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs w-8 text-gray-500">P90</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-amber-500 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((healthData.metrics.latencyP90 / 1000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 w-12">{healthData.metrics.latencyP90}ms</span>
                </div>
                
                {/* P99 */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs w-8 text-gray-500">P99</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-red-500 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((healthData.metrics.latencyP99 / 1000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 w-12">{healthData.metrics.latencyP99}ms</span>
                </div>
              </div>
            </div>
          )}

          {/* SSL Certificate & Security */}
          {healthData.metrics?.sslExpiry && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded flex items-center space-x-2">
              <ShieldCheckIcon className="h-4 w-4 text-green-600" />
              <Typography variant="small" className="text-green-700 text-xs">
                SSL expires in {healthData.metrics.sslExpiry} days
              </Typography>
            </div>
          )}

          {/* Redirect Chain Warning */}
          {healthData.metrics?.redirectChain > 2 && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded flex items-center space-x-2">
              <ArrowPathIcon className="h-4 w-4 text-amber-600" />
              <Typography variant="small" className="text-amber-700 text-xs">
                {healthData.metrics.redirectChain} redirects detected
              </Typography>
            </div>
          )}

          {/* Error message */}
          {healthData.error && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
              <Typography variant="small" className="text-red-700 text-xs">
                Error: {healthData.error}
              </Typography>
            </div>
          )}

          {/* Mini Trend Chart */}
          {healthHistory.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <ChartBarIcon className="h-4 w-4 text-gray-500" />
                <Typography variant="small" className="text-gray-600 text-xs">
                  Response Time Trend
                </Typography>
              </div>
              <div className="h-8 flex items-end space-x-1">
                {healthHistory
                  .filter(h => h.id === healthData.id)
                  .slice(-10)
                  .map((point, index) => (
                    <div
                      key={index}
                      className={`w-1 rounded-t ${
                        point.status === HEALTH_STATUS.HEALTHY ? 'bg-green-400' :
                        point.status === HEALTH_STATUS.WARNING ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      style={{ 
                        height: `${Math.max((point.responseTime / 2000) * 100, 10)}%` 
                      }}
                    ></div>
                  ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </Tooltip>
  );
}

export default HealthCard;
