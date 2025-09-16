import React, { useState, useEffect } from 'react';
import { Typography, Button, Textarea, Switch } from '@material-tailwind/react';
import { 
    MagnifyingGlassIcon,
    EyeIcon,
    DocumentTextIcon,
    ArrowPathIcon,
    ChevronDownIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

export default function JsonDiffPanel() {
    const [inputA, setInputA] = useState('');
    const [inputB, setInputB] = useState('');
    const [errorA, setErrorA] = useState('');
    const [errorB, setErrorB] = useState('');
    const [diffs, setDiffs] = useState([]);
    const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'raw'
    const [compareOptions, setCompareOptions] = useState({
        ignoreCase: false,
        ignoreKeyOrder: false
    });

    // Deep comparison function with options
    const compareJson = (objA, objB, options = {}) => {
        const differences = [];

        const compare = (a, b, path = []) => {
            // Handle null/undefined
            if (a === null && b === null) return;
            if (a === null || b === null) {
                differences.push({
                    path: path.join('.'),
                    type: a === null ? 'removed' : 'added',
                    valueA: a,
                    valueB: b
                });
                return;
            }

            // Handle different types
            if (typeof a !== typeof b) {
                differences.push({
                    path: path.join('.'),
                    type: 'changed',
                    valueA: a,
                    valueB: b
                });
                return;
            }

            // Handle primitives
            if (typeof a !== 'object') {
                let equal = a === b;
                if (options.ignoreCase && typeof a === 'string' && typeof b === 'string') {
                    equal = a.toLowerCase() === b.toLowerCase();
                }
                if (!equal) {
                    differences.push({
                        path: path.join('.'),
                        type: 'changed',
                        valueA: a,
                        valueB: b
                    });
                }
                return;
            }

            // Handle arrays
            if (Array.isArray(a) && Array.isArray(b)) {
                const maxLength = Math.max(a.length, b.length);
                for (let i = 0; i < maxLength; i++) {
                    if (i >= a.length) {
                        differences.push({
                            path: [...path, i].join('.'),
                            type: 'added',
                            valueA: undefined,
                            valueB: b[i]
                        });
                    } else if (i >= b.length) {
                        differences.push({
                            path: [...path, i].join('.'),
                            type: 'removed',
                            valueA: a[i],
                            valueB: undefined
                        });
                    } else {
                        compare(a[i], b[i], [...path, i]);
                    }
                }
                return;
            }

            // Handle objects
            if (typeof a === 'object' && typeof b === 'object') {
                const keysA = Object.keys(a);
                const keysB = Object.keys(b);
                const allKeys = [...new Set([...keysA, ...keysB])];

                for (const key of allKeys) {
                    if (!(key in a)) {
                        differences.push({
                            path: [...path, key].join('.'),
                            type: 'added',
                            valueA: undefined,
                            valueB: b[key]
                        });
                    } else if (!(key in b)) {
                        differences.push({
                            path: [...path, key].join('.'),
                            type: 'removed',
                            valueA: a[key],
                            valueB: undefined
                        });
                    } else {
                        compare(a[key], b[key], [...path, key]);
                    }
                }
            }
        };

        compare(objA, objB);
        return differences;
    };

    const performComparison = () => {
        setErrorA('');
        setErrorB('');
        setDiffs([]);

        if (!inputA.trim() || !inputB.trim()) {
            toast.error('Please provide both JSON inputs');
            return;
        }

        let jsonA, jsonB;

        try {
            jsonA = JSON.parse(inputA);
        } catch (e) {
            setErrorA(e.message);
            toast.error('JSON A error: ' + e.message);
            return;
        }

        try {
            jsonB = JSON.parse(inputB);
        } catch (e) {
            setErrorB(e.message);
            toast.error('JSON B error: ' + e.message);
            return;
        }

        const differences = compareJson(jsonA, jsonB, compareOptions);
        setDiffs(differences);
        
        if (differences.length === 0) {
            toast.success('JSONs are identical!');
        } else {
            toast.info(`Found ${differences.length} difference(s)`);
        }
    };

    const reset = () => {
        setInputA('');
        setInputB('');
        setErrorA('');
        setErrorB('');
        setDiffs([]);
    };

    // Validate JSON on input change
    useEffect(() => {
        if (inputA.trim()) {
            try {
                JSON.parse(inputA);
                setErrorA('');
            } catch (e) {
                setErrorA(e.message);
            }
        } else {
            setErrorA('');
        }
    }, [inputA]);

    useEffect(() => {
        if (inputB.trim()) {
            try {
                JSON.parse(inputB);
                setErrorB('');
            } catch (e) {
                setErrorB(e.message);
            }
        } else {
            setErrorB('');
        }
    }, [inputB]);

    return (
        <div className="space-y-6">
            {/* Input Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* JSON A */}
                <div>
                    <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                        JSON A (Original)
                    </Typography>
                    <div className="relative">
                        <Textarea
                            rows={8}
                            value={inputA}
                            onChange={(e) => setInputA(e.target.value)}
                            placeholder="Paste first JSON here..."
                            className={`font-mono text-xs sm:text-sm w-full ${errorA ? 'border-red-300' : ''}`}
                        />
                    </div>
                    {errorA && (
                        <div className="mt-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                            Error: {errorA}
                        </div>
                    )}
                </div>

                {/* JSON B */}
                <div>
                    <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                        JSON B (Compare with)
                    </Typography>
                    <div className="relative">
                        <Textarea
                            rows={8}
                            value={inputB}
                            onChange={(e) => setInputB(e.target.value)}
                            placeholder="Paste second JSON here..."
                            className={`font-mono text-xs sm:text-sm w-full ${errorB ? 'border-red-300' : ''}`}
                        />
                    </div>
                    {errorB && (
                        <div className="mt-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                            Error: {errorB}
                        </div>
                    )}
                </div>
            </div>

            {/* Options */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                    <Switch 
                        checked={compareOptions.ignoreCase}
                        onChange={(checked) => setCompareOptions(prev => ({...prev, ignoreCase: checked}))}
                    />
                    <Typography variant="small" color="blue-gray">
                        Ignore Case
                    </Typography>
                </div>
                <div className="flex items-center gap-2">
                    <Switch 
                        checked={compareOptions.ignoreKeyOrder}
                        onChange={(checked) => setCompareOptions(prev => ({...prev, ignoreKeyOrder: checked}))}
                        disabled
                    />
                    <Typography variant="small" color="gray" className="opacity-60">
                        Ignore Key Order (Coming Soon)
                    </Typography>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2">
                <Button 
                    size="md" 
                    color="blue" 
                    onClick={performComparison} 
                    className="flex items-center gap-2 shadow-md"
                    disabled={(!!errorA && inputA.trim()) || (!!errorB && inputB.trim())}
                >
                    <MagnifyingGlassIcon className="h-4 w-4" /> Compare JSONs
                </Button>
                <Button size="md" variant="outlined" color="red" onClick={reset}>
                    Clear
                </Button>
            </div>

            {/* Results Section */}
            {diffs.length >= 0 && (inputA.trim() && inputB.trim()) && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Typography variant="small" color="blue-gray" className="font-medium">
                                Comparison Results ({diffs.length} differences)
                            </Typography>
                            <div className="flex border rounded-md overflow-hidden">
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
                                <button
                                    onClick={() => setViewMode('raw')}
                                    className={`px-2 py-1 text-xs font-medium ${
                                        viewMode === 'raw' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <DocumentTextIcon className="h-3 w-3 inline mr-1" />
                                    Raw
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border rounded-md">
                        {viewMode === 'tree' ? (
                            <div className="p-4 bg-gray-50 max-h-96 overflow-auto">
                                <DiffTreeView diffs={diffs} />
                            </div>
                        ) : (
                            <Textarea 
                                rows={12} 
                                value={JSON.stringify(diffs, null, 2)} 
                                readOnly 
                                className="font-mono text-xs sm:text-sm w-full border-0 focus:ring-0" 
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Diff Tree View Component
function DiffTreeView({ diffs }) {
    if (diffs.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">No differences found - JSONs are identical!</span>
                </div>
            </div>
        );
    }

    const groupedDiffs = diffs.reduce((acc, diff) => {
        const pathParts = diff.path.split('.');
        const rootPath = pathParts[0] || 'root';
        if (!acc[rootPath]) acc[rootPath] = [];
        acc[rootPath].push(diff);
        return acc;
    }, {});

    return (
        <div className="space-y-4">
            {Object.entries(groupedDiffs).map(([rootPath, pathDiffs]) => (
                <DiffGroup key={rootPath} rootPath={rootPath} diffs={pathDiffs} />
            ))}
        </div>
    );
}

function DiffGroup({ rootPath, diffs }) {
    const [expanded, setExpanded] = useState(true);

    const getTypeColor = (type) => {
        switch (type) {
            case 'added': return 'bg-green-50 text-green-700 border-green-200';
            case 'removed': return 'bg-red-50 text-red-700 border-red-200';
            case 'changed': return 'bg-yellow-100 text-yellow border-yellow-300';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'added': return '+';
            case 'removed': return '−';
            case 'changed': return '~';
            default: return '?';
        }
    };

    return (
        <div className="border border-gray-200 rounded-lg">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 rounded-t-lg text-left"
            >
                {expanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                <span className="font-medium text-gray-700">
                    {rootPath === 'root' ? 'Root Level' : rootPath} ({diffs.length} change{diffs.length !== 1 ? 's' : ''})
                </span>
            </button>
            
            {expanded && (
                <div className="p-3 space-y-2">
                    {diffs.map((diff, index) => (
                        <div key={index} className={`border rounded-md p-3 ${getTypeColor(diff.type)}`}>
                            <div className="flex items-start gap-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-current bg-opacity-20 text-xs font-bold">
                                    {getTypeIcon(diff.type)}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-xs uppercase tracking-wide">
                                            {diff.type}
                                        </span>
                                        <span className="text-sm font-mono text-gray-600">
                                            {diff.path || 'root'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-xs">
                                        {diff.type !== 'added' && (
                                            <div>
                                                <span className="text-gray-500 block mb-1">Original (A):</span>
                                                <code className="block p-2 bg-white bg-opacity-50 rounded font-mono">
                                                    {JSON.stringify(diff.valueA, null, 2)}
                                                </code>
                                            </div>
                                        )}
                                        {diff.type !== 'removed' && (
                                            <div>
                                                <span className="text-gray-500 block mb-1">Compare (B):</span>
                                                <code className="block p-2 bg-white bg-opacity-50 rounded font-mono">
                                                    {JSON.stringify(diff.valueB, null, 2)}
                                                </code>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}