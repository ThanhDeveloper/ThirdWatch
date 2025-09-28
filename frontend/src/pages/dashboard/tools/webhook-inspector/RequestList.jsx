import React from 'react';
import { Card, CardHeader, CardBody, Typography, Chip } from '@material-tailwind/react';
import { ClockIcon, EyeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const RequestList = ({
  requests,
  selectedRequest,
  onSelectRequest,
  formatTimestamp,
  getMethodColor,
  truncateJson,
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
                className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                  selectedRequest?.id === request.id
                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                    : 'border-l-4 border-l-transparent'
                }`}
                onClick={() => onSelectRequest(request)}
              >
                {/* Request header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Chip
                      value={request.method}
                      color={getMethodColor(request.method)}
                      size="sm"
                      className="text-xs font-semibold"
                    />
                    {/* Show content type if available */}
                    {request.headers?.['content-type'] && (
                      <Typography variant="small" color="gray" className="text-xs">
                        {request.headers['content-type'].split(';')[0]}
                      </Typography>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Show size if available */}
                    {request.headers?.['content-length'] && (
                      <Typography variant="small" color="gray" className="text-xs">
                        {request.headers['content-length']}b
                      </Typography>
                    )}
                  </div>
                </div>
                
                {/* Timestamp */}
                <div className="flex items-center gap-1 mb-2">
                  <ClockIcon className="h-3 w-3 text-gray-400" />
                  <Typography variant="small" color="gray" className="text-xs">
                    {formatTimestamp(request.timestamp)}
                  </Typography>
                </div>
                
                {/* Body preview */}
                <Typography variant="small" color="blue-gray" className="font-mono text-xs break-all line-clamp-2">
                  {truncateJson(request.body)}
                </Typography>
                
                {/* Request source indicator */}
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <Typography variant="small" color="gray" className="text-xs">
                    {request.headers?.['user-agent']?.split('/')[0] || 'Unknown'}
                  </Typography>
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