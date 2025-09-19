import React, { useState } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Button,
  Input,
  Card,
  CardBody,
  Chip,
} from '@material-tailwind/react';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import CopyButton from '@/components/common/CopyButton';

const EndpointCreator = ({ open, onClose, onCreateEndpoint }) => {
  const [customId, setCustomId] = useState('');
  const [generatedId, setGeneratedId] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const generateRandomId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const handleGenerate = () => {
    const newId = generateRandomId();
    setGeneratedId(newId);
    setIsCustom(false);
    setCustomId('');
  };

  const handleCreate = () => {
    const endpointId = isCustom ? customId : generatedId;
    if (!endpointId.trim()) {
      handleGenerate();
      return;
    }
    onCreateEndpoint(endpointId.trim());
    onClose();
    // Reset state
    setCustomId('');
    setGeneratedId('');
    setIsCustom(false);
  };

  const handleCustomToggle = () => {
    setIsCustom(!isCustom);
    if (!isCustom) {
      setGeneratedId('');
    }
  };

  const currentEndpointId = isCustom ? customId : generatedId;
  const currentUrl = currentEndpointId ? `https://localhost:5173/hooks/${currentEndpointId}` : '';

  // Generate initial ID when dialog opens
  React.useEffect(() => {
    if (open && !generatedId && !isCustom) {
      handleGenerate();
    }
  }, [open, generatedId, isCustom]);

  return (
    <Dialog open={open} handler={onClose} size="lg">
      <DialogHeader className="flex items-center justify-between">
        <Typography variant="h5" color="blue-gray">
          Create New Webhook Endpoint
        </Typography>
      </DialogHeader>
      
      <DialogBody className="space-y-4">
        <Typography color="gray" className="mb-4">
          Generate a new webhook endpoint to receive and inspect HTTP requests in real-time.
        </Typography>

        {/* Endpoint ID Configuration */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <Button
              variant={!isCustom ? "filled" : "outlined"}
              color="blue"
              size="sm"
              onClick={() => !isCustom && handleGenerate()}
              disabled={isCustom}
            >
              Auto Generate
            </Button>
            <Button
              variant={isCustom ? "filled" : "outlined"}
              color="gray"
              size="sm"
              onClick={handleCustomToggle}
            >
              Custom ID
            </Button>
          </div>

          {isCustom ? (
            <div>
              <Typography variant="small" color="gray" className="mb-1">
                Custom Endpoint ID
              </Typography>
              <Input
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder="Enter custom ID (e.g., my-webhook-123)"
                className="font-mono"
              />
              <Typography variant="small" color="gray" className="mt-1">
                Only alphanumeric characters and hyphens allowed
              </Typography>
            </div>
          ) : (
            <div>
              <Typography variant="small" color="gray" className="mb-1">
                Generated Endpoint ID
              </Typography>
              <div className="flex items-center gap-2">
                <Input
                  value={generatedId}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={handleGenerate}
                  className="flex-shrink-0"
                >
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Preview URL */}
        {currentUrl && (
          <Card className="bg-gray-50">
            <CardBody className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Typography variant="small" color="gray" className="mb-1">
                    Your new webhook URL will be:
                  </Typography>
                  <Typography className="font-mono text-sm break-all">
                    {currentUrl}
                  </Typography>
                </div>
                <CopyButton
                  content={currentUrl}
                  isIcon
                  variant="text"
                  successMessage="URL copied!"
                />
              </div>
            </CardBody>
          </Card>
        )}

        {/* Features Overview */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <Typography variant="small" className="font-semibold text-blue-gray-800 mb-2">
            What you get with this endpoint:
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-green-600" />
              <Typography variant="small" color="gray">Real-time request monitoring</Typography>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-green-600" />
              <Typography variant="small" color="gray">Headers & body inspection</Typography>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-green-600" />
              <Typography variant="small" color="gray">Signature validation</Typography>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div>
          <Typography variant="small" className="font-semibold text-gray-800 mb-2">
            Usage Examples:
          </Typography>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Chip value="cURL" size="sm" color="blue" className="text-xs" />
              <Typography variant="small" className="font-mono text-gray-600">
                curl -X POST {currentUrl || 'your-webhook-url'} -d '&#123;"test": "data"&#125;'
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <Chip value="GitHub" size="sm" color="green" className="text-xs" />
              <Typography variant="small" color="gray">
                Use in GitHub repository webhook settings
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <Chip value="Stripe" size="sm" color="purple" className="text-xs" />
              <Typography variant="small" color="gray">
                Add to Stripe webhook endpoints
              </Typography>
            </div>
          </div>
        </div>
      </DialogBody>
      
      <DialogFooter className="flex items-center gap-2">
        <Button variant="outlined" color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="filled"
          color="blue"
          onClick={handleCreate}
          disabled={isCustom && !customId.trim()}
        >
          Create Endpoint
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EndpointCreator;