import { Button } from "@material-tailwind/react";
import { GoogleLogin } from '@react-oauth/google';
import PropTypes from 'prop-types';
import authService from '@/services/authService';

export function GoogleLoginButton({ onSuccess, onError, buttonText = "Sign in With Google", disabled = false, className = "" }) {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await authService.handleGoogleCallback(credentialResponse);
      
      if (result.success) {
        if (onSuccess) onSuccess(result);
      } else {
        if (onError) onError(result.message || 'Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      if (onError) onError(error.response?.data?.message || error.message || 'Google login failed');
    }
  };

  const handleGoogleError = () => {
    console.error('Google OAuth error');
    if (onError) onError('Failed to login with Google. The email might already be registered.');
  };

  return (
    <div className={className} style={{ width: '100%' }}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        theme="outline"
        size="large"
        width="100%"
        text="signin_with"
        shape="rectangular"
        disabled={disabled}
        logo_alignment="center"
      />
    </div>
  );
}

GoogleLoginButton.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  buttonText: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default GoogleLoginButton;