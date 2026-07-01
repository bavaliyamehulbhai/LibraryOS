import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { startRegistration } from "@simplewebauthn/browser";
import { setup2FA, verify2FASetup, getPasskeyRegisterOptions, verifyPasskeyRegistration } from "../../services/authService";
import { getCurrentUser } from "../../redux/features/auth/authThunks";

const SecurityCenter = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const [setupData, setSetupData] = useState(null);
  const [token, setToken] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleSetup2FA = async () => {
    try {
      setIsSettingUp(true);
      const res = await setup2FA();
      setSetupData(res.data);
    } catch (error) {
      toast.error("Failed to setup 2FA");
      setIsSettingUp(false);
    }
  };

  const handleVerify2FA = async () => {
    try {
      await verify2FASetup({ token });
      toast.success("Google Authenticator Enabled Successfully!");
      setSetupData(null);
      setToken("");
      dispatch(getCurrentUser()); // Refresh user state
    } catch (error) {
      toast.error("Invalid token. Please try again.");
    }
  };

  const handleRegisterPasskey = async () => {
    try {
      const optionsRes = await getPasskeyRegisterOptions();
      const options = optionsRes.data.options;

      const attResp = await startRegistration(options);
      
      await verifyPasskeyRegistration(attResp);
      toast.success("Passkey registered successfully!");
      dispatch(getCurrentUser());
    } catch (error) {
      if (error.name === "NotAllowedError") {
        toast.error("Passkey registration cancelled.");
      } else {
        console.error("Passkey Error:", error);
        toast.error(error.response?.data?.message || error.message || "Failed to register passkey. Ensure your device supports it.");
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Security Center</h1>
      <p className="text-gray-600">Manage your account security, two-factor authentication, and active sessions.</p>

      {/* Two-Factor Authentication */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Two-Factor Authentication (TOTP)</h2>
            <p className="text-sm text-gray-500">Protect your account using Google Authenticator.</p>
          </div>
          {user?.twoFactorEnabled && user?.twoFactorMethod === "TOTP" ? (
            <span className="px-4 py-2 rounded-md font-semibold bg-green-100 text-green-700">Enabled</span>
          ) : (
            <button
              onClick={handleSetup2FA}
              className="px-4 py-2 rounded-md font-semibold bg-blue-600 text-white hover:bg-blue-700"
            >
              Setup Authenticator
            </button>
          )}
        </div>
        
        {isSettingUp && setupData && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2">Scan this QR Code</h3>
            <p className="text-sm text-gray-600 mb-4 text-center">Open Google Authenticator and scan the barcode below.</p>
            <img src={setupData.qrCode} alt="2FA QR Code" className="w-48 h-48 mb-4 border p-2 bg-white" />
            <p className="text-xs text-gray-500 mb-4">Secret: {setupData.secret}</p>
            
            <div className="w-full max-w-xs space-y-3">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                maxLength="6"
                className="w-full px-4 py-2 border rounded-md text-center tracking-widest text-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <button 
                onClick={handleVerify2FA}
                disabled={token.length !== 6}
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Verify & Enable
              </button>
              <button 
                onClick={() => { setIsSettingUp(false); setSetupData(null); }}
                className="w-full text-gray-500 py-2 hover:text-gray-700 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* WebAuthn Passkeys */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Passkeys / Biometrics</h2>
            <p className="text-sm text-gray-500">Sign in with FaceID, TouchID, or Windows Hello.</p>
          </div>
          <button
            onClick={handleRegisterPasskey}
            className="px-4 py-2 rounded-md font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Register Passkey
          </button>
        </div>
        
        {user?.passkeys?.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold mb-2">Registered Devices:</p>
            <ul className="space-y-2">
              {user.passkeys.map((pk, idx) => (
                <li key={idx} className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                  Passkey #{idx + 1}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
};

export default SecurityCenter;
