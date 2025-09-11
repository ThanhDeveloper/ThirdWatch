import React, { useState } from 'react';
import { Typography, Textarea, Button, Alert, Input } from '@material-tailwind/react';
import { create } from 'jsondiffpatch';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

function formatDiff(diff, obj1, obj2) {
  if (!diff) return 'No difference.';
  const result = {};
  for (const key in diff) {
    if (Array.isArray(diff[key]) && diff[key].length === 2) {
      result[key] = { from: diff[key][0], to: diff[key][1] };
    } else if (typeof diff[key] === 'object') {
      result[key] = formatDiff(diff[key], obj1[key], obj2[key]);
    }
  }
  return result;
}

function JsonDiff() {
  const [json1, setJson1] = useState('');
  const [json2, setJson2] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard!'))
      .catch(() => toast.error('Failed to copy'));
  };

  const handleDiff = () => {
    setError('');
    try {
      const obj1 = JSON.parse(json1);
      const obj2 = JSON.parse(json2);
      const diffpatch = create();
      const diff = diffpatch.diff(obj1, obj2);
      const formatted = formatDiff(diff, obj1, obj2);
      setResult(JSON.stringify(formatted, null, 2));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <Typography variant="h6">JSON Diff Tool</Typography>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Textarea label="JSON 1" value={json1} onChange={e => setJson1(e.target.value)} rows={12} />
        </div>
        <div className="flex-1">
          <Textarea label="JSON 2" value={json2} onChange={e => setJson2(e.target.value)} rows={12} />
        </div>
      </div>
      <Button color="blue" onClick={handleDiff}>Compare</Button>
      {result && (
        <div className="space-y-2">
          <Typography variant="small" color="blue-gray" className="font-medium">Diff Result:</Typography>
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

export default JsonDiff;
