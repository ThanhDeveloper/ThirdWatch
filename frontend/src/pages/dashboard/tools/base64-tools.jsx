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
import { ArrowDownTrayIcon, ClipboardDocumentIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

export function Base64Tools() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef(null);

    const canCopy = useMemo(() => Boolean(output), [output]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(output);
            toast.success('Copied to clipboard');
        } catch (_) {
            toast.error('Copy failed');
        }
    };

    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName ? `${fileName}.txt` : 'result.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

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
                            <Tabs.Trigger value="decode" className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-gray-600 data-[state=active]:bg-white data-[state=active]:text-blue-gray-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200">Decode</Tabs.Trigger>
                            <Tabs.Trigger value="encode" className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-gray-600 data-[state=active]:bg-white data-[state=active]:text-blue-gray-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200">Encode</Tabs.Trigger>
                        </Tabs.List>

                        {/* Shared Panel Layout */}
                        <Tabs.Content value="decode" className="p-4 sm:p-6">
                            <Panel
                                mode="decode"
                                input={input}
                                setInput={setInput}
                                output={output}
                                onAction={onDecode}
                                onCopy={handleCopy}
                                onDownload={handleDownload}
                                onFilePick={onFilePick}
                                fileInputRef={fileInputRef}
                                onReset={reset}
                                canCopy={canCopy}
                            />
                        </Tabs.Content>

                        <Tabs.Content value="encode" className="p-4 sm:p-6">
                            <Panel
                                mode="encode"
                                input={input}
                                setInput={setInput}
                                output={output}
                                onAction={onEncode}
                                onCopy={handleCopy}
                                onDownload={handleDownload}
                                onFilePick={onFilePick}
                                fileInputRef={fileInputRef}
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

function Panel({ mode, input, setInput, output, onAction, onCopy, onDownload, onFilePick, fileInputRef, onReset, canCopy }) {
    const title = mode === 'decode' ? 'Decode from Base64' : 'Encode to Base64';
    const cta = mode === 'decode' ? 'Decode' : 'Encode';

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <Typography variant="small" color="blue-gray" className="font-medium">{title}</Typography>
                    <Textarea
                        rows={10}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={mode === 'decode' ? 'Paste Base64 here…' : 'Paste or type text to encode…'}
                        className="font-mono text-xs sm:text-sm"
                    />
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <input ref={fileInputRef} type="file" accept=".txt,.json,.csv,.log,.md,.xml,.html" onChange={onFilePick} className="block w-full text-sm" />
                        <div className="flex gap-2">
                            <Button size="sm" color="blue" onClick={onAction} className="flex items-center gap-2">
                                <ArrowPathIcon className="h-4 w-4" /> {cta}
                            </Button>
                            <Button size="sm" variant="outlined" color="red" onClick={onReset}>Clear</Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Typography variant="small" color="blue-gray" className="font-medium">Result</Typography>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outlined" disabled={!canCopy} onClick={onCopy} className="flex items-center gap-2">
                                <ClipboardDocumentIcon className="h-4 w-4" /> Copy
                            </Button>
                            <Button size="sm" variant="outlined" disabled={!canCopy} onClick={onDownload} className="flex items-center gap-2">
                                <ArrowDownTrayIcon className="h-4 w-4" /> Download
                            </Button>
                        </div>
                    </div>
                    <Textarea rows={10} value={output} readOnly className="font-mono text-xs sm:text-sm" />
                    {!output && (
                        <Chip value="No result yet" variant="ghost" color="blue-gray" className="w-max" />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Base64Tools;
