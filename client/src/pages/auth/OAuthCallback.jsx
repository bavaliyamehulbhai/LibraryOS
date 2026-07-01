import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setOAuthTokens } from "../../redux/features/auth/authSlice";
import { getCurrentUser } from "../../redux/features/auth/authThunks";

const OAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const refreshToken = params.get("refreshToken");

    if (token && refreshToken) {
      // Save tokens to Redux and LocalStorage
      dispatch(setOAuthTokens({ token, refreshToken }));
      
      // Fetch the user's details using the new token
      dispatch(getCurrentUser()).then(() => {
        navigate("/dashboard", { replace: true });
      });
    } else {
      navigate("/login?error=OAuthFailed", { replace: true });
    }
  }, [location, dispatch, navigate]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
