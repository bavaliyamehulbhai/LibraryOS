import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Navigate, Link } from "react-router-dom";
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
  const [showPassword, setShowPassword] = useState(false);

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
        toast.error("Failed to login with passkey.");
      }
    }
  };

  return (
    <AuthCard 
      title="Welcome back" 
      subtitle="Enter your credentials to access the LibraryOS dashboard."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            className="absolute right-3 top-9 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:shadow-none transition-all duration-200 transform hover:-translate-y-0.5"
        >
          {loading ? "Authenticating..." : "Sign in to Dashboard"}
        </button>
      </form>

      <div className="mt-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <a
            href="/api/v1/oauth/google"
            className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Google
          </a>
          <button
            type="button"
            onClick={handleEmailOtpLogin}
            className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Email OTP
          </button>
        </div>

        <button
          type="button"
          onClick={handlePasskeyLogin}
          className="mt-4 w-full flex justify-center py-2.5 px-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Sign in with Passkey / Biometrics
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
            Create one now
          </Link>
        </p>
      </div>
      <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
        <Link to="/portal" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
          <span className="text-xl">📚</span> Browse Public Catalog
        </Link>
      </div>
    </AuthCard>
  );
};

export default Login;
