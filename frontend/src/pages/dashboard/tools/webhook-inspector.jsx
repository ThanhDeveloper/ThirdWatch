import React, { useState, useCallback, useEffect, useRef } from 'react';
import RequestDetails from './webhook-inspector/RequestDetails';
import WebhookHeader from './webhook-inspector/WebhookHeader';
import StatsBar from './webhook-inspector/StatsBar';
import RequestList from './webhook-inspector/RequestList';
import EndpointCreator from './webhook-inspector/EndpointCreator';
import { toast } from 'react-toastify';

// Mock data for requests with more realistic variety
const mockRequests = [
  {
    id: '1',
    method: 'POST',
    url: '/hooks/abc123',
    timestamp: new Date('2025-09-19T10:30:00').getTime(),
    headers: {
      'content-type': 'application/json',
      'user-agent': 'GitHub-Hookshot/abc123',
      'x-github-event': 'push',
      'x-github-delivery': 'abc123-def456-789',
      'x-hub-signature-256': 'sha256=valid_signature_hash_here',
      'host': 'localhost:5173',
      'content-length': '1024',
    },
    body: {
      action: 'opened',
      number: 123,
      pull_request: {
        title: 'Add new webhook feature',
        state: 'open',
        user: { login: 'developer123' },
      },
      repository: {
        name: 'my-awesome-project',
        full_name: 'company/my-awesome-project',
        private: false,
      },
      sender: { login: 'developer123' },
    },
    signatureValid: true,
  },
  {
    id: '2',
    method: 'POST',
    url: '/hooks/abc123',
    timestamp: new Date('2025-09-19T10:25:00').getTime(),
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
      'stripe-signature': 'v1=invalid_signature_here',
      'stripe-version': '2023-10-16',
      'host': 'localhost:5173',
      'content-length': '512',
    },
    body: {
      id: 'evt_1234567890',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_1234567890',
          amount: 2000,
          currency: 'usd',
          status: 'succeeded',
          customer: 'cus_1234567890',
        },
      },
      created: 1695123456,
    },
    signatureValid: false,
  },
  {
    id: '3',
    method: 'GET',
    url: '/hooks/abc123/health',
    timestamp: new Date('2025-09-19T10:20:00').getTime(),
    headers: {
      'user-agent': 'curl/8.1.2',
      'accept': '*/*',
      'host': 'localhost:5173',
    },
    body: null,
    signatureValid: true,
  },
  {
    id: '4',
    method: 'POST',
    url: '/hooks/abc123',
    timestamp: new Date('2025-09-19T10:15:00').getTime(),
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Slack-Hooks/1.0',
      'x-slack-signature': 'v0=valid_slack_signature',
      'x-slack-request-timestamp': '1695123456',
      'host': 'localhost:5173',
      'content-length': '256',
    },
    body: {
      token: 'verification_token_here',
      challenge: 'challenge_code_here',
      type: 'url_verification',
    },
    signatureValid: true,
  },
  {
    id: '5',
    method: 'PUT',
    url: '/hooks/abc123',
    timestamp: new Date('2025-09-19T10:10:00').getTime(),
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Custom-Webhook/2.1',
      'authorization': 'Bearer jwt_token_here',
      'host': 'localhost:5173',
      'content-length': '128',
    },
    body: {
      event: 'user.updated',
      user_id: '12345',
      changes: ['email', 'name'],
      timestamp: 1695123456,
    },
    signatureValid: true,
  },
];

export function WebhookInspector() {
  const [requests, setRequests] = useState(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState(mockRequests[0]);
  const [currentUrl, setCurrentUrl] = useState('https://localhost:5173/hooks/abc123');
  const [endpointId, setEndpointId] = useState('abc123');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLive, setIsLive] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(Date.now());
  const [showEndpointCreator, setShowEndpointCreator] = useState(false);
  const intervalRef = useRef(null);

  // Simulate real-time request updates
  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(() => {
        // Simulate new request (20% chance every 3 seconds)
        if (Math.random() < 0.2) {
          const newRequest = {
            id: Date.now().toString(),
            method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
            url: `/hooks/${endpointId}`,
            timestamp: Date.now(),
            headers: {
              'user-agent': 'SimulatedWebhook/1.0',
              'content-type': 'application/json',
              'host': 'localhost:5173',
            },
            body: {
              event: 'test_event',
              data: { id: Math.floor(Math.random() * 1000) },
            },
            signatureValid: Math.random() > 0.3,
          };
          
          setRequests(prev => [newRequest, ...prev.slice(0, 19)]); // Keep max 20 requests
          setLastRequestTime(Date.now());
        }
      }, 3000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive, endpointId]);

  const handleNewEndpoint = useCallback(() => {
    setShowEndpointCreator(true);
  }, []);

  const handleCreateEndpoint = useCallback((newEndpointId) => {
    const newUrl = `https://localhost:5173/hooks/${newEndpointId}`;
    
    // Simulate endpoint creation
    setEndpointId(newEndpointId);
    setCurrentUrl(newUrl);
    setRequests([]); // Clear previous requests
    setSelectedRequest(null);
    setIsLive(false); // Stop live mode for new endpoint
    
    toast.success(`New endpoint created: ${newEndpointId}`, {
      autoClose: 3000,
    });
    console.log('New endpoint created:', newUrl);
  }, []);

  const handleClearLogs = useCallback(() => {
    setRequests([]);
    setSelectedRequest(null);
    toast.info('All logs cleared');
  }, []);

  const toggleLiveMode = useCallback(() => {
    setIsLive(prev => {
      const newLiveState = !prev;
      toast.info(newLiveState ? 'Live mode activated' : 'Live mode deactivated');
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

  return (
    <div className="mt-8">
      <WebhookHeader
        currentUrl={currentUrl}
        isLive={isLive}
        requestsCount={requests.length}
        lastRequestTime={lastRequestTime}
        onNewEndpoint={handleNewEndpoint}
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
            onSelectRequest={setSelectedRequest}
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