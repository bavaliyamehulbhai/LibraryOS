import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { registerUser } from "../../redux/features/auth/authThunks";
import { useAuth } from "../../hooks/useAuth";
import AuthCard from "../../components/auth/AuthCard";
import Input from "../../components/common/Input";
import api from "../../services/api";

const Register = () => {
  const { isAuthenticated, loading } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [libraries, setLibraries] = useState([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        const response = await api.get('/public/libraries');
        if (response.data && response.data.success) {
          setLibraries(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load libraries");
      }
    };
    fetchLibraries();
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const onSubmit = async (data) => {
    try {
      const resultAction = await dispatch(registerUser(data));
      if (registerUser.fulfilled.match(resultAction)) {
        toast.success("Registration Successful");
        navigate("/dashboard");
      } else {
        toast.error(resultAction.payload || "Registration Failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <AuthCard title="Register for an account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name"
          placeholder="Full Name"
          {...register("name", { required: "Name is required" })}
          error={errors.name}
        />

        <Input
          label="Email"
          type="email"
          placeholder="Email address"
          {...register("email", { required: "Email is required" })}
          error={errors.email}
        />
        
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })}
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

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm Password"
          {...register("confirmPassword", { 
            validate: value => value === watch("password") || "Passwords do not match" 
          })}
          error={errors.confirmPassword}
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Library
          </label>
          <select
            className={`appearance-none block w-full px-3 py-2.5 border rounded-lg shadow-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 dark:focus:ring-indigo-500/50 dark:focus:border-indigo-500 transition-colors duration-200 sm:text-sm ${
              errors.libraryId ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
            }`}
            {...register("libraryId", { required: "Library is required" })}
          >
            <option value="">Select a library</option>
            {libraries.map(lib => (
              <option key={lib._id} value={lib._id}>{lib.name}</option>
            ))}
          </select>
          {errors.libraryId && (
            <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.libraryId.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Role
          </label>
          <select
            className={`appearance-none block w-full px-3 py-2.5 border rounded-lg shadow-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 dark:focus:ring-indigo-500/50 dark:focus:border-indigo-500 transition-colors duration-200 sm:text-sm ${
              errors.role ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
            }`}
            {...register("role", { required: "Role is required" })}
          >
            <option value="">Select a role</option>
            <option value="LIBRARIAN">LIBRARIAN</option>
            <option value="ASSISTANT">ASSISTANT</option>
            <option value="STUDENT">STUDENT</option>
          </select>
          {errors.role && (
            <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.role.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-[10px] shadow-sm text-sm font-semibold text-white dark:text-black bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-colors mt-6"
        >
          {loading ? "Registering..." : "Create Account"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-center">
        <p className="text-[13px] text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-black dark:text-white hover:underline transition-all">
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
};

export default Register;
