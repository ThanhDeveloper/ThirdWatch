import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Textarea,
  Select,
  Option,
  Switch,
  Chip,
  IconButton,
} from '@material-tailwind/react';
import * as Tabs from '@radix-ui/react-tabs';
import { 
  ClipboardDocumentIcon, 
  ArrowPathIcon, 
  TrashIcon,
  PlusIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

export function DataGenerator() {
  // GUID Generator States
  const [guidValue, setGuidValue] = useState('');
  const [guidOptions, setGuidOptions] = useState({
    uppercase: false,
    includeHyphens: true,
    count: 1,
  });
  const [generatedGuids, setGeneratedGuids] = useState([]);

  // Random String Generator States
  const [randomStringValue, setRandomStringValue] = useState('');
  const [stringLength, setStringLength] = useState(10);
  const [stringType, setStringType] = useState('alphanumeric');
  const [stringOptions, setStringOptions] = useState({
    uppercase: false,
    lowercase: true,
    includeNumbers: true,
    includeSpecial: false,
    customChars: '',
    count: 1,
  });
  const [generatedStrings, setGeneratedStrings] = useState([]);

  // Generate GUID function
  const generateGuid = () => {
    const guids = [];
    for (let i = 0; i < guidOptions.count; i++) {
      let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      
      // Apply options
      if (guidOptions.uppercase) {
        guid = guid.toUpperCase();
      }
      if (!guidOptions.includeHyphens) {
        guid = guid.replace(/-/g, '');
      }
      
      guids.push(guid);
    }
    
    if (guidOptions.count === 1) {
      setGuidValue(guids[0]);
    } else {
      setGeneratedGuids(guids);
    }
  };

  // Generate random string function
  const generateRandomString = () => {
    let chars = '';
    
    // Build character set based on options
    if (stringOptions.customChars) {
      chars = stringOptions.customChars;
    } else {
      if (stringOptions.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (stringOptions.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
      if (stringOptions.includeNumbers) chars += '0123456789';
      if (stringOptions.includeSpecial) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      // Fallback to default if no options selected
      if (!chars) chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    }

    const strings = [];
    for (let i = 0; i < stringOptions.count; i++) {
      let result = '';
      for (let j = 0; j < stringLength; j++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      strings.push(result);
    }
    
    if (stringOptions.count === 1) {
      setRandomStringValue(strings[0]);
    } else {
      setGeneratedStrings(strings);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  // Copy all generated items
  const copyAllToClipboard = (items) => {
    const text = items.join('\n');
    copyToClipboard(text);
  };

  // Clear generated items
  const clearGenerated = (type) => {
    if (type === 'guid') {
      setGuidValue('');
      setGeneratedGuids([]);
    } else {
      setRandomStringValue('');
      setGeneratedStrings([]);
    }
  };

  return (
    <div className="mt-4 sm:mt-8 lg:mt-12">
      <div className="mb-6 sm:mb-8">
        <Typography variant="h3" color="blue-gray" className="mb-2 text-2xl sm:text-3xl lg:text-4xl">
          Data Generator
        </Typography>
        <Typography variant="paragraph" color="blue-gray" className="text-base sm:text-lg font-normal">
          Generate various types of data for testing and development purposes.
        </Typography>
      </div>

      <Card className="border border-blue-gray-100 shadow-sm">
        <CardBody className="p-0">
          <Tabs.Root defaultValue="guid" className="w-full">
            <Tabs.List className="flex w-full bg-blue-gray-50/50 p-1">
              <Tabs.Trigger
                value="guid"
                className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-gray-600 data-[state=active]:bg-white data-[state=active]:text-blue-gray-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
              >
                <span className="hidden sm:inline">Generate GUID</span>
                <span className="sm:hidden">GUID</span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="random-string"
                className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-gray-600 data-[state=active]:bg-white data-[state=active]:text-blue-gray-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
              >
                <span className="hidden sm:inline">Generate Random String</span>
                <span className="sm:hidden">String</span>
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="guid" className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <Typography variant="h5" color="blue-gray" className="mb-2 sm:mb-4 text-lg sm:text-xl">
                    GUID Generator
                  </Typography>
                  <Typography variant="paragraph" color="blue-gray" className="mb-4 sm:mb-6 text-sm sm:text-base">
                    Generate globally unique identifiers (GUID/UUID) with customizable options.
                  </Typography>
                </div>

                {/* GUID Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={guidOptions.uppercase}
                      onChange={(e) => setGuidOptions(prev => ({ ...prev, uppercase: e.target.checked }))}
                      color="blue"
                    />
                    <Typography variant="small" color="blue-gray" className="font-medium">
                      Uppercase
                    </Typography>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={guidOptions.includeHyphens}
                      onChange={(e) => setGuidOptions(prev => ({ ...prev, includeHyphens: e.target.checked }))}
                      color="blue"
                    />
                    <Typography variant="small" color="blue-gray" className="font-medium">
                      Include Hyphens
                    </Typography>
                  </div>
                  
                  <div className="sm:col-span-2 lg:col-span-1">
                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                      Count
                    </Typography>
                    <Input
                      type="number"
                      value={guidOptions.count}
                      onChange={(e) => setGuidOptions(prev => ({ ...prev, count: Math.max(1, parseInt(e.target.value) || 1) }))}
                      min="1"
                      max="100"
                      size="sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <Button
                    onClick={generateGuid}
                    className="flex items-center justify-center gap-2"
                    color="blue"
                    size="sm"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    Generate {guidOptions.count > 1 ? `${guidOptions.count} GUIDs` : 'GUID'}
                  </Button>
                  
                  {(guidValue || generatedGuids.length > 0) && (
                    <Button
                      onClick={() => clearGenerated('guid')}
                      variant="outlined"
                      color="red"
                      size="sm"
                      className="flex items-center justify-center gap-2"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Single GUID Result */}
                {guidValue && guidOptions.count === 1 && (
                  <div className="space-y-2">
                    <Typography variant="small" color="blue-gray" className="font-medium">
                      Generated GUID:
                    </Typography>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={guidValue}
                        readOnly
                        className="font-mono text-xs sm:text-sm"
                        containerProps={{ className: "min-w-0 flex-1" }}
                      />
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={() => copyToClipboard(guidValue)}
                        className="flex items-center justify-center gap-1"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  </div>
                )}

                {/* Multiple GUIDs Result */}
                {generatedGuids.length > 0 && guidOptions.count > 1 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        Generated GUIDs ({generatedGuids.length}):
                      </Typography>
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={() => copyAllToClipboard(generatedGuids)}
                        className="flex items-center gap-1"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                        Copy All
                      </Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {generatedGuids.map((guid, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-2 p-2 bg-gray-50 rounded-lg">
                          <Input
                            value={guid}
                            readOnly
                            className="font-mono text-xs sm:text-sm"
                            containerProps={{ className: "min-w-0 flex-1" }}
                          />
                          <Button
                            size="sm"
                            variant="text"
                            onClick={() => copyToClipboard(guid)}
                            className="flex items-center justify-center gap-1"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Tabs.Content>

            <Tabs.Content value="random-string" className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <Typography variant="h5" color="blue-gray" className="mb-2 sm:mb-4 text-lg sm:text-xl">
                    Random String Generator
                  </Typography>
                  <Typography variant="paragraph" color="blue-gray" className="mb-4 sm:mb-6 text-sm sm:text-base">
                    Generate random strings with customizable length and character types.
                  </Typography>
                </div>

                {/* String Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                      String Length
                    </Typography>
                    <Input
                      type="number"
                      value={stringLength}
                      onChange={(e) => setStringLength(Math.max(1, parseInt(e.target.value) || 10))}
                      min="1"
                      max="1000"
                      size="sm"
                    />
                  </div>
                  
                  <div>
                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                      Count
                    </Typography>
                    <Input
                      type="number"
                      value={stringOptions.count}
                      onChange={(e) => setStringOptions(prev => ({ ...prev, count: Math.max(1, parseInt(e.target.value) || 1) }))}
                      min="1"
                      max="100"
                      size="sm"
                    />
                  </div>
                  
                  <div className="sm:col-span-2 lg:col-span-1">
                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                      Custom Characters
                    </Typography>
                    <Input
                      value={stringOptions.customChars}
                      onChange={(e) => setStringOptions(prev => ({ ...prev, customChars: e.target.value }))}
                      placeholder="Optional custom set"
                      size="sm"
                    />
                  </div>
                </div>

                {/* Character Type Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={stringOptions.uppercase}
                      onChange={(e) => setStringOptions(prev => ({ ...prev, uppercase: e.target.checked }))}
                      color="blue"
                    />
                    <Typography variant="small" color="blue-gray" className="font-medium">
                      Uppercase (A-Z)
                    </Typography>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={stringOptions.lowercase}
                      onChange={(e) => setStringOptions(prev => ({ ...prev, lowercase: e.target.checked }))}
                      color="blue"
                    />
                    <Typography variant="small" color="blue-gray" className="font-medium">
                      Lowercase (a-z)
                    </Typography>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={stringOptions.includeNumbers}
                      onChange={(e) => setStringOptions(prev => ({ ...prev, includeNumbers: e.target.checked }))}
                      color="blue"
                    />
                    <Typography variant="small" color="blue-gray" className="font-medium">
                      Numbers (0-9)
                    </Typography>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={stringOptions.includeSpecial}
                      onChange={(e) => setStringOptions(prev => ({ ...prev, includeSpecial: e.target.checked }))}
                      color="blue"
                    />
                    <Typography variant="small" color="blue-gray" className="font-medium">
                      Special Chars
                    </Typography>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <Button
                    onClick={generateRandomString}
                    className="flex items-center justify-center gap-2"
                    color="blue"
                    size="sm"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    Generate {stringOptions.count > 1 ? `${stringOptions.count} Strings` : 'String'}
                  </Button>
                  
                  {(randomStringValue || generatedStrings.length > 0) && (
                    <Button
                      onClick={() => clearGenerated('string')}
                      variant="outlined"
                      color="red"
                      size="sm"
                      className="flex items-center justify-center gap-2"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Single String Result */}
                {randomStringValue && stringOptions.count === 1 && (
                  <div className="space-y-2">
                    <Typography variant="small" color="blue-gray" className="font-medium">
                      Generated String:
                    </Typography>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={randomStringValue}
                        readOnly
                        className="font-mono text-xs sm:text-sm"
                        containerProps={{ className: "min-w-0 flex-1" }}
                      />
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={() => copyToClipboard(randomStringValue)}
                        className="flex items-center justify-center gap-1"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  </div>
                )}

                {/* Multiple Strings Result */}
                {generatedStrings.length > 0 && stringOptions.count > 1 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        Generated Strings ({generatedStrings.length}):
                      </Typography>
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={() => copyAllToClipboard(generatedStrings)}
                        className="flex items-center gap-1"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                        Copy All
                      </Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {generatedStrings.map((str, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-2 p-2 bg-gray-50 rounded-lg">
                          <Input
                            value={str}
                            readOnly
                            className="font-mono text-xs sm:text-sm"
                            containerProps={{ className: "min-w-0 flex-1" }}
                          />
                          <Button
                            size="sm"
                            variant="text"
                            onClick={() => copyToClipboard(str)}
                            className="flex items-center justify-center gap-1"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </CardBody>
      </Card>
    </div>
  );
}

export default DataGenerator;
