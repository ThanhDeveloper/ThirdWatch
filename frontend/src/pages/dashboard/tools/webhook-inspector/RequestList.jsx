import React from 'react';
import { Card, CardHeader, CardBody, Typography, Chip } from '@material-tailwind/react';
import { ClockIcon, EyeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const RequestList = ({
  requests,
  selectedRequest,
  onSelectRequest,
  formatTimestamp,
  getMethodColor,
}) => {
  return (
    <Card className="h-fit max-h-[600px]">
      <CardHeader floated={false} shadow={false} className="rounded-none p-4 pb-0">
        <div className="flex items-center justify-between">
          <Typography variant="h6" color="blue-gray" className="font-semibold">
            Request History
          </Typography>
          {requests.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <EyeIcon className="h-3 w-3" />
              <span>Click to inspect</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardBody className="p-0 overflow-y-auto">
        {requests.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <GlobeAltIcon className="h-8 w-8 text-gray-400" />
            </div>
            <Typography color="gray" className="text-sm mb-2">
              No requests yet
            </Typography>
            <Typography color="gray" className="text-xs">
              Your webhook endpoint is ready to receive requests
            </Typography>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((request) => (
              <div
                key={request.id}
                className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${selectedRequest?.id === request.id
                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                    : 'border-l-4 border-l-transparent'
                  }`}
                onClick={() => onSelectRequest(request)}
              >
                {/* Top row: Method + Timestamp */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Chip
                      value={request.method}
                      color={getMethodColor(request.method)}
                      size="sm"
                      className="text-xs font-bold min-w-[60px] text-center"
                    />
                    <div className="flex items-center gap-1 text-gray-500">
                      <ClockIcon className="h-3 w-3" />
                      <Typography variant="small" className="text-xs font-medium">
                        {formatTimestamp(request.timestamp)}
                      </Typography>
                    </div>
                  </div>
                  
                  {/* Content info */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {request.headers?.['content-type'] && (
                      <span className="bg-gray-100 px-2 py-1 rounded-md font-mono">
                        {request.headers['content-type'].split(';')[0]}
                      </span>
                    )}
                    {request.headers?.['content-length'] && (
                      <span className="bg-blue-100 px-2 py-1 rounded-md font-mono text-blue-700">
                        {request.headers['content-length']}B
                      </span>
                    )}
                  </div>
                </div>

                {/* Endpoint ID */}
                <div className="mb-2">
                  <Typography variant="small" color="blue-gray" className="font-mono text-xs bg-gray-50 px-2 py-1 rounded border break-all">
                    <span className="text-gray-500 font-semibold">EndpointId:</span> {request.endpointId}
                  </Typography>
                </div>

                {/* Provider info */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <Typography variant="small" color="gray" className="text-xs font-medium">
                      Provider: <span className="text-blue-600 font-semibold">{request.providerName || 'Unknown'}</span>
                    </Typography>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <Typography variant="small" color="green" className="text-xs font-medium">
                      Received
                    </Typography>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RequestList;