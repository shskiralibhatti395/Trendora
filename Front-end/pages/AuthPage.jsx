import { useState } from "react";
import { useStore } from "../context/StoreContext.jsx";
import { Key, Mail, User, Sparkles, ArrowLeft, RefreshCw, Smartphone, KeyRound, Eye, EyeOff } from "lucide-react";
export const AuthPage = ({ setTab }) => {
  const { login, register, showToast, setUser, setToken } = useStore();
  const [activeMode, setActiveMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [outboxOtp, setOutboxOtp] = useState(null);
  const [outboxEmail, setOutboxEmail] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (activeMode === "admin-login") {
      const trimmedUsername = adminUsername.trim();
      const trimmedPassword = adminPassword.trim();
      if (!trimmedUsername || !trimmedPassword) {
        showToast("Admin Username and Password are required.", "error");
        setLoading(false);
        return;
      }
      const responseStatus = await login(trimmedUsername, trimmedPassword);
      if (responseStatus === true || responseStatus && responseStatus.success) {
        const loggedUser = responseStatus === true ? null : responseStatus.user;
        if (loggedUser && loggedUser.role === "admin") {
          showToast("Administrative authorization granted. Redirecting to console...", "success");
          setTab("admin");
        } else {
          showToast("This account does not have administrative privileges.", "error");
          setTab("home");
        }
      } else {
        showToast("Administrative verification failed. Invalid credentials.", "error");
      }
      setLoading(false);
      return;
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      showToast("Please specify your account email address.", "error");
      setLoading(false);
      return;
    }
    if (activeMode === "login") {
      const trimmedPassword = password.trim();
      if (!trimmedPassword) {
        showToast("Password is required.", "error");
        setLoading(false);
        return;
      }
      const responseStatus = await login(trimmedEmail, trimmedPassword);
      if (responseStatus === true || responseStatus && responseStatus.success) {
        const loggedUser = responseStatus === true ? null : responseStatus.user;
        if (loggedUser && loggedUser.role === "admin") {
          setTab("admin");
        } else {
          setTab("home");
        }
      } else if (responseStatus && responseStatus.verificationPending) {
        setOutboxOtp(responseStatus.otp);
        setOutboxEmail(responseStatus.email);
        setActiveMode("verify-email");
        showToast("Account requires email verification. Simulated OTP code is ready.", "info");
      }
    } else if (activeMode === "register") {
      const trimmedPassword = password.trim();
      if (!trimmedPassword || !name) {
        showToast("Please complete all credential fields.", "error");
        setLoading(false);
        return;
      }
      const responseStatus = await register(name, trimmedEmail, trimmedPassword);
      if (responseStatus === true) {
        setTab("home");
      } else if (responseStatus && responseStatus.verificationRequired) {
        setOutboxOtp(responseStatus.otp);
        setOutboxEmail(responseStatus.email);
        setActiveMode("verify-email");
        showToast("Registration successful! Simulated verification OTP is ready.", "success");
      }
    } else if (activeMode === "forgot") {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmedEmail })
        });
        const data = await res.json();
        if (res.ok) {
          setOutboxOtp(data.otp);
          setOutboxEmail(data.email);
          setActiveMode("reset-password");
          showToast(data.message, "success");
        } else {
          showToast(data.message || "ForgotPassword trigger failed", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to request password reset", "error");
      }
    } else if (activeMode === "reset-password") {
      if (!newPassword) {
        showToast("Please enter a new password.", "error");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: newPassword })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(data.message, "success");
          setActiveMode("login");
          setOtpCode("");
          setNewPassword("");
          setOutboxOtp(null);
        } else {
          showToast(data.message || "Password reset rejected.", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Server error executing reset.", "error");
      }
    } else if (activeMode === "verify-email") {
      if (!otpCode) {
        showToast("Please insert the email verification code.", "error");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/auth/verify-registration-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: outboxEmail || email, otp: otpCode })
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("trendora_token", data.token);
          setToken(data.token);
          setUser(data.user);
          showToast(data.message, "success");
          setTab("home");
        } else {
          showToast(data.message || "Verification rejected", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to complete verification protocol.", "error");
      }
    }
    setLoading(false);
  };
  const handleQuickSignIn = async (role) => {
    setLoading(true);
    const mockEmail = role === "admin" ? "admin@trendora.com" : "user@trendora.com";
    const mockPass = role === "admin" ? "admin123" : "user123";
    setEmail(mockEmail);
    setPassword(mockPass);
    if (role === "admin") {
      const success = await login(mockEmail, mockPass);
      if (success) {
        setTab("admin");
      }
    } else {
      try {
        const setupRes = await fetch("/api/auth/setup-demo-customer", { method: "POST" });
        if (setupRes.ok) {
          const responseStatus = await login(mockEmail, mockPass);
          if (responseStatus && responseStatus.verificationPending) {
            setOutboxOtp(responseStatus.otp);
            setOutboxEmail(responseStatus.email);
            setActiveMode("verify-email");
            showToast("Simulated login OTP code has been sent. Please enter it below to authorize.", "info");
          } else if (responseStatus === true) {
            setTab("home");
          }
        } else {
          showToast("Failed to setup OTP simulation.", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to initialize demo OTP flow.", "error");
      }
    }
    setLoading(false);
  };
  return <div className={`text-neutral-900 dark:text-neutral-100 min-h-[85vh] flex items-center justify-center py-6 sm:py-12 px-4 transition-all duration-300 ${activeMode === "register" ? "bg-neutral-100/90 dark:bg-neutral-950" : "bg-white dark:bg-neutral-900"}`}>
      <style>{`
        /* Exclusive responsive fixes for mobile screens (< 768px) */
        @media (max-width: 767px) {
          .mobile-px-safe {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          .mobile-py-safe {
            padding-top: 1.5rem !important;
            padding-bottom: 1.5rem !important;
          }
          .mobile-stack {
            display: flex !important;
            flex-direction: column !important;
          }
          .mobile-stack > * {
            width: 100% !important;
          }
          .mobile-text-xs {
            font-size: 0.65rem !important;
          }
          .mobile-gap-y-small {
            gap: 0.5rem !important;
          }
        }

        /* Input overrides to ensure 100% visibility in both themes and prevent white hiding */
        input.custom-input {
          background-color: #ededed !important;
          color: #171717 !important;
          border-color: #d4d4d4 !important;
        }
        .dark input.custom-input {
          background-color: #262626 !important;
          color: #f5f5f5 !important;
          border-color: #404040 !important;
        }
        input.custom-input::placeholder {
          color: #737373 !important;
        }
        .dark input.custom-input::placeholder {
          color: #a3a3a3 !important;
        }
        input.custom-input:focus {
          background-color: #e5e5e5 !important;
          color: #171717 !important;
          border-color: #171717 !important;
          outline: none !important;
          box-shadow: 0 0 0 2px rgba(23, 23, 23, 0.4) !important;
        }
        .dark input.custom-input:focus {
          background-color: #1c1c1c !important;
          color: #ffffff !important;
          border-color: #ffffff !important;
          outline: none !important;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4) !important;
        }
      `}</style>
      
      <div className={`max-w-md w-full p-4 sm:p-8 rounded-2xl sm:rounded-3xl border space-y-4 sm:space-y-6 shadow-sm transition-all duration-300 mobile-px-safe mobile-py-safe ${activeMode === "register" ? "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800" : "bg-gray-50/50 dark:bg-neutral-950 border-gray-150 dark:border-neutral-805"}`}>
        
        {
    /* Header graphics and branding */
  }
        <div className="text-center space-y-2">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold font-mono text-[17px] tracking-tighter">
            T
          </div>
          <h2 className="text-2xl font-sans font-bold tracking-tight text-neutral-900 dark:text-white">
            {activeMode === "login" && "Sign In"}
            {activeMode === "register" && "Create Premium Account"}
            {activeMode === "forgot" && "Reset Secure Access"}
            {activeMode === "reset-password" && "Configure New Password"}
            {activeMode === "verify-email" && "Verify Account Email"}
            {activeMode === "admin-login" && "Verify Security Credentials"}
          </h2>
          <p className="text-[11px] text-neutral-450 dark:text-neutral-500 font-medium px-4">
            {activeMode === "login" && "Connect to complete and authorize payment allocations on Trendora."}
            {activeMode === "register" && "Set up bespoke client profiles and unlock express curated vertical dispatch."}
            {activeMode === "forgot" && "Provide your account email address to dispatch a simulated reset OTP."}
            {activeMode === "reset-password" && "Apply verification security parameters to restore session credentials."}
            {activeMode === "verify-email" && "Activate fully verified logistics and safe checkout coordinates."}
            {activeMode === "admin-login" && "Verify administrative security parameters to restore system control credentials."}
          </p>
        </div>

        {
    /* Dynamic Simulated Email Outbox Notification Area */
  }
        {outboxOtp && <div className="bg-amber-500/10 border border-amber-500/20 text-neutral-800 dark:text-amber-100 p-4 rounded-2xl text-[11px] space-y-2 font-mono">
            <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-450 uppercase tracking-wider text-[9.5px]">
              <Sparkles size={11} /> Simulated Email Delivery
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed leading-snug">
              To verify <span className="font-semibold text-neutral-800 dark:text-white">{outboxEmail || email}</span>, input OTP:
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 mobile-stack">
              <span className="text-sm font-black bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-800 tracking-widest select-all inline-block w-fit">
                {outboxOtp}
              </span>
              <span className="text-[9px] text-neutral-400">(Mouseover or double-click to copy code)</span>
            </div>
          </div>}

        {
    /* Dynamic Toggles depending on activeMode */
  }
        {(activeMode === "login" || activeMode === "register") && <div className="flex border-b border-neutral-200 dark:border-neutral-800 text-[11px] sm:text-xs font-bold leading-none">
            <button
    type="button"
    onClick={() => setActiveMode("login")}
    className={`flex-1 py-3 text-center transition relative ${activeMode === "login" ? "text-neutral-900 dark:text-white" : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
  >
              Sign In Existing
              {activeMode === "login" && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-blue-600 dark:bg-blue-500 rounded-full" />}
            </button>
            <button
    type="button"
    onClick={() => setActiveMode("register")}
    className={`flex-1 py-3 text-center transition relative ${activeMode === "register" ? "text-neutral-900 dark:text-white" : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
  >
              Create a New Account
              {activeMode === "register" && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-blue-600 dark:bg-blue-500 rounded-full" />}
            </button>
          </div>}

        {
    /* Forms Field Implementations */
  }
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {activeMode === "register" && <div className="space-y-1.5 animate-fade pt-1">
              <label className="text-[10px] font-bold text-neutral-455 uppercase tracking-widest font-mono">First Name</label>
              <div className="relative">
                <input
    type="text"
    placeholder="First Name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="w-full rounded-xl px-3.5 py-2.5 pl-10 font-medium transition-colors custom-input"
  />
                <User className="absolute left-3.5 top-3 w-4.5 text-neutral-405" />
              </div>
            </div>}

          {activeMode === "register" && <div className="space-y-1.5 animate-fade">
              <label className="text-[10px] font-bold text-neutral-455 uppercase tracking-widest font-mono">New Email Address</label>
              <div className="relative">
                <input
    type="email"
    placeholder="Email address"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full rounded-xl px-3.5 py-2.5 pl-10 font-medium transition-colors custom-input"
  />
                <Mail className="absolute left-3.5 top-3 w-4.5 text-neutral-405" />
              </div>
            </div>}

          {activeMode !== "register" && (activeMode === "login" || activeMode === "forgot" || activeMode === "reset-password") && activeMode !== "admin-login" && <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-455 uppercase tracking-widest font-mono">Email Address</label>
              <div className="relative">
                <input
    type="email"
    placeholder="Enter Email hear"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full rounded-xl px-3.5 py-2.5 pl-10 font-medium transition-colors custom-input"
    disabled={activeMode === "reset-password" && email !== ""}
  />
                <Mail className="absolute left-3.5 top-3 w-4.5 text-neutral-405" />
              </div>
            </div>}

          {activeMode === "verify-email" && <div className="space-y-1.5 animate-fade">
              <label className="text-[10px] font-bold text-neutral-455 uppercase tracking-widest font-mono">Simulated OTP Security Code</label>
              <div className="relative">
                <input
    type="text"
    placeholder="6-digit dynamic code"
    value={otpCode}
    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
    className="w-full rounded-xl px-3.5 py-2.5 pl-10 tracking-widest font-black transition-colors custom-input"
    maxLength={6}
  />
                <Smartphone className="absolute left-3.5 top-3 w-4.5 text-neutral-405" />
              </div>
            </div>}

          {activeMode === "login" && <div className="space-y-1.5 animate-fade">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-neutral-455 uppercase tracking-widest font-mono">Password</label>
                <button
    type="button"
    onClick={() => {
      setActiveMode("forgot");
      setOutboxOtp(null);
    }}
    className="text-[10px] text-amber-500 hover:underline font-bold"
  >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
    type={showPassword ? "text" : "password"}
    placeholder="••••••••"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full rounded-xl px-3.5 py-2.5 pl-10 pr-10 font-medium transition-colors custom-input"
  />
                <Key className="absolute left-3.5 top-3 w-4.5 text-neutral-405" />
                <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3.5 top-3 text-neutral-405 hover:text-neutral-700 dark:hover:text-neutral-300 transition"
    aria-label="Toggle password visibility"
  >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>}

          {activeMode === "register" && <div className="space-y-1.5 animate-fade">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-neutral-455 uppercase tracking-widest font-mono">Create Password</label>
                <button
    type="button"
    onClick={() => showToast("Password must be at least 6 characters.", "info")}
    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold"
  >
                  Password Requirements?
                </button>
              </div>
              <div className="relative">
                <input
    type={showPassword ? "text" : "password"}
    placeholder="••••••••"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full rounded-xl px-3.5 py-2.5 pl-10 pr-10 font-medium transition-colors custom-input"
  />
                <Key className="absolute left-3.5 top-3 w-4.5 text-neutral-405" />
                <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3.5 top-3 text-neutral-405 hover:text-neutral-700 dark:hover:text-neutral-300 transition"
    aria-label="Toggle password visibility"
  >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              <p className="text-[10.5px] text-neutral-450 dark:text-neutral-500 italic">
                A strong password helps protect your profile.
              </p>
            </div>}

          {activeMode === "reset-password" && <div className="space-y-1.5 animate-fade">
              <label className="text-[10px] font-bold text-neutral-455 uppercase tracking-widest font-mono">Configure New Secure Password</label>
              <div className="relative">
                <input
    type={showNewPassword ? "text" : "password"}
    placeholder="Enter new strong password"
    value={newPassword}
    onChange={(e) => setNewPassword(e.target.value)}
    className="w-full rounded-xl px-3.5 py-2.5 pl-10 pr-10 font-medium transition-colors custom-input"
  />
                <KeyRound className="absolute left-3.5 top-3 w-4.5 text-neutral-451" />
                <button
    type="button"
    onClick={() => setShowNewPassword(!showNewPassword)}
    className="absolute right-3.5 top-3 text-neutral-451 hover:text-neutral-700 dark:hover:text-neutral-300 transition"
    aria-label="Toggle password visibility"
  >
                  {showNewPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>}

          {activeMode === "admin-login" && <>
              <div className="space-y-1.5 animate-fade">
                <label className="text-[10px] font-bold text-neutral-455 uppercase tracking-widest font-mono">Admin Username</label>
                <div className="relative">
                  <input
    type="text"
    placeholder="Enter Admin Email or Username"
    value={adminUsername}
    onChange={(e) => setAdminUsername(e.target.value)}
    className="w-full rounded-xl px-3.5 py-2.5 pl-10 font-medium transition-colors custom-input"
  />
                  <Mail className="absolute left-3.5 top-3 w-4.5 text-neutral-405" />
                </div>
              </div>

              <div className="space-y-1.5 animate-fade">
                <label className="text-[10px] font-bold text-neutral-455 uppercase tracking-widest font-mono">Admin Password</label>
                <div className="relative">
                  <input
    type={showAdminPassword ? "text" : "password"}
    placeholder="••••••••"
    value={adminPassword}
    onChange={(e) => setAdminPassword(e.target.value)}
    className="w-full rounded-xl px-3.5 py-2.5 pl-10 pr-10 font-medium transition-colors custom-input"
  />
                  <Key className="absolute left-3.5 top-3 w-4.5 text-neutral-405" />
                  <button
    type="button"
    onClick={() => setShowAdminPassword(!showAdminPassword)}
    className="absolute right-3.5 top-3 text-neutral-405 hover:text-neutral-700 dark:hover:text-neutral-300 transition"
    aria-label="Toggle password visibility"
  >
                    {showAdminPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>
            </>}

          <button
    type="submit"
    disabled={loading}
    className="w-full h-11 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold uppercase tracking-widest py-3 mt-4 hover:opacity-85 transition shadow-md flex items-center justify-center text-[10px]"
  >
            {loading ? <span className="flex items-center gap-1">
                <RefreshCw className="animate-spin h-3.5 w-3.5" /> Working...
              </span> : <>
                {activeMode === "login" && "Sign In"}
                {activeMode === "register" && "Create Account"}
                {activeMode === "forgot" && "Send Security Reset Code"}
                {activeMode === "reset-password" && "Submit New Password"}
                {activeMode === "verify-email" && "Verify Account Activation"}
                {activeMode === "admin-login" && "Verify Administrative Credentials"}
              </>}
          </button>

          {activeMode === "register" && <p className="text-center text-[11px] text-neutral-450 dark:text-neutral-500 mt-3 font-medium">
              Already have an account?{" "}
              <button
    type="button"
    onClick={() => {
      setActiveMode("login");
      setOutboxOtp(null);
    }}
    className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
  >
                Sign in here
              </button>
            </p>}

          {activeMode === "login" && <p className="text-center text-[11px] text-neutral-450 dark:text-neutral-500 mt-3 font-medium">
              Don't have an account?{" "}
              <button
    type="button"
    onClick={() => {
      setActiveMode("register");
      setOutboxOtp(null);
    }}
    className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
  >
                Create one
              </button>
            </p>}

          {activeMode !== "login" && activeMode !== "register" && <button
    type="button"
    onClick={() => {
      setActiveMode("login");
      setOutboxOtp(null);
    }}
    className="text-[10.5px] font-bold text-neutral-500 flex items-center gap-1.5 justify-center mx-auto hover:text-neutral-800 dark:hover:text-neutral-200 mt-2 transition"
  >
              <ArrowLeft size={12} /> Back to standard Sign In
            </button>}
        </form>

        {
    /* Quick Credentials Sandbox for Recruiters (Only visible on Main Access Modes) */
  }
        {(activeMode === "login" || activeMode === "register") && <div className="space-y-4 pt-2">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800" />
              <span className="flex-shrink mx-4 text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-bold tracking-wider">
                Or Test Accounts
              </span>
              <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800" />
            </div>

            <div className="flex justify-start">
              <button
    type="button"
    onClick={() => {
      setActiveMode("admin-login");
      setAdminUsername("");
      setAdminPassword("");
    }}
    disabled={loading}
    className="py-2.5 px-4 border border-amber-200/50 dark:border-amber-951/30 bg-amber-400/5 text-amber-600 dark:text-amber-450 rounded-xl hover:bg-amber-400/10 transition font-bold text-[11px] text-center"
  >
                Sign In Admin
              </button>
            </div>
          </div>}

      </div>

    </div>;
};
