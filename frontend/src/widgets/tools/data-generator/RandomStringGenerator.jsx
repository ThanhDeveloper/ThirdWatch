import React, { useState } from 'react';
import { Typography, Button, Input, Switch } from '@material-tailwind/react';
import { ClipboardDocumentIcon, ArrowPathIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

export default function RandomStringGenerator() {
    const [randomStringValue, setRandomStringValue] = useState('');
    const [generatedStrings, setGeneratedStrings] = useState([]);
    const [stringLength, setStringLength] = useState(10);
    const [stringOptions, setStringOptions] = useState({
        uppercase: false,
        lowercase: true,
        includeNumbers: true,
        includeSpecial: false,
        customChars: '',
        count: 1,
    });

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard!')).catch(() => toast.error('Failed to copy'));
    };

    const copyAllToClipboard = (items) => copyToClipboard(items.join('\n'));

    const clearGenerated = () => {
        setRandomStringValue('');
        setGeneratedStrings([]);
    };

    const generateRandomString = () => {
        let chars = '';
        if (stringOptions.customChars) {
            chars = stringOptions.customChars;
        } else {
            if (stringOptions.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (stringOptions.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
            if (stringOptions.includeNumbers) chars += '0123456789';
            if (stringOptions.includeSpecial) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
            if (!chars) chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        }

        const strings = [];
        for (let i = 0; i < stringOptions.count; i++) {
            let result = '';
            for (let j = 0; j < stringLength; j++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            strings.push(result);
        }
        if (stringOptions.count === 1) setRandomStringValue(strings[0]); else setGeneratedStrings(strings);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <Typography variant="h5" color="blue-gray" className="mb-2 sm:mb-4 text-lg sm:text-xl">Random String Generator</Typography>
                <Typography variant="paragraph" color="blue-gray" className="mb-4 sm:mb-6 text-sm sm:text-base">Generate random strings with customizable length and character types.</Typography>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">String Length</Typography>
                    <Input type="number" value={stringLength} onChange={(e) => setStringLength(Math.max(1, parseInt(e.target.value) || 10))} min="1" max="1000" size="sm" />
                </div>
                <div>
                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">Count</Typography>
                    <Input type="number" value={stringOptions.count} onChange={(e) => setStringOptions((p) => ({ ...p, count: Math.max(1, parseInt(e.target.value) || 1) }))} min="1" max="100" size="sm" />
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">Custom Characters</Typography>
                    <Input value={stringOptions.customChars} onChange={(e) => setStringOptions((p) => ({ ...p, customChars: e.target.value }))} placeholder="Optional custom set" size="sm" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                    <Switch checked={stringOptions.uppercase} onChange={(e) => setStringOptions((p) => ({ ...p, uppercase: e.target.checked }))} color="blue" />
                    <Typography variant="small" color="blue-gray" className="font-medium">Uppercase (A-Z)</Typography>
                </div>
                <div className="flex items-center gap-3">
                    <Switch checked={stringOptions.lowercase} onChange={(e) => setStringOptions((p) => ({ ...p, lowercase: e.target.checked }))} color="blue" />
                    <Typography variant="small" color="blue-gray" className="font-medium">Lowercase (a-z)</Typography>
                </div>
                <div className="flex items-center gap-3">
                    <Switch checked={stringOptions.includeNumbers} onChange={(e) => setStringOptions((p) => ({ ...p, includeNumbers: e.target.checked }))} color="blue" />
                    <Typography variant="small" color="blue-gray" className="font-medium">Numbers (0-9)</Typography>
                </div>
                <div className="flex items-center gap-3">
                    <Switch checked={stringOptions.includeSpecial} onChange={(e) => setStringOptions((p) => ({ ...p, includeSpecial: e.target.checked }))} color="blue" />
                    <Typography variant="small" color="blue-gray" className="font-medium">Special Chars</Typography>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button onClick={generateRandomString} className="flex items-center justify-center gap-2" color="blue" size="sm">
                    <ArrowPathIcon className="h-4 w-4" /> Generate {stringOptions.count > 1 ? `${stringOptions.count} Strings` : 'String'}
                </Button>
                {(randomStringValue || generatedStrings.length > 0) && (
                    <Button onClick={clearGenerated} variant="outlined" color="red" size="sm" className="flex items-center justify-center gap-2">
                        <TrashIcon className="h-4 w-4" /> Clear
                    </Button>
                )}
            </div>

            {randomStringValue && stringOptions.count === 1 && (
                <div className="space-y-2">
                    <Typography variant="small" color="blue-gray" className="font-medium">Generated String:</Typography>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input value={randomStringValue} readOnly className="font-mono text-xs sm:text-sm" containerProps={{ className: 'min-w-0 flex-1' }} />
                        <Button size="sm" variant="outlined" onClick={() => copyToClipboard(randomStringValue)} className="flex items-center justify-center gap-1">
                            <ClipboardDocumentIcon className="h-4 w-4" /> Copy
                        </Button>
                    </div>
                </div>
            )}

            {generatedStrings.length > 0 && stringOptions.count > 1 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Typography variant="small" color="blue-gray" className="font-medium">Generated Strings ({generatedStrings.length}):</Typography>
                        <Button size="sm" variant="outlined" onClick={() => copyAllToClipboard(generatedStrings)} className="flex items-center gap-1">
                            <DocumentDuplicateIcon className="h-4 w-4" /> Copy All
                        </Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {generatedStrings.map((str, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-2 p-2 bg-gray-50 rounded-lg">
                                <Input value={str} readOnly className="font-mono text-xs sm:text-sm" containerProps={{ className: 'min-w-0 flex-1' }} />
                                <Button size="sm" variant="text" onClick={() => copyToClipboard(str)} className="flex items-center justify-center gap-1">
                                    <ClipboardDocumentIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


