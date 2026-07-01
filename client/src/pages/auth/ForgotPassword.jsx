import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import AuthCard from "../../components/auth/AuthCard";
import Input from "../../components/common/Input";
import { forgotPassword } from "../../services/authService";

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await forgotPassword(data);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Reset Password">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          {...register("email", { required: "Email is required" })}
          error={errors.email}
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="font-medium text-sm text-blue-600 hover:text-blue-500">
          Back to Login
        </Link>
      </div>
    </AuthCard>
  );
};

export default ForgotPassword;
