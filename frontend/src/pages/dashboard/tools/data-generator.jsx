import React, { useMemo, useState } from 'react';
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
import fileTypes from '@/data/file-generator-config';
import {
  DocumentTextIcon,
  CodeBracketSquareIcon,
  TableCellsIcon,
  Bars3BottomLeftIcon,
  CodeBracketIcon,
  AdjustmentsHorizontalIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/solid';
import GuidGenerator from '@/pages/dashboard/tools/data-generator/GuidGenerator';
import RandomStringGenerator from '@/pages/dashboard/tools/data-generator/RandomStringGenerator';
import FileGenerator from '@/pages/dashboard/tools/data-generator/FileGenerator';

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

  // ----- File Generator State -----
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [fileContents, setFileContents] = useState({});
  const [baseName, setBaseName] = useState('sample');

  const iconMap = {
    DocumentTextIcon,
    CodeBracketSquareIcon,
    TableCellsIcon,
    Bars3BottomLeftIcon,
    CodeBracketIcon,
    AdjustmentsHorizontalIcon,
    ShieldCheckIcon,
  };

  const selectedConfigs = useMemo(() => fileTypes.filter(f => selectedTypes.includes(f.id)), [selectedTypes]);

  // Generate GUID function
  const generateGuid = () => {
    const guids = [];
    for (let i = 0; i < guidOptions.count; i++) {
      let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
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

  const handleToggleType = (id) => {
    setSelectedTypes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const cfg = fileTypes.find(f => f.id === id);
    if (cfg && !fileContents[id]) {
      setFileContents(prev => ({ ...prev, [id]: cfg.defaultContent }));
    }
  };

  const handleContentChange = (id, value) => {
    setFileContents(prev => ({ ...prev, [id]: value }));
  };

  const downloadFile = (name, content, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSelected = () => {
    if (selectedConfigs.length === 0) {
      toast.info('Select at least one file type');
      return;
    }
    selectedConfigs.forEach((cfg, index) => {
      const content = fileContents[cfg.id] ?? cfg.defaultContent ?? '';
      const fname = `${baseName || 'file'}-${index + 1}.${cfg.extension}`;
      downloadFile(fname, content, cfg.mime);
    });
    toast.success(`Downloaded ${selectedConfigs.length} file(s)`);
  };

  const handleClearFiles = () => {
    setSelectedTypes([]);
    setFileContents({});
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
            <Tabs.List className="flex w-full bg-blue-gray-50/50 p-1 gap-1">
              <Tabs.Trigger
                value="guid"
                className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-gray-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
              >
                <span className="hidden sm:inline">Generate GUID</span>
                <span className="sm:hidden">GUID</span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="random-string"
                className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-gray-600 data-[state=active]:bg-green-50 data-[state=active]:text-green-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
              >
                <span className="hidden sm:inline">Generate Random String</span>
                <span className="sm:hidden">String</span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="files"
                className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-gray-600 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
              >
                <span className="hidden sm:inline">File Generator</span>
                <span className="sm:hidden">Files</span>
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="guid" className="p-4 sm:p-6">
              <GuidGenerator />
            </Tabs.Content>

            {/* Files Generator */}
            <Tabs.Content value="files" className="p-4 sm:p-6">
              {/* Use extracted component for maintainability */}
              <FileGenerator />
            </Tabs.Content>

            <Tabs.Content value="random-string" className="p-4 sm:p-6">
              <RandomStringGenerator />
            </Tabs.Content>
          </Tabs.Root>
        </CardBody>
      </Card>
    </div>
  );
}

export default DataGenerator;
