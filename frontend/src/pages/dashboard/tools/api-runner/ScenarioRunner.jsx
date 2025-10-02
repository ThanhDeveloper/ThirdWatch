import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    Typography,
    Button,
    Input,
    Select,
    Option,
    Textarea,
    Chip,
    IconButton,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Progress,
} from '@material-tailwind/react';
import { 
    PlayIcon,
    TrashIcon,
    PlusIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    PencilIcon,
    StopIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationCircleIcon,
    ClockIcon,
    EyeIcon,
    Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

const COMMON_HEADERS = {
    'GET': {
        'Accept': 'application/json',
        'User-Agent': 'ThirdWatch Scenario Runner/1.0'
    },
    'POST': {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ThirdWatch Scenario Runner/1.0'
    },
    'PUT': {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ThirdWatch Scenario Runner/1.0'
    },
    'DELETE': {
        'Accept': 'application/json',
        'User-Agent': 'ThirdWatch Scenario Runner/1.0'
    },
    'PATCH': {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ThirdWatch Scenario Runner/1.0'
    }
};

const DEFAULT_STEP = {
    id: Date.now(),
    name: 'New Request',
    method: 'GET',
    url: '',
    headers: [{ key: '', value: '', id: Date.now() }],
    body: '',
    saveVariables: [],
    validations: [],
    result: null,
    status: 'pending', // pending, running, success, failed
};

const DEFAULT_VALIDATION = {
    id: Date.now(),
    type: 'statusCode', // statusCode, jsonField, responseTime
    field: '',
    operator: 'equals', // equals, contains, exists, lessThan, greaterThan
    expectedValue: '',
    actualValue: '',
    passed: false,
};

const DEFAULT_VARIABLE = {
    id: Date.now(),
    name: '',
    jsonPath: '', // e.g., "data.user.id" or "data[0].name"
    value: '',
};

export default function ScenarioRunner() {
    const [steps, setSteps] = useState([{ ...DEFAULT_STEP }]);
    const [variables, setVariables] = useState(new Map());
    const [isRunning, setIsRunning] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [showStepEditor, setShowStepEditor] = useState(false);
    const [editingStep, setEditingStep] = useState(null);
    const [scenarioName, setScenarioName] = useState('My Scenario');
    const [scenarios, setScenarios] = useState([]);

    // Load saved scenarios
    useEffect(() => {
        const savedScenarios = localStorage.getItem('api-runner-scenarios');
        if (savedScenarios) {
            try {
                setScenarios(JSON.parse(savedScenarios));
            } catch (e) {
                console.error('Failed to parse saved scenarios:', e);
            }
        }
    }, []);

    const addStep = () => {
        const newStep = { 
            ...DEFAULT_STEP, 
            id: Date.now(),
            name: `Request ${steps.length + 1}`,
        };
        setSteps([...steps, newStep]);
    };

    const removeStep = (stepId) => {
        setSteps(steps.filter(s => s.id !== stepId));
    };

    const moveStep = (stepId, direction) => {
        const index = steps.findIndex(s => s.id === stepId);
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === steps.length - 1)
        ) return;

        const newSteps = [...steps];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
        setSteps(newSteps);
    };

    const updateStep = (stepId, updates) => {
        setSteps(steps.map(s => s.id === stepId ? { ...s, ...updates } : s));
    };

    const openStepEditor = (step) => {
        setEditingStep({ ...step });
        setShowStepEditor(true);
    };

    const saveStepEdits = () => {
        if (editingStep) {
            updateStep(editingStep.id, editingStep);
            setShowStepEditor(false);
            setEditingStep(null);
            toast.success('Step updated successfully');
        }
    };

    const addValidation = () => {
        if (!editingStep) return;
        const newValidation = { ...DEFAULT_VALIDATION, id: Date.now() };
        setEditingStep({
            ...editingStep,
            validations: [...editingStep.validations, newValidation]
        });
    };

    const updateValidation = (validationId, updates) => {
        if (!editingStep) return;
        setEditingStep({
            ...editingStep,
            validations: editingStep.validations.map(v => 
                v.id === validationId ? { ...v, ...updates } : v
            )
        });
    };

    const removeValidation = (validationId) => {
        if (!editingStep) return;
        setEditingStep({
            ...editingStep,
            validations: editingStep.validations.filter(v => v.id !== validationId)
        });
    };

    const addVariable = () => {
        if (!editingStep) return;
        const newVariable = { ...DEFAULT_VARIABLE, id: Date.now() };
        setEditingStep({
            ...editingStep,
            saveVariables: [...editingStep.saveVariables, newVariable]
        });
    };

    const updateVariable = (variableId, updates) => {
        if (!editingStep) return;
        setEditingStep({
            ...editingStep,
            saveVariables: editingStep.saveVariables.map(v => 
                v.id === variableId ? { ...v, ...updates } : v
            )
        });
    };

    const removeVariable = (variableId) => {
        if (!editingStep) return;
        setEditingStep({
            ...editingStep,
            saveVariables: editingStep.saveVariables.filter(v => v.id !== variableId)
        });
    };

    const replaceVariables = (text) => {
        if (!text) return text;
        let result = text;
        variables.forEach((value, key) => {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
        return result;
    };

    const extractJsonValue = (obj, path) => {
        try {
            return path.split('.').reduce((current, key) => {
                // Handle array notation like data[0]
                if (key.includes('[') && key.includes(']')) {
                    const arrayKey = key.substring(0, key.indexOf('['));
                    const index = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')));
                    return current[arrayKey][index];
                }
                return current[key];
            }, obj);
        } catch (e) {
            return undefined;
        }
    };

    const validateResponse = (response, validation) => {
        const { type, field, operator, expectedValue } = validation;
        let actualValue;
        let passed = false;

        try {
            switch (type) {
                case 'statusCode':
                    actualValue = response.status;
                    break;
                case 'jsonField':
                    actualValue = extractJsonValue(response.data, field);
                    break;
                case 'responseTime':
                    actualValue = response.responseTime || 0;
                    break;
                default:
                    return { passed: false, actualValue: 'Unknown validation type' };
            }

            switch (operator) {
                case 'equals':
                    passed = String(actualValue) === String(expectedValue);
                    break;
                case 'contains':
                    passed = String(actualValue).includes(String(expectedValue));
                    break;
                case 'exists':
                    passed = actualValue !== undefined && actualValue !== null;
                    break;
                case 'lessThan':
                    passed = Number(actualValue) < Number(expectedValue);
                    break;
                case 'greaterThan':
                    passed = Number(actualValue) > Number(expectedValue);
                    break;
                default:
                    passed = false;
            }
        } catch (e) {
            actualValue = 'Error: ' + e.message;
            passed = false;
        }

        return { passed, actualValue };
    };

    const executeStep = async (step, stepIndex) => {
        const startTime = Date.now();
        
        // Replace variables in step configuration
        const processedStep = {
            ...step,
            url: replaceVariables(step.url),
            body: replaceVariables(step.body),
            headers: step.headers.map(h => ({
                ...h,
                value: replaceVariables(h.value)
            }))
        };

        updateStep(step.id, { status: 'running' });

        try {
            // Mock API call
            const mockResponse = {
                status: Math.random() > 0.1 ? 200 : 500, // 90% success rate
                statusText: Math.random() > 0.1 ? 'OK' : 'Internal Server Error',
                headers: {
                    'content-type': 'application/json',
                    'x-scenario-step': stepIndex + 1,
                    'date': new Date().toISOString(),
                },
                data: {
                    message: `Mock response for step ${stepIndex + 1}: ${step.name}`,
                    stepIndex: stepIndex,
                    stepName: step.name,
                    method: processedStep.method,
                    url: processedStep.url,
                    timestamp: new Date().toISOString(),
                    userData: {
                        id: Math.floor(Math.random() * 1000),
                        name: 'John Doe',
                        email: 'john@example.com',
                        token: 'mock-jwt-token-' + Math.random().toString(36).substring(7),
                    },
                    items: [
                        { id: 1, name: 'Item 1', value: 100 },
                        { id: 2, name: 'Item 2', value: 200 },
                    ]
                },
                responseTime: Date.now() - startTime
            };

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

            // Save variables from response
            const newVariables = new Map(variables);
            step.saveVariables.forEach(variable => {
                if (variable.name && variable.jsonPath) {
                    const value = extractJsonValue(mockResponse.data, variable.jsonPath);
                    if (value !== undefined) {
                        newVariables.set(variable.name, String(value));
                    }
                }
            });
            setVariables(newVariables);

            // Run validations
            const validationResults = step.validations.map(validation => {
                const result = validateResponse(mockResponse, validation);
                return { ...validation, ...result };
            });

            const allValidationsPassed = validationResults.length === 0 || 
                validationResults.every(v => v.passed);

            const stepResult = {
                response: mockResponse,
                validations: validationResults,
                success: mockResponse.status < 400 && allValidationsPassed,
                executedAt: new Date().toISOString(),
            };

            updateStep(step.id, { 
                status: stepResult.success ? 'success' : 'failed',
                result: stepResult
            });

            return stepResult;

        } catch (error) {
            const errorResult = {
                error: error.message,
                success: false,
                executedAt: new Date().toISOString(),
            };

            updateStep(step.id, { 
                status: 'failed',
                result: errorResult
            });

            return errorResult;
        }
    };

    const runScenario = async () => {
        if (steps.length === 0) {
            toast.error('No steps to execute');
            return;
        }

        setIsRunning(true);
        setCurrentStepIndex(0);
        setVariables(new Map()); // Reset variables

        // Reset all steps
        setSteps(steps.map(s => ({ ...s, status: 'pending', result: null })));

        try {
            for (let i = 0; i < steps.length; i++) {
                setCurrentStepIndex(i);
                const result = await executeStep(steps[i], i);
                
                if (!result.success) {
                    toast.error(`Step ${i + 1} failed: ${steps[i].name}`);
                    break;
                }
                
                toast.success(`Step ${i + 1} completed: ${steps[i].name}`);
            }

            toast.success('Scenario execution completed!');
        } catch (error) {
            toast.error('Scenario execution failed: ' + error.message);
        } finally {
            setIsRunning(false);
            setCurrentStepIndex(-1);
        }
    };

    const stopScenario = () => {
        setIsRunning(false);
        setCurrentStepIndex(-1);
        toast.info('Scenario execution stopped');
    };

    const saveScenario = () => {
        const scenario = {
            id: Date.now(),
            name: scenarioName,
            steps: steps,
            createdAt: new Date().toISOString(),
        };

        const newScenarios = [...scenarios, scenario];
        setScenarios(newScenarios);
        localStorage.setItem('api-runner-scenarios', JSON.stringify(newScenarios));
        toast.success('Scenario saved successfully');
    };

    const loadScenario = (scenario) => {
        setSteps(scenario.steps.map(s => ({ ...s, status: 'pending', result: null })));
        setScenarioName(scenario.name);
        toast.success('Scenario loaded successfully');
    };

    const deleteScenario = (scenarioId) => {
        const newScenarios = scenarios.filter(s => s.id !== scenarioId);
        setScenarios(newScenarios);
        localStorage.setItem('api-runner-scenarios', JSON.stringify(newScenarios));
        toast.success('Scenario deleted');
    };

    const getStepStatusIcon = (status) => {
        switch (status) {
            case 'running':
                return <ClockIcon className="h-4 w-4 text-blue-500 animate-spin" />;
            case 'success':
                return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
            case 'failed':
                return <XCircleIcon className="h-4 w-4 text-red-500" />;
            default:
                return <ExclamationCircleIcon className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStepStatusColor = (status) => {
        switch (status) {
            case 'running': return 'blue';
            case 'success': return 'green';
            case 'failed': return 'red';
            default: return 'gray';
        }
    };

    return (
        <div className="space-y-6">
            {/* Scenario Header */}
            <Card className="border border-blue-gray-100">
                <CardBody className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <div className="flex-1">
                            <Input
                                label="Scenario Name"
                                value={scenarioName}
                                onChange={(e) => setScenarioName(e.target.value)}
                                className="!border-blue-gray-200 focus:!border-blue-500"
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                onClick={saveScenario}
                                size="sm"
                                variant="outlined"
                                className="flex items-center gap-1 flex-1 sm:flex-none"
                            >
                                Save Scenario
                            </Button>
                            <Button
                                onClick={addStep}
                                size="sm"
                                color="blue"
                                className="flex items-center gap-1 flex-1 sm:flex-none"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Add Step
                            </Button>
                        </div>
                    </div>

                    {/* Execution Controls */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                onClick={runScenario}
                                disabled={isRunning || steps.length === 0}
                                color="green"
                                className="flex items-center gap-2 flex-1 sm:flex-none"
                            >
                                <PlayIcon className="h-4 w-4" />
                                Run Scenario
                            </Button>
                            {isRunning && (
                                <Button
                                    onClick={stopScenario}
                                    color="red"
                                    variant="outlined"
                                    className="flex items-center gap-2"
                                >
                                    <StopIcon className="h-4 w-4" />
                                    Stop
                                </Button>
                            )}
                        </div>

                        {isRunning && (
                            <div className="flex-1 w-full">
                                <div className="flex items-center gap-2 mb-1">
                                    <Typography variant="small" className="text-blue-gray-600">
                                        Progress: {currentStepIndex + 1} / {steps.length}
                                    </Typography>
                                </div>
                                <Progress 
                                    value={(currentStepIndex + 1) / steps.length * 100} 
                                    color="blue"
                                    size="sm"
                                />
                            </div>
                        )}
                    </div>

                    {/* Variables Display */}
                    {variables.size > 0 && (
                        <div className="mt-4">
                            <Typography variant="small" className="mb-2 font-medium text-blue-gray-600">
                                Current Variables
                            </Typography>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(variables.entries()).map(([key, value]) => (
                                    <Chip
                                        key={key}
                                        value={`${key}: ${value}`}
                                        size="sm"
                                        color="blue"
                                        variant="ghost"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Steps List */}
            <div className="space-y-3">
                {steps.map((step, index) => (
                    <Card key={step.id} className="border border-blue-gray-100">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        {getStepStatusIcon(step.status)}
                                        <Typography variant="small" className="font-medium">
                                            {index + 1}.
                                        </Typography>
                                    </div>
                                    
                                    <Chip
                                        value={step.method}
                                        size="sm"
                                        color={
                                            step.method === 'GET' ? 'green' :
                                            step.method === 'POST' ? 'blue' :
                                            step.method === 'PUT' ? 'amber' :
                                            step.method === 'DELETE' ? 'red' : 'purple'
                                        }
                                    />
                                    
                                    <div className="flex-1 min-w-0">
                                        <Typography variant="small" className="font-medium text-blue-gray-700 truncate">
                                            {step.name}
                                        </Typography>
                                        <Typography variant="small" className="text-blue-gray-500 truncate">
                                            {step.url || 'No URL set'}
                                        </Typography>
                                    </div>

                                    {step.result && (
                                        <Chip
                                            value={step.result.success ? 'Success' : 'Failed'}
                                            size="sm"
                                            color={getStepStatusColor(step.status)}
                                        />
                                    )}
                                </div>

                                <div className="flex items-center gap-1 ml-4">
                                    <IconButton
                                        size="sm"
                                        variant="text"
                                        onClick={() => openStepEditor(step)}
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </IconButton>
                                    <IconButton
                                        size="sm"
                                        variant="text"
                                        onClick={() => moveStep(step.id, 'up')}
                                        disabled={index === 0}
                                    >
                                        <ChevronUpIcon className="h-4 w-4" />
                                    </IconButton>
                                    <IconButton
                                        size="sm"
                                        variant="text"
                                        onClick={() => moveStep(step.id, 'down')}
                                        disabled={index === steps.length - 1}
                                    >
                                        <ChevronDownIcon className="h-4 w-4" />
                                    </IconButton>
                                    <IconButton
                                        size="sm"
                                        variant="text"
                                        color="red"
                                        onClick={() => removeStep(step.id)}
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </IconButton>
                                </div>
                            </div>

                            {/* Step Result */}
                            {step.result && (
                                <div className="mt-3 pt-3 border-t border-blue-gray-100">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                        <div>
                                            <Typography variant="small" className="font-medium text-blue-gray-600">
                                                Status
                                            </Typography>
                                            <Typography variant="small">
                                                {step.result.response?.status || 'N/A'}
                                            </Typography>
                                        </div>
                                        <div>
                                            <Typography variant="small" className="font-medium text-blue-gray-600">
                                                Response Time
                                            </Typography>
                                            <Typography variant="small">
                                                {step.result.response?.responseTime || 0}ms
                                            </Typography>
                                        </div>
                                        <div>
                                            <Typography variant="small" className="font-medium text-blue-gray-600">
                                                Validations
                                            </Typography>
                                            <Typography variant="small">
                                                {step.result.validations?.filter(v => v.passed).length || 0} / {step.result.validations?.length || 0} passed
                                            </Typography>
                                        </div>
                                        <div>
                                            <Typography variant="small" className="font-medium text-blue-gray-600">
                                                Executed At
                                            </Typography>
                                            <Typography variant="small">
                                                {step.result.executedAt ? new Date(step.result.executedAt).toLocaleTimeString() : 'N/A'}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Saved Scenarios */}
            {scenarios.length > 0 && (
                <Card className="border border-blue-gray-100">
                    <CardBody className="p-4 sm:p-6">
                        <Typography variant="h5" color="blue-gray" className="mb-4">
                            Saved Scenarios
                        </Typography>
                        <div className="space-y-2">
                            {scenarios.map((scenario) => (
                                <Card key={scenario.id} className="bg-gray-50">
                                    <CardBody className="p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <Typography variant="small" className="font-medium text-blue-gray-700">
                                                    {scenario.name}
                                                </Typography>
                                                <Typography variant="small" className="text-blue-gray-500">
                                                    {scenario.steps.length} steps • Created {new Date(scenario.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="text"
                                                    onClick={() => loadScenario(scenario)}
                                                >
                                                    Load
                                                </Button>
                                                <IconButton
                                                    size="sm"
                                                    variant="text"
                                                    color="red"
                                                    onClick={() => deleteScenario(scenario.id)}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </IconButton>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Step Editor Dialog */}
            <Dialog open={showStepEditor} handler={() => setShowStepEditor(false)} size="xl">
                <DialogHeader className="flex items-center justify-between">
                    <Typography variant="h4">
                        Edit Step: {editingStep?.name}
                    </Typography>
                </DialogHeader>
                <DialogBody className="max-h-[70vh] overflow-y-auto">
                    {editingStep && (
                        <div className="space-y-4">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Step Name"
                                    value={editingStep.name}
                                    onChange={(e) => setEditingStep({ ...editingStep, name: e.target.value })}
                                />
                                <Select 
                                    label="Method"
                                    value={editingStep.method} 
                                    onChange={(val) => setEditingStep({ ...editingStep, method: val })}
                                >
                                    {HTTP_METHODS.map((method) => (
                                        <Option key={method} value={method}>{method}</Option>
                                    ))}
                                </Select>
                            </div>

                            <Input
                                label="URL (use {{variableName}} for variables)"
                                value={editingStep.url}
                                onChange={(e) => setEditingStep({ ...editingStep, url: e.target.value })}
                            />

                            {/* Headers */}
                            <div>
                                <Typography variant="h6" className="mb-2">Headers</Typography>
                                <div className="space-y-2">
                                    {editingStep.headers.map((header) => (
                                        <div key={header.id} className="grid grid-cols-5 gap-2">
                                            <Input
                                                placeholder="Header Name"
                                                value={header.key}
                                                onChange={(e) => {
                                                    const newHeaders = editingStep.headers.map(h => 
                                                        h.id === header.id ? { ...h, key: e.target.value } : h
                                                    );
                                                    setEditingStep({ ...editingStep, headers: newHeaders });
                                                }}
                                                size="sm"
                                            />
                                            <div className="col-span-3">
                                                <Input
                                                    placeholder="Header Value"
                                                    value={header.value}
                                                    onChange={(e) => {
                                                        const newHeaders = editingStep.headers.map(h => 
                                                            h.id === header.id ? { ...h, value: e.target.value } : h
                                                        );
                                                        setEditingStep({ ...editingStep, headers: newHeaders });
                                                    }}
                                                    size="sm"
                                                />
                                            </div>
                                            <IconButton
                                                size="sm"
                                                variant="text"
                                                color="red"
                                                onClick={() => {
                                                    const newHeaders = editingStep.headers.filter(h => h.id !== header.id);
                                                    setEditingStep({ ...editingStep, headers: newHeaders });
                                                }}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </IconButton>
                                        </div>
                                    ))}
                                    <Button
                                        size="sm"
                                        variant="text"
                                        onClick={() => {
                                            const newHeader = { key: '', value: '', id: Date.now() };
                                            setEditingStep({ 
                                                ...editingStep, 
                                                headers: [...editingStep.headers, newHeader] 
                                            });
                                        }}
                                        className="w-full"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        Add Header
                                    </Button>
                                </div>
                            </div>

                            {/* Body */}
                            {['POST', 'PUT', 'PATCH'].includes(editingStep.method) && (
                                <div>
                                    <Typography variant="h6" className="mb-2">Request Body</Typography>
                                    <Textarea
                                        placeholder='{"key": "{{variableName}}"}'
                                        value={editingStep.body}
                                        onChange={(e) => setEditingStep({ ...editingStep, body: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                            )}

                            {/* Variables to Save */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Typography variant="h6">Save Variables</Typography>
                                    <Button size="sm" variant="text" onClick={addVariable}>
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        Add Variable
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {editingStep.saveVariables.map((variable) => (
                                        <div key={variable.id} className="grid grid-cols-5 gap-2">
                                            <Input
                                                placeholder="Variable Name"
                                                value={variable.name}
                                                onChange={(e) => updateVariable(variable.id, { name: e.target.value })}
                                                size="sm"
                                            />
                                            <div className="col-span-3">
                                                <Input
                                                    placeholder="JSON Path (e.g., data.user.id)"
                                                    value={variable.jsonPath}
                                                    onChange={(e) => updateVariable(variable.id, { jsonPath: e.target.value })}
                                                    size="sm"
                                                />
                                            </div>
                                            <IconButton
                                                size="sm"
                                                variant="text"
                                                color="red"
                                                onClick={() => removeVariable(variable.id)}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </IconButton>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Validations */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Typography variant="h6">Validations</Typography>
                                    <Button size="sm" variant="text" onClick={addValidation}>
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        Add Validation
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {editingStep.validations.map((validation) => (
                                        <div key={validation.id} className="grid grid-cols-6 gap-2">
                                            <Select
                                                value={validation.type}
                                                onChange={(val) => updateValidation(validation.id, { type: val })}
                                                size="sm"
                                            >
                                                <Option value="statusCode">Status Code</Option>
                                                <Option value="jsonField">JSON Field</Option>
                                                <Option value="responseTime">Response Time</Option>
                                            </Select>
                                            
                                            {validation.type === 'jsonField' && (
                                                <Input
                                                    placeholder="Field Path"
                                                    value={validation.field}
                                                    onChange={(e) => updateValidation(validation.id, { field: e.target.value })}
                                                    size="sm"
                                                />
                                            )}
                                            
                                            <Select
                                                value={validation.operator}
                                                onChange={(val) => updateValidation(validation.id, { operator: val })}
                                                size="sm"
                                            >
                                                <Option value="equals">Equals</Option>
                                                <Option value="contains">Contains</Option>
                                                <Option value="exists">Exists</Option>
                                                <Option value="lessThan">Less Than</Option>
                                                <Option value="greaterThan">Greater Than</Option>
                                            </Select>
                                            
                                            {validation.operator !== 'exists' && (
                                                <Input
                                                    placeholder="Expected Value"
                                                    value={validation.expectedValue}
                                                    onChange={(e) => updateValidation(validation.id, { expectedValue: e.target.value })}
                                                    size="sm"
                                                />
                                            )}
                                            
                                            <IconButton
                                                size="sm"
                                                variant="text"
                                                color="red"
                                                onClick={() => removeValidation(validation.id)}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </IconButton>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogBody>
                <DialogFooter className="gap-2">
                    <Button variant="text" onClick={() => setShowStepEditor(false)}>
                        Cancel
                    </Button>
                    <Button color="blue" onClick={saveStepEdits}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}