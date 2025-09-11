import React from 'react';
import {
  Card,
  CardBody,
  Typography,
} from '@material-tailwind/react';
import * as Tabs from '@radix-ui/react-tabs';
import JsonValidator from './json/JsonValidator';
import JsonFormatter from './json/JsonFormatter';
import JsonMinifier from './json/JsonMinifier';
import JsonToXml from './json/JsonToXml';
import JsonSchemaGenerator from './json/JsonSchemaGenerator';
import JsonDiff from './json/JsonDiff';


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
        <CardBody className="p-0">
          <Tabs.Root defaultValue="validator" className="w-full">
            <Tabs.List className="flex w-full bg-blue-gray-50/50 p-1 gap-1">
              <Tabs.Trigger value="validator" className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-gray-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200">
                <span className="hidden sm:inline">JSON Validator</span>
                <span className="sm:hidden">Validator</span>
              </Tabs.Trigger>
              <Tabs.Trigger value="formatter" className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-gray-600 data-[state=active]:bg-green-50 data-[state=active]:text-green-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200">
                <span className="hidden sm:inline">Formatter & Beautifier</span>
                <span className="sm:hidden">Formatter</span>
              </Tabs.Trigger>
              <Tabs.Trigger value="minifier" className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-gray-600 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200">
                <span className="hidden sm:inline">Minifier</span>
                <span className="sm:hidden">Minifier</span>
              </Tabs.Trigger>
              <Tabs.Trigger value="toxml" className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-gray-600 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200">
                <span className="hidden sm:inline">JSON to XML</span>
                <span className="sm:hidden">To XML</span>
              </Tabs.Trigger>
              <Tabs.Trigger value="schema" className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-gray-600 data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200">
                <span className="hidden sm:inline">Schema Generator</span>
                <span className="sm:hidden">Schema</span>
              </Tabs.Trigger>
              <Tabs.Trigger value="diff" className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-gray-600 data-[state=active]:bg-red-50 data-[state=active]:text-red-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200">
                <span className="hidden sm:inline">Diff Tool</span>
                <span className="sm:hidden">Diff</span>
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="validator" className="p-4 sm:p-6">
              <JsonValidator />
            </Tabs.Content>
            <Tabs.Content value="formatter" className="p-4 sm:p-6">
              <JsonFormatter />
            </Tabs.Content>
            <Tabs.Content value="minifier" className="p-4 sm:p-6">
              <JsonMinifier />
            </Tabs.Content>
            <Tabs.Content value="toxml" className="p-4 sm:p-6">
              <JsonToXml />
            </Tabs.Content>
            <Tabs.Content value="schema" className="p-4 sm:p-6">
              <JsonSchemaGenerator />
            </Tabs.Content>
            <Tabs.Content value="diff" className="p-4 sm:p-6">
              <JsonDiff />
            </Tabs.Content>
          </Tabs.Root>
        </CardBody>
      </Card>
    </div>
  );
}

export default JsonTools;
