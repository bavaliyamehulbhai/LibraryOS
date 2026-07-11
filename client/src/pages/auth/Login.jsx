import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Navigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { startAuthentication } from "@simplewebauthn/browser";
import { loginUser, requestOtpLogin } from "../../redux/features/auth/authThunks";
import { getPasskeyLoginOptions, verifyPasskeyLogin } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import AuthCard from "../../components/auth/AuthCard";
import Input from "../../components/common/Input";

const Login = () => {
  const { isAuthenticated, loading, requires2FA } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("error") === "OAuthFailed") {
      toast.error("OAuth Login Failed. Ensure your account exists or you have an invitation.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search]);

  const { register, handleSubmit, formState: { errors } } = useForm();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  if (requires2FA) {
    return <Navigate to="/verify-otp" />;
  }

  const onSubmit = async (data) => {
    try {
      const resultAction = await dispatch(loginUser(data));
      if (loginUser.fulfilled.match(resultAction)) {
        toast.success("Login Successful");
        navigate("/dashboard");
      } else {
        toast.error(resultAction.payload || "Invalid Credentials");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleEmailOtpLogin = async () => {
    const email = document.getElementById("email").value;
    if (!email) {
      toast.error("Please enter your email first to receive an OTP");
      return;
    }
    
    try {
      const resultAction = await dispatch(requestOtpLogin({ email }));
      if (requestOtpLogin.fulfilled.match(resultAction)) {
        toast.success("OTP sent to your email!");
      } else {
        toast.error(resultAction.payload || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handlePasskeyLogin = async () => {
    const email = document.getElementById("email").value;
    if (!email) {
      toast.error("Please enter your email first to use Passkey");
      return;
    }
    
    try {
      const optionsRes = await getPasskeyLoginOptions({ email });
      const options = optionsRes.data.options;

      const asseResp = await startAuthentication(options);
      
      const verificationRes = await verifyPasskeyLogin({ email, response: asseResp });
      if (verificationRes.data.success) {
        toast.success("Login Successful");
        // We could dispatch a custom action here or just reload since token is handled in backend
        // Ideally, we have a thunk for passkeyLogin, but for MVP we manually set it
        localStorage.setItem("token", verificationRes.data.token);
        localStorage.setItem("refreshToken", verificationRes.data.refreshToken);
        window.location.href = "/dashboard";
      }
    } catch (error) {
      if (error.name === "NotAllowedError") {
        toast.error("Passkey login cancelled.");
      } else {
        toast.error(error.response?.data?.message || "Failed to login with passkey.");
      }
    }
  };

  return (
    <AuthCard 
      title="Welcome back" 
      subtitle="Enter your credentials to access the LibraryOS dashboard."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          {...register("email", { required: "Email is required" })}
          error={errors.email}
        />
        
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            {...register("password", { required: "Password is required" })}
            error={errors.password}
          />
          <button
            type="button"
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-[10px] shadow-sm text-sm font-semibold text-white dark:text-black bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-colors"
        >
          {loading ? "Authenticating..." : "Sign in"}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-[13px]">
            <span className="px-4 bg-white dark:bg-[#111111] text-gray-500">Or</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div>
            <a
              href={`${import.meta.env.VITE_API_URL || '/api'}/v1/oauth/google`}
              className="w-full h-full flex items-center justify-center py-2.5 px-4 border border-gray-200 dark:border-gray-700/50 rounded-[10px] shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <svg className="w-4 h-4 mr-2 grayscale opacity-70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </a>
          </div>
          <div>
            <button
              type="button"
              onClick={handleEmailOtpLogin}
              className="w-full flex flex-col items-center justify-center py-1.5 px-4 border border-gray-200 dark:border-gray-700/50 rounded-[10px] shadow-sm text-[13px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <span>Email OTP</span>
              <span className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">Needs Email</span>
            </button>
          </div>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={handlePasskeyLogin}
            className="w-full flex items-center justify-between py-2.5 px-4 border border-gray-200 dark:border-gray-700/50 rounded-[10px] shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <span>Sign in with Passkey</span>
            <span className="text-lg">👋</span>
          </button>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[13px] text-gray-500 dark:text-gray-400">
          New here?{" "}
          <Link to="/register" className="font-semibold text-black dark:text-white hover:underline transition-all">
            Create account
          </Link>
        </p>
        <div className="flex items-center gap-3">
          <Link to="/portal" className="text-[12px] font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors">
            Public Portal
          </Link>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <Link to="/onboarding" className="text-[12px] font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors">
            Setup Library
          </Link>
        </div>
      </div>
    </AuthCard>
  );
};

export default Login;
