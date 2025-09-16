import React, { useMemo, useRef, useState } from 'react';
import {
    Card,
    CardBody,
    Typography,
    Button,
    Input,
    Textarea,
    Chip,
} from '@material-tailwind/react';
import * as Tabs from '@radix-ui/react-tabs';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { CopyButton, DownloadButton } from '@/components/common';

export function Base64Tools() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef(null);

    const canCopy = useMemo(() => Boolean(output), [output]);

    // We've replaced the handleCopy and handleDownload functions with our reusable components

    const onEncode = () => {
        try {
            const encoded = btoa(unescape(encodeURIComponent(input)));
            setOutput(encoded);
        } catch (e) {
            toast.error('Encode error: ensure input is valid text');
        }
    };

    const onDecode = () => {
        try {
            const decoded = decodeURIComponent(escape(atob(input)));
            setOutput(decoded);
        } catch (e) {
            toast.error('Decode error: invalid Base64');
        }
    };

    const onFilePick = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name.replace(/\.[^.]+$/, ''));
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            if (typeof result === 'string') {
                setInput(result);
            }
        };
        reader.readAsText(file);
    };

    const reset = () => {
        setInput('');
        setOutput('');
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="mt-4 sm:mt-8 lg:mt-12">
            <div className="mb-6 sm:mb-8">
                <Typography variant="h3" color="blue-gray" className="mb-2 text-2xl sm:text-3xl lg:text-4xl">
                    Base64 Decoder/Encoder
                </Typography>
                <Typography variant="paragraph" color="blue-gray" className="text-base sm:text-lg font-normal">
                    Encode and decode Base64 strings or files. Mobile-first, fast, and convenient.
                </Typography>
            </div>

            <Card className="border border-blue-gray-100 shadow-sm">
                <CardBody className="p-0">
                    <Tabs.Root defaultValue="decode" className="w-full">
                        <Tabs.List className="flex w-full bg-blue-gray-50/50 p-1">
                            <Tabs.Trigger
                                value="decode"
                                className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-gray-600
                                    data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700
                                    data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                            >
                                Decode
                            </Tabs.Trigger>
                            <Tabs.Trigger
                                value="encode"
                                className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-gray-600
                                    data-[state=active]:bg-green-50 data-[state=active]:text-blue-gray-900
                                    data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                            >
                                Encode
                            </Tabs.Trigger>
                        </Tabs.List>

                        {/* Shared Panel Layout */}
                        <Tabs.Content value="decode" className="p-4 sm:p-6">
                            <Panel
                                mode="decode"
                                input={input}
                                setInput={setInput}
                                output={output}
                                onAction={onDecode}
                                onFilePick={onFilePick}
                                fileInputRef={fileInputRef}
                                fileName={fileName}
                                onReset={reset}
                                canCopy={canCopy}
                            />
                        </Tabs.Content>

                        <Tabs.Content value="encode" className="p-4 sm:p-6" color='green'>
                            <Panel
                                mode="encode"
                                input={input}
                                setInput={setInput}
                                output={output}
                                onAction={onEncode}
                                onFilePick={onFilePick}
                                fileInputRef={fileInputRef}
                                fileName={fileName}
                                onReset={reset}
                                canCopy={canCopy}
                            />
                        </Tabs.Content>
                    </Tabs.Root>
                </CardBody>
            </Card>
        </div>
    );
}

function Panel({ mode, input, setInput, output, onAction, onFilePick, fileInputRef, fileName, onReset, canCopy }) {
    const title = mode === 'decode' ? 'Decode from Base64' : 'Encode to Base64';
    const cta = mode === 'decode' ? 'Decode' : 'Encode';

    return (
        <div className="space-y-6">
            {/* Input Section */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <Typography variant="small" color="blue-gray" className="font-medium">{title}</Typography>
                </div>
                <Textarea
                    rows={6}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={mode === 'decode' ? 'Paste Base64 here…' : 'Paste or type text to encode…'}
                    className="font-mono text-xs sm:text-sm w-full"
                />
            </div>
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <label className="inline-flex items-center gap-2 text-sm text-blue-gray-600 cursor-pointer">
                        <input ref={fileInputRef} type="file" accept=".txt,.json,.csv,.log,.md,.xml,.html" onChange={onFilePick} className="hidden" />
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-md bg-blue-50 text-blue-700">
                            Choose File
                        </span>
                        <span className="text-sm text-blue-gray-500 truncate max-w-[220px]">{fileName || 'No file chosen'}</span>
                    </label>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button size="md" color="blue" onClick={onAction} className="flex items-center gap-2 shadow-md">
                        <ArrowPathIcon className="h-4 w-4" /> {cta}
                    </Button>
                    <Button size="md" variant="outlined" color="red" onClick={onReset}>
                        Clear
                    </Button>
                </div>
            </div>

            {/* Output Section */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <Typography variant="small" color="blue-gray" className="font-medium">Result</Typography>
                    <div className="flex gap-2">
                        <CopyButton content={output} disabled={!canCopy} size="md" variant="outlined" className="px-3 py-1" />
                        <DownloadButton 
                            content={output} 
                            fileName={`base64-${mode === 'decode' ? 'decoded' : 'encoded'}.txt`} 
                            disabled={!canCopy} 
                            size="md"
                            variant="outlined"
                            className="px-3 py-1"
                        />
                    </div>
                </div>
                <div>
                    <Textarea 
                        rows={6} 
                        value={output} 
                        readOnly 
                        className="font-mono text-xs sm:text-sm w-full" 
                    />
                </div>
            </div>
        </div>
    );
}

export default Base64Tools;
