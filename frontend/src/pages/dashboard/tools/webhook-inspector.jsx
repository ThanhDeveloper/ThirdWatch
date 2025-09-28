import React, { useState, useCallback, useEffect, useRef } from 'react';
import RequestDetails from './webhook-inspector/RequestDetails';
import WebhookHeader from './webhook-inspector/WebhookHeader';
import StatsBar from './webhook-inspector/StatsBar';
import RequestList from './webhook-inspector/RequestList';
import EndpointCreator from './webhook-inspector/EndpointCreator';
import { toast } from 'react-toastify';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import webhookService from '@/services/webhookService';

export function WebhookInspector() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [endpointId, setEndpointId] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLive, setIsLive] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(Date.now());
  const [showEndpointCreator, setShowEndpointCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasNoEndpoint, setHasNoEndpoint] = useState(false);
  const [requestPayloads, setRequestPayloads] = useState({}); // Cache payloads by request ID
  const intervalRef = useRef(null);

  // Function to load payload for a specific request
  const loadRequestPayload = async (request) => {
    try {
      const payload = await webhookService.getRequestPayload(request.endpointId, request.id);
      setRequestPayloads(prev => ({
        ...prev,
        [request.id]: payload
      }));
      return payload;
    } catch (error) {
      console.error('Failed to load request payload:', error);
      return null;
    }
  };



  // Load active endpoint on component mount
  useEffect(() => {
    const loadActiveEndpoint = async () => {
      setLoading(true);
      try {
        const endpoint = await webhookService.getActiveEndpoint();
        
        if (endpoint) {
          setActiveEndpoint(endpoint);
          const url = endpoint || '';
          setCurrentUrl(url);
          // Extract endpoint ID from URL
          const urlParts = url.split('/');
          const extractedEndpointId = urlParts ? urlParts[urlParts.length - 1] : '';
          setEndpointId(extractedEndpointId);
          setHasNoEndpoint(false);
          
          // Load histories after URL is set
          const histories = await webhookService.getHistories();
          const transformedRequests = histories.map(history => {
            let parsedHeaders = {};
            try {
              parsedHeaders = JSON.parse(history.headers || '{}');
            } catch (e) {
              console.warn('Failed to parse headers for request:', history.id, e);
              parsedHeaders = {};
            }

            return {
              id: history.id,
              endpointId: history.endpointId, // Store endpointId from history
              method: history.httpMethod || 'POST',
              url: url,
              timestamp: new Date(history.receivedAt).getTime(),
              headers: parsedHeaders,
              body: null, // Will be loaded separately
            };
          });
          
          setRequests(transformedRequests);
          
          // Auto-load payload for the first request
          if (transformedRequests.length > 0) {
            const firstRequest = transformedRequests[0];
            setSelectedRequest(firstRequest);
            await loadRequestPayload(firstRequest);
          }
        } else {
          setHasNoEndpoint(true);
          setActiveEndpoint(null);
          setCurrentUrl('');
          setEndpointId('');
          setRequests([]);
        }
      } catch (error) {
        console.error('Failed to load active endpoint:', error);
        toast.error('Failed to load webhook endpoint');
        setHasNoEndpoint(true);
      } finally {
        setLoading(false);
      }
    };

    loadActiveEndpoint();
  }, []);

  // Load request histories
  const loadRequestHistories = async () => {
    try {
      const histories = await webhookService.getHistories();
      // Transform API data to match component structure
      const transformedRequests = histories.map(history => {
        // Parse headers JSON string
        let parsedHeaders = {};
        try {
          parsedHeaders = JSON.parse(history.headers || '{}');
        } catch (e) {
          console.warn('Failed to parse headers for request:', history.id, e);
          parsedHeaders = {};
        }

        return {
          id: history.id,
          method: history.httpMethod || 'POST',
          url: currentUrl || 'Unknown URL',
          timestamp: new Date(history.receivedAt).getTime(),
          headers: parsedHeaders,
          body: null, // Will be loaded separately when needed
        };
      });
      
      setRequests(transformedRequests);
      
      // Select the first request if available
      if (transformedRequests.length > 0 && !selectedRequest) {
        setSelectedRequest(transformedRequests[0]);
      }
    } catch (error) {
      console.error('Failed to load request histories:', error);
      toast.error('Failed to load request histories');
    }
  };

  // Simulate real-time request updates (keep for live mode simulation)
  useEffect(() => {
    if (isLive && activeEndpoint && currentUrl) {
      intervalRef.current = setInterval(async () => {
        // Refresh histories from API
        try {
          const histories = await webhookService.getHistories();
          const transformedRequests = histories.map(history => {
            let parsedHeaders = {};
            try {
              parsedHeaders = JSON.parse(history.headers || '{}');
            } catch (e) {
              console.warn('Failed to parse headers for request:', history.id, e);
              parsedHeaders = {};
            }

            return {
              id: history.id,
              endpointId: history.endpointId, // Store endpointId from history
              method: history.httpMethod || 'POST',
              url: currentUrl,
              timestamp: new Date(history.receivedAt).getTime(),
              headers: parsedHeaders,
              body: null,
            };
          });
          
          setRequests(transformedRequests);
          setLastRequestTime(Date.now());
        } catch (error) {
          console.error('Failed to refresh histories:', error);
        }
      }, 5000); // Check every 5 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive, activeEndpoint, currentUrl]);

  // Handle request selection and load payload if needed
  const handleRequestSelection = async (request) => {
    setSelectedRequest(request);
    
    // Load payload if not already cached
    if (!requestPayloads[request.id]) {
      await loadRequestPayload(request);
    }
  };

  const handleCreateEndpoint = useCallback(async (providerName, httpMethod) => {
    try {
      const newEndpoint = await webhookService.createEndpoint(providerName, httpMethod);
      
      // Update state with new endpoint
      setActiveEndpoint(newEndpoint);
      const url = newEndpoint || ''; // newEndpoint đã là URL string
      setCurrentUrl(url);
      // Extract endpoint ID from URL
      const urlParts = url.split('/');
      const extractedEndpointId = urlParts ? urlParts[urlParts.length - 1] : '';
      setEndpointId(extractedEndpointId);
      setRequests([]); // Clear previous requests
      setSelectedRequest(null);
      setIsLive(false); // Stop live mode for new endpoint
      setHasNoEndpoint(false);
      
      toast.success(`New webhook endpoint created for ${providerName}`, {
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Failed to create endpoint:', error);
      toast.error('Failed to create webhook endpoint');
    }
  }, []);

  const handleClearLogs = useCallback(async () => {
    setRequests([]);
    setSelectedRequest(null);
    toast.info('All logs cleared');
  }, []);

  const toggleLiveMode = useCallback(() => {
    setIsLive(prev => {
      const newLiveState = !prev;
      toast.info(newLiveState ? 'Live mode activated - checking for new requests...' : 'Live mode deactivated');
      return newLiveState;
    });
  }, []);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: 'blue',
      POST: 'green',
      PUT: 'orange',
      DELETE: 'red',
      PATCH: 'purple',
    };
    return colors[method] || 'gray';
  };

  const truncateJson = (obj, maxLength = 60) => {
    if (!obj) return 'No body';
    const jsonStr = JSON.stringify(obj, null, 0);
    return jsonStr.length > maxLength 
      ? `${jsonStr.substring(0, maxLength)}...` 
      : jsonStr;
  };

  const exportRequests = () => {
    const data = {
      endpoint: currentUrl,
      endpoint_id: endpointId,
      exported_at: new Date().toISOString(),
      total_requests: requests.length,
      requests: requests.map(r => ({
        ...r,
        timestamp: new Date(r.timestamp).toISOString(),
      })),
    };
    return JSON.stringify(data, null, 2);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="mt-8 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <Typography color="gray">Loading webhook endpoint...</Typography>
        </div>
      </div>
    );
  }

  // Show no endpoint state
  if (hasNoEndpoint) {
    return (
      <div className="mt-8">
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
                onClick={() => setShowEndpointCreator(true)}
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

        {/* Endpoint Creator Dialog */}
        <EndpointCreator
          open={showEndpointCreator}
          onClose={() => setShowEndpointCreator(false)}
          onCreateEndpoint={handleCreateEndpoint}
        />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <WebhookHeader
        key={currentUrl} // Force re-render when URL changes
        currentUrl={currentUrl}
        isLive={isLive}
        requestsCount={requests.length}
        lastRequestTime={lastRequestTime}
        onNewEndpoint={() => setShowEndpointCreator(true)}
        onToggleLiveMode={toggleLiveMode}
        onClearLogs={handleClearLogs}
        onExportLogs={exportRequests}
        formatTimestamp={formatTimestamp}
      />

      <StatsBar requests={requests} />

      {/* Main layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left column - Request list */}
        <div className="xl:col-span-2 order-2 xl:order-1">
          <RequestList
            requests={requests}
            selectedRequest={selectedRequest}
            onSelectRequest={handleRequestSelection}
            formatTimestamp={formatTimestamp}
            getMethodColor={getMethodColor}
            truncateJson={truncateJson}
          />
        </div>

        {/* Right column - Request details */}
        <div className="xl:col-span-3 order-1 xl:order-2">
          <RequestDetails
            selectedRequest={selectedRequest}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            formatTimestamp={formatTimestamp}
            getMethodColor={getMethodColor}
            requestPayload={selectedRequest ? requestPayloads[selectedRequest.id] : null}
          />
        </div>
      </div>

      {/* Endpoint Creator Dialog */}
      <EndpointCreator
        open={showEndpointCreator}
        onClose={() => setShowEndpointCreator(false)}
        onCreateEndpoint={handleCreateEndpoint}
      />
    </div>
  );
}

WebhookInspector.displayName = '/src/pages/dashboard/tools/webhook-inspector.jsx';

export default WebhookInspector;