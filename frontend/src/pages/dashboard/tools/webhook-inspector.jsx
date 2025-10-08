import React, { useState, useCallback, useEffect, useRef } from 'react';
import RequestDetails from './webhook-inspector/RequestDetails';
import WebhookHeader from './webhook-inspector/WebhookHeader';
import StatsBar from './webhook-inspector/StatsBar';
import RequestList from './webhook-inspector/RequestList';
import EndpointCreator from './webhook-inspector/EndpointCreator';
import NoEndpointState from './webhook-inspector/NoEndpointState';
import { toast } from 'react-toastify';
import { Typography } from '@material-tailwind/react';
import webhookService from '@/services/webhookService';

export function WebhookInspector() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [endpointId, setEndpointId] = useState('');
  const [expirationTime, setExpirationTime] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLive, setIsLive] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(Date.now());
  const [showEndpointCreator, setShowEndpointCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasNoEndpoint, setHasNoEndpoint] = useState(false);
  const [requestPayloads, setRequestPayloads] = useState({});
  const intervalRef = useRef(null);
  const expirationCheckRef = useRef(null);

  const loadRequestPayload = async (request) => {
    try {
      const payload = await webhookService.getRequestPayload(request.endpointId, request.id);
      setRequestPayloads(prev => ({
        ...prev,
        [request.id]: payload
      }));
      return payload;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const loadActiveEndpoint = async () => {
      setLoading(true);
      try {
        const endpoint = await webhookService.getActiveEndpoint();
        
        if (endpoint) {
          setActiveEndpoint(endpoint);
          const url = endpoint.endpointUrl || '';
          setCurrentUrl(url);
          const urlParts = url.split('/');
          const extractedEndpointId = urlParts ? urlParts[urlParts.length - 1] : '';
          setEndpointId(extractedEndpointId);
          setExpirationTime(endpoint.expirationTime);
          
          // Check if endpoint is expired
          const now = new Date();
          const expiration = new Date(endpoint.expirationTime);
          setIsExpired(now > expiration);
          
          setHasNoEndpoint(false);
          
          const histories = await webhookService.getHistories();
          const transformedRequests = histories.map(history => {
            let parsedHeaders = {};
            try {
              parsedHeaders = JSON.parse(history.headers || '{}');
            } catch (e) {
              parsedHeaders = {};
            }

            return {
              id: history.id,
              endpointId: history.endpointId,
              url: url,
              timestamp: new Date(history.receivedAt).getTime(),
              headers: parsedHeaders,
              body: null,
              providerName: history.providerName,
            };
          });
          
          setRequests(transformedRequests);
          
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
        toast.error('Failed to load webhook endpoint');
        setHasNoEndpoint(true);
      } finally {
        setLoading(false);
      }
    };

    loadActiveEndpoint();
  }, []);

  const loadRequestHistories = async () => {
    try {
      const histories = await webhookService.getHistories();
      const transformedRequests = histories.map(history => {
        let parsedHeaders = {};
        try {
          parsedHeaders = JSON.parse(history.headers || '{}');
        } catch (e) {
          parsedHeaders = {};
        }

        return {
          id: history.id,
          endpointId: history.endpointId,
          url: currentUrl || 'Unknown URL',
          timestamp: new Date(history.receivedAt).getTime(),
          headers: parsedHeaders,
          body: null,
          providerName: history.providerName,
        };
      });
      
      setRequests(transformedRequests);
      
      if (transformedRequests.length > 0 && !selectedRequest) {
        setSelectedRequest(transformedRequests[0]);
      }
    } catch (error) {
      toast.error('Failed to load request histories');
    }
  };

  useEffect(() => {
    if (isLive && activeEndpoint && currentUrl) {
      intervalRef.current = setInterval(async () => {
        try {
          const histories = await webhookService.getHistories();
          const transformedRequests = histories.map(history => {
            let parsedHeaders = {};
            try {
              parsedHeaders = JSON.parse(history.headers || '{}');
            } catch (e) {
              parsedHeaders = {};
            }

            return {
              id: history.id,
              endpointId: history.endpointId,
              url: currentUrl,
              timestamp: new Date(history.receivedAt).getTime(),
              headers: parsedHeaders,
              body: null,
              providerName: history.providerName,
            };
          });
          
          setRequests(transformedRequests);
          setLastRequestTime(Date.now());
        } catch (error) {
        }
      }, 5000);
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

  // Check expiration status periodically
  useEffect(() => {
    if (expirationTime) {
      // Initial check
      const now = new Date();
      const expiration = new Date(expirationTime);
      setIsExpired(now > expiration);
      
      // Set up interval for periodic checks
      expirationCheckRef.current = setInterval(() => {
        const now = new Date();
        const expiration = new Date(expirationTime);
        setIsExpired(now > expiration);
      }, 30000); // Check every 30 seconds for better responsiveness
    } else {
      if (expirationCheckRef.current) {
        clearInterval(expirationCheckRef.current);
        expirationCheckRef.current = null;
      }
    }

    return () => {
      if (expirationCheckRef.current) clearInterval(expirationCheckRef.current);
    };
  }, [expirationTime]);

  const handleRequestSelection = async (request) => {
    setSelectedRequest(request);
    
    if (!requestPayloads[request.id]) {
      await loadRequestPayload(request);
    }
  };

  const handleCreateEndpoint = useCallback(async (providerName) => {
    try {
      const newEndpoint = await webhookService.createEndpoint(providerName);
      
      setActiveEndpoint(newEndpoint);
      const url = newEndpoint.endpointUrl || '';
      setCurrentUrl(url);
      const urlParts = url.split('/');
      const extractedEndpointId = urlParts ? urlParts[urlParts.length - 1] : '';
      setEndpointId(extractedEndpointId);
      setExpirationTime(newEndpoint.expirationTime);
      
      // Check if endpoint is expired
      const now = new Date();
      const expiration = new Date(newEndpoint.expirationTime);
      setIsExpired(now > expiration);
      
      setIsLive(false);
      setHasNoEndpoint(false);
      setShowEndpointCreator(false);
      
      toast.success(`New webhook endpoint created for ${providerName}`, {
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('Failed to create webhook endpoint');
    }
  }, []);

  const handleClearLogs = useCallback(async () => {
    try {
      await webhookService.clearHistories();
      setRequests([]);
      setSelectedRequest(null);
      setRequestPayloads({});
      
      toast.success('All webhook histories cleared successfully');
    } catch (error) {
      toast.error('Failed to clear webhook histories');
    }
  }, []);

  const toggleLiveMode = useCallback(() => {
    const newLiveState = !isLive;
    setIsLive(newLiveState);
    toast.info(newLiveState ? 'Live mode activated - checking for new requests...' : 'Live mode deactivated');
  }, [isLive]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  
  const handleShowEndpointCreator = useCallback(() => {
    setShowEndpointCreator(true);
  }, []);

  const handleCloseEndpointCreator = useCallback(() => {
    setShowEndpointCreator(false);
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

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

  if (hasNoEndpoint) {
    return (
      <div className="mt-8">
        <NoEndpointState onCreateEndpoint={handleShowEndpointCreator} />

        <EndpointCreator
          open={showEndpointCreator}
          onClose={handleCloseEndpointCreator}
          onCreateEndpoint={handleCreateEndpoint}
        />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <WebhookHeader
        key={currentUrl}
        currentUrl={currentUrl}
        isLive={isLive}
        requestsCount={requests.length}
        lastRequestTime={lastRequestTime}
        expirationTime={expirationTime}
        isExpired={isExpired}
        onNewEndpoint={handleShowEndpointCreator}
        onToggleLiveMode={toggleLiveMode}
        onClearLogs={handleClearLogs}
        onExportLogs={exportRequests}
        formatTimestamp={formatTimestamp}
      />

      <StatsBar requests={requests} />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 order-2 xl:order-1">
          <RequestList
            requests={requests}
            selectedRequest={selectedRequest}
            onSelectRequest={handleRequestSelection}
            formatTimestamp={formatTimestamp}
          />
        </div>

        <div className="xl:col-span-3 order-1 xl:order-2">
          <RequestDetails
            selectedRequest={selectedRequest}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            formatTimestamp={formatTimestamp}
            requestPayload={selectedRequest ? requestPayloads[selectedRequest.id] : null}
          />
        </div>
      </div>

      <EndpointCreator
        open={showEndpointCreator}
        onClose={handleCloseEndpointCreator}
        onCreateEndpoint={handleCreateEndpoint}
      />
    </div>
  );
}

WebhookInspector.displayName = '/src/pages/dashboard/tools/webhook-inspector.jsx';

export default WebhookInspector;