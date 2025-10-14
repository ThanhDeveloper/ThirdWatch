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

export function HealthCard({ healthData, isLoading = false, healthHistory = [] }) {
  const [animate, setAnimate] = useState(false);
  const statusConfig = getStatusColor(healthData?.status || HEALTH_STATUS.DOWN);

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

  const getStatusIcon = (status) => {
    const iconProps = { className: "h-4 w-4 md:h-5 md:w-5" };
    
    switch (status) {
      case HEALTH_STATUS.HEALTHY:
        return <CheckCircleIcon {...iconProps} className={`h-4 w-4 md:h-5 md:w-5 text-green-600 ${animate ? 'animate-pulse' : ''}`} />;
      case HEALTH_STATUS.WARNING:
        return <ExclamationTriangleIcon {...iconProps} className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />;
      case HEALTH_STATUS.DOWN:
        return <XCircleIcon {...iconProps} className="h-4 w-4 md:h-5 md:w-5 text-red-600" />;
      case HEALTH_STATUS.CHECKING:
        return <ArrowPathIcon {...iconProps} className="h-4 w-4 md:h-5 md:w-5 text-blue-600 animate-spin" />;
      default:
        return <XCircleIcon {...iconProps} className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />;
    }
  };

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

  if (isLoading || !healthData) {
    return (
      <Card className="health-card shadow-md">
        <CardBody className="p-4 md:p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-lg animate-shimmer"></div>
              <div>
                <div className="w-20 md:w-24 h-3 md:h-4 bg-gray-200 rounded animate-shimmer mb-2"></div>
                <div className="w-24 md:w-32 h-2 md:h-3 bg-gray-200 rounded animate-shimmer"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="w-12 md:w-16 h-5 md:h-6 bg-gray-200 rounded animate-shimmer mb-2"></div>
              <div className="w-16 md:w-20 h-2 md:h-3 bg-gray-200 rounded animate-shimmer"></div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full h-2 md:h-3 bg-gray-200 rounded animate-shimmer"></div>
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
        <CardBody className="p-4 md:p-5 lg:p-6">
          <div className="flex items-center justify-between">
            {/* Thông tin endpoint */}
            <div className="flex items-center space-x-3 md:space-x-4">
              {/* Icon và emoji */}
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${statusConfig.bgColor} flex items-center justify-center relative overflow-hidden`}>
                <span className={`text-lg md:text-2xl ${animate ? 'animate-heartbeat' : ''}`}>
                  {statusConfig.icon}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <Typography variant="h6" color="blue-gray" className="font-bold mb-1 text-sm md:text-base lg:text-lg">
                  {healthData.name}
                </Typography>
                <Typography variant="small" className="text-gray-600 truncate text-xs md:text-sm">
                  {healthData.url}
                </Typography>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="flex items-center space-x-1 md:space-x-2 mb-2">
                {getStatusIcon(healthData.status)}
                <Chip
                  variant="ghost"
                  color={statusConfig.color}
                  value={getStatusText(healthData.status)}
                  className="py-0.5 px-2 md:px-3 text-xs font-medium"
                />
              </div>

              <div className="flex flex-col items-end">
                <Typography variant="small" className="font-semibold text-blue-gray-600 text-xs md:text-sm">
                  {healthData.responseTime}ms
                </Typography>
                <Typography variant="small" className="text-gray-500 text-xs">
                  {formatTimestamp(healthData.timestamp).split(' ')[1]}
                </Typography>
              </div>
            </div>
          </div>

          {healthData.metrics && (
            <div className="mt-3 md:mt-4 grid grid-cols-2 gap-2 md:gap-3">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <Typography variant="small" className="text-gray-700 font-bold text-xs md:text-sm">
                  {healthData.metrics.uptime}%
                </Typography>
                <Typography variant="small" className="text-gray-500 text-xs">
                  Uptime
                </Typography>
              </div>

              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <Typography variant="small" className="text-gray-700 font-bold text-xs md:text-sm">
                  {healthData.metrics.stabilityIndex}
                </Typography>
                <Typography variant="small" className="text-gray-500 text-xs">
                  Stability
                </Typography>
              </div>
            </div>
          )}

          {/* Latency bars */}
          {healthData.metrics && (
            <div className="mt-3 md:mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Latency Distribution</span>
                <span className="hidden md:inline">P50/P90/P99</span>
              </div>
              <div className="space-y-1">
                {/* P50 */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs w-6 md:w-8 text-gray-500">P50</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-green-500 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((healthData.metrics.latencyP50 / 1000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 w-10 md:w-12 text-right">{healthData.metrics.latencyP50}ms</span>
                </div>
                
                {/* P90 */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs w-6 md:w-8 text-gray-500">P90</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-amber-500 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((healthData.metrics.latencyP90 / 1000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 w-10 md:w-12 text-right">{healthData.metrics.latencyP90}ms</span>
                </div>
                
                {/* P99 */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs w-6 md:w-8 text-gray-500">P99</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-red-500 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((healthData.metrics.latencyP99 / 1000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 w-10 md:w-12 text-right">{healthData.metrics.latencyP99}ms</span>
                </div>
              </div>
            </div>
          )}

          {/* SSL Certificate & Security */}
          {healthData.metrics?.sslExpiry && (
            <div className="mt-2 md:mt-3 p-2 bg-green-50 border border-green-200 rounded flex items-center space-x-2">
              <ShieldCheckIcon className="h-3 w-3 md:h-4 md:w-4 text-green-600 flex-shrink-0" />
              <Typography variant="small" className="text-green-700 text-xs">
                SSL expires in {healthData.metrics.sslExpiry} days
              </Typography>
            </div>
          )}

          {/* Redirect Chain Warning */}
          {healthData.metrics?.redirectChain > 2 && (
            <div className="mt-2 md:mt-3 p-2 bg-amber-50 border border-amber-200 rounded flex items-center space-x-2">
              <ArrowPathIcon className="h-3 w-3 md:h-4 md:w-4 text-amber-600 flex-shrink-0" />
              <Typography variant="small" className="text-amber-700 text-xs">
                {healthData.metrics.redirectChain} redirects detected
              </Typography>
            </div>
          )}

          {/* Error message */}
          {healthData.error && (
            <div className="mt-2 md:mt-3 p-2 bg-red-50 border border-red-200 rounded">
              <Typography variant="small" className="text-red-700 text-xs break-words">
                Error: {healthData.error}
              </Typography>
            </div>
          )}

          {/* Mini Trend Chart */}
          {healthHistory.length > 0 && (
            <div className="mt-3 md:mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <ChartBarIcon className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                <Typography variant="small" className="text-gray-600 text-xs">
                  Response Time Trend
                </Typography>
              </div>
              <div className="h-6 md:h-8 flex items-end space-x-1">
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
