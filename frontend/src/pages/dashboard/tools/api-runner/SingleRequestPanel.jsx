import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    Typography,
    Button,
    Input,
    Select,
    Option,
    Textarea,
    Chip,
    IconButton,
} from '@material-tailwind/react';
import { 
    PlayIcon,
    TrashIcon,
    PlusIcon,
    ClockIcon,
    DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { CopyButton } from '@/components/common';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

const COMMON_HEADERS = {
    'GET': {
        'Accept': 'application/json',
        'User-Agent': 'ThirdWatch API Runner/1.0'
    },
    'POST': {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ThirdWatch API Runner/1.0'
    },
    'PUT': {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ThirdWatch API Runner/1.0'
    },
    'DELETE': {
        'Accept': 'application/json',
        'User-Agent': 'ThirdWatch API Runner/1.0'
    },
    'PATCH': {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ThirdWatch API Runner/1.0'
    },
    'HEAD': {
        'Accept': 'application/json',
        'User-Agent': 'ThirdWatch API Runner/1.0'
    },
    'OPTIONS': {
        'Accept': 'application/json',
        'User-Agent': 'ThirdWatch API Runner/1.0'
    }
};

export default function SingleRequestPanel() {
    const [requestName, setRequestName] = useState('New Request');
    const [method, setMethod] = useState('GET');
    const [url, setUrl] = useState('');
    const [headers, setHeaders] = useState([{ key: '', value: '', id: Date.now() }]);
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [history, setHistory] = useState([]);

    // Load request history from localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem('api-runner-history');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Failed to parse request history:', e);
            }
        }
    }, []);

    // Auto-populate headers when method changes
    useEffect(() => {
        const commonHeaders = COMMON_HEADERS[method] || {};
        const newHeaders = Object.entries(commonHeaders).map(([key, value]) => ({
            key,
            value,
            id: Date.now() + Math.random()
        }));
        
        // Add empty row for additional headers
        newHeaders.push({ key: '', value: '', id: Date.now() + Math.random() + 1 });
        setHeaders(newHeaders);
    }, [method]);

    const addHeader = () => {
        setHeaders([...headers, { key: '', value: '', id: Date.now() }]);
    };

    const updateHeader = (id, field, value) => {
        setHeaders(headers.map(h => 
            h.id === id ? { ...h, [field]: value } : h
        ));
    };

    const removeHeader = (id) => {
        setHeaders(headers.filter(h => h.id !== id));
    };

    const saveRequestToHistory = (request, response) => {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            name: requestName,
            method: request.method,
            url: request.url,
            headers: request.headers,
            body: request.body,
            response: response,
        };

        const newHistory = [historyItem, ...history.slice(0, 49)]; // Keep last 50 requests
        setHistory(newHistory);
        localStorage.setItem('api-runner-history', JSON.stringify(newHistory));
    };

    const sendRequest = async () => {
        if (!url.trim()) {
            toast.error('Please enter a URL');
            return;
        }

        setLoading(true);
        setResponse(null);

        try {
            // Mock API response since backend integration will be implemented later
            const mockResponse = {
                status: 200,
                statusText: 'OK',
                headers: {
                    'content-type': 'application/json',
                    'x-powered-by': 'ThirdWatch Mock Server',
                    'date': new Date().toISOString(),
                },
                data: {
                    message: 'Mock response from ThirdWatch API Runner',
                    method: method,
                    url: url,
                    timestamp: new Date().toISOString(),
                    requestHeaders: headers.filter(h => h.key && h.value),
                    requestBody: body ? JSON.parse(body || '{}') : null,
                }
            };

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

            const request = {
                method,
                url,
                headers: headers.filter(h => h.key && h.value),
                body: body || null,
            };

            setResponse(mockResponse);
            saveRequestToHistory(request, mockResponse);
            toast.success(`${method} request completed successfully`);

        } catch (error) {
            const errorResponse = {
                status: 500,
                statusText: 'Internal Server Error',
                headers: {},
                error: error.message,
            };
            
            setResponse(errorResponse);
            toast.error('Request failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadFromHistory = (historyItem) => {
        setRequestName(historyItem.name);
        setMethod(historyItem.method);
        setUrl(historyItem.url);
        setHeaders([...historyItem.headers, { key: '', value: '', id: Date.now() }]);
        setBody(historyItem.body || '');
        setResponse(historyItem.response);
        toast.info('Request loaded from history');
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('api-runner-history');
        toast.success('Request history cleared');
    };

    const formatJsonBody = () => {
        if (!body.trim()) return;
        
        try {
            const parsed = JSON.parse(body);
            setBody(JSON.stringify(parsed, null, 2));
            toast.success('JSON formatted successfully');
        } catch (e) {
            toast.error('Invalid JSON format');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            {/* Left Sidebar - Request History */}
            <div className="lg:col-span-1 order-2 lg:order-1">
                <Card className="border border-blue-gray-100 h-full">
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <Typography variant="h6" color="blue-gray">
                                Request History
                            </Typography>
                            {history.length > 0 && (
                                <IconButton
                                    size="sm"
                                    variant="text"
                                    color="red"
                                    onClick={clearHistory}
                                    className="p-1"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </IconButton>
                            )}
                        </div>

                        {history.length === 0 ? (
                            <div className="text-center py-8">
                                <ClockIcon className="h-12 w-12 mx-auto text-blue-gray-300 mb-2" />
                                <Typography variant="small" color="blue-gray" className="text-blue-gray-400">
                                    No requests yet
                                </Typography>
                                <Typography variant="small" color="blue-gray" className="text-blue-gray-400 text-xs">
                                    Your request history will appear here
                                </Typography>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                                {history.map((item) => (
                                    <Card 
                                        key={item.id} 
                                        className="bg-gray-50 hover:bg-blue-50 cursor-pointer transition-colors border border-transparent hover:border-blue-200"
                                    >
                                        <CardBody 
                                            className="p-3"
                                            onClick={() => loadFromHistory(item)}
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Typography variant="small" className="font-medium text-blue-gray-700 truncate pr-2">
                                                        {item.name}
                                                    </Typography>
                                                    <Chip
                                                        value={item.method}
                                                        size="sm"
                                                        color={
                                                            item.method === 'GET' ? 'green' :
                                                            item.method === 'POST' ? 'blue' :
                                                            item.method === 'PUT' ? 'amber' :
                                                            item.method === 'DELETE' ? 'red' : 'purple'
                                                        }
                                                        className="text-xs"
                                                    />
                                                </div>
                                                
                                                <Typography variant="small" className="text-blue-gray-500 truncate text-xs">
                                                    {item.url}
                                                </Typography>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1 text-blue-gray-400">
                                                        <ClockIcon className="h-3 w-3" />
                                                        <Typography variant="small" className="text-xs">
                                                            {new Date(item.timestamp).toLocaleTimeString()}
                                                        </Typography>
                                                    </div>
                                                    
                                                    {item.response && (
                                                        <Chip
                                                            value={item.response.status}
                                                            size="sm"
                                                            color={item.response.status < 300 ? 'green' : item.response.status < 400 ? 'amber' : 'red'}
                                                            className="text-xs h-5"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Right Content - Request Configuration and Response */}
            <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
                {/* Request Configuration */}
                <Card className="border border-blue-gray-100">
                    <CardBody className="p-4 sm:p-6">
                        <Typography variant="h5" color="blue-gray" className="mb-4">
                            API Request Configuration
                        </Typography>

                        {/* Request Name */}
                        <div className="mb-4">
                            <Typography variant="small" className="mb-2 font-medium text-blue-gray-600">
                                Request Name
                            </Typography>
                            <Input
                                placeholder="Enter request name"
                                value={requestName}
                                onChange={(e) => setRequestName(e.target.value)}
                                className="!border-blue-gray-200 focus:!border-blue-500"
                            />
                        </div>

                        {/* Method and URL */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                            <div className="sm:col-span-1">
                                <Typography variant="small" className="mb-2 font-medium text-blue-gray-600">
                                    Method
                                </Typography>
                                <Select value={method} onChange={(val) => setMethod(val)}>
                                    {HTTP_METHODS.map((m) => (
                                        <Option key={m} value={m}>
                                            <span className={`font-medium ${
                                                m === 'GET' ? 'text-green-600' :
                                                m === 'POST' ? 'text-blue-600' :
                                                m === 'PUT' ? 'text-amber-600' :
                                                m === 'DELETE' ? 'text-red-600' :
                                                'text-purple-600'
                                            }`}>
                                                {m}
                                            </span>
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                            <div className="sm:col-span-3">
                                <Typography variant="small" className="mb-2 font-medium text-blue-gray-600">
                                    URL
                                </Typography>
                                <Input
                                    placeholder="https://api.example.com/endpoint"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="!border-blue-gray-200 focus:!border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Headers */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <Typography variant="small" className="font-medium text-blue-gray-600">
                                    Headers
                                </Typography>
                                <Button
                                    size="sm"
                                    variant="text"
                                    className="flex items-center gap-1"
                                    onClick={addHeader}
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    Add Header
                                </Button>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {headers.map((header) => (
                                    <div key={header.id} className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                                        <div className="sm:col-span-2">
                                            <Input
                                                placeholder="Header Name"
                                                value={header.key}
                                                onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                                                size="sm"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <Input
                                                placeholder="Header Value"
                                                value={header.value}
                                                onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                                                size="sm"
                                            />
                                        </div>
                                        <div className="sm:col-span-1 flex justify-end">
                                            <IconButton
                                                size="sm"
                                                variant="text"
                                                color="red"
                                                onClick={() => removeHeader(header.id)}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </IconButton>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Request Body */}
                        {['POST', 'PUT', 'PATCH'].includes(method) && (
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Typography variant="small" className="font-medium text-blue-gray-600">
                                        Request Body (JSON)
                                    </Typography>
                                    <Button
                                        size="sm"
                                        variant="text"
                                        onClick={formatJsonBody}
                                        className="flex items-center gap-1"
                                    >
                                        <DocumentDuplicateIcon className="h-4 w-4" />
                                        Format JSON
                                    </Button>
                                </div>
                                <Textarea
                                    placeholder='{"key": "value"}'
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={6}
                                    className="!border-blue-gray-200 focus:!border-blue-500"
                                />
                            </div>
                        )}

                        {/* Send Button */}
                        <Button
                            onClick={sendRequest}
                            loading={loading}
                            disabled={loading || !url.trim()}
                            className="w-full sm:w-auto flex items-center gap-2"
                            color="blue"
                        >
                            <PlayIcon className="h-4 w-4" />
                            {loading ? 'Sending...' : 'Send Request'}
                        </Button>
                    </CardBody>
                </Card>

                {/* Response Display */}
                {response && (
                    <Card className="border border-blue-gray-100">
                        <CardBody className="p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Typography variant="h5" color="blue-gray">
                                    Response
                                </Typography>
                                <div className="flex items-center gap-2">
                                    <Chip
                                        value={`${response.status} ${response.statusText || ''}`}
                                        color={response.status < 300 ? 'green' : response.status < 400 ? 'amber' : 'red'}
                                        size="sm"
                                    />
                                    <CopyButton
                                        content={JSON.stringify(response, null, 2)}
                                        size="sm"
                                        variant="outlined"
                                    />
                                </div>
                            </div>

                            {/* Response Headers */}
                            {response.headers && Object.keys(response.headers).length > 0 && (
                                <div className="mb-4">
                                    <Typography variant="small" className="mb-2 font-medium text-blue-gray-600">
                                        Response Headers
                                    </Typography>
                                    <Card className="bg-gray-50">
                                        <CardBody className="p-3">
                                            <pre className="text-xs text-blue-gray-700 overflow-x-auto">
                                                {Object.entries(response.headers).map(([key, value]) => (
                                                    <div key={key} className="mb-1">
                                                        <span className="font-medium">{key}:</span> {value}
                                                    </div>
                                                ))}
                                            </pre>
                                        </CardBody>
                                    </Card>
                                </div>
                            )}

                            {/* Response Body */}
                            <div>
                                <Typography variant="small" className="mb-2 font-medium text-blue-gray-600">
                                    Response Body
                                </Typography>
                                <Card className="bg-gray-50">
                                    <CardBody className="p-3">
                                        <pre className="text-xs text-blue-gray-700 overflow-x-auto whitespace-pre-wrap">
                                            {JSON.stringify(response.data || response.error || response, null, 2)}
                                        </pre>
                                    </CardBody>
                                </Card>
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>
        </div>
    );
}