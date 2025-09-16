import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@material-tailwind/react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

/**
 * Reusable download button component
 * 
 * @param {Object} props - Component props
 * @param {string|Blob} props.content - Content to download (string or Blob)
 * @param {string} props.fileName - File name to download as
 * @param {string} [props.mimeType='text/plain;charset=utf-8'] - MIME type of the file
 * @param {string} [props.successMessage] - Success message to show in toast (none shown if omitted)
 * @param {string} [props.variant='outlined'] - Button variant (outlined, filled, text, gradient)
 * @param {string} [props.color='blue'] - Button color
 * @param {string} [props.size='md'] - Button size (sm, md, lg)
 * @param {boolean} [props.isIcon=false] - Whether to show only the icon without text
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {React.ReactNode} [props.children] - Button label text (defaults to "Download")
 */
function DownloadButton({
  content,
  fileName,
  mimeType = 'text/plain;charset=utf-8',
  successMessage,
  variant = 'outlined',
  color = 'blue',
  size = 'md',
  isIcon = false,
  className = '',
  children,
}) {
  const handleDownload = () => {
    if (!content) return;
    
    try {
      // Create blob from content
      const blob = content instanceof Blob 
        ? content 
        : new Blob([content], { type: mimeType });
        
      // Create download link and trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      a.click();
      
      // Clean up URL object
      URL.revokeObjectURL(url);
      
      if (successMessage) {
        toast.success(successMessage);
      }
    } catch (err) {
      toast.error('Download failed');
    }
  };

  if (isIcon) {
    return (
      <Button
        size={size}
        variant={variant}
        color={color}
        onClick={handleDownload}
        disabled={!content}
        className={`flex items-center justify-center ${className}`}
      >
        <ArrowDownTrayIcon className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      color={color}
      onClick={handleDownload}
      disabled={!content}
      className={`flex items-center justify-center gap-1 ${className}`}
    >
      <ArrowDownTrayIcon className="h-4 w-4" />
      {children || 'Download'}
    </Button>
  );
}

DownloadButton.propTypes = {
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Blob),
  ]).isRequired,
  fileName: PropTypes.string.isRequired,
  mimeType: PropTypes.string,
  successMessage: PropTypes.string,
  variant: PropTypes.oneOf(['outlined', 'filled', 'text', 'gradient']),
  color: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  isIcon: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default DownloadButton;