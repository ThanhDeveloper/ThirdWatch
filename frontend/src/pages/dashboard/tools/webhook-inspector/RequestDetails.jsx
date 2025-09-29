import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Chip,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Spinner,
  Button,
} from '@material-tailwind/react';
import { DocumentTextIcon, ExclamationTriangleIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import CopyButton from '@/components/common/CopyButton';

// Collapsible JSON Viewer Component
const JsonView = ({ data, title = "Request Body" }) => {
  const [collapsed, setCollapsed] = useState({});

  if (!data) return null;

  const toggleCollapse = (path) => {
    setCollapsed(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const renderJsonValue = (value, key = '', path = '', level = 0) => {
    if (value === null) {
      return <span className="text-gray-500">null</span>;
    }

    if (typeof value === 'boolean') {
      return <span className={`${value ? 'text-green-600' : 'text-red-600'} font-medium`}>{String(value)}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-blue-600 font-medium">{value}</span>;
    }

    if (typeof value === 'string') {
      return <span className="text-green-700">"{value}"</span>;
    }

    if (Array.isArray(value)) {
      const currentPath = path ? `${path}.${key}` : key;
      const isCollapsed = collapsed[currentPath];
      
      return (
        <div className="ml-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleCollapse(currentPath)}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
            >
              {isCollapsed ? (
                <ChevronRightIcon className="h-3 w-3" />
              ) : (
                <ChevronDownIcon className="h-3 w-3" />
              )}
              <span className="text-purple-600 font-medium">[{value.length}]</span>
            </button>
          </div>
          {!isCollapsed && (
            <div className="ml-4 border-l border-gray-200 pl-4">
              {value.map((item, index) => (
                <div key={index} className="py-1">
                  <span className="text-gray-500 mr-2">{index}:</span>
                  {renderJsonValue(item, index, currentPath, level + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      const currentPath = path ? `${path}.${key}` : key;
      const isCollapsed = collapsed[currentPath];
      const keys = Object.keys(value);

      return (
        <div className="ml-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleCollapse(currentPath)}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
            >
              {isCollapsed ? (
                <ChevronRightIcon className="h-3 w-3" />
              ) : (
                <ChevronDownIcon className="h-3 w-3" />
              )}
              <span className="text-gray-600 font-medium">&#123;{keys.length}&#125;</span>
            </button>
          </div>
          {!isCollapsed && (
            <div className="ml-4 border-l border-gray-200 pl-4">
              {keys.map((objKey) => (
                <div key={objKey} className="py-1">
                  <span className="text-blue-800 font-medium mr-2">"{objKey}":</span>
                  {renderJsonValue(value[objKey], objKey, currentPath, level + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Typography variant="small" color="gray" className="font-medium">
          {title}
        </Typography>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setCollapsed({})}
          >
            Expand All
          </Button>
          <CopyButton
            content={JSON.stringify(data, null, 2)}
            size="sm"
            successMessage="JSON copied!"
          >
            Copy JSON
          </CopyButton>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 border max-h-96 overflow-auto">
        <div className="text-sm font-mono">
          {renderJsonValue(data, '', '', 0)}
        </div>
      </div>
    </div>
  );
};

const RequestDetails = ({
  selectedRequest,
  activeTab,
  onTabChange,
  formatTimestamp,
  getMethodColor,
  requestPayload,
}) => {
  // Helper function to get header value case-insensitive
  const getHeaderValue = (headers, headerName) => {
    if (!headers) return null;
    const key = Object.keys(headers).find(k => k.toLowerCase() === headerName.toLowerCase());
    return key ? headers[key] : null;
  };
  if (!selectedRequest) {
    return (
      <Card className="min-h-[600px]">
        <CardBody className="p-0">
          <div className="flex flex-col items-center justify-center h-96 text-center p-8">
            <div className="w-20 h-20 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-10 w-10 text-gray-400" />
            </div>
            <Typography color="gray" className="mb-2">
              Select a request to view details
            </Typography>
            <Typography color="gray" className="text-sm">
              Choose any request from the history to inspect its headers, body, and metadata
            </Typography>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="min-h-[600px]">
      <CardBody className="p-0">
        <div className="h-full">
          {/* Request summary header */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Chip
                  value={selectedRequest.method}
                  color={getMethodColor(selectedRequest.method)}
                  size="lg"
                  className="font-bold"
                />
                <div>
                  <Typography variant="h6" color="blue-gray" className="font-mono">
                    EndpointId: {selectedRequest.endpointId}
                  </Typography>
                  <Typography variant="small" color="gray">
                    {formatTimestamp(selectedRequest.timestamp)}
                  </Typography>
                </div>
              </div>
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Typography variant="small" color="gray">
                  Headers: {Object.keys(selectedRequest.headers || {}).length}
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <Typography variant="small" color="gray">
                  Size: {requestPayload?.size || 'Unknown'}
                </Typography>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="p-6">
            <Tabs value={activeTab} onChange={onTabChange}>
              <TabsHeader className="grid w-full grid-cols-3">
                <Tab value="overview" className="text-sm">Overview</Tab>
                <Tab value="headers" className="text-sm">Headers</Tab>
                <Tab value="body" className="text-sm">Body</Tab>
              </TabsHeader>
              
              <TabsBody className="mt-6">
                {/* Overview Tab */}
                <TabPanel value="overview" className="p-0">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Typography variant="small" color="gray" className="mb-2 font-medium">
                            Request Method
                          </Typography>
                          <Chip
                            value={selectedRequest.method}
                            color={getMethodColor(selectedRequest.method)}
                            size="sm"
                            className="font-semibold"
                          />
                        </div>
                        
                        <div>
                          <Typography variant="small" color="gray" className="mb-2 font-medium">
                            Content Type
                          </Typography>
                          <Typography className="font-mono text-sm">
                            {getHeaderValue(selectedRequest.headers, 'content-type') || 'Not specified'}
                          </Typography>
                        </div>

                        <div>
                          <Typography variant="small" color="gray" className="mb-2 font-medium">
                            Content Length
                          </Typography>
                          <Typography className="font-mono text-sm">
                            {getHeaderValue(selectedRequest.headers, 'content-length') || 'Not specified'}
                          </Typography>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Typography variant="small" color="gray" className="mb-2 font-medium">
                            User Agent
                          </Typography>
                          <Typography className="font-mono text-sm break-all">
                            {getHeaderValue(selectedRequest.headers, 'user-agent') || 'Not specified'}
                          </Typography>
                        </div>

                        <div>
                          <Typography variant="small" color="gray" className="mb-2 font-medium">
                            Host
                          </Typography>
                          <Typography className="font-mono text-sm">
                            {getHeaderValue(selectedRequest.headers, 'host') || 'Not specified'}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabPanel>

                {/* Headers Tab */}
                <TabPanel value="headers" className="p-0">
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {Object.entries(selectedRequest.headers || {}).map(([key, value]) => (
                      <div key={key} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="sm:w-1/3">
                            <Typography variant="small" className="font-semibold text-blue-gray-700">
                              {key}
                            </Typography>
                          </div>
                          <div className="sm:w-2/3 flex items-center justify-between gap-2">
                            <Typography variant="small" className="font-mono text-gray-600 break-all flex-1">
                              {value}
                            </Typography>
                            <CopyButton
                              content={value}
                              isIcon
                              size="sm"
                              variant="text"
                              successMessage={`${key} copied!`}
                              className="flex-shrink-0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabPanel>

                {/* Body Tab */}
                <TabPanel value="body" className="p-0">
                  {requestPayload ? (
                    <JsonView data={requestPayload} title="Request Payload" />
                  ) : selectedRequest?.body ? (
                    <JsonView data={selectedRequest.body} title="Request Body" />
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <Typography color="gray" className="mb-2">No request body</Typography>
                      <Typography color="gray" className="text-sm">
                        This {selectedRequest.method} request doesn't contain a body
                      </Typography>
                    </div>
                  )}
                </TabPanel>
              </TabsBody>
            </Tabs>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default RequestDetails;