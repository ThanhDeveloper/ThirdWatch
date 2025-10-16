import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
  Alert,
  IconButton,
} from "@material-tailwind/react";
import {
  PlusIcon,
  XMarkIcon,
  GlobeAltIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import MockDataService from '@/services/mockDataService';

const SITE_TYPES = [
  { value: 'website', label: 'Website', icon: GlobeAltIcon },
  { value: 'api', label: 'API Endpoint', icon: GlobeAltIcon },
  { value: 'server', label: 'Server', icon: GlobeAltIcon },
];

const CHECK_INTERVALS = [
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
  { value: 600, label: '10 minutes' },
  { value: 1800, label: '30 minutes' },
  { value: 3600, label: '1 hour' },
];

export function SiteManager({ userSites = [], onSitesUpdated, onClose }) {
  const [sites, setSites] = useState(userSites);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'website',
    interval: 300,
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Site name is required';
    }
    
    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'Please enter a valid URL';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const newSite = {
        id: editingSite?.id || Date.now(),
        name: formData.name.trim(),
        url: formData.url.trim(),
        type: formData.type,
        interval: formData.interval,
        description: formData.description.trim(),
        createdAt: editingSite?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      };

      if (editingSite) {
        // Update existing site using MockDataService
        const updatedSite = MockDataService.updateUserSite(editingSite.id, {
          name: formData.name.trim(),
          url: formData.url.trim(),
          type: formData.type,
          interval: formData.interval,
          description: formData.description.trim()
        });
        
        if (updatedSite) {
          const updatedSites = sites.map(site => 
            site.id === editingSite.id ? updatedSite : site
          );
          setSites(updatedSites);
        }
      } else {
        // Add new site using MockDataService
        const newSite = MockDataService.addUserSite({
          name: formData.name.trim(),
          url: formData.url.trim(),
          type: formData.type,
          interval: formData.interval,
          description: formData.description.trim()
        });
        
        setSites(prev => [...prev, newSite]);
      }

      // Reset form
      setFormData({
        name: '',
        url: '',
        type: 'website',
        interval: 300,
        description: ''
      });
      setShowAddModal(false);
      setEditingSite(null);
      setErrors({});
      
      // Notify parent component with updated sites from MockDataService
      if (onSitesUpdated) {
        onSitesUpdated(MockDataService.getUserSites());
      }
    } catch (error) {
      console.error('Error saving site:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (site) => {
    setFormData({
      name: site.name,
      url: site.url,
      type: site.type,
      interval: site.interval,
      description: site.description || ''
    });
    setEditingSite(site);
    setShowAddModal(true);
  };

  const handleDelete = (siteId) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      // Delete using MockDataService
      MockDataService.deleteUserSite(siteId);
      const updatedSites = sites.filter(site => site.id !== siteId);
      setSites(updatedSites);
      
      if (onSitesUpdated) {
        onSitesUpdated(MockDataService.getUserSites());
      }
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingSite(null);
    setFormData({
      name: '',
      url: '',
      type: 'website',
      interval: 300,
      description: ''
    });
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader variant="gradient" color="blue-gray" className="mb-4 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GlobeAltIcon className="h-6 w-6 text-white" />
              <div>
                <Typography variant="h5" color="white" className="font-bold">
                  Site Management
                </Typography>
                <Typography variant="small" color="white" className="opacity-90">
                  Add and manage websites for health monitoring
                </Typography>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="filled"
                color="white"
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="text-blue-gray-700 flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Site</span>
              </Button>
              
              {onClose && (
                <IconButton
                  variant="text"
                  color="white"
                  size="sm"
                  onClick={onClose}
                >
                  <XMarkIcon className="h-5 w-5" />
                </IconButton>
              )}
            </div>
          </div>
        </CardHeader>

        <CardBody className="px-6">
          {sites.length === 0 ? (
            <div className="text-center py-12">
              <GlobeAltIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <Typography variant="h6" className="text-gray-600 mb-2">
                No sites added yet
              </Typography>
              <Typography variant="small" className="text-gray-500 mb-6">
                Add your first website or API endpoint to start monitoring
              </Typography>
              <Button
                variant="gradient"
                color="blue"
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 mx-auto"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Your First Site</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sites.map((site) => (
                <Card key={site.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Typography variant="h6" className="text-gray-900 mb-1 font-semibold">
                          {site.name}
                        </Typography>
                        <Typography variant="small" className="text-gray-600 break-all">
                          {site.url}
                        </Typography>
                      </div>
                      
                      <div className="flex space-x-1 ml-2">
                        <IconButton
                          variant="text"
                          color="blue"
                          size="sm"
                          onClick={() => handleEdit(site)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          variant="text"
                          color="red"
                          size="sm"
                          onClick={() => handleDelete(site.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">{site.type}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Check Interval:</span>
                        <span className="font-medium">
                          {CHECK_INTERVALS.find(i => i.value === site.interval)?.label || `${site.interval}s`}
                        </span>
                      </div>
                      {site.description && (
                        <div className="text-sm">
                          <span className="text-gray-600">Description:</span>
                          <p className="text-gray-700 mt-1">{site.description}</p>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Site Modal */}
      <Dialog open={showAddModal} handler={handleCloseModal} size="md">
        <DialogHeader className="flex items-center justify-between">
          <Typography variant="h5" className="font-bold">
            {editingSite ? 'Edit Site' : 'Add New Site'}
          </Typography>
          <IconButton variant="text" color="blue-gray" onClick={handleCloseModal}>
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            {/* Site Name */}
            <div>
              <Typography variant="small" className="font-medium text-gray-700 mb-2">
                Site Name *
              </Typography>
              <Input
                size="lg"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., My Company Website"
                error={!!errors.name}
              />
              {errors.name && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.name}
                </Typography>
              )}
            </div>

            {/* URL */}
            <div>
              <Typography variant="small" className="font-medium text-gray-700 mb-2">
                URL *
              </Typography>
              <Input
                size="lg"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com"
                error={!!errors.url}
              />
              {errors.url && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.url}
                </Typography>
              )}
            </div>

            {/* Type */}
            <div>
              <Typography variant="small" className="font-medium text-gray-700 mb-2">
                Type
              </Typography>
              <Select
                size="lg"
                value={formData.type}
                onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                {SITE_TYPES.map((type) => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Check Interval */}
            <div>
              <Typography variant="small" className="font-medium text-gray-700 mb-2">
                Check Interval
              </Typography>
              <Select
                size="lg"
                value={formData.interval.toString()}
                onChange={(value) => setFormData(prev => ({ ...prev, interval: parseInt(value) }))}
              >
                {CHECK_INTERVALS.map((interval) => (
                  <Option key={interval.value} value={interval.value.toString()}>
                    {interval.label}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Description */}
            <div>
              <Typography variant="small" className="font-medium text-gray-700 mb-2">
                Description (Optional)
              </Typography>
              <Input
                size="lg"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this site..."
              />
            </div>

            <Alert icon={<ExclamationTriangleIcon className="h-5 w-5" />} className="border-l-4 border-amber-500">
              <Typography variant="small" className="font-medium">
                Note: Sites will be checked from our servers at the specified intervals. 
                Make sure the URLs are publicly accessible.
              </Typography>
            </Alert>
          </DialogBody>

          <DialogFooter className="space-x-2">
            <Button
              variant="text"
              color="blue-gray"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              color="blue"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingSite ? 'Update Site' : 'Add Site')}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}

export default SiteManager;