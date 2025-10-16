import { Button, Dialog, DialogHeader, DialogBody, DialogFooter, Typography, Alert } from "@material-tailwind/react";
import { useState } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, TrashIcon } from "@heroicons/react/24/outline";
import MockDataService from '@/services/mockDataService';

export function DataManager({ isOpen, onClose }) {
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');

  const handleExport = () => {
    try {
      const data = MockDataService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `thirdwatch-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage('Data exported successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Export failed: ' + error.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const success = MockDataService.importData(data);
        
        if (success) {
          setMessage('Data imported successfully! Please refresh the page.');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setMessage('Import failed: Invalid data format');
        }
      } catch (error) {
        setMessage('Import failed: ' + error.message);
      } finally {
        setImporting(false);
        setTimeout(() => setMessage(''), 3000);
      }
    };
    
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure? This will delete all your sites, preferences, and history. This action cannot be undone.')) {
      MockDataService.clearAllData();
      setMessage('All data cleared successfully! Refreshing page...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <Dialog open={isOpen} handler={onClose} size="md">
      <DialogHeader>
        <Typography variant="h5" className="font-bold">
          Data Management
        </Typography>
      </DialogHeader>
      
      <DialogBody className="space-y-4">
        {message && (
          <Alert color={message.includes('failed') ? 'red' : 'green'} className="mb-4">
            {message}
          </Alert>
        )}

        <div className="space-y-6">
          {/* Export Data */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ArrowDownTrayIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <Typography variant="h6" className="font-semibold mb-2">
                  Export Data
                </Typography>
                <Typography variant="small" className="text-gray-600 mb-3">
                  Download all your sites, preferences, and health check history as a backup file.
                </Typography>
                <Button
                  onClick={handleExport}
                  color="blue"
                  variant="outlined"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  <span>Export Backup</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Import Data */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ArrowUpTrayIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <Typography variant="h6" className="font-semibold mb-2">
                  Import Data
                </Typography>
                <Typography variant="small" className="text-gray-600 mb-3">
                  Restore your data from a previously exported backup file. This will overwrite current data.
                </Typography>
                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                      disabled={importing}
                    />
                    <Button
                      as="span"
                      color="green"
                      variant="outlined"
                      size="sm"
                      disabled={importing}
                      className="flex items-center space-x-2"
                    >
                      <ArrowUpTrayIcon className="h-4 w-4" />
                      <span>{importing ? 'Importing...' : 'Import Backup'}</span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Clear Data */}
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-start space-x-3">
              <TrashIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <Typography variant="h6" className="font-semibold mb-2 text-red-900">
                  Clear All Data
                </Typography>
                <Typography variant="small" className="text-red-700 mb-3">
                  Permanently delete all sites, preferences, and history. This action cannot be undone.
                </Typography>
                <Button
                  onClick={handleClearData}
                  color="red"
                  variant="outlined"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Clear All Data</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogBody>
      
      <DialogFooter>
        <Button variant="text" color="blue-gray" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default DataManager;