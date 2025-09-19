import React from 'react';
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
} from '@material-tailwind/react';
import { CheckCircleIcon, ExclamationTriangleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import CopyButton from '@/components/common/CopyButton';

const RequestDetails = ({
  selectedRequest,
  activeTab,
  onTabChange,
  formatTimestamp,
  getMethodColor,
}) => {
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
                    {selectedRequest.url}
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
                {selectedRequest.signatureValid ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <Typography variant="small" className="text-green-700 font-medium">
                      Valid Signature
                    </Typography>
                  </>
                ) : (
                  <>
                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
                    <Typography variant="small" className="text-orange-700 font-medium">
                      Invalid Signature
                    </Typography>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Typography variant="small" color="gray">
                  Headers: {Object.keys(selectedRequest.headers).length}
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
                            {selectedRequest.headers['content-type'] || 'Not specified'}
                          </Typography>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Typography variant="small" color="gray" className="mb-2 font-medium">
                            User Agent
                          </Typography>
                          <Typography className="font-mono text-sm break-all">
                            {selectedRequest.headers['user-agent'] || 'Not specified'}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabPanel>

                {/* Headers Tab */}
                <TabPanel value="headers" className="p-0">
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {Object.entries(selectedRequest.headers).map(([key, value]) => (
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
                  {selectedRequest.body ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Typography variant="small" color="gray" className="font-medium">
                          Request Body (JSON)
                        </Typography>
                        <CopyButton
                          content={JSON.stringify(selectedRequest.body, null, 2)}
                          size="sm"
                          successMessage="Request body copied!"
                        >
                          Copy JSON
                        </CopyButton>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border max-h-96 overflow-auto">
                        <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                          {JSON.stringify(selectedRequest.body, null, 2)}
                        </pre>
                      </div>
                    </div>
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