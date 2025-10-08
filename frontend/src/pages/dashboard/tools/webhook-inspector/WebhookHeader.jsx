import React from 'react';
import { Typography, Button, Badge, Input } from '@material-tailwind/react';
import { PlusIcon, TrashIcon, SignalIcon, GlobeAltIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import CopyButton from '@/components/common/CopyButton';
import DownloadButton from '@/components/common/DownloadButton';

const WebhookHeader = ({
  currentUrl,
  isLive,
  requestsCount,
  lastRequestTime,
  expirationTime,
  isExpired,
  onNewEndpoint,
  onToggleLiveMode,
  onClearLogs,
  onExportLogs,
  formatTimestamp,
}) => {
  const formatExpirationTime = (expirationTime) => {
    if (!expirationTime) return '';
    const expiration = new Date(expirationTime);
    const now = new Date();
    const diffInMs = expiration.getTime() - now.getTime();
    
    if (diffInMs <= 0) {
      return 'Expired';
    }
    
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffInHours > 24) {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ${diffInHours % 24} hour${(diffInHours % 24) !== 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`;
    } else {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`;
    }
  };

  const getExpirationMessage = () => {
    if (!expirationTime) return '';
    
    if (isExpired) {
      return 'Endpoint has expired - Create a new endpoint to receive webhooks';
    } else {
      const timeRemaining = formatExpirationTime(expirationTime);
      const fullDateTime = new Date(expirationTime).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
      return `Endpoint expires in ${timeRemaining} (${fullDateTime})`;
    }
  };
  return (
    <div className="mb-6">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-500 rounded-lg">
          <GlobeAltIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <Typography variant="h4" color="blue-gray" className="font-bold">
            Webhook Inspector
          </Typography>
          <Typography color="gray" className="text-sm">
            Monitor and debug incoming webhook requests in real-time
          </Typography>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <Typography variant="small" className="font-medium">
                LIVE
              </Typography>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button
          variant="filled"
          color="blue"
          size="sm"
          className="flex items-center gap-2"
          onClick={onNewEndpoint}
        >
          <PlusIcon className="h-4 w-4" />
          New Endpoint
        </Button>
      
        <Button
          variant={isLive ? "filled" : "outlined"}
          color={isLive ? "green" : "gray"}
          size="sm"
          className="flex items-center gap-2"
          onClick={onToggleLiveMode}
        >
          <SignalIcon className="h-4 w-4" />
          {isLive ? 'Stop Live' : 'Go Live'}
        </Button>

        <DownloadButton
          content={onExportLogs()}
          fileName={`webhook-logs-${new Date().toISOString().split('T')[0]}.json`}
          mimeType="application/json"
          successMessage="Webhook logs exported!"
          size="sm"
          className="flex items-center gap-2"
        >
          Export
        </DownloadButton>

        <Button
          variant="outlined"
          color="red"
          size="sm"
          className="flex items-center gap-2"
          onClick={onClearLogs}
          disabled={requestsCount === 0}
        >
          <TrashIcon className="h-4 w-4" />
          Clear All
        </Button>
      </div>

      {/* Current URL display */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center justify-between mb-1">
          <Typography variant="small" color="gray" className="font-medium">
            Active Endpoint
          </Typography>
          <Typography variant="small" color="gray">
            Last activity: {formatTimestamp(lastRequestTime)}
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={currentUrl || ''}
            readOnly
            style={{
              flex: 1,
              minWidth: 0,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '14px',
              backgroundColor: 'white',
              color: '#374151'
            }}
            placeholder="No active endpoint"
          />
          <CopyButton
            content={currentUrl || ''}
            isIcon
            size="sm"
            variant="text"
            successMessage="URL copied!"
            disabled={!currentUrl}
          />
        </div>
        
        {/* Expiration status */}
        {expirationTime && (
          <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
            isExpired 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            {isExpired ? (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
            ) : (
              <ClockIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <Typography 
                variant="small" 
                className={`font-medium ${isExpired ? 'text-red-700' : 'text-blue-700'}`}
              >
                {getExpirationMessage()}
              </Typography>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebhookHeader;