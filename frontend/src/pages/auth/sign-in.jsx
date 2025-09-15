import { useState } from "react";
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import authService from "@/services/authService";
import userService from "@/services/userService";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

export function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/dashboard/home";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      await authService.login(String(email), String(password));
      await userService.getCurrentUser();
      navigate(from, { replace: true });
    } catch (err) {
      if (err?.status === 404) {
        setError('Invalid email or password');
      } else {
        setError("");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (result) => {
    setLoading(true);
    setError("");
    try {
      await userService.getCurrentUser();
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Navigation error after Google login:', err);
      setError("Failed to login with Google. The email might already be registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Sign In</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Enter your email and password to Sign In.</Typography>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Email
            </Typography>
            <Input
              name="email"
              type="email"
              size="lg"
              placeholder="example@mail.com"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.form?.requestSubmit(); }}
            />
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Password
            </Typography>
            <Input
              name="password"
              type="password"
              size="lg"
              placeholder="********"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.form?.requestSubmit(); }}
              onChange={(e) => {setError("")}}
            />
            {error && (
              <Typography variant="small" color="red" className="mt-0 text-left font-bold">
                {error}
              </Typography>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 mt-6">
            <Checkbox
              defaultChecked
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
            <Typography variant="small" className="font-medium text-gray-900">
              <a href="#">
                Forgot Password
              </a>
            </Typography>
          </div>
          <Button 
            type="submit"
            className="mt-6" 
            fullWidth
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
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
            Not registered?
            <Link to="/auth/sign-up" className="text-gray-900 ml-1">Create account</Link>
          </Typography>
        </form>

      </div>
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>

    </section>
  );
}

export default SignIn;
