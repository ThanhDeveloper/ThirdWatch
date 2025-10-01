import React from 'react';
import { Card, Typography } from '@material-tailwind/react';
import { DocumentTextIcon, ClockIcon, ServerIcon } from '@heroicons/react/24/outline';

const StatsBar = ({ requests }) => {
  const recentRequests = requests.filter(r => {
    const now = Date.now();
    const requestTime = typeof r.timestamp === 'number' ? r.timestamp : new Date(r.timestamp).getTime();
    return (now - requestTime) < 300000; // Last 5 minutes
  }).length;

  // Count requests by provider instead of HTTP method
  const providerCounts = requests.reduce((acc, request) => {
    const provider = request.providerName || 'Unknown';
    acc[provider] = (acc[provider] || 0) + 1;
    return acc;
  }, {});

  const mostCommonProvider = Object.keys(providerCounts).length > 0 
    ? Object.entries(providerCounts).reduce((a, b) => 
        providerCounts[a[0]] > providerCounts[b[0]] ? a : b, ['N/A', 0])[0]
    : 'N/A';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <DocumentTextIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <Typography variant="small" color="gray">Total Requests</Typography>
            <Typography variant="h6" color="blue-gray">{requests.length}</Typography>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <ClockIcon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <Typography variant="small" color="gray">Recent (5min)</Typography>
            <Typography variant="h6" color="blue-gray">{recentRequests}</Typography>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <ServerIcon className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <Typography variant="small" color="gray">Top Provider</Typography>
            <Typography variant="h6" color="blue-gray">{mostCommonProvider}</Typography>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatsBar;