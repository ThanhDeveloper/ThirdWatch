import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Chip,
  Progress,
} from "@material-tailwind/react";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import MockDataService from '@/services/mockDataService';

export function HealthStatistics({ refreshTrigger }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [refreshTrigger]);

  const loadStatistics = () => {
    try {
      setLoading(true);
      const statistics = MockDataService.getStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <Card className="mb-6">
        <CardBody className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  const getTrendIcon = (trend) => {
    if (trend > 2) return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    if (trend < -2) return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
  };

  const getTrendColor = (trend) => {
    if (trend > 2) return 'text-green-600';
    if (trend < -2) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className="mb-6 shadow-lg">
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-6 w-6 text-blue-600" />
            <Typography variant="h6" className="font-bold text-gray-900">
              Monitoring Statistics
            </Typography>
          </div>
          {stats.lastCheck && (
            <Chip
              value={`Last: ${new Date(stats.lastCheck).toLocaleTimeString()}`}
              size="sm"
              color="blue"
              variant="ghost"
              className="flex items-center space-x-1"
              icon={<ClockIcon className="h-3 w-3" />}
            />
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total Sites */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <Typography variant="small" className="text-blue-700 font-semibold mb-1">
              Total Sites
            </Typography>
            <Typography variant="h4" className="text-blue-900 font-bold">
              {stats.totalSites}
            </Typography>
          </div>

          {/* Active Sites */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <Typography variant="small" className="text-green-700 font-semibold mb-1">
              Active
            </Typography>
            <Typography variant="h4" className="text-green-900 font-bold">
              {stats.activeSites}
            </Typography>
          </div>

          {/* Current Uptime */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <Typography variant="small" className="text-purple-700 font-semibold mb-1">
              Current Uptime
            </Typography>
            <Typography variant="h4" className="text-purple-900 font-bold">
              {stats.uptime.current.toFixed(1)}%
            </Typography>
          </div>

          {/* Average Uptime */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
            <Typography variant="small" className="text-amber-700 font-semibold mb-1">
              Avg Uptime
            </Typography>
            <div className="flex items-center space-x-2">
              <Typography variant="h4" className="text-amber-900 font-bold">
                {stats.uptime.average.toFixed(1)}%
              </Typography>
              <div className="flex items-center space-x-1">
                {getTrendIcon(stats.uptime.trend)}
                <Typography 
                  variant="small" 
                  className={`font-medium ${getTrendColor(stats.uptime.trend)}`}
                >
                  {stats.uptime.trend > 0 ? '+' : ''}{stats.uptime.trend.toFixed(1)}%
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Uptime Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <Typography variant="small" className="font-semibold text-gray-700">
              Overall System Health
            </Typography>
            <Typography variant="small" className="font-bold text-gray-900">
              {stats.uptime.current.toFixed(1)}%
            </Typography>
          </div>
          <Progress
            value={stats.uptime.current}
            color={stats.uptime.current >= 95 ? "green" : stats.uptime.current >= 80 ? "amber" : "red"}
            className="h-3"
          />
        </div>

        {/* Sites by Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Typography variant="small" className="font-semibold text-gray-700 mb-3">
              Sites by Type
            </Typography>
            <div className="space-y-2">
              {Object.entries(stats.sitesBy.type).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      type === 'website' ? 'bg-blue-500' :
                      type === 'api' ? 'bg-green-500' : 'bg-purple-500'
                    }`} />
                    <Typography variant="small" className="capitalize text-gray-700">
                      {type}
                    </Typography>
                  </div>
                  <Chip
                    value={count.toString()}
                    size="sm"
                    color={type === 'website' ? 'blue' : type === 'api' ? 'green' : 'purple'}
                    variant="ghost"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Typography variant="small" className="font-semibold text-gray-700 mb-3">
              Check Intervals
            </Typography>
            <div className="space-y-2">
              {Object.entries(stats.sitesBy.interval).map(([interval, count]) => (
                <div key={interval} className="flex items-center justify-between">
                  <Typography variant="small" className="text-gray-700">
                    {interval === '300' ? '5 min' : 
                     interval === '600' ? '10 min' : 
                     interval === '1800' ? '30 min' : 
                     `${interval}s`}
                  </Typography>
                  <Chip
                    value={count.toString()}
                    size="sm"
                    color="gray"
                    variant="ghost"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default HealthStatistics;