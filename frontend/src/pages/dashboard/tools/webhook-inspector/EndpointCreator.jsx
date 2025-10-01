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
  Select,
  Option,
} from '@material-tailwind/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import CopyButton from '@/components/common/CopyButton';

const EndpointCreator = ({ open, onClose, onCreateEndpoint }) => {
  const [providerName, setProviderName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!providerName.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onCreateEndpoint(providerName.trim());
      onClose();
      // Reset state
      setProviderName('');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setProviderName('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} handler={handleClose} size="lg">
      <DialogHeader className="flex items-center justify-between">
        <Typography variant="h5" color="blue-gray">
          Create New Webhook Endpoint
        </Typography>
      </DialogHeader>
      
      <DialogBody className="space-y-6">
        <Typography color="gray" className="mb-4">
          Create a new webhook endpoint to receive and inspect HTTP requests in real-time.
        </Typography>

        {/* Provider Name Input */}
        <div>
          <Typography variant="small" color="gray" className="mb-2 font-medium">
            Provider Name *
          </Typography>
          <Input
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            placeholder="e.g., GitHub, Stripe, PayPal, Discord"
            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            labelProps={{
              className: "before:content-none after:content-none",
            }}
          />
          <Typography variant="small" color="gray" className="mt-1">
            Enter the name of the service that will send webhooks to this endpoint
          </Typography>
        </div>

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
              <Typography variant="small" color="gray">Request history tracking</Typography>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-green-600" />
              <Typography variant="small" color="gray">JSON payload analysis</Typography>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div>
          <Typography variant="small" className="font-semibold text-gray-800 mb-2">
            Popular Use Cases:
          </Typography>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Chip value="GitHub" size="sm" color="blue" className="text-xs" />
              <Typography variant="small" color="gray">
                Repository events, pull requests, issues
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <Chip value="Stripe" size="sm" color="green" className="text-xs" />
              <Typography variant="small" color="gray">
                Payment confirmations, subscription updates
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <Chip value="Discord" size="sm" color="purple" className="text-xs" />
              <Typography variant="small" color="gray">
                Bot interactions, server events
              </Typography>
            </div>
          </div>
        </div>
      </DialogBody>
      
      <DialogFooter className="flex items-center gap-2">
        <Button variant="outlined" color="gray" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="filled"
          color="blue"
          onClick={handleCreate}
          disabled={!providerName.trim() || loading}
          loading={loading}
        >
          Create Endpoint
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EndpointCreator;