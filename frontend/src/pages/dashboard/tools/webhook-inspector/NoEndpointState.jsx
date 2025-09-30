import React from 'react';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const NoEndpointState = ({ onCreateEndpoint }) => {
  return (
    <Card className="border border-amber-200 bg-amber-50">
      <CardBody className="text-center py-12">
        <ExclamationTriangleIcon className="h-16 w-16 text-amber-600 mx-auto mb-4" />
        <Typography variant="h4" color="amber" className="mb-2">
          No Webhook Endpoint Found
        </Typography>
        <Typography color="gray" className="mb-6 max-w-md mx-auto">
          You don't have any active webhook endpoint yet. Create one to start receiving and inspecting HTTP requests in real-time.
        </Typography>
        <div className="space-y-4">
          <button
            onClick={onCreateEndpoint}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create Your First Endpoint
          </button>
          <div className="text-sm text-gray-600">
            <p>✨ Get started with webhook inspection</p>
            <p>🔍 Monitor requests in real-time</p>
            <p>📊 Analyze headers and payloads</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default NoEndpointState;