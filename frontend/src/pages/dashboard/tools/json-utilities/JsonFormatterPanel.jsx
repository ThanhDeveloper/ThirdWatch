import React, { useState, useRef, useEffect } from 'react';
import { Typography, Button, Textarea } from '@material-tailwind/react';
import { 
    CodeBracketIcon, 
    EyeIcon, 
    DocumentTextIcon,
    ChevronDownIcon,
    ChevronRightIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { CopyButton, DownloadButton } from '@/components/common';

export default function JsonFormatterPanel() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [viewMode, setViewMode] = useState('formatted'); // 'formatted' | 'tree'
    const [parsedJson, setParsedJson] = useState(null);
    const [inputError, setInputError] = useState('');

    const formatJson = () => {
        if (!input.trim()) {
            toast.error('Please enter JSON to format');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const formatted = JSON.stringify(parsed, null, 2);
            setOutput(formatted);
            setParsedJson(parsed);
            setInputError('');
            toast.success('JSON formatted successfully');
        } catch (e) {
            const errorMsg = e.message;
            setInputError(errorMsg);
            toast.error('Invalid JSON: ' + errorMsg);
            setOutput('');
            setParsedJson(null);
        }
    };

    const reset = () => {
        setInput('');
        setOutput('');
        setParsedJson(null);
        setInputError('');
    };

    const minifyJson = () => {
        if (!input.trim()) {
            toast.error('Please enter JSON to minify');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const minified = JSON.stringify(parsed);
            setOutput(minified);
            setParsedJson(parsed);
            setInputError('');
            toast.success('JSON minified successfully');
        } catch (e) {
            const errorMsg = e.message;
            setInputError(errorMsg);
            toast.error('Invalid JSON: ' + errorMsg);
            setOutput('');
            setParsedJson(null);
        }
    };

    // Validate JSON on input change
    useEffect(() => {
        if (input.trim()) {
            try {
                JSON.parse(input);
                setInputError('');
            } catch (e) {
                setInputError(e.message);
            }
        } else {
            setInputError('');
        }
    }, [input]);

    return (
        <div className="space-y-6">
            {/* Input Section */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <Typography variant="small" color="blue-gray" className="font-medium">
                        JSON Input
                    </Typography>
                </div>
                <div className="relative">
                    <Textarea
                        rows={10}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste your JSON here..."
                        className={`font-mono text-xs sm:text-sm w-full ${inputError ? 'border-red-300' : ''}`}
                    />
                    {/* Line numbers and syntax highlighting could go here */}
                </div>
                {inputError && (
                    <div className="mt-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                        Error: {inputError}
                    </div>
                )}
            </div>
            
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2">
                <Button 
                    size="md" 
                    color="blue" 
                    onClick={formatJson} 
                    className="flex items-center gap-2 shadow-md"
                >
                    <CodeBracketIcon className="h-4 w-4" /> Format
                </Button>
                <Button 
                    size="md" 
                    color="indigo" 
                    variant="outlined"
                    onClick={minifyJson} 
                    className="flex items-center gap-2"
                >
                    <DocumentTextIcon className="h-4 w-4" /> Minify
                </Button>
                <Button size="md" variant="outlined" color="red" onClick={reset}>
                    Clear
                </Button>
            </div>

            {/* Output Section */}
            {(output || parsedJson) && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Typography variant="small" color="blue-gray" className="font-medium">
                                Result
                            </Typography>
                            <div className="flex border rounded-md overflow-hidden">
                                <button
                                    onClick={() => setViewMode('formatted')}
                                    className={`px-2 py-1 text-xs font-medium ${
                                        viewMode === 'formatted' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <DocumentTextIcon className="h-3 w-3 inline mr-1" />
                                    Text
                                </button>
                                <button
                                    onClick={() => setViewMode('tree')}
                                    className={`px-2 py-1 text-xs font-medium ${
                                        viewMode === 'tree' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <EyeIcon className="h-3 w-3 inline mr-1" />
                                    Tree
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <CopyButton 
                                content={output} 
                                disabled={!output} 
                                size="sm" 
                                variant="outlined" 
                                className="px-3 py-1" 
                            />
                            <DownloadButton 
                                content={output} 
                                fileName="formatted.json" 
                                disabled={!output} 
                                size="sm"
                                variant="outlined"
                                className="px-3 py-1"
                                mimeType="application/json"
                            />
                        </div>
                    </div>
                    
                    <div className="border rounded-md">
                        {viewMode === 'formatted' ? (
                            <Textarea 
                                rows={12} 
                                value={output} 
                                readOnly 
                                className="font-mono text-xs sm:text-sm w-full border-0 focus:ring-0" 
                            />
                        ) : (
                            <div className="p-4 bg-gray-50 max-h-96 overflow-auto">
                                <JsonTreeView data={parsedJson} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// JSON Tree View Component
function JsonTreeView({ data, level = 0 }) {
    const [expanded, setExpanded] = useState(level < 2); // Auto expand first 2 levels

    if (data === null) return <span className="text-red-500 font-mono">null</span>;
    if (typeof data === 'string') return <span className="text-green-600 font-mono">"{data}"</span>;
    if (typeof data === 'number') return <span className="text-blue-600 font-mono">{data}</span>;
    if (typeof data === 'boolean') return <span className="text-purple-600 font-mono">{String(data)}</span>;

    if (Array.isArray(data)) {
        return (
            <div className="ml-4">
                <button 
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center text-gray-700 hover:text-gray-900 font-mono"
                >
                    {expanded ? <ChevronDownIcon className="h-3 w-3" /> : <ChevronRightIcon className="h-3 w-3" />}
                    <span className="text-gray-500">[</span>
                    {!expanded && <span className="text-gray-400 ml-1">{data.length} items</span>}
                    {!expanded && <span className="text-gray-500">]</span>}
                </button>
                {expanded && (
                    <div className="ml-4 border-l-2 border-gray-200 pl-4">
                        {data.map((item, index) => (
                            <div key={index} className="my-1">
                                <span className="text-gray-500 font-mono text-xs mr-2">{index}:</span>
                                <JsonTreeView data={item} level={level + 1} />
                            </div>
                        ))}
                        <div className="text-gray-500 font-mono">]</div>
                    </div>
                )}
            </div>
        );
    }

    if (typeof data === 'object') {
        const keys = Object.keys(data);
        return (
            <div className="ml-4">
                <button 
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center text-gray-700 hover:text-gray-900 font-mono"
                >
                    {expanded ? <ChevronDownIcon className="h-3 w-3" /> : <ChevronRightIcon className="h-3 w-3" />}
                    <span className="text-gray-500">{'{'}</span>
                    {!expanded && <span className="text-gray-400 ml-1">{keys.length} keys</span>}
                    {!expanded && <span className="text-gray-500">{'}'}</span>}
                </button>
                {expanded && (
                    <div className="ml-4 border-l-2 border-gray-200 pl-4">
                        {keys.map((key) => (
                            <div key={key} className="my-1">
                                <span className="text-orange-600 font-mono text-sm mr-2">"{key}":</span>
                                <JsonTreeView data={data[key]} level={level + 1} />
                            </div>
                        ))}
                        <div className="text-gray-500 font-mono">{'}'}</div>
                    </div>
                )}
            </div>
        );
    }

    return <span>{String(data)}</span>;
}