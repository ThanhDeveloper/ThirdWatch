import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@material-tailwind/react';
import { ClipboardDocumentIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

/**
 * Reusable copy to clipboard button component
 * 
 * @param {Object} props - Component props
 * @param {string|string[]} props.content - Content to copy (string or array of strings)
 * @param {string} [props.successMessage='Copied to clipboard!'] - Success message to show in toast
 * @param {string} [props.variant='outlined'] - Button variant (outlined, filled, text, gradient)
 * @param {string} [props.color='blue'] - Button color
 * @param {string} [props.size='md'] - Button size (sm, md, lg)
 * @param {boolean} [props.isIcon=false] - Whether to show only the icon without text
 * @param {boolean} [props.isMultiple=false] - Whether content is multiple items (will join with newlines)
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {React.ReactNode} [props.children] - Button label text (defaults to "Copy")
 */
function CopyButton({ 
  content,
  successMessage = 'Copied to clipboard!',
  variant = 'outlined',
  color = 'blue',
  size = 'md',
  isIcon = false,
  isMultiple = false,
  className = '',
  children,
}) {
  const [copying, setCopying] = useState(false);

  const handleCopy = async () => {
    if (!content) return;
    
    try {
      setCopying(true);
      const textToCopy = isMultiple ? Array.isArray(content) ? content.join('\n') : content : content;
      await navigator.clipboard.writeText(textToCopy);
      toast.success(successMessage);
    } catch (err) {
      toast.error('Failed to copy');
    } finally {
      setCopying(false);
    }
  };

  // Determine which icon to use
  const IconComponent = isMultiple ? DocumentDuplicateIcon : ClipboardDocumentIcon;

  if (isIcon) {
    return (
      <Button 
        size={size}
        variant={variant}
        color={color}
        onClick={handleCopy}
        disabled={!content || copying}
        className={`flex items-center justify-center ${className}`}
      >
        <IconComponent className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button 
      size={size}
      variant={variant}
      color={color}
      onClick={handleCopy}
      disabled={!content || copying}
      className={`flex items-center justify-center gap-1 ${className}`}
    >
      <IconComponent className="h-4 w-4" />
      {children || (isMultiple ? 'Copy All' : 'Copy')}
    </Button>
  );
}

CopyButton.propTypes = {
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]).isRequired,
  successMessage: PropTypes.string,
  variant: PropTypes.oneOf(['outlined', 'filled', 'text', 'gradient']),
  color: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  isIcon: PropTypes.bool,
  isMultiple: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default CopyButton;