import React, { useState, useEffect } from 'react';
import { Typography, Button, Textarea } from '@material-tailwind/react';
import {
    ArrowPathIcon,
    DocumentTextIcon,
    EyeIcon,
    ChevronDownIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { CopyButton, DownloadButton } from '@/components/common';

export default function JsonConverterPanel() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [viewMode, setViewMode] = useState('xml'); // 'xml' | 'preview'
    const [inputError, setInputError] = useState('');

    const convertJsonToXml = () => {
        if (!input.trim()) {
            toast.error('Please enter JSON to convert');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const xml = jsonToXml(parsed);
            setOutput(xml);
            setInputError('');
            toast.success('JSON converted to XML successfully');
        } catch (e) {
            const errorMsg = e.message;
            setInputError(errorMsg);
            toast.error('Invalid JSON: ' + errorMsg);
            setOutput('');
        }
    };

    const reset = () => {
        setInput('');
        setOutput('');
        setInputError('');
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

    // Enhanced JSON to XML converter
    const jsonToXml = (obj, rootName = 'root') => {
        const convertValue = (key, value, level = 0) => {
            const indent = '  '.repeat(level);

            if (value === null || value === undefined) {
                return `${indent}<${key} xsi:nil="true" />`;
            }

            if (typeof value === 'object' && !Array.isArray(value)) {
                const entries = Object.entries(value);
                if (entries.length === 0) {
                    return `${indent}<${key} />`;
                }

                const children = entries
                    .map(([k, v]) => convertValue(k, v, level + 1))
                    .join('\n');
                return `${indent}<${key}>\n${children}\n${indent}</${key}>`;
            }

            if (Array.isArray(value)) {
                if (value.length === 0) {
                    return `${indent}<${key} type="array" />`;
                }

                const items = value
                    .map((item, index) => convertValue(`item`, item, level + 1))
                    .join('\n');
                return `${indent}<${key} type="array">\n${items}\n${indent}</${key}>`;
            }

            // Handle primitive values with type attribute
            const type = typeof value;
            let escapedValue = String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');

            return `${indent}<${key} type="${type}">${escapedValue}</${key}>`;
        };

        const xmlContent = Object.entries(obj)
            .map(([key, value]) => convertValue(key, value, 1))
            .join('\n');

        return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName} xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n${xmlContent}\n</${rootName}>`;
    };

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
                        rows={8}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste your JSON here to convert to XML..."
                        className={`font-mono text-xs sm:text-sm w-full ${inputError ? 'border-red-300' : ''}`}
                    />
                </div>
                {inputError && (
                    <div className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                        Error: {inputError}
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className="flex justify-center gap-2">
                <Button
                    size="md"
                    color="green"
                    onClick={convertJsonToXml}
                    className="flex items-center gap-2 shadow-md"
                >
                    <ArrowPathIcon className="h-4 w-4" /> Convert to XML
                </Button>
                <Button size="md" variant="outlined" color="red" onClick={reset}>
                    Clear
                </Button>
            </div>

            {/* Output Section */}
            {output && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Typography variant="small" color="blue-gray" className="font-medium">
                                XML Output
                            </Typography>
                            <div className="flex border rounded-md overflow-hidden">
                                <button
                                    onClick={() => setViewMode('xml')}
                                    className={`px-2 py-1 text-xs font-medium ${viewMode === 'xml'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <DocumentTextIcon className="h-3 w-3 inline mr-1" />
                                    XML
                                </button>
                                <button
                                    onClick={() => setViewMode('preview')}
                                    className={`px-2 py-1 text-xs font-medium ${viewMode === 'preview'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <EyeIcon className="h-3 w-3 inline mr-1" />
                                    Preview
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
                                fileName="converted.xml"
                                disabled={!output}
                                size="sm"
                                variant="outlined"
                                className="px-3 py-1"
                                mimeType="application/xml"
                            />
                        </div>
                    </div>

                    <div className="border rounded-md">
                        {viewMode === 'xml' ? (
                            <Textarea
                                rows={12}
                                value={output}
                                readOnly
                                className="font-mono text-xs sm:text-sm w-full border-0 focus:ring-0"
                            />
                        ) : (
                            <div className="p-4 bg-gray-50 max-h-96 overflow-auto">
                                <XmlTreeView xmlContent={output} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Simple XML Tree Preview Component
function XmlTreeView({ xmlContent }) {
    const [expanded, setExpanded] = useState({});

    // Simple XML parser for preview (basic implementation)
    const parseXmlForPreview = (xmlString) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

        const renderNode = (node, level = 0) => {
            if (node.nodeType === 3) { // Text node
                const text = node.textContent.trim();
                return text ? (
                    <span className="text-gray-700 font-mono ml-2">{text}</span>
                ) : null;
            }

            if (node.nodeType === 1) { // Element node
                const nodeName = node.nodeName;
                const nodeId = `${nodeName}-${level}-${Math.random()}`;
                const hasChildren = node.children.length > 0 || node.textContent.trim();
                const isExpanded = expanded[nodeId] !== false; // Default to expanded

                return (
                    <div key={nodeId} className="ml-4">
                        <div className="flex items-start">
                            {hasChildren && (
                                <button
                                    onClick={() => setExpanded(prev => ({
                                        ...prev,
                                        [nodeId]: !isExpanded
                                    }))}
                                    className="mr-1 text-gray-500 hover:text-gray-700"
                                >
                                    {isExpanded ?
                                        <ChevronDownIcon className="h-3 w-3" /> :
                                        <ChevronRightIcon className="h-3 w-3" />
                                    }
                                </button>
                            )}
                            <span className="text-blue-600 font-mono">
                                &lt;{nodeName}
                                {Array.from(node.attributes).map(attr => (
                                    <span key={attr.name}>
                                        {' '}
                                        <span className="text-purple-600">{attr.name}</span>
                                        =
                                        <span className="text-green-600">"{attr.value}"</span>
                                    </span>
                                ))}
                                &gt;
                            </span>
                        </div>

                        {hasChildren && isExpanded && (
                            <div className="ml-4 border-l-2 border-gray-200 pl-2">
                                {Array.from(node.childNodes).map((child, index) => (
                                    <div key={index}>
                                        {renderNode(child, level + 1)}
                                    </div>
                                ))}
                                <div className="text-blue-600 font-mono">
                                    &lt;/{nodeName}&gt;
                                </div>
                            </div>
                        )}
                    </div>
                );
            }

            return null;
        };

        return renderNode(xmlDoc.documentElement);
    };

    return (
        <div className="font-mono text-sm">
            <div className="text-gray-600 mb-2">XML Preview:</div>
            {parseXmlForPreview(xmlContent)}
        </div>
    );
}