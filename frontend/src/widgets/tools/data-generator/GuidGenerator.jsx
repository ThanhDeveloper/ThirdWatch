import React, { useState } from 'react';
import { Typography, Button, Input, Switch } from '@material-tailwind/react';
import { ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { CopyButton } from '@/components/common';

export default function GuidGenerator() {
    const [guidValue, setGuidValue] = useState('');
    const [generatedGuids, setGeneratedGuids] = useState([]);
    const [guidOptions, setGuidOptions] = useState({ uppercase: false, includeHyphens: true, count: 1 });

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard!')).catch(() => toast.error('Failed to copy'));
    };

    const copyAllToClipboard = (items) => copyToClipboard(items.join('\n'));

    const clearGenerated = () => {
        setGuidValue('');
        setGeneratedGuids([]);
    };

    const generateGuid = () => {
        const guids = [];
        for (let i = 0; i < guidOptions.count; i++) {
            let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
            if (guidOptions.uppercase) guid = guid.toUpperCase();
            if (!guidOptions.includeHyphens) guid = guid.replace(/-/g, '');
            guids.push(guid);
        }
        if (guidOptions.count === 1) setGuidValue(guids[0]); else setGeneratedGuids(guids);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <Typography variant="h5" color="blue-gray" className="mb-2 sm:mb-4 text-lg sm:text-xl">GUID Generator</Typography>
                <Typography variant="paragraph" color="blue-gray" className="mb-4 sm:mb-6 text-sm sm:text-base">Generate globally unique identifiers (GUID/UUID) with customizable options.</Typography>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                    <Switch checked={guidOptions.uppercase} onChange={(e) => setGuidOptions((p) => ({ ...p, uppercase: e.target.checked }))} color="blue" />
                    <Typography variant="small" color="blue-gray" className="font-medium">Uppercase</Typography>
                </div>
                <div className="flex items-center gap-3">
                    <Switch checked={guidOptions.includeHyphens} onChange={(e) => setGuidOptions((p) => ({ ...p, includeHyphens: e.target.checked }))} color="blue" />
                    <Typography variant="small" color="blue-gray" className="font-medium">Include Hyphens</Typography>
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">Count</Typography>
                    <Input type="number" value={guidOptions.count} onChange={(e) => setGuidOptions((p) => ({ ...p, count: Math.max(1, parseInt(e.target.value) || 1) }))} min="1" max="100" size="md" />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button onClick={generateGuid} className="flex items-center justify-center gap-2" color="blue" size="md">
                    <ArrowPathIcon className="h-4 w-4" /> Generate {guidOptions.count > 1 ? `${guidOptions.count} GUIDs` : 'GUID'}
                </Button>
                {(guidValue || generatedGuids.length > 0) && (
                    <Button onClick={clearGenerated} variant="outlined" color="red" size="md" className="flex items-center justify-center gap-2">
                        <TrashIcon className="h-4 w-4" /> Clear
                    </Button>
                )}
            </div>

            {guidValue && guidOptions.count === 1 && (
                <div className="space-y-2">
                    <Typography variant="small" color="blue-gray" className="font-medium">Generated GUID:</Typography>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input value={guidValue} readOnly className="font-mono text-xs sm:text-sm" containerProps={{ className: 'min-w-0 flex-1' }} />
                        <CopyButton content={guidValue} />
                    </div>
                </div>
            )}

            {generatedGuids.length > 0 && guidOptions.count > 1 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Typography variant="small" color="blue-gray" className="font-medium">Generated GUIDs ({generatedGuids.length}):</Typography>
                        <CopyButton content={generatedGuids} isMultiple />
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {generatedGuids.map((guid, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-2 p-2 bg-gray-50 rounded-lg">
                                <Input value={guid} readOnly className="font-mono text-xs sm:text-sm" containerProps={{ className: 'min-w-0 flex-1' }} />
                                <CopyButton content={guid} variant="text" isIcon />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


