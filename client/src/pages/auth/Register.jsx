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

        <div className="mb-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Library Tenant
          </label>
          <div className="relative">
            <select
              className={`appearance-none block w-full px-3.5 py-2.5 border rounded-xl shadow-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all ${
                errors.libraryId ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
              }`}
              {...register("libraryId", { required: "Library is required" })}
            >
              <option value="">Select a library</option>
              {libraries.map(lib => (
                <option key={lib._id} value={lib._id}>{lib.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
            </div>
          </div>
          {errors.libraryId && (
            <p className="mt-1 text-xs text-rose-500">{errors.libraryId.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Assigned Role
          </label>
          <div className="relative">
            <select
              className={`appearance-none block w-full px-3.5 py-2.5 border rounded-xl shadow-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all ${
                errors.role ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
              }`}
              {...register("role", { required: "Role is required" })}
            >
              <option value="">Select a role</option>
              <option value="LIBRARIAN">LIBRARIAN</option>
              <option value="ASSISTANT">ASSISTANT</option>
              <option value="STUDENT">STUDENT</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
            </div>
          </div>
          {errors.role && (
            <p className="mt-1 text-xs text-rose-500">{errors.role.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl shadow-md shadow-indigo-600/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all mt-4"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Registering...</span>
            </div>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
};

export default Register;
