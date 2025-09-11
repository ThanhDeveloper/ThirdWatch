import React, { useState } from 'react';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { Typography, Textarea, Button, Alert, Input } from '@material-tailwind/react';

function JsonMinifier() {
  const [json, setJson] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard!'))
      .catch(() => toast.error('Failed to copy'));
  };

  const handleMinify = () => {
    setError('');
    setResult('');
    try {
      const minified = JSON.stringify(JSON.parse(json));
      setResult(minified);
    } catch (e) {
      setError('Invalid JSON: ' + e.message);
    }
  };

  return (
    <div className="space-y-4">
      <Typography variant="h6">JSON Minifier</Typography>
      <Textarea label="JSON" value={json} onChange={e => setJson(e.target.value)} rows={8} />
      <Button color="blue" onClick={handleMinify}>Minify</Button>
      {result && (
        <div className="space-y-2">
          <Typography variant="small" color="blue-gray" className="font-medium">Minified JSON:</Typography>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input value={result} readOnly className="font-mono text-xs sm:text-sm" containerProps={{ className: 'min-w-0 flex-1' }} />
            <Button
              size="sm"
              variant="text"
              onClick={() => copyToClipboard(result)}
              className="flex items-center justify-center gap-1"
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {error && <Alert color="red">{error}</Alert>}
    </div>
  );
}

export default JsonMinifier;
