import { useState, useEffect } from "react";
import { orderService } from "../services/orderService.js";
import { useStore } from "../context/StoreContext.jsx";
import { ShoppingBag, ChevronRight, MapPin, CreditCard, CheckCircle2, ShieldCheck, Loader2, Copy, Check, MessageSquare, Mail } from "lucide-react";
export const CheckoutPage = ({ setTab, promoDiscountPrice, promoCodeApplied }) => {
  const { cart, user, clearCart, showToast } = useStore();
  const [step, setStep] = useState(1);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [razorpaySuccess, setRazorpaySuccess] = useState(false);
  const [razorpayCardNumber, setRazorpayCardNumber] = useState("");
  const [razorpayError, setRazorpayError] = useState("");
  const [showPaypalModal, setShowPaypalModal] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [paypalSuccess, setPaypalSuccess] = useState(false);
  const [paypalError, setPaypalError] = useState("");
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [cryptoSuccess, setCryptoSuccess] = useState(false);
  const [cryptoError, setCryptoError] = useState("");
  const [addressCopied, setAddressCopied] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [pendingOrderDetails, setPendingOrderDetails] = useState(null);
  const [latestGeneratedOtp, setLatestGeneratedOtp] = useState("");
  const [deliveryRoute, setDeliveryRoute] = useState("email");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  useEffect(() => {
    if (user) {
      setAddressForm({
        fullName: user.address?.fullName || user.name || "",
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        zipCode: user.address?.zipCode || "",
        phone: user.address?.phone || ""
      });
      if (user.address?.phone) {
        setWhatsappNumber(user.address.phone);
      }
    }
  }, [user]);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (promoDiscountPrice || 0) / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const handleNextStep = () => {
    if (step === 1) {
      if (cart.length === 0) {
        showToast("Your Cart is empty. Cannot continue checkout.", "error");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const { fullName, street, city, state, zipCode, phone } = addressForm;
      if (!fullName || !street || !city || !state || !zipCode || !phone) {
        showToast("Please complete all shipping address fields before preceding.", "error");
        return;
      }
      setStep(3);
    }
  };
  const triggerOtpFlow = async (payMethod, payId) => {
    setOtpLoading(true);
    setOtpError("");
    setOtpValue("");
    try {
      const formattedItems = cart.map((item) => ({
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }));
      await orderService.requestOtp({
        items: formattedItems,
        totalPrice: finalTotal,
      });
      setLatestGeneratedOtp("");
      setPendingOrderDetails({ payMethod, payId });
      setShowOtpModal(true);
      showToast("Order confirmation code sent to your email!", "success");
    } catch (e) {
      showToast(e.message || "Network issue sending security OTP.", "error");
    } finally {
      setOtpLoading(false);
    }
  };
  const handleCreateOrder = async (payMethod, payId, verifyingOtp) => {
    try {
      const formattedItems = cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0],
        color: item.selectedColor,
        size: item.selectedSize
      }));
      const orderData = await orderService.placeOrder({
        items: formattedItems,
        shippingAddress: addressForm,
        paymentMethod: payMethod,
        paymentId: payId,
        totalPrice: finalTotal,
        otp: verifyingOtp,
      });
      setCreatedOrder(orderData);
      clearCart();
      setShowOtpModal(false);
      showToast("Order created successfully!", "success");
    } catch (e) {
      console.error(e);
      showToast(e.message || "Network issue placing your order.", "error");
    }
  };
  const handlePaymentTrigger = () => {
    if (paymentMethod === "Card") {
      setRazorpayError("");
      setShowRazorpayModal(true);
    } else if (paymentMethod === "PayPal") {
      setPaypalError("");
      setPaypalSuccess(false);
      setShowPaypalModal(true);
    } else if (paymentMethod === "Crypto") {
      setCryptoError("");
      setCryptoSuccess(false);
      setShowCryptoModal(true);
    }
  };
  const handleRazorpayMockCancel = () => {
    setShowRazorpayModal(false);
  };
  const handleRazorpayMockPaymentSubmit = (isFail = false) => {
    if (!isFail && razorpayCardNumber.trim().length > 0 && razorpayCardNumber.length < 16) {
      setRazorpayError("Please insert valid credit / debit card coordinates.");
      return;
    }
    setRazorpayLoading(true);
    setRazorpayError("");
    setTimeout(async () => {
      setRazorpayLoading(false);
      if (isFail) {
        setRazorpayError("Payment declined by card issuer bank. Please try standard COD or reload mockup funds.");
        showToast("Payment Transaction Declined.", "error");
      } else {
        setRazorpaySuccess(true);
        setTimeout(async () => {
          setShowRazorpayModal(false);
          setRazorpaySuccess(false);
          const mockPaymentId = "pay_card_" + Math.random().toString(36).substring(2, 10);
          await handleCreateOrder("Credit/Debit Card", mockPaymentId);
        }, 1500);
      }
    }, 2e3);
  };
  const handlePaypalMockPaymentSubmit = (isFail = false) => {
    if (!isFail && paypalEmail.trim().length > 0 && !paypalEmail.includes("@")) {
      setPaypalError("Provide a valid PayPal account address.");
      return;
    }
    setPaypalLoading(true);
    setPaypalError("");
    setTimeout(async () => {
      setPaypalLoading(false);
      if (isFail) {
        setPaypalError("Authorization refused or wallet balance insufficient.");
        showToast("PayPal Security Authorization Denied.", "error");
      } else {
        setPaypalSuccess(true);
        setTimeout(async () => {
          setShowPaypalModal(false);
          setPaypalSuccess(false);
          const mockPaymentId = "pay_pp_" + Math.random().toString(36).substring(2, 10);
          await handleCreateOrder("PayPal Wallet", mockPaymentId);
        }, 1500);
      }
    }, 2e3);
  };
  const handleCryptoMockVerify = (isFail = false) => {
    setCryptoLoading(true);
    setCryptoError("");
    setTimeout(async () => {
      setCryptoLoading(false);
      if (isFail) {
        setCryptoError("On-chain verification failed. No transactions observed matching invoice block state.");
        showToast("Blockchain Settlement Failed", "error");
      } else {
        setCryptoSuccess(true);
        setTimeout(async () => {
          setShowCryptoModal(false);
          setCryptoSuccess(false);
          const mockPaymentId = "pay_tx_" + Math.random().toString(36).substring(2, 12);
          await handleCreateOrder(`Crypto Blockchain (${selectedCoin})`, mockPaymentId);
        }, 1500);
      }
    }, 2500);
  };
  const handleCODPurchase = async () => {
    await handleCreateOrder("COD", "pay_cod_simulated");
  };
  if (!user) {
    return <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 min-h-[60vh] flex flex-col items-center justify-center p-6 text-center gap-4">
        <h2 className="text-xl font-bold">Checkout is Protected</h2>
        <p className="text-xs text-neutral-500 max-w-sm">You must have an authenticated Trendora account credentials locked in to place checkout balances.</p>
        <button
      onClick={() => setTab("auth")}
      className="rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs px-6 py-3"
    >
          Authenticate Account Options
        </button>
      </div>;
  }
  if (createdOrder) {
    return <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 min-h-screen py-16 flex items-center justify-center">
        <div className="max-w-xl w-full mx-auto px-6 text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 size={32} />
          </div>
          
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 uppercase px-2.5 py-1 rounded-lg">Verified Secure Receipt</span>
            <h1 className="text-3xl font-sans font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">Investment Absolute!</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Thank you {createdOrder.customerName}, your payment transaction succeeded beautifully.</p>
          </div>

          <div className="bg-gray-50 dark:bg-neutral-950 p-6 rounded-2xl border border-gray-150 dark:border-neutral-805 space-y-4 text-xs text-left">
            <div className="flex justify-between border-b border-gray-100 dark:border-neutral-800 pb-2.5 font-mono text-[11px] text-neutral-400">
              <span>Order Ref: {createdOrder.id}</span>
              <span>Method: {createdOrder.paymentMethod}</span>
            </div>
            
            <div className="space-y-3">
              {createdOrder.items.map((item, i) => <div key={i} className="flex gap-3">
                  <div className="h-10 w-10 shrink-0 bg-neutral-100 rounded-lg overflow-hidden">
                    <img src={item.image} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold pr-4 line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] text-neutral-400">{item.color} • {item.size} (x{item.quantity})</p>
                  </div>
                  <span className="ml-auto font-sans font-extrabold pb-0.5">${item.price * item.quantity}</span>
                </div>)}
            </div>

            <div className="border-t border-gray-150 dark:border-neutral-850 pt-2.5 flex justify-between font-extrabold text-sm">
              <span>Grand Balance Paid:</span>
              <span className="text-emerald-500 font-mono">${createdOrder.totalPrice}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
      onClick={() => setTab("profile")}
      className="rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs px-6 py-3 flex-1 sm:flex-none shadow-md hover:opacity-90 transition"
    >
              Track Order Dispatch Status
            </button>
            <button
      onClick={() => setTab("home")}
      className="rounded-full bg-gray-50 dark:bg-neutral-850 border border-gray-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold text-xs px-6 py-3 flex-1 sm:flex-none transition hover:bg-gray-100"
    >
              Explore Other Curations
            </button>
          </div>

        </div>
      </div>;
  }
  return <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 min-h-screen transition-colors duration-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {
    /* Title & Wizard progression */
  }
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-sans font-bold tracking-tight">Checkout Vault</h1>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Authorize secure allocations through climate-controlled logistics registries.</p>
          </div>

          {
    /* Stepper Wizard Indicator */
  }
          <div className="flex items-center gap-2 max-w-lg">
            <button
    onClick={() => setStep(1)}
    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${step >= 1 ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "text-neutral-400"}`}
  >
              1. Review Bag
            </button>
            <ChevronRight size={14} className="text-neutral-300" />
            <button
    onClick={() => {
      if (step >= 2) setStep(2);
    }}
    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${step >= 2 ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "text-neutral-400"}`}
  >
              2. Address
            </button>
            <ChevronRight size={14} className="text-neutral-300" />
            <span
    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${step === 3 ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "text-neutral-400"}`}
  >
              3. Payment
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {
    /* Left Column depending on Step */
  }
          <div className="lg:col-span-8 bg-gray-50/50 dark:bg-neutral-950/20 p-6 rounded-3xl border border-gray-150 dark:border-neutral-808">
            
            {
    /* Step 1: Review items list */
  }
            {step === 1 && <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-neutral-800">
                  <ShoppingBag size={18} className="text-amber-500 animate-fade" />
                  <h2 className="font-sans font-extrabold text-sm uppercase tracking-wider text-neutral-900 dark:text-white">Verify Shipping Bag Contents</h2>
                </div>

                <div className="space-y-4 divide-y divide-gray-100 dark:divide-neutral-850">
                  {cart.map((item, id) => <div key={id} className="flex gap-4 pt-3 first:pt-0">
                      <div className="h-14 w-14 rounded-lg bg-white overflow-hidden border shrink-0">
                        <img src={item.product.images[0]} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{item.product.name}</h4>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{item.selectedColor} • {item.selectedSize} (x{item.quantity})</p>
                      </div>
                      <div className="font-extrabold text-xs text-neutral-900 dark:text-white self-center">
                        ${item.product.price * item.quantity}
                      </div>
                    </div>)}
                </div>

                <button
    onClick={handleNextStep}
    className="rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs px-6 py-3 hover:opacity-80 transition"
  >
                  Confirm Items & Specify Shipment Address
                </button>
              </div>}

            {
    /* Step 2: Address form */
  }
            {step === 2 && <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-neutral-800">
                  <MapPin size={18} className="text-amber-500 animate-fade" />
                  <h2 className="font-sans font-extrabold text-sm uppercase tracking-wider text-neutral-900 dark:text-white">Shipment Coordinator Details</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono">Consignee Full Name</label>
                    <input
    type="text"
    value={addressForm.fullName}
    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
    className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none"
  />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono">Physical Street Address</label>
                    <input
    type="text"
    value={addressForm.street}
    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
    className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none"
  />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono">Town / City</label>
                    <input
    type="text"
    value={addressForm.city}
    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
    className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none"
  />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono">Region / State</label>
                    <input
    type="text"
    value={addressForm.state}
    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
    className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none"
  />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono">Logistic Zip / Postal Code</label>
                    <input
    type="text"
    value={addressForm.zipCode}
    onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
    className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none"
  />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono">Consignee Contact Phone</label>
                    <input
    type="tel"
    placeholder="+65 9123 4567"
    value={addressForm.phone}
    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
    className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none"
  />
                  </div>
                </div>

                <button
    onClick={handleNextStep}
    className="rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs px-6 py-3 hover:opacity-80 transition"
  >
                  Verify Details & Choose Payment Option
                </button>
              </div>}

            {
    /* Step 3: Payment details selection and execution */
  }
            {step === 3 && <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-neutral-800">
                  <CreditCard size={18} className="text-amber-500 animate-fade" />
                  <h2 className="font-sans font-extrabold text-sm uppercase tracking-wider text-neutral-900 dark:text-white">Payment Selection</h2>
                </div>

                {
    /* Secure information warning */
  }
                <div className="flex gap-3 bg-neutral-100 dark:bg-neutral-850 text-neutral-800 dark:text-neutral-250 p-4 rounded-xl text-xs">
                  <ShieldCheck size={18} className="shrink-0 text-amber-500" />
                  <p className="leading-snug">Trendora supports simulated card processing, live cryptocurrency block validation, and PayPal redirects in this playground sandbox.</p>
                </div>

                <div className="space-y-4">
                  
                  {
    /* Credit / Debit Cards selection */
  }
                  <label className={`flex gap-3.5 items-center p-4 rounded-2xl border transition cursor-pointer ${paymentMethod === "Card" ? "bg-amber-400/5 border-amber-500 dark:border-amber-450 text-neutral-900 dark:text-white" : "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-500"}`}>
                    <input
    type="radio"
    name="payment-choice"
    checked={paymentMethod === "Card"}
    onChange={() => setPaymentMethod("Card")}
    className="h-4 w-4 accent-amber-500"
  />
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                        Credit or Debit Cards
                        <span className="text-[9px] uppercase font-mono font-bold bg-amber-400/20 text-neutral-900 dark:text-amber-400 px-1.5 py-0.5 rounded">Mock Visa/MC</span>
                      </h4>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">Settle securely using simulated tokenized credit card parameters with bank validation triggers.</p>
                    </div>
                  </label>

                  {
    /* PayPal selection */
  }
                  <label className={`flex gap-3.5 items-center p-4 rounded-2xl border transition cursor-pointer ${paymentMethod === "PayPal" ? "bg-amber-400/5 border-amber-500 dark:border-amber-450 text-neutral-900 dark:text-white" : "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-500"}`}>
                    <input
    type="radio"
    name="payment-choice"
    checked={paymentMethod === "PayPal"}
    onChange={() => setPaymentMethod("PayPal")}
    className="h-4 w-4 accent-amber-500"
  />
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                        PayPal Instant Checkout
                        <span className="text-[9px] uppercase font-mono font-bold bg-blue-400/20 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded">Sim Wallet</span>
                      </h4>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">Redirect to PayPal sandbox wallet portal to authorize balances seamlessly using email protocols.</p>
                    </div>
                  </label>

                  {
    /* Cryptocurrency selection */
  }
                  <label className={`flex gap-3.5 items-center p-4 rounded-2xl border transition cursor-pointer ${paymentMethod === "Crypto" ? "bg-amber-400/5 border-amber-500 dark:border-amber-450 text-neutral-900 dark:text-white" : "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-500"}`}>
                    <input
    type="radio"
    name="payment-choice"
    checked={paymentMethod === "Crypto"}
    onChange={() => setPaymentMethod("Crypto")}
    className="h-4 w-4 accent-amber-500"
  />
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                        Cryptocurrency Ledger Settle
                        <span className="text-[9px] uppercase font-mono font-bold bg-purple-400/20 text-purple-800 dark:text-purple-300 px-1.5 py-0.5 rounded">USDT / BTC / ETH / USDC</span>
                      </h4>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">Display invoice public key address and simulate ledger validation over mining networks.</p>
                    </div>
                  </label>

                  {
    /* COD selection */
  }
                  <label className={`flex gap-3.5 items-center p-4 rounded-2xl border transition cursor-pointer ${paymentMethod === "COD" ? "bg-neutral-950/10 dark:bg-neutral-900 text-neutral-900 dark:text-white" : "bg-white dark:bg-neutral-900 border-gray-250 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-500"}`}>
                    <input
    type="radio"
    name="payment-choice"
    checked={paymentMethod === "COD"}
    onChange={() => setPaymentMethod("COD")}
    className="h-4 w-4 accent-amber-500"
  />
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white">Cash on Delivery (COD)</h4>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">Submit order immediately and pay with cash during climate-controlled personal home deliveries.</p>
                    </div>
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 flex justify-end">
                  {paymentMethod === "COD" ? <button
    onClick={handleCODPurchase}
    className="rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold text-xs px-8 py-3.5 hover:opacity-85 transition uppercase tracking-wider"
  >
                      Submit COD Order
                    </button> : <button
    onClick={handlePaymentTrigger}
    className="rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs px-8 py-3.5 hover:opacity-85 transition tracking-wider shadow"
  >
                      Process simulated {paymentMethod} payment
                    </button>}
                </div>

              </div>}

          </div>

          {
    /* Right Column: Pricing panel */
  }
          <div className="lg:col-span-4 bg-gray-50/50 dark:bg-neutral-950 p-6 rounded-3xl border border-gray-150 dark:border-neutral-808 space-y-4">
            <h3 className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white">Summary Review</h3>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Items Subtotal:</span>
                <span className="font-bold text-neutral-900 dark:text-white">${subtotal}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Logistic delivery fees:</span>
                <span className="font-bold text-emerald-500 font-mono">Complimentary</span>
              </div>
              
              {promoCodeApplied && <div className="flex justify-between text-neutral-500">
                  <span>Applied Promo ({promoCodeApplied}):</span>
                  <span className="font-bold text-amber-500">-${discountAmount}</span>
                </div>}

              <div className="h-px bg-gray-200 dark:bg-neutral-800 pt-1" />
              <div className="flex justify-between text-sm py-1 font-bold">
                <span>Grand Total Price:</span>
                <span className="font-serif font-extrabold text-neutral-900 dark:text-white text-lg">${finalTotal}</span>
              </div>
            </div>

            {
    /* Recipient card summary details */
  }
            {step >= 2 && addressForm.fullName && <div className="border-t border-gray-100 dark:border-neutral-800 pt-4 text-[10.5px] text-neutral-500 space-y-1">
                <span className="font-bold uppercase tracking-wider text-neutral-400">Shipment Details:</span>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200">{addressForm.fullName}</p>
                <p>{addressForm.street}</p>
                <p>{addressForm.city}, {addressForm.state} {addressForm.zipCode}</p>
                <p>Phone: {addressForm.phone}</p>
              </div>}
          </div>

        </div>

      </div>

      {
    /* Order Confirmation OTP security modal */
  }
      {showOtpModal && <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-[32px] shadow-2xl max-w-sm w-full overflow-hidden relative border-t-4 border-t-amber-500 transform hover:scale-[1.01] transition-all duration-300">
            
            {
    /* Top Interactive Banner */
  }
            <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-[#1e1b4b] p-6 text-white relative">
              <div className="absolute top-3 right-3">
                <button
    type="button"
    onClick={() => setShowOtpModal(false)}
    className="text-neutral-400 hover:text-white text-xs bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl transition font-sans font-semibold"
  >
                  Close
                </button>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <ShieldCheck size={16} className="animate-pulse" />
                  </div>
                  <span className="font-sans font-black tracking-widest text-amber-400 text-[13px] uppercase">SECURITY CENTER</span>
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">SECURE GATEWAY</span>
                </div>
                <h2 className="text-sm font-bold text-neutral-100 tracking-tight font-sans">Purchase Authorization Hub</h2>
                <p className="text-[10px] text-neutral-400 leading-normal">
                  Recipient Profile: <strong className="text-zinc-200">{user?.email}</strong>
                </p>
              </div>
            </div>

            {
    /* Selected Pricing State Indicator */
  }
            <div className="bg-neutral-50 dark:bg-neutral-950/40 px-5 py-3 border-b border-neutral-100 dark:border-neutral-800/80 flex justify-between items-center text-[10px]">
              <span className="font-medium text-neutral-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                Authorization Method:
              </span>
              <span className="font-mono font-extrabold text-neutral-800 dark:text-neutral-200 select-none uppercase tracking-wide bg-neutral-100 dark:bg-neutral-850 px-2.5 py-0.5 rounded-lg border border-neutral-200/50 dark:border-neutral-750">
                {pendingOrderDetails?.payMethod || "Digital Vault"}
              </span>
            </div>

            {
    /* Delivery Route Selection Tabs */
  }
            <div className="px-5 pt-4">
              <div className="grid grid-cols-2 gap-1 bg-neutral-100 dark:bg-neutral-950 p-1 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/80">
                <button
    type="button"
    onClick={() => setDeliveryRoute("email")}
    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition duration-200 ${deliveryRoute === "email" ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-md" : "text-neutral-500 hover:text-neutral-850 dark:hover:text-neutral-300"}`}
  >
                  <Mail size={13} className={deliveryRoute === "email" ? "text-amber-500" : ""} />
                  Email Route
                </button>
                <button
    type="button"
    onClick={() => setDeliveryRoute("whatsapp")}
    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition duration-200 ${deliveryRoute === "whatsapp" ? "bg-emerald-600 text-white shadow-md" : "text-neutral-500 hover:text-neutral-850 dark:hover:text-neutral-300"}`}
  >
                  <MessageSquare size={13} />
                  WhatsApp Route
                </button>
              </div>
            </div>

            {
    /* Tab Contents */
  }
            <div className="p-5 space-y-4">
              {deliveryRoute === "email" ? <div className="space-y-3">
                  <div className="space-y-2 bg-amber-500/[0.04] p-3.5 rounded-2xl border border-amber-500/10 text-center">
                    <p className="text-[10.5px] text-amber-600 dark:text-amber-400 font-bold leading-normal">
                      📧 OTP Verification Dispatch Sent
                    </p>
                    <p className="text-[9.5px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-semibold">
                      Tension mat len! Agar email aane me server dispatch runtime delay ho raha hai, toh aap niche golden **"Real-Time Security Hub Diagnostic"** box se live verification PIN copy kar ke direct insert kar sakte hain. Aapka time waste nahi hoga!
                    </p>
                  </div>
                </div> : <div className="space-y-3.5 bg-neutral-50 dark:bg-neutral-950/85 p-3.5 rounded-2xl border border-neutral-200/45 dark:border-neutral-800">
                  <div className="text-center space-y-0.5">
                    <h3 className="font-bold text-xs text-neutral-900 dark:text-white">Instant WhatsApp Send</h3>
                    <p className="text-[9.5px] text-neutral-500 dark:text-neutral-400 leading-normal">
                      Automated high-volume SMS gateways require expensive enterprise plans. We provide this completely <strong>FREE WhatsApp dispatcher</strong>! Tap below to open with prefilled order details.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Customer Mobile Number:</span>
                    <input
    type="tel"
    placeholder="e.g. +923001234567"
    value={whatsappNumber}
    onChange={(e) => setWhatsappNumber(e.target.value)}
    className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all text-center tracking-wide"
  />
                  </div>

                  <button
    type="button"
    onClick={() => {
      if (!whatsappNumber) {
        showToast("Please enter your WhatsApp mobile number first!", "error");
        return;
      }
      const summaryText = cart.map((item) => `- *${item.product.name}* (Qty: ${item.quantity})`).join("\n");
      const message = `\u{1F6CD}\uFE0F *Trendora Invoice Checkout Security OTP* \u{1F6CD}\uFE0F

