import React, { useState, useEffect } from 'react';
import { Typography, Button, Textarea } from '@material-tailwind/react';
import { 
    TableCellsIcon,
    DocumentArrowDownIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { CopyButton, DownloadButton } from '@/components/common';
import * as XLSX from 'xlsx';

export default function JsonToCsvPanel() {
    const [input, setInput] = useState('');
    const [csvOutput, setCsvOutput] = useState('');
    const [tableData, setTableData] = useState([]);
    const [tableHeaders, setTableHeaders] = useState([]);
    const [inputError, setInputError] = useState('');

    // JSON to CSV conversion function
    const jsonToCsv = (jsonArray) => {
        if (!Array.isArray(jsonArray)) {
            throw new Error('Input must be an array of objects');
        }
        
        if (jsonArray.length === 0) {
            throw new Error('Array cannot be empty');
        }
        
        // Check if all items are objects
        const nonObjectItems = jsonArray.filter(item => typeof item !== 'object' || item === null || Array.isArray(item));
        if (nonObjectItems.length > 0) {
            throw new Error('All array items must be objects (not null, arrays, or primitives)');
        }
        
        // Get all unique keys from all objects
        const allKeys = [...new Set(jsonArray.flatMap(obj => Object.keys(obj)))];
        
        // Create CSV header
        const csvRows = [allKeys.map(key => `"${key}"`).join(',')];
        
        // Create CSV rows
        jsonArray.forEach(obj => {
            const row = allKeys.map(key => {
                let value = obj[key];
                
                // Handle different data types
                if (value === null || value === undefined) {
                    return '';
                } else if (typeof value === 'object') {
                    value = JSON.stringify(value);
                } else if (typeof value === 'string') {
                    // Escape quotes and wrap in quotes
                    value = `"${value.replace(/"/g, '""')}"`;
                } else {
                    value = String(value);
                }
                
                return value;
            });
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    };

    const convertToTable = () => {
        if (!input.trim()) {
            toast.error('Please enter JSON array to convert');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const csv = jsonToCsv(parsed);
            
            // Get headers from first object
            const headers = Object.keys(parsed[0]);
            
            setCsvOutput(csv);
            setTableData(parsed);
            setTableHeaders(headers);
            setInputError('');
            toast.success(`Successfully converted ${parsed.length} records to CSV`);
        } catch (e) {
            const errorMsg = e.message;
            setInputError(errorMsg);
            toast.error('Conversion failed: ' + errorMsg);
            setCsvOutput('');
            setTableData([]);
            setTableHeaders([]);
        }
    };

    const reset = () => {
        setInput('');
        setCsvOutput('');
        setTableData([]);
        setTableHeaders([]);
        setInputError('');
    };

    const downloadExcel = () => {
        if (tableData.length === 0) {
            toast.error('No data to export');
            return;
        }

        try {
            // Create a new workbook
            const workbook = XLSX.utils.book_new();
            
            // Convert JSON data to worksheet
            const worksheet = XLSX.utils.json_to_sheet(tableData);
            
            // Add the worksheet to the workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'JSON Data');
            
            // Generate Excel file and download
            XLSX.writeFile(workbook, 'json-data.xlsx');
            
            toast.success('Excel file downloaded successfully');
        } catch (error) {
            toast.error('Failed to export Excel: ' + error.message);
        }
    };

    // Validate JSON on input change
    useEffect(() => {
        if (input.trim()) {
            try {
                const parsed = JSON.parse(input);
                if (!Array.isArray(parsed)) {
                    setInputError('Input must be an array');
                } else if (parsed.length === 0) {
                    setInputError('Array cannot be empty');
                } else if (parsed.some(item => typeof item !== 'object' || item === null || Array.isArray(item))) {
                    setInputError('All array items must be objects');
                } else {
                    setInputError('');
                }
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
                        JSON Array Input
                    </Typography>
                </div>
                <div className="relative">
                    <Textarea
                        rows={8}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder='Paste your JSON array here... Example: [{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]'
                        className={`font-mono text-xs sm:text-sm w-full ${inputError ? 'border-red-300' : ''}`}
                    />
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
                    onClick={convertToTable} 
                    className="flex items-center gap-2 shadow-md"
                    disabled={!!inputError && input.trim()}
                >
                    <TableCellsIcon className="h-4 w-4" /> Convert to CSV
                </Button>
                <Button size="md" variant="outlined" color="red" onClick={reset}>
                    Clear
                </Button>
            </div>

            {/* Download Section */}
            {csvOutput && (
                <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg">
                    <CopyButton 
                        content={csvOutput} 
                        size="sm" 
                        variant="outlined" 
                        className="px-3 py-1" 
                    />
                    <DownloadButton 
                        content={csvOutput} 
                        fileName="data.csv" 
                        size="sm"
                        variant="outlined"
                        className="px-3 py-1"
                        mimeType="text/csv"
                    />
                    <Button 
                        size="sm"
                        variant="outlined"
                        color="green"
                        className="flex items-center gap-2 px-3 py-1"
                        onClick={downloadExcel}
                    >
                        <DocumentArrowDownIcon className="h-4 w-4" />
                        Download Excel
                    </Button>
                </div>
            )}

            {/* Table Preview */}
            {tableData.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Typography variant="small" color="blue-gray" className="font-medium">
                            Table Preview ({tableData.length} records)
                        </Typography>
                    </div>
                    <div className="border rounded-md overflow-hidden">
                        <div className="overflow-auto max-h-96">
                            <table className="min-w-full text-xs sm:text-sm">
                                <thead className="bg-blue-50 sticky top-0">
                                    <tr>
                                        <th className="px-2 py-2 text-left font-medium text-blue-gray-700 border-r">#</th>
                                        {tableHeaders.map((header) => (
                                            <th key={header} className="px-3 py-2 text-left font-medium text-blue-gray-700 border-r">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {tableData.map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-2 py-2 text-gray-500 border-r bg-gray-50 font-mono">
                                                {index + 1}
                                            </td>
                                            {tableHeaders.map((header) => (
                                                <td key={header} className="px-3 py-2 border-r max-w-xs">
                                                    <div className="truncate" title={String(row[header])}>
                                                        {row[header] === null || row[header] === undefined 
                                                            ? <span className="text-gray-400 italic">null</span>
                                                            : typeof row[header] === 'object'
                                                            ? JSON.stringify(row[header])
                                                            : String(row[header])
                                                        }
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}