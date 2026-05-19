import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI, paymentAPI } from '../services/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'bank_transfer', label: 'Bank Transfer', icon: '🏦', desc: 'BCA · BNI · Mandiri · BRI' },
  { id: 'ewallet', label: 'E-Wallet', icon: '📱', desc: 'GoPay · OVO · DANA · ShopeePay' },
  { id: 'credit_card', label: 'Credit Card', icon: '💳', desc: 'Visa · Mastercard · JCB' },
];

const PaymentPage = () => {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('bank_transfer');
  const [proof, setProof] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const timerRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingAPI.getByCode(bookingCode);
        setBooking(res.data.data);
        // Calculate countdown from expired_at
        if (res.data.data.expired_at) {
          const expiry = new Date(res.data.data.expired_at).getTime();
          setCountdown(Math.max(0, Math.floor((expiry - Date.now()) / 1000)));
        }
      } catch {
        toast.error('Booking not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingCode]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) return;
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [countdown]);

  const formatCountdown = (secs) => {
    if (secs <= 0) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (countdown === 0) {
      toast.error('Payment has expired');
      return;
    }
    setSubmitting(true);
    try {
      await paymentAPI.submit({
        booking_code: bookingCode,
        payment_method: method,
        payment_proof: proof,
      });
      setShowSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!booking) return null;

  if (showSuccess) {
    return (
      <DashboardLayout>
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            id="payment-success-modal"
            data-testid="payment-success-modal"
            className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Pembayaran Berhasil!</h2>
            <p className="text-gray-500 mb-2">Tiket Anda telah dikonfirmasi.</p>
            <p
              id="success-booking-code"
              data-testid="success-booking-code"
              className="font-mono text-blue-600 font-bold text-lg mb-6"
            >
              {bookingCode}
            </p>
            <button
              id="btn-view-tickets"
              data-testid="btn-view-tickets"
              onClick={() => navigate('/dashboard/tickets')}
              className="btn-primary w-full py-3"
            >
              Lihat Tiket Saya
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div id="payment-page" data-testid="payment-page" className="max-w-3xl mx-auto fade-in">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Complete Payment</h1>

        {/* Countdown Timer */}
        <div id="payment-timer" data-testid="payment-timer"
          className={`card mb-6 flex items-center justify-between
            ${countdown < 300 ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <div>
            <p className="text-sm font-semibold text-gray-700">Complete payment before:</p>
            <p className="text-xs text-gray-500">After timer expires, booking will be cancelled</p>
          </div>
          <div id="countdown-display" data-testid="countdown-display"
            className={`text-3xl font-extrabold font-mono
              ${countdown < 300 ? 'text-red-600' : 'text-yellow-700'}`}>
            {formatCountdown(countdown)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left: Payment Form */}
          <div className="md:col-span-3 space-y-6">
            {/* Payment Method */}
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">Select Payment Method</h2>
              <div id="payment-methods" data-testid="payment-methods" className="space-y-3">
                {PAYMENT_METHODS.map(pm => (
                  <label
                    key={pm.id}
                    id={`payment-method-${pm.id}`}
                    data-testid={`payment-method-${pm.id}`}
                    htmlFor={`radio-${pm.id}`}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${method === pm.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <input
                      type="radio"
                      id={`radio-${pm.id}`}
                      name="payment_method"
                      data-testid={`radio-${pm.id}`}
                      value={pm.id}
                      checked={method === pm.id}
                      onChange={() => setMethod(pm.id)}
                      className="text-blue-600"
                    />
                    <span className="text-2xl">{pm.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{pm.label}</p>
                      <p className="text-xs text-gray-500">{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Upload Proof */}
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">Payment Proof</h2>
              <div
                id="upload-proof-area"
                data-testid="upload-proof-area"
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                  ${proof ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
              >
                <input
                  type="file"
                  id="input-payment-proof"
                  name="payment_proof"
                  data-testid="input-payment-proof"
                  ref={fileRef}
                  className="hidden"
                  accept="image/*"
                  onChange={e => setProof(e.target.files?.[0] || null)}
                />
                {proof ? (
                  <>
                    <p className="text-green-600 font-semibold">✓ {proof.name}</p>
                    <p className="text-xs text-gray-400 mt-1">Click to change</p>
                  </>
                ) : (
                  <>
                    <p className="text-4xl mb-2">📎</p>
                    <p className="font-medium text-gray-600">Click to upload payment proof</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                  </>
                )}
              </div>
              {proof && (
                <p id="proof-filename" data-testid="proof-filename" className="text-xs text-gray-500 mt-2">
                  File: {proof.name} ({(proof.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <button
              id="btn-submit-payment"
              data-testid="btn-submit-payment"
              onClick={handleSubmit}
              disabled={submitting || countdown === 0}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
            >
              {submitting ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing Payment...</>
              ) : countdown === 0 ? 'Payment Expired' : 'Confirm Payment'}
            </button>
          </div>

          {/* Right: Order Summary */}
          <div className="md:col-span-2">
            <div id="order-summary" data-testid="order-summary" className="card sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Booking Code</p>
                  <p id="summary-booking-code" data-testid="summary-booking-code"
                    className="font-bold text-blue-600 font-mono">{booking.booking_code}</p>
                </div>
                <div className="border-t border-gray-50 pt-3">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Route</p>
                  <p className="font-medium">{booking.origin_city} → {booking.destination_city}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Train</p>
                  <p className="font-medium">{booking.train_name} · {booking.class}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Departure</p>
                  <p className="font-medium">{booking.departure_date} · {booking.departure_time?.slice(0, 5)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Passengers</p>
                  <p className="font-medium">{booking.passenger_count} person(s)</p>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total Payment</span>
                    <span id="summary-total-price" data-testid="summary-total-price"
                      className="text-xl font-extrabold text-blue-600">
                      Rp {Number(booking.total_price).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <span id="payment-status-badge" data-testid="payment-status-badge"
                    className={`badge-${booking.payment_status === 'success' ? 'success' : booking.payment_status === 'failed' ? 'danger' : 'pending'}`}>
                    Status: {booking.payment_status || 'pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentPage;
