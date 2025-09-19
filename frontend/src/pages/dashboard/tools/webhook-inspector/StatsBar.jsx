import React from 'react';
import { Card, Typography } from '@material-tailwind/react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const StatsBar = ({ requests }) => {
  const validSignatures = requests.filter(r => r.signatureValid).length;
  const invalidSignatures = requests.filter(r => !r.signatureValid).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <DocumentTextIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <Typography variant="small" color="gray">Total Requests</Typography>
            <Typography variant="h6" color="blue-gray">{requests.length}</Typography>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <Typography variant="small" color="gray">Valid Signatures</Typography>
            <Typography variant="h6" color="blue-gray">{validSignatures}</Typography>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <Typography variant="small" color="gray">Invalid Signatures</Typography>
            <Typography variant="h6" color="blue-gray">{invalidSignatures}</Typography>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatsBar;