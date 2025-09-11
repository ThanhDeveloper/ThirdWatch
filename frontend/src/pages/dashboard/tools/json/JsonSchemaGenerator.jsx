import React, { useState } from 'react';
import Ajv from 'ajv';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { Typography, Textarea, Button, Alert, Input } from '@material-tailwind/react';

function JsonSchemaGenerator() {
  const [json, setJson] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard!'))
      .catch(() => toast.error('Failed to copy'));
  };

  // Recursive schema generator
  const getType = value => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'number';
    return typeof value;
  };

  const generateSchema = obj => {
    const type = getType(obj);
    if (type === 'object') {
      const properties = {};
      for (const key in obj) {
        properties[key] = generateSchema(obj[key]);
      }
      return {
        type,
        properties,
      };
    } else if (type === 'array') {
      return {
        type,
        items: obj.length > 0 ? generateSchema(obj[0]) : {},
      };
    } else {
      return { type };
    }
  };

  const handleGenerate = () => {
    setError('');
    try {
      const jsonObj = JSON.parse(json);
      const schema = generateSchema(jsonObj);
      setResult(JSON.stringify(schema, null, 2));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <Typography variant="h6">JSON Schema Generator</Typography>
      <Textarea label="JSON" value={json} onChange={e => setJson(e.target.value)} rows={8} />
      <Button color="blue" onClick={handleGenerate}>Generate Schema</Button>
      {result && (
        <div className="space-y-2">
          <Typography variant="small" color="blue-gray" className="font-medium">Generated Schema:</Typography>
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

export default JsonSchemaGenerator;