Hi, thank you for shopping on Trendora! Please verify your active purchase details:

\u{1F539} *Order Summary:*
${summaryText}
----------------------------------------
\u{1F4B0} *Grand Receipt Total:* Rs. ${finalTotal.toLocaleString()}
\u{1F512} *Security Verification OTP:* *${latestGeneratedOtp || "123456"}*

\u{1F449} Enter this secure code on the Trendora checkout tab to authorize cargo dispatch immediately!`;
      const cleanPhone = whatsappNumber.replace(/[^\d+]/g, "");
      const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
      showToast("WhatsApp dispatch screen launched!", "success");
    }}
    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
  >
                    <MessageSquare size={14} className="shrink-0" />
                    Open WhatsApp to Receive OTP (FREE)
                  </button>
                </div>}

              {
    /* Central OTP Input Layout */
  }
              <div className="space-y-2">
                <div className="text-center">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Input Verification OTP</label>
                  <div className="relative">
                    <input
    type="text"
    maxLength={6}
    placeholder="------"
    value={otpValue}
    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
    className="w-full text-center tracking-[0.8em] pl-[0.8em] font-mono text-xl font-black select-all bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-3 py-3.5 text-neutral-900 dark:text-neutral-101 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition duration-155 shadow-inner"
  />
                  </div>
                </div>
                {otpError && <p className="text-[10px] text-rose-500 text-center font-semibold leading-relaxed animate-pulse">{otpError}</p>}
              </div>

              {
    /* Submit Authentication Button */
  }
              <button
    onClick={async () => {
      if (otpValue.length !== 6) {
        setOtpError("Please insert the complete 6-digit confirmation security code.");
        return;
      }
      setOtpLoading(true);
      setOtpError("");
      try {
        if (pendingOrderDetails) {
          await handleCreateOrder(
            pendingOrderDetails.payMethod,
            pendingOrderDetails.payId,
            otpValue
          );
        }
      } catch (err) {
        setOtpError("Invalid secure code. Please inspect security credentials and try again.");
      } finally {
        setOtpLoading(false);
      }
    }}
    disabled={otpLoading}
    className="w-full h-12 flex items-center justify-center rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-neutral-950 font-black text-xs transition duration-155 gap-2 shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
  >
                {otpLoading ? <>
                    <Loader2 size={14} className="animate-spin" />
                    Authenticating Secure Gateway...
                  </> : "Authorize Purchase & Process Order"}
              </button>

              {
    /* Premium Interactive Live OTP Helper Widget */
  }
              <div className="bg-amber-500/[0.04] dark:bg-black/40 rounded-2xl p-3.5 text-[10px] text-neutral-600 dark:text-neutral-400 border border-amber-500/15">
                <div className="flex gap-2 items-center mb-1.5 font-bold text-amber-600 dark:text-amber-400">
                  <ShieldCheck size={14} className="shrink-0" />
                  <span>Real-Time OTP Diagnostic Box:</span>
                </div>
                <p className="text-[9.5px] text-neutral-500 dark:text-neutral-400 mb-2 leading-relaxed">
                  Avoid any dispatch/network latency and copy your live security verification credentials immediately below:
                </p>
                
                <div className="bg-white dark:bg-black/60 border border-neutral-150 dark:border-neutral-800 rounded-xl py-2 px-3 font-mono text-center flex justify-between items-center shadow-inner">
                  <div className="flex flex-col text-left">
                    <span className="text-neutral-400 text-[8px] uppercase tracking-wider font-sans select-none">Live Access Pin</span>
                    <span className="text-amber-600 dark:text-amber-400 text-sm font-black tracking-wider select-all">
                      {latestGeneratedOtp || "123456"}
                    </span>
                  </div>
                  
                  <button
    type="button"
    onClick={() => {
      const codeToCopy = latestGeneratedOtp || "123456";
      navigator.clipboard.writeText(codeToCopy);
      setCopiedCode(true);
      showToast("Security verification pin copied to clipboard!", "success");
      setTimeout(() => setCopiedCode(false), 2e3);
    }}
    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase transition duration-150 ${copiedCode ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-150 text-neutral-600 dark:text-neutral-300 active:scale-95"}`}
  >
                    {copiedCode ? <>
                        <Check size={10} strokeWidth={3} />
                        Copied
                      </> : <>
                        <Copy size={10} />
                        Copy Code
                      </>}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>}

      {
    /* 1. Premium Credit / Debit Card mock overlay */
  }
      {showRazorpayModal && <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden relative">
            <div className="bg-[#0f172a] p-5 text-white flex justify-between items-center relative">
              <div className="space-y-1">
                <div className="flex h-5 items-center gap-1">
                  <span className="font-mono font-bold tracking-tighter text-amber-400 text-lg">CARDLINK</span>
                  <span className="font-sans text-[9px] bg-amber-500/25 text-amber-400 font-bold px-1.5 py-0.5 rounded uppercase">Secure Core</span>
                </div>
                <p className="text-[9px] text-neutral-400">Vendor: Trendora E-Commerce Gateway</p>
              </div>
              <button
    onClick={handleRazorpayMockCancel}
    className="text-neutral-300 hover:text-white text-xs font-semibold px-2 py-1 rounded hover:bg-neutral-800 transition"
    disabled={razorpayLoading}
  >
                Cancel
              </button>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-950 px-5 py-3 border-b border-neutral-150 dark:border-neutral-800 flex justify-between items-center text-xs">
              <span className="font-medium text-neutral-500">Transaction Balance:</span>
              <span className="font-mono font-extrabold text-sm text-neutral-900 dark:text-white">${finalTotal}</span>
            </div>

            <div className="p-5 space-y-4">
              {razorpayError && <div className="text-[10px] bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-2.5 rounded-lg border border-red-200 dark:border-red-900/40 font-medium">
                  {razorpayError}
                </div>}

              {razorpaySuccess ? <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 animate-pulse font-bold">
                    ✓
                  </div>
                  <h4 className="font-bold text-xs">Card Authorization Submited!</h4>
                  <p className="text-[9px] text-neutral-400 leading-relaxed">Processing complete sandbox handshake protocols...</p>
                </div> : razorpayLoading ? <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
                  <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                  <h4 className="font-bold text-xs">Verifying Token Assets...</h4>
                  <p className="text-[9px] text-neutral-400">Securing mock clearing transaction networks...</p>
                </div> : <div className="space-y-3.5 text-[11px]">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-neutral-500 uppercase">Input Card Number (16-digits)</label>
                    <input
    type="text"
    placeholder="4111 2222 3333 4444"
    value={razorpayCardNumber}
    onChange={(e) => setRazorpayCardNumber(e.target.value.replace(/\D/g, ""))}
    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 focus:outline-none bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
    maxLength={16}
  />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-neutral-500 uppercase">Valid Thru (MM/YY)</label>
                      <input
    type="text"
    placeholder="12/28"
    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
    maxLength={5}
  />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-neutral-500 uppercase">CVV Code (3-digits)</label>
                      <input
    type="password"
    placeholder="•••"
    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
    maxLength={3}
  />
                    </div>
                  </div>

                  <span className="text-[8.5px] text-neutral-455 dark:text-neutral-500 block leading-tight">
                    Type 16 numerical digits to pass simulated tests. Click failure button to test decline handlers.
                  </span>

                  <div className="pt-2 flex gap-2">
                    <button
    type="button"
    onClick={() => handleRazorpayMockPaymentSubmit(true)}
    className="h-10 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200 dark:border-red-900 flex-1 rounded-xl transition"
  >
                      Fail Card
                    </button>
                    <button
    type="button"
    onClick={() => handleRazorpayMockPaymentSubmit(false)}
    className="h-10 text-[10px] font-bold text-white bg-amber-500 hover:bg-amber-600 flex-1 rounded-xl transition"
  >
                      Pay ${finalTotal}
                    </button>
                  </div>
                </div>}
            </div>
          </div>
        </div>}

      {
    /* 2. PayPal Instant Checkout simulated overlay */
  }
      {showPaypalModal && <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden relative">
            <div className="bg-[#003087] p-5 text-white flex justify-between items-center relative font-sans">
              <div className="space-y-0.5">
                <h4 className="text-lg font-extrabold italic tracking-tight text-white flex items-center gap-1.5">
                  PayPal <span className="text-blue-300 text-[10px] uppercase tracking-widest font-mono not-italic px-1.5 py-0.5 rounded bg-blue-900/50">Sandbox</span>
                </h4>
                <p className="text-[8.5px] text-blue-200">Express Simulated Payments Ecosystem</p>
              </div>
              <button
    onClick={() => setShowPaypalModal(false)}
    className="text-neutral-300 hover:text-white text-xs font-semibold px-2 py-1 rounded hover:bg-white/10 transition"
    disabled={paypalLoading}
  >
                Cancel
              </button>
            </div>

            <div className="bg-[#f2f4f7] dark:bg-neutral-950 px-5 py-3 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center text-xs">
              <span className="font-medium text-neutral-500">Checkout Price:</span>
              <span className="font-mono font-extrabold text-sm text-neutral-900 dark:text-white">${finalTotal} USD</span>
            </div>

            <div className="p-5 space-y-4">
              {paypalError && <div className="text-[10px] bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-2.5 rounded-lg border border-red-200 dark:border-red-900/40 font-medium">
                  {paypalError}
                </div>}

              {paypalSuccess ? <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 animate-pulse font-bold">
                    ✓
                  </div>
                  <h4 className="font-bold text-xs">PayPal Authorization Cleared!</h4>
                  <p className="text-[9px] text-neutral-400">Order tokenization successfully dispatched.</p>
                </div> : paypalLoading ? <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
                  <Loader2 className="h-8 w-8 text-[#0070ba] animate-spin" />
                  <h4 className="font-bold text-xs">Fetching PayPal Wallet...</h4>
                  <p className="text-[9px] text-neutral-400">Authorizing login coordinates and ledger balances...</p>
                </div> : <div className="space-y-3.5 text-[11px]">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-neutral-500 uppercase">PayPal Email or Mobile Number</label>
                    <input
    type="email"
    placeholder="buyer@trendora.com"
    value={paypalEmail}
    onChange={(e) => setPaypalEmail(e.target.value)}
    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
  />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-neutral-505 uppercase">PayPal Account Password</label>
                    <input
    type="password"
    placeholder="••••••••"
    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
  />
                  </div>

                  <span className="text-[8.5px] text-neutral-450 block leading-tight">
                    Simulated login is verified immediately. Click "Pay with PayPal" to authorize simulated account funds.
                  </span>

                  <div className="pt-2 flex gap-2">
                    <button
    type="button"
    onClick={() => handlePaypalMockPaymentSubmit(true)}
    className="h-10 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200 dark:border-red-950-30 flex-1 rounded-xl transition"
  >
                      Reject Pay
                    </button>
                    <button
    type="button"
    onClick={() => handlePaypalMockPaymentSubmit(false)}
    className="h-10 text-[10px] font-bold text-white bg-[#0070ba] hover:bg-[#005ea6] flex-1 rounded-xl transition"
  >
                      Pay with PayPal
                    </button>
                  </div>
                </div>}
            </div>
          </div>
        </div>}

      {
    /* 3. Cryptocurrency simulated overlay */
  }
      {showCryptoModal && <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden relative">
            <div className="bg-[#1a0f2e] p-5 text-white flex justify-between items-center relative">
              <div className="space-y-1">
                <div className="flex h-5 items-center gap-1">
                  <span className="font-mono font-bold tracking-tighter text-purple-400 text-lg">ON-CHAIN</span>
                  <span className="font-sans text-[9px] bg-purple-500/20 text-purple-400 font-bold px-1.5 py-0.5 rounded uppercase">Web3 Sandbox</span>
                </div>
                <p className="text-[9px] text-neutral-400">Trendora Decentralized Settle Core</p>
              </div>
              <button
    onClick={() => setShowCryptoModal(false)}
    className="text-neutral-300 hover:text-white text-xs font-semibold px-2 py-1 rounded hover:bg-neutral-800 transition"
    disabled={cryptoLoading}
  >
                Cancel
              </button>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-950 px-5 py-3 border-b border-gray-150 dark:border-neutral-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-neutral-500">Invoice Amount:</span>
                <span className="font-mono font-extrabold text-sm text-neutral-900 dark:text-white">${finalTotal} USD</span>
              </div>
              <div className="flex gap-2">
                {["USDT", "USDC", "BTC", "ETH"].map((coin) => <button
    key={coin}
    onClick={() => {
      setSelectedCoin(coin);
      setCryptoError("");
      setAddressCopied(false);
    }}
    className={`text-[9.5px] font-bold px-2 py-1 rounded-lg border transition ${selectedCoin === coin ? "bg-purple-500 border-purple-500 text-white shadow-sm" : "bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-neutral-500"}`}
  >
                    {coin}
                  </button>)}
              </div>
            </div>

            <div className="p-5 space-y-4">
              {cryptoError && <div className="text-[10px] bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-2.5 rounded-lg border border-red-200 dark:border-red-900/40 font-medium leading-relaxed">
                  {cryptoError}
                </div>}

              {cryptoSuccess ? <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 animate-pulse font-bold">
                    ✓
                  </div>
                  <h4 className="font-bold text-xs">On-Chain Block Confirmed!</h4>
                  <p className="text-[9px] text-neutral-400">Block height mining succeeded beautifully.</p>
                </div> : cryptoLoading ? <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
                  <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                  <h4 className="font-bold text-xs">Verifying blockchain ledger...</h4>
                  <p className="text-[9px] text-neutral-400">Awaiting block miner inclusion handshakes...</p>
                </div> : <div className="space-y-4 text-center">
                  {
    /* Dynamic Custom QR Code Rendering */
  }
                  <div className="relative group">
                    {selectedCoin === "USDT" ? (
    /* Custom highly polished TRON / TRX QR Code SVG */
    <svg viewBox="0 0 120 120" className="w-28 h-28 mx-auto bg-white p-2 rounded-2xl border border-gray-250 dark:border-neutral-800 shadow-md" xmlns="http://www.w3.org/2000/svg">
                        {
      /* Finder Patterns */
    }
                        {
      /* Top-Left */
    }
                        <rect x="8" y="8" width="28" height="28" fill="#111827" rx="5" />
                        <rect x="12" y="12" width="20" height="20" fill="white" rx="3" />
                        <rect x="16" y="16" width="12" height="12" fill="#111827" rx="1.5" />
                        
                        {
      /* Top-Right */
    }
                        <rect x="84" y="8" width="28" height="28" fill="#111827" rx="5" />
                        <rect x="88" y="12" width="20" height="20" fill="white" rx="3" />
                        <rect x="92" y="16" width="12" height="12" fill="#111827" rx="1.5" />
                        
                        {
      /* Bottom-Left */
    }
                        <rect x="8" y="84" width="28" height="28" fill="#111827" rx="5" />
                        <rect x="12" y="88" width="20" height="20" fill="white" rx="3" />
                        <rect x="16" y="92" width="12" height="12" fill="#111827" rx="1.5" />
                        
                        {
      /* Alignment Pattern (Bottom-Right) */
    }
                        <rect x="86" y="86" width="14" height="14" fill="#111827" rx="3" />
                        <rect x="90" y="90" width="6" height="6" fill="white" rx="1" />
                        <rect x="92" y="92" width="2" height="2" fill="#111827" />

                        {
      /* Random styled QR code modules */
    }
                        <rect x="42" y="8" width="8" height="8" fill="#111827" rx="1" />
                        <rect x="42" y="20" width="8" height="8" fill="#111827" rx="1" />
                        <rect x="54" y="12" width="16" height="8" fill="#111827" rx="1" />
                        <rect x="54" y="24" width="8" height="8" fill="#111827" rx="1" />
                        <rect x="74" y="8" width="6" height="14" fill="#111827" rx="1" />

                        <rect x="8" y="42" width="14" height="8" fill="#111827" rx="1" />
                        <rect x="8" y="54" width="8" height="14" fill="#111827" rx="1" />
                        <rect x="24" y="42" width="8" height="8" fill="#111827" rx="1" />
                        <rect x="28" y="66" width="12" height="8" fill="#111827" rx="1" />

                        <rect x="104" y="42" width="8" height="12" fill="#111827" rx="1" />
                        <rect x="84" y="54" width="14" height="8" fill="#111827" rx="1" />
                        <rect x="92" y="66" width="12" height="8" fill="#111827" rx="1" />

                        <rect x="42" y="84" width="8" height="14" fill="#111827" rx="1" />
                        <rect x="42" y="104" width="14" height="8" fill="#111827" rx="1" />
                        <rect x="54" y="96" width="14" height="8" fill="#111827" rx="1" />
                        <rect x="72" y="84" width="8" height="8" fill="#111827" rx="1" />

                        <g transform="translate(42, 42)">
                          <rect x="0" y="0" width="36" height="36" rx="9" fill="#EC0928" />
                          <path d="M18 7 L8 17 L18 29 L28 17 Z" fill="none" stroke="white" strokeWidth="2.5" />
                          <path d="M18 7 L18 29" stroke="white" strokeWidth="2.5" />
                          <path d="M8 17 L28 17" stroke="white" strokeWidth="2.5" />
                        </g>
                      </svg>
  ) : selectedCoin === "BTC" ? (
    /* Custom Bitcoin QR Code SVG */
    <svg viewBox="0 0 120 120" className="w-28 h-28 mx-auto bg-white p-2 rounded-2xl border border-gray-255 dark:border-neutral-800 shadow-md" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="8" width="28" height="28" fill="#111827" rx="5" />
                        <rect x="12" y="12" width="20" height="20" fill="white" rx="3" />
                        <rect x="16" y="16" width="12" height="12" fill="#111827" rx="1.5" />

                        <rect x="84" y="8" width="28" height="28" fill="#111827" rx="5" />
                        <rect x="88" y="12" width="20" height="20" fill="white" rx="3" />
                        <rect x="92" y="16" width="12" height="12" fill="#111827" rx="1.5" />

                        <rect x="8" y="84" width="28" height="28" fill="#111827" rx="5" />
                        <rect x="12" y="88" width="20" height="20" fill="white" rx="3" />
                        <rect x="16" y="92" width="12" height="12" fill="#111827" rx="1.5" />

                        <rect x="86" y="86" width="14" height="14" fill="#111827" rx="3" />
                        <rect x="90" y="90" width="6" height="6" fill="white" rx="1" />
                        <rect x="92" y="92" width="2" height="2" fill="#111827" />

                        <rect x="42" y="8" width="8" height="8" fill="#111827" rx="1" />
                        <rect x="42" y="20" width="8" height="8" fill="#111827" rx="1" />
                        <rect x="54" y="12" width="16" height="8" fill="#111827" rx="1" />
                        <rect x="24" y="42" width="8" height="8" fill="#111827" rx="1" />
                        <g transform="translate(42, 42)">
                          <circle cx="18" cy="18" r="18" fill="#F7931A" />
                          <text x="18" y="24" fill="white" fontStyle="italic" fontWeight="bold" fontSize="19" textAnchor="middle" fontFamily="sans-serif">₿</text>
                        </g>
                      </svg>
  ) : selectedCoin === "ETH" ? (
    /* Custom Ethereum QR Code SVG */
    <svg viewBox="0 0 120 120" className="w-28 h-28 mx-auto bg-white p-2 rounded-2xl border border-gray-255 dark:border-neutral-800 shadow-md" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="8" width="28" height="28" fill="#111827" rx="5" />
                        <rect x="12" y="12" width="20" height="20" fill="white" rx="3" />
                        <rect x="16" y="16" width="12" height="12" fill="#111827" rx="1.5" />

                        <rect x="84" y="8" width="28" height="28" fill="#111827" rx="5" />
                        <rect x="88" y="12" width="20" height="20" fill="white" rx="3" />
                        <rect x="92" y="16" width="12" height="12" fill="#111827" rx="1.5" />

                        <rect x="8" y="84" width="28" height="28" fill="#111827" rx="5" />
                        <rect x="12" y="88" width="20" height="20" fill="white" rx="3" />
                        <rect x="16" y="92" width="12" height="12" fill="#111827" rx="1.5" />

                        <rect x="86" y="86" width="14" height="14" fill="#111827" rx="3" />
                        <rect x="90" y="90" width="6" height="6" fill="white" rx="1" />
                        <rect x="92" y="92" width="2" height="2" fill="#111827" />

                        <rect x="42" y="8" width="8" height="8" fill="#111827" rx="1" />
                        <rect x="42" y="20" width="8" height="8" fill="#111827" rx="1" />
                        <rect x="54" y="12" width="16" height="8" fill="#111827" rx="1" />
                        <rect x="24" y="42" width="8" height="8" fill="#111827" rx="1" />
                        <g transform="translate(42, 42)">
                          <rect x="0" y="0" width="36" height="36" rx="9" fill="#627EEA" />
                          <path d="M18 4 L10 14 L18 18 L26 14 Z" fill="none" stroke="white" strokeWidth="2.2" />
                          <path d="M18 18 L10 14 L18 28 L26 14 Z" fill="none" stroke="white" strokeWidth="2.2" />
                          <path d="M18 4 L18 28" stroke="white" strokeWidth="2.2" />
                        </g>
                      </svg>
  ) : (
    /* Custom USDC QR Code SVG */
    <svg viewBox="0 0 120 120" className="w-28 h-28 mx-auto bg-white p-2 rounded-2xl border border-gray-255 dark:border-neutral-800 shadow-md" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="8" width="28" height="28" fill="#111827" rx="5" />
                        <rect x="12" y="12" width="20" height="20" fill="white" rx="3" />
                        <rect x="16" y="16" width="12" height="12" fill="#111827" rx="1.5" />

                        <rect x="84" y="8" width="28" height="28" fill="#111827" rx="5" />
                        <rect x="88" y="12" width="20" height="20" fill="white" rx="3" />
                        <rect x="92" y="16" width="12" height="12" fill="#111827" rx="1.5" />

                        <rect x="8" y="84" width="28" height="28" fill="#111827" rx="5" />
                        <rect x="12" y="88" width="20" height="20" fill="white" rx="3" />
                        <rect x="16" y="92" width="12" height="12" fill="#111827" rx="1.5" />

                        <rect x="86" y="86" width="14" height="14" fill="#111827" rx="3" />
                        <rect x="90" y="90" width="6" height="6" fill="white" rx="1" />
                        <rect x="92" y="92" width="2" height="2" fill="#111827" />

                        <rect x="42" y="8" width="8" height="8" fill="#111827" rx="1" />
                        <rect x="54" y="12" width="16" height="8" fill="#111827" rx="1" />
                        <rect x="24" y="42" width="8" height="8" fill="#111827" rx="1" />
                        <g transform="translate(42, 42)">
                          <circle cx="18" cy="18" r="18" fill="#2775CA" />
                          <text x="18" y="24" fill="white" fontWeight="bold" fontSize="16" textAnchor="middle" fontFamily="sans-serif">$</text>
                        </g>
                      </svg>
  )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/60 rounded-2xl">
                      <span className="text-[10px] font-sans font-bold text-white uppercase tracking-wider">Scan QR code</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-left bg-neutral-50 dark:bg-neutral-950 p-3.5 rounded-xl border border-neutral-150 dark:border-neutral-805">
                    <div className="flex justify-between items-center">
                      <span className="text-[8.5px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                        Target Address ({selectedCoin === "USDT" ? "USDT TRC-20" : selectedCoin === "BTC" ? "Bitcoin" : selectedCoin === "ETH" ? "Ethereum" : "ERC-20"})
                      </span>
                      <button
    onClick={() => {
      const addr = selectedCoin === "USDT" ? "THemFWQm3AM33WsU3sRm7Fz7tWDy3pEU1c" : selectedCoin === "BTC" ? "1CK6KHYscXG9fN6t2uYjN1eLrkdPrXF2s4" : selectedCoin === "ETH" ? "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" : "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
      navigator.clipboard.writeText(addr);
      setAddressCopied(true);
      showToast("Wallet address copied!", "success");
      setTimeout(() => setAddressCopied(false), 2e3);
    }}
    className="p-1 rounded-md text-neutral-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
    title="Copy Address"
  >
                        {addressCopied ? <Check size={13} className="text-emerald-500 font-bold" /> : <Copy size={13} />}
                      </button>
                    </div>
                    
                    <p className="font-mono text-[10px] text-neutral-800 dark:text-neutral-200 break-all select-all leading-relaxed font-semibold bg-white dark:bg-neutral-900 p-2 rounded border border-neutral-150 dark:border-neutral-800">
                      {selectedCoin === "USDT" ? "THemFWQm3AM33WsU3sRm7Fz7tWDy3pEU1c" : selectedCoin === "BTC" ? "1CK6KHYscXG9fN6t2uYjN1eLrkdPrXF2s4" : selectedCoin === "ETH" ? "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" : "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}
                    </p>
                    <span className="text-[8px] text-neutral-450 dark:text-neutral-500 block leading-tight pt-1">
                      Check your network details carefully. Transferring currency to a wrong network structure leads to irreversible fund forfeiture.
                    </span>
                  </div>

                  <div className="flex gap-2 pt-1 text-[11px]">
                    <button
    type="button"
    onClick={() => handleCryptoMockVerify(true)}
    className="h-10 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200 dark:border-red-900 flex-1 rounded-xl transition"
  >
                      Timeout Settle
                    </button>
                    <button
    type="button"
    onClick={() => handleCryptoMockVerify(false)}
    className="h-10 text-[10px] font-bold text-white bg-purple-600 hover:bg-purple-700 flex-1 rounded-xl transition"
  >
                      Verify Settle Status
                    </button>
                  </div>
                </div>}
            </div>
          </div>
        </div>}

    </div>;
};
