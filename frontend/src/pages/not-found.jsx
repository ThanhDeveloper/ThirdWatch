import { Button } from '@material-tailwind/react';
import { HomeIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

/**
 * 404 Not Found page component
 */
const NotFound = () => {
  return (
    <div className="min-h-screen bg-blue-gray-50/50 flex items-center justify-center px-4">
      <div className="text-center w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-6xl md:text-9xl font-bold text-blue-gray-900 mb-4">404</h1>
          <h2 className="text-xl md:text-3xl font-semibold text-blue-gray-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-blue-gray-600 text-sm md:text-lg mb-8">
            The page you are looking for doesn't exist or has been moved to another location.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="filled"
            color="blue"
            size="lg"
            className="flex items-center gap-2"
            onClick={() => window.history.back()}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Go Back
          </Button>
          
          <Link to="/dashboard/home">
            <Button
              variant="outlined"
              color="blue"
              size="lg"
              className="flex items-center gap-2"
            >
              <HomeIcon className="w-5 h-5" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
