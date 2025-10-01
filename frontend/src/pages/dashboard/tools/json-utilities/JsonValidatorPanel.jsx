import React, { useState, useEffect } from 'react';
import { Typography, Button, Textarea } from '@material-tailwind/react';
import { 
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import JSON5 from 'json5';

export default function JsonValidatorPanel() {
    const [input, setInput] = useState('');
    const [validationResult, setValidationResult] = useState(null);
    const [errorDetails, setErrorDetails] = useState(null);
    useEffect(() => {
        const timer = setTimeout(() => {
            if (input.trim()) {
                validateJson();
            } else {
                setValidationResult(null);
                setErrorDetails(null);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [input]);
    // Removed auto-fix and suggestion states

    // Parse JSON error and extract line/column info
    const parseJsonError = (errorMessage, jsonString) => {
        const lines = jsonString.split('\n');
        let lineNumber = null;
        let columnNumber = null;
        let errorType = 'syntax';

        // Try to extract line/column from different error formats
        const patterns = [
            /at position (\d+)/i,
            /line (\d+) column (\d+)/i,
            /at line (\d+)/i,
            /column (\d+)/i
        ];

        for (const pattern of patterns) {
            const match = errorMessage.match(pattern);
            if (match) {
                if (match[2]) {
                    lineNumber = parseInt(match[1]);
                    columnNumber = parseInt(match[2]);
                } else {
                    const position = parseInt(match[1]);
                    // Convert position to line/column
                    let currentPos = 0;
                    for (let i = 0; i < lines.length; i++) {
                        if (currentPos + lines[i].length >= position) {
                            lineNumber = i + 1;
                            columnNumber = position - currentPos + 1;
                            break;
                        }
                        currentPos += lines[i].length + 1; // +1 for newline
                    }
                }
                break;
            }
        }

        return {
            message: errorMessage,
            lineNumber,
            columnNumber,
            errorType,
            context: lineNumber ? lines[lineNumber - 1] : null
        };
    };


    const validateJson = () => {
        if (!input.trim()) {
            toast.error('Please enter JSON to validate');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            setValidationResult({
                isValid: true,
                data: parsed,
                message: 'Valid JSON',
                size: JSON.stringify(parsed).length,
                keys: typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 0
            });
            setErrorDetails(null);
        } catch (error) {
            const errorInfo = parseJsonError(error.message, input);
            setValidationResult({
                isValid: false,
                message: 'Invalid JSON'
            });
            setErrorDetails(errorInfo);
        }
    };

    const reset = () => {
        setInput('');
        setValidationResult(null);
        setErrorDetails(null);
    };

    const formatJson = () => {
        if (validationResult && validationResult.isValid) {
            const formatted = JSON.stringify(validationResult.data, null, 2);
            setInput(formatted);
            toast.success('JSON formatted');
        }
    };

    return (
        <div className="space-y-6">
            {/* Input Section */}
            <div>
                <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                    JSON Input
                </Typography>
                <div className="relative">
                    <Textarea
                        rows={12}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste your JSON here to validate..."
                        className={`font-mono text-xs sm:text-sm w-full ${
                            validationResult?.isValid === false ? 'border-red-300 bg-red-50' : 
                            validationResult?.isValid === true ? 'border-green-300 bg-green-50' : ''
                        }`}
                    />
                    {/* Line numbers overlay could be added here for advanced highlighting */}
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2">
                <Button 
                    size="md" 
                    color="blue" 
                    onClick={validateJson} 
                    className="flex items-center gap-2 shadow-md"
                >
                    <CheckCircleIcon className="h-4 w-4" /> Validate
                </Button>
                {validationResult?.isValid && (
                    <Button 
                        size="md" 
                        color="green" 
                        variant="outlined"
                        onClick={formatJson} 
                        className="flex items-center gap-2"
                    >
                        <WrenchScrewdriverIcon className="h-4 w-4" /> Format
                    </Button>
                )}
                <Button size="md" variant="outlined" color="red" onClick={reset}>
                    Clear
                </Button>
            </div>

            {/* Validation Result */}
            {validationResult && (
                <div className={`border rounded-lg p-4 ${
                    validationResult.isValid 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                }`}>
                    <div className="flex items-center gap-2 mb-2">
                        {validationResult.isValid ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        ) : (
                            <XCircleIcon className="h-6 w-6 text-red-600" />
                        )}
                        <Typography variant="h6" color={validationResult.isValid ? "green" : "red"}>
                            {validationResult.message}
                        </Typography>
                    </div>
                    
                    {validationResult.isValid && (
                        <div className="text-sm text-green-700 space-y-1">
                            <div>✅ JSON syntax is correct</div>
                            <div>📊 Size: {validationResult.size} characters</div>
                            {typeof validationResult.data === 'object' && validationResult.data !== null && (
                                <div>🔑 Keys: {validationResult.keys}</div>
                            )}
                            <div>🎯 Type: {Array.isArray(validationResult.data) ? 'Array' : typeof validationResult.data}</div>
                        </div>
                    )}
                </div>
            )}

            {/* Error Details */}
            {errorDetails && (
                <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                        <Typography variant="h6" color="red">
                            Validation Error
                        </Typography>
                    </div>
                    
                    <div className="text-sm text-red-700 space-y-2">
                        <div className="font-mono bg-red-100 p-2 rounded">
                            {errorDetails.message}
                        </div>
                        
                        {errorDetails.lineNumber && (
                            <div>
                                📍 <strong>Location:</strong> Line {errorDetails.lineNumber}
                                {errorDetails.columnNumber && `, Column ${errorDetails.columnNumber}`}
                            </div>
                        )}
                        
                        {errorDetails.context && (
                            <div>
                                <strong>Context:</strong>
                                <div className="font-mono bg-red-100 p-2 rounded mt-1 text-xs">
                                    {errorDetails.context}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}