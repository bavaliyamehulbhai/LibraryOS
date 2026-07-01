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
            className="absolute right-3 top-9 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Library
          </label>
          <select
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.libraryId ? 'border-red-300' : 'border-gray-300'
            }`}
            {...register("libraryId", { required: "Library is required" })}
          >
            <option value="">Select a library</option>
            {libraries.map(lib => (
              <option key={lib._id} value={lib._id}>{lib.name}</option>
            ))}
          </select>
          {errors.libraryId && (
            <p className="mt-2 text-sm text-red-600">{errors.libraryId.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.role ? 'border-red-300' : 'border-gray-300'
            }`}
            {...register("role", { required: "Role is required" })}
          >
            <option value="">Select a role</option>
            <option value="LIBRARIAN">LIBRARIAN</option>
            <option value="ASSISTANT">ASSISTANT</option>
            <option value="STUDENT">STUDENT</option>
          </select>
          {errors.role && (
            <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Login
          </Link>
        </p>
      </div>
    </AuthCard>
  );
};

export default Register;
