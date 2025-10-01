import React, { useMemo, useState } from 'react';
import { Typography, Button, Input, Textarea, Chip } from '@material-tailwind/react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import fileTypes from '@/data/file-generator-config';
import {
    DocumentTextIcon,
    CodeBracketSquareIcon,
    TableCellsIcon,
    Bars3BottomLeftIcon,
    CodeBracketIcon,
    AdjustmentsHorizontalIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import { DownloadButton } from '@/components/common';

export default function FileGenerator() {
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [fileContents, setFileContents] = useState({});
    const [baseName, setBaseName] = useState('sample');

    const iconMap = { DocumentTextIcon, CodeBracketSquareIcon, TableCellsIcon, Bars3BottomLeftIcon, CodeBracketIcon, AdjustmentsHorizontalIcon, ShieldCheckIcon };
    const selectedConfigs = useMemo(() => fileTypes.filter((f) => selectedTypes.includes(f.id)), [selectedTypes]);

    const handleToggleType = (id) => {
        setSelectedTypes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
        const cfg = fileTypes.find((f) => f.id === id);
        if (cfg && !fileContents[id]) setFileContents((p) => ({ ...p, [id]: cfg.defaultContent }));
    };

    const handleContentChange = (id, value) => setFileContents((p) => ({ ...p, [id]: value }));

    const downloadFile = (name, content, mime) => {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadSelected = () => {
        if (selectedConfigs.length === 0) return toast.info('Select at least one file type');
        selectedConfigs.forEach((cfg, index) => {
            const content = fileContents[cfg.id] ?? cfg.defaultContent ?? '';
            const fname = `${baseName || 'file'}-${index + 1}.${cfg.extension}`;
            downloadFile(fname, content, cfg.mime);
        });
        toast.success(`Downloaded ${selectedConfigs.length} file(s)`);
    };

    const handleClearFiles = () => {
        setSelectedTypes([]);
        setFileContents({});
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <Typography variant="h5" color="blue-gray" className="mb-2 sm:mb-4 text-lg sm:text-xl">File Generator</Typography>
                <Typography variant="paragraph" color="blue-gray" className="mb-4 sm:mb-6 text-sm sm:text-base">Select file types, edit contents, and download multiple files at once.</Typography>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {fileTypes.map((cfg) => {
                    const Icon = iconMap[cfg.icon] || DocumentTextIcon;
                    const active = selectedTypes.includes(cfg.id);
                    return (
                        <button key={cfg.id} type="button" onClick={() => handleToggleType(cfg.id)} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition ${active ? 'border-blue-500 bg-blue-50' : 'border-blue-gray-100 hover:bg-blue-gray-50/50'}`}>
                            <Icon className={`h-5 w-5 text-${cfg.color}-600`} />
                            <span className="text-sm font-medium text-blue-gray-700 truncate">{cfg.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 min-w-0">
                    <Input label="Base file name" value={baseName} onChange={(e) => setBaseName(e.target.value)} size="md" />
                </div>
                <div className="flex gap-2">
                    <Button size="md" color="blue" className="flex items-center gap-2" onClick={handleDownloadSelected}>
                        <ArrowPathIcon className="h-4 w-4" /> Download Selected
                    </Button>
                    <Button size="md" variant="outlined" color="red" onClick={handleClearFiles}>Clear</Button>
                </div>
            </div>

            {selectedConfigs.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {selectedConfigs.map((cfg) => {
                        const Icon = iconMap[cfg.icon] || DocumentTextIcon;
                        return (
                            <div key={cfg.id} className="space-y-2 p-3 rounded-lg border border-blue-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon className={`h-5 w-5 text-${cfg.color}-600`} />
                                        <Typography variant="small" color="blue-gray" className="font-medium">{cfg.label}</Typography>
                                    </div>
                                    <Chip value={`.${cfg.extension}`} className="bg-blue-gray-50 text-blue-gray-700" />
                                </div>
                                <Textarea rows={8} value={fileContents[cfg.id] ?? cfg.defaultContent ?? ''} onChange={(e) => handleContentChange(cfg.id, e.target.value)} className="font-mono text-xs sm:text-sm" />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}


