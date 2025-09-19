import React from 'react';
import { Typography, Button, Badge, Input } from '@material-tailwind/react';
import { PlusIcon, TrashIcon, SignalIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import CopyButton from '@/components/common/CopyButton';
import DownloadButton from '@/components/common/DownloadButton';

const WebhookHeader = ({
  currentUrl,
  isLive,
  requestsCount,
  lastRequestTime,
  onNewEndpoint,
  onToggleLiveMode,
  onClearLogs,
  onExportLogs,
  formatTimestamp,
}) => {
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
        
        <CopyButton
          content={currentUrl}
          successMessage="Endpoint URL copied!"
          size="sm"
          className="flex items-center gap-2"
        >
          Copy URL
        </CopyButton>

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
          <Input
            value={currentUrl}
            readOnly
            className="font-mono text-sm"
            containerProps={{ className: "min-w-0 flex-1" }}
          />
          <CopyButton
            content={currentUrl}
            isIcon
            size="sm"
            variant="text"
            successMessage="URL copied!"
          />
        </div>
      </div>
    </div>
  );
};

export default WebhookHeader;