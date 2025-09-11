import React, { useState } from 'react';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import Ajv from 'ajv';
import { Typography, Textarea, Button, Alert, Input } from '@material-tailwind/react';

function JsonValidator() {
  const [json, setJson] = useState('');
  const [schema, setSchema] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard!'))
      .catch(() => toast.error('Failed to copy'));
  };

  const handleValidate = () => {
    setError('');
    setResult(null);
    try {
      let jsonData;
      let jsonSchema;
      try {
        jsonData = JSON.parse(json);
      } catch (e) {
        setError('Invalid JSON: ' + e.message);
        return;
      }
      try {
        jsonSchema = JSON.parse(schema);
      } catch (e) {
        setError('Invalid Schema: ' + e.message);
        return;
      }
      const ajv = new Ajv();
      const validate = ajv.compile(jsonSchema);
      const valid = validate(jsonData);
      setResult(valid ? 'Valid JSON!' : `Invalid: ${JSON.stringify(validate.errors, null, 2)}`);
    } catch (e) {
      setError('Validation error: ' + e.message);
    }
  };

  return (
    <div className="space-y-4">
      <Typography variant="h6">JSON Validator</Typography>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Textarea label="JSON" value={json} onChange={e => setJson(e.target.value)} rows={12} />
        </div>
        <div className="flex-1">
          <Textarea label="JSON Schema" value={schema} onChange={e => setSchema(e.target.value)} rows={12} />
        </div>
      </div>
      <Button color="blue" onClick={handleValidate}>Validate</Button>
      {result && (
        <div className="space-y-2">
          <Typography variant="small" color="blue-gray" className="font-medium">Validation Result:</Typography>
          <Alert color={result.startsWith('Valid') ? 'green' : 'red'} className="mb-2">{result}</Alert>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={result}
              readOnly
              className="font-mono text-xs sm:text-sm"
              containerProps={{ className: 'min-w-0 flex-1' }}
              label="Result Details"
            />
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

export default JsonValidator;
