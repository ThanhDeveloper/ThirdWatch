import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from '@material-tailwind/react';
import { CodeBracketIcon } from '@heroicons/react/24/outline';

export function JsonTools() {
  return (
    <div className="mt-4 sm:mt-8 lg:mt-12">
      <div className="mb-8">
        <Typography variant="h4" color="blue-gray" className="mb-2">
          JSON Tools
        </Typography>
        <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
          Powerful JSON manipulation and validation tools for developers.
        </Typography>
      </div>

      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader
          floated={false}
          shadow={false}
          color="transparent"
          className="m-0 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <CodeBracketIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                JSON Tools
              </Typography>
              <Typography variant="small" color="blue-gray" className="font-normal">
                Coming Soon - JSON validation, formatting, and manipulation tools
              </Typography>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="text-center py-12">
            <div className="p-6 bg-gray-50 rounded-lg inline-block">
              <CodeBracketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <Typography variant="h6" color="gray" className="mb-2">
                This is JSON Tools
              </Typography>
              <Typography variant="paragraph" color="gray" className="text-sm">
                We will implement comprehensive JSON tools here including:
              </Typography>
              <ul className="text-left text-sm text-gray-600 mt-4 space-y-1">
                <li>• JSON Validator</li>
                <li>• JSON Formatter & Beautifier</li>
                <li>• JSON Minifier</li>
                <li>• JSON to XML Converter</li>
                <li>• JSON Schema Generator</li>
                <li>• JSON Diff Tool</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default JsonTools;
