import React, { useState, useEffect } from 'react';
import { Typography, Button, Textarea } from '@material-tailwind/react';
import { 
    KeyIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    EyeIcon,
    ClockIcon,
    UserIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { CopyButton, DownloadButton } from '@/components/common';

export default function JwtDecoderPanel() {
    const [input, setInput] = useState('');
    const [decodedToken, setDecodedToken] = useState(null);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('formatted'); // 'formatted' | 'raw'

    // Base64URL decode function
    const base64UrlDecode = (str) => {
        // Add padding if needed
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const padding = base64.length % 4;
        if (padding) {
            base64 += '='.repeat(4 - padding);
        }
        
        try {
            const decoded = atob(base64);
            return JSON.parse(decoded);
        } catch (error) {
            throw new Error('Invalid Base64URL encoding');
        }
    };

    // Parse and decode JWT token
    const decodeJwt = (token) => {
        if (!token.trim()) {
            throw new Error('Token cannot be empty');
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format. Token must have exactly 3 parts separated by dots.');
        }

        try {
            const header = base64UrlDecode(parts[0]);
            const payload = base64UrlDecode(parts[1]);
            const signature = parts[2]; // Keep signature as is, don't decode

            return {
                header,
                payload,
                signature,
                raw: {
                    header: parts[0],
                    payload: parts[1],
                    signature: parts[2]
                }
            };
        } catch (error) {
            throw new Error('Failed to decode JWT: ' + error.message);
        }
    };

    // Get important claims with their descriptions
    const getImportantClaims = (payload) => {
        const importantClaims = {
            iss: { name: 'Issuer', icon: GlobeAltIcon, description: 'Token issuer' },
            sub: { name: 'Subject', icon: UserIcon, description: 'Token subject (user ID)' },
            aud: { name: 'Audience', icon: GlobeAltIcon, description: 'Token audience' },
            exp: { name: 'Expires', icon: ClockIcon, description: 'Expiration time', isTimestamp: true },
            nbf: { name: 'Not Before', icon: ClockIcon, description: 'Not valid before', isTimestamp: true },
            iat: { name: 'Issued At', icon: ClockIcon, description: 'Token issued at', isTimestamp: true },
            jti: { name: 'JWT ID', icon: KeyIcon, description: 'Unique identifier' }
        };

        return Object.entries(payload)
            .filter(([key]) => importantClaims[key])
            .map(([key, value]) => ({
                key,
                value,
                ...importantClaims[key]
            }));
    };

    // Format timestamp
    const formatTimestamp = (timestamp) => {
        try {
            const date = new Date(timestamp * 1000);
            return {
                formatted: date.toLocaleString(),
                iso: date.toISOString(),
                relative: getRelativeTime(date)
            };
        } catch {
            return { formatted: 'Invalid timestamp', iso: '', relative: '' };
        }
    };

    // Get relative time
    const getRelativeTime = (date) => {
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);

        if (Math.abs(diffMins) < 60) {
            return diffMins > 0 ? `in ${diffMins} minutes` : `${Math.abs(diffMins)} minutes ago`;
        } else if (Math.abs(diffHours) < 24) {
            return diffHours > 0 ? `in ${diffHours} hours` : `${Math.abs(diffHours)} hours ago`;
        } else {
            return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
        }
    };

    const handleDecode = () => {
        setError('');
        setDecodedToken(null);

        try {
            const decoded = decodeJwt(input);
            setDecodedToken(decoded);
            toast.success('JWT decoded successfully');
        } catch (err) {
            setError(err.message);
            toast.error('Decode failed: ' + err.message);
        }
    };

    const reset = () => {
        setInput('');
        setDecodedToken(null);
        setError('');
    };

    // Auto-decode on input change with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (input.trim() && input.includes('.')) {
                try {
                    const decoded = decodeJwt(input);
                    setDecodedToken(decoded);
                    setError('');
                } catch (err) {
                    setError(err.message);
                    setDecodedToken(null);
                }
            } else {
                setDecodedToken(null);
                setError('');
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [input]);

    return (
        <div className="space-y-6">
            {/* Input Section */}
            <div>
                <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                    JWT Token Input
                </Typography>
                <div className="relative">
                    <Textarea
                        rows={6}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste your JWT token here (format: header.payload.signature)..."
                        className={`font-mono text-xs sm:text-sm w-full ${error ? 'border-red-300' : ''}`}
                    />
                </div>
                {error && (
                    <div className="mt-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                        Error: {error}
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2">
                <Button 
                    size="md" 
                    color="blue" 
                    onClick={handleDecode} 
                    className="flex items-center gap-2 shadow-md"
                    disabled={!input.trim()}
                >
                    <KeyIcon className="h-4 w-4" /> Decode JWT
                </Button>
                <Button size="md" variant="outlined" color="red" onClick={reset}>
                    Clear
                </Button>
            </div>

            {/* Decoded Results */}
            {decodedToken && (
                <div className="space-y-6">
                    {/* Important Claims Highlight */}
                    {decodedToken.payload && getImportantClaims(decodedToken.payload).length > 0 && (
                        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                            <Typography variant="h6" color="blue" className="mb-3 flex items-center gap-2">
                                <EyeIcon className="h-5 w-5" />
                                Important Claims
                            </Typography>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {getImportantClaims(decodedToken.payload).map((claim) => {
                                    const IconComponent = claim.icon;
                                    return (
                                        <div key={claim.key} className="bg-white rounded p-3 border">
                                            <div className="flex items-center gap-2 mb-1">
                                                <IconComponent className="h-4 w-4 text-blue-600" />
                                                <span className="font-medium text-sm">{claim.name}</span>
                                                <span className="text-xs text-gray-500">({claim.key})</span>
                                            </div>
                                            <div className="text-sm">
                                                {claim.isTimestamp ? (
                                                    <div>
                                                        <div className="font-mono text-xs text-gray-600">
                                                            {claim.value}
                                                        </div>
                                                        <div className="text-gray-700">
                                                            {formatTimestamp(claim.value).formatted}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {formatTimestamp(claim.value).relative}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="font-mono text-gray-700">
                                                        {JSON.stringify(claim.value)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Header Section */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
                                <DocumentTextIcon className="h-5 w-5" />
                                Header
                            </Typography>
                            <div className="flex gap-2">
                                <CopyButton 
                                    content={JSON.stringify(decodedToken.header, null, 2)} 
                                    size="sm" 
                                    variant="outlined" 
                                    className="px-3 py-1" 
                                />
                                <DownloadButton 
                                    content={JSON.stringify(decodedToken.header, null, 2)} 
                                    fileName="jwt-header.json" 
                                    size="sm"
                                    variant="outlined"
                                    className="px-3 py-1"
                                    mimeType="application/json"
                                />
                            </div>
                        </div>
                        <div className="border rounded-md">
                            <Textarea 
                                rows={4} 
                                value={JSON.stringify(decodedToken.header, null, 2)} 
                                readOnly 
                                className="font-mono text-xs sm:text-sm w-full border-0 focus:ring-0" 
                            />
                        </div>
                    </div>

                    {/* Payload Section */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
                                <DocumentTextIcon className="h-5 w-5" />
                                Payload
                            </Typography>
                            <div className="flex gap-2">
                                <CopyButton 
                                    content={JSON.stringify(decodedToken.payload, null, 2)} 
                                    size="sm" 
                                    variant="outlined" 
                                    className="px-3 py-1" 
                                />
                                <DownloadButton 
                                    content={JSON.stringify(decodedToken.payload, null, 2)} 
                                    fileName="jwt-payload.json" 
                                    size="sm"
                                    variant="outlined"
                                    className="px-3 py-1"
                                    mimeType="application/json"
                                />
                            </div>
                        </div>
                        <div className="border rounded-md">
                            <Textarea 
                                rows={8} 
                                value={JSON.stringify(decodedToken.payload, null, 2)} 
                                readOnly 
                                className="font-mono text-xs sm:text-sm w-full border-0 focus:ring-0" 
                            />
                        </div>
                    </div>

                    {/* Signature Section */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
                                <KeyIcon className="h-5 w-5" />
                                Signature
                            </Typography>
                            <div className="flex gap-2">
                                <CopyButton 
                                    content={decodedToken.signature} 
                                    size="sm" 
                                    variant="outlined" 
                                    className="px-3 py-1" 
                                />
                            </div>
                        </div>
                        <div className="border rounded-md bg-gray-50 p-3">
                            <div className="text-xs text-gray-600 mb-2">
                                ⚠️ Signature verification is not performed. This tool only decodes the token content.
                            </div>
                            <div className="font-mono text-xs break-all text-gray-700">
                                {decodedToken.signature}
                            </div>
                        </div>
                    </div>

                    {/* Raw Parts (for debugging) */}
                    <details className="border rounded-md">
                        <summary className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 font-medium text-sm">
                            Raw Token Parts (Base64URL)
                        </summary>
                        <div className="p-3 space-y-3">
                            <div>
                                <div className="text-sm font-medium mb-1">Header (Base64URL):</div>
                                <div className="font-mono text-xs bg-gray-50 p-2 rounded break-all">
                                    {decodedToken.raw.header}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">Payload (Base64URL):</div>
                                <div className="font-mono text-xs bg-gray-50 p-2 rounded break-all">
                                    {decodedToken.raw.payload}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">Signature:</div>
                                <div className="font-mono text-xs bg-gray-50 p-2 rounded break-all">
                                    {decodedToken.raw.signature}
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
            )}
        </div>
    );
}