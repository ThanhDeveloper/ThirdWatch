import { useState } from "react";
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import authService from "@/services/authService";
import userService from "@/services/userService";


export function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleRegister = async (e) => {
    e.preventDefault();
    // Will be implemented when backend endpoint is ready
  };
  
  const handleGoogleLoginSuccess = async (result) => {
    setLoading(true);
    setError("");
    try {
      await userService.getCurrentUser();
      navigate("/dashboard/home", { replace: true });
    } catch (err) {
      setError("Failed to login with Google. The email might already be registered.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <section className="m-8 flex">
            <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Join Us Today</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Enter your email and password to register.</Typography>
        </div>
        <form onSubmit={handleRegister} className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
            Email
            </Typography>
            <Input
              size="lg"
              placeholder="name@mail.com"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>
          <Checkbox
            label={
              <Typography
                variant="small"
                color="gray"
                className="flex items-center justify-start font-medium"
              >
                I agree the&nbsp;
                <a
                  href="#"
                  className="font-normal text-black transition-colors hover:text-gray-900 underline"
                >
                  Terms and Conditions
                </a>
              </Typography>
            }
            containerProps={{ className: "-ml-2.5" }}
          />
          {error && (
              <Typography variant="small" color="red" className="mt-2 text-left font-bold">
                {error}
              </Typography>
            )}
          <Button 
            type="submit" 
            className="mt-6" 
            fullWidth
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register Now'}
          </Button>

          <div className="space-y-4 mt-8">
            <div className="flex items-center justify-center">
              <span className="text-center text-gray-900 font-medium">Or</span>
            </div>
            <GoogleLoginButton 
              onSuccess={handleGoogleLoginSuccess}
              onError={() => setError("Failed to login with Google. The email might already be registered.")}
              disabled={loading}
            />
          </div>
          <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
            Already have an account?
            <Link to="/auth/sign-in" className="text-gray-900 ml-1">Sign in</Link>
          </Typography>
        </form>

      </div>
    </section>
  );
}

export default SignUp;
