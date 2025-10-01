import React from 'react';
import {
    Card,
    CardBody,
    Typography,
} from '@material-tailwind/react';
import * as Tabs from '@radix-ui/react-tabs';
import JsonFormatterPanel from '@/pages/dashboard/tools/json-utilities/JsonFormatterPanel';
import JsonConverterPanel from '@/pages/dashboard/tools/json-utilities/JsonConverterPanel';
import JsonToCsvPanel from '@/pages/dashboard/tools/json-utilities/JsonToCsvPanel';
import JsonDiffPanel from '@/pages/dashboard/tools/json-utilities/JsonDiffPanel';
import JsonValidatorPanel from '@/pages/dashboard/tools/json-utilities/JsonValidatorPanel';
import JwtDecoderPanel from '@/pages/dashboard/tools/json-utilities/JwtDecoderPanel';

export function JsonUtilities() {
    return (
        <div className="mt-4 sm:mt-8 lg:mt-12">
            <div className="mb-6 sm:mb-8">
                <Typography variant="h3" color="blue-gray" className="mb-2 text-2xl sm:text-3xl lg:text-4xl">
                    JSON Tools Suite
                </Typography>
                <Typography variant="paragraph" color="blue-gray" className="text-base sm:text-lg font-normal">
                    Complete JSON toolkit: Format, validate, convert, compare, and decode JWT tokens with advanced features.
                </Typography>
            </div>

            <Card className="border border-blue-gray-100 shadow-sm">
                <CardBody className="p-0">
                    <Tabs.Root defaultValue="formatter" className="w-full">
                        <Tabs.List className="flex flex-wrap w-full bg-blue-gray-50/50 p-1 gap-1">
                            <Tabs.Trigger
                                value="formatter"
                                className="flex-1 min-w-0 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-blue-gray-600
                                    data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700
                                    data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                            >
                                Json Formatter
                            </Tabs.Trigger>
                            <Tabs.Trigger
                                value="validator"
                                className="flex-1 min-w-0 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-blue-gray-600
                                    data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700
                                    data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                            >
                                Json Validator
                            </Tabs.Trigger>
                            <Tabs.Trigger
                                value="converter"
                                className="flex-1 min-w-0 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-blue-gray-600
                                    data-[state=active]:bg-green-50 data-[state=active]:text-blue-gray-900
                                    data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                            >
                                Json to XML
                            </Tabs.Trigger>
                            <Tabs.Trigger
                                value="csv"
                                className="flex-1 min-w-0 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-blue-gray-600
                                    data-[state=active]:bg-purple-50 data-[state=active]:text-blue-gray-900
                                    data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                            >
                                Json to CSV
                            </Tabs.Trigger>
                            <Tabs.Trigger
                                value="diff"
                                className="flex-1 min-w-0 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-blue-gray-600
                                    data-[state=active]:bg-orange-50 data-[state=active]:text-blue-gray-900
                                    data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                            >
                                Json Compare
                            </Tabs.Trigger>
                            <Tabs.Trigger
                                value="jwt"
                                className="flex-1 min-w-0 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-blue-gray-600
                                    data-[state=active]:bg-indigo-50 data-[state=active]:text-blue-gray-900
                                    data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                            >
                                JWT Decoder
                            </Tabs.Trigger>
                        </Tabs.List>

                        <Tabs.Content value="formatter" className="p-4 sm:p-6">
                            <JsonFormatterPanel />
                        </Tabs.Content>

                        <Tabs.Content value="validator" className="p-4 sm:p-6">
                            <JsonValidatorPanel />
                        </Tabs.Content>

                        <Tabs.Content value="converter" className="p-4 sm:p-6">
                            <JsonConverterPanel />
                        </Tabs.Content>

                        <Tabs.Content value="csv" className="p-4 sm:p-6">
                            <JsonToCsvPanel />
                        </Tabs.Content>

                        <Tabs.Content value="diff" className="p-4 sm:p-6">
                            <JsonDiffPanel />
                        </Tabs.Content>

                        <Tabs.Content value="jwt" className="p-4 sm:p-6">
                            <JwtDecoderPanel />
                        </Tabs.Content>
                    </Tabs.Root>
                </CardBody>
            </Card>
        </div>
    );
}

export default JsonUtilities;