import React from 'react';
import {
    Card,
    CardBody,
    Typography,
} from '@material-tailwind/react';
import * as Tabs from '@radix-ui/react-tabs';
import SingleRequestPanel from '@/pages/dashboard/tools/api-runner/SingleRequestPanel';
import ScenarioRunner from '@/pages/dashboard/tools/api-runner/ScenarioRunner';

export function ApiRunner() {
    return (
        <div className="mt-4 sm:mt-8 lg:mt-12">
            <div className="mb-6 sm:mb-8">
                <Typography variant="h3" color="blue-gray" className="mb-2 text-2xl sm:text-3xl lg:text-4xl">
                    API Runner
                </Typography>
                <Typography variant="paragraph" color="blue-gray" className="text-base sm:text-lg font-normal">
                    Test APIs with single requests or run complex scenarios with multiple steps, variable management, and validations.
                </Typography>
            </div>

            <Card className="border border-blue-gray-100 shadow-sm">
                <CardBody className="p-0">
                    <Tabs.Root defaultValue="single-request" className="w-full">
                        <Tabs.List className="flex w-full bg-blue-gray-50/50 p-1 gap-1">
                            <Tabs.Trigger
                                value="single-request"
                                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base font-medium text-blue-gray-600
                                    data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700
                                    data-[state=active]:shadow-sm rounded-md transition-all duration-200
                                    hover:bg-blue-gray-100/50"
                            >
                                <span className="flex items-center gap-2">
                                    <svg 
                                        className="w-4 h-4" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M13 10V3L4 14h7v7l9-11h-7z" 
                                        />
                                    </svg>
                                    Single Request
                                </span>
                            </Tabs.Trigger>
                            <Tabs.Trigger
                                value="scenario-runner"
                                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base font-medium text-blue-gray-600
                                    data-[state=active]:bg-green-50 data-[state=active]:text-green-700
                                    data-[state=active]:shadow-sm rounded-md transition-all duration-200
                                    hover:bg-blue-gray-100/50"
                            >
                                <span className="flex items-center gap-2">
                                    <svg 
                                        className="w-4 h-4" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" 
                                        />
                                    </svg>
                                    Scenario Runner
                                </span>
                            </Tabs.Trigger>
                        </Tabs.List>

                        <Tabs.Content value="single-request" className="p-4 sm:p-6">
                            <div className="mb-4">
                                <Typography variant="h5" color="blue-gray" className="mb-2">
                                    Single API Request
                                </Typography>
                                <Typography variant="small" color="blue-gray" className="text-blue-gray-600">
                                    Send individual API requests with custom headers, methods, and body. History panel on the left shows previous requests for easy reuse.
                                </Typography>
                            </div>
                            <SingleRequestPanel />
                        </Tabs.Content>

                        <Tabs.Content value="scenario-runner" className="p-4 sm:p-6">
                            <div className="mb-4">
                                <Typography variant="h5" color="blue-gray" className="mb-2">
                                    Multi-Step Scenario Runner
                                </Typography>
                                <Typography variant="small" color="blue-gray" className="text-blue-gray-600">
                                    Create and run complex test scenarios with multiple API requests, variable management, and automated validations.
                                </Typography>
                            </div>
                            <ScenarioRunner />
                        </Tabs.Content>
                    </Tabs.Root>
                </CardBody>
            </Card>
        </div>
    );
}