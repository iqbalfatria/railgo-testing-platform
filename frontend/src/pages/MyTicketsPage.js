import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { bookingAPI } from '../services/api';
import toast from 'react-hot-toast';

const statusConfig = {
  confirmed: { badge: 'badge-success', text: 'Confirmed', icon: '✅' },
  pending: { badge: 'badge-pending', text: 'Pending Payment', icon: '⏳' },
  cancelled: { badge: 'badge-danger', text: 'Cancelled', icon: '❌' },
};

const QRCode = ({ bookingCode }) => (
  <div
    id={`qr-code-${bookingCode}`}
    data-testid={`qr-code-${bookingCode}`}
    className="w-24 h-24 bg-white border-2 border-gray-200 rounded-xl p-2 flex items-center justify-center"
    aria-label={`QR Code for booking ${bookingCode}`}
  >
    <div className="grid grid-cols-5 gap-px">
      {Array.from({ length: 25 }, (_, i) => (
        <div
          key={i}
          className={`w-3 h-3 ${Math.random() > 0.4 ? 'bg-gray-900' : 'bg-white'}`}
        />
      ))}
    </div>
  </div>
);

const MyTicketsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingAPI.getAll();
      setBookings(res.data.data.bookings || []);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (code) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(code);
    try {
      await bookingAPI.cancel(code);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(null);
    }
  };

  const handleDownload = (bookingCode) => {
    toast.success(`Downloading ticket ${bookingCode}...`);
    // Simulate PDF download
    setTimeout(() => toast.success('Ticket downloaded as PDF!'), 1500);
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <DashboardLayout>
      <div id="my-tickets-page" data-testid="my-tickets-page" className="fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">My Tickets</h1>
          <button
            id="btn-book-new"
            data-testid="btn-book-new"
            onClick={() => navigate('/booking')}
            className="btn-primary text-sm py-2 px-4"
          >
            + Book New Ticket
          </button>
        </div>

        {/* Filter Tabs */}
        <div id="ticket-filter-tabs" data-testid="ticket-filter-tabs" className="flex gap-2 mb-6">
          {[
            { value: 'all', label: 'All' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'pending', label: 'Pending' },
            { value: 'cancelled', label: 'Cancelled' },
          ].map(tab => (
            <button
              key={tab.value}
              id={`filter-tab-${tab.value}`}
              data-testid={`filter-tab-${tab.value}`}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
                ${filter === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ticket List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div id="no-tickets-message" data-testid="no-tickets-message"
            className="card text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🎟️</p>
            <p className="text-lg font-semibold text-gray-600">No tickets found</p>
            <p className="text-sm">Book your first train ticket!</p>
          </div>
        ) : (
          <div id="tickets-list" data-testid="tickets-list" className="space-y-4">
            {filtered.map((b) => {
              const cfg = statusConfig[b.status] || statusConfig.pending;
              const isExpanded = expanded === b.booking_code;

              return (
                <div
                  key={b.id}
                  id={`ticket-card-${b.booking_code}`}
                  data-testid={`ticket-card-${b.booking_code}`}
                  className="card overflow-hidden"
                >
                  {/* Ticket Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <QRCode bookingCode={b.booking_code} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            id={`booking-code-${b.booking_code}`}
                            data-testid={`booking-code-${b.booking_code}`}
                            className="font-extrabold text-gray-900 font-mono"
                          >
                            {b.booking_code}
                          </span>
                          <span className={cfg.badge}>{cfg.icon} {cfg.text}</span>
                        </div>
                        <p className="font-semibold text-gray-700">{b.train_name} · {b.class}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {b.origin_city} → {b.destination_city}
                        </p>
                        <p className="text-sm text-gray-500">
                          {b.departure_date} · {b.departure_time?.slice(0, 5)} - {b.arrival_time?.slice(0, 5)}
                        </p>
                        <p className="font-bold text-blue-600 mt-1">
                          Rp {Number(b.total_price).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        id={`btn-expand-${b.booking_code}`}
                        data-testid={`btn-expand-${b.booking_code}`}
                        onClick={() => setExpanded(isExpanded ? null : b.booking_code)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {isExpanded ? 'Hide Details ▲' : 'Show Details ▼'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div
                      id={`ticket-details-${b.booking_code}`}
                      data-testid={`ticket-details-${b.booking_code}`}
                      className="mt-4 pt-4 border-t border-gray-100 fade-in"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Passengers</p>
                          <p className="font-medium">{b.passenger_count}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Seats</p>
                          <p id={`seat-numbers-${b.booking_code}`} data-testid={`seat-numbers-${b.booking_code}`}
                            className="font-medium">{b.seat_numbers || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Payment</p>
                          <p className="font-medium capitalize">{b.payment_method?.replace('_', ' ') || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Payment Status</p>
                          <p id={`payment-status-${b.booking_code}`} data-testid={`payment-status-${b.booking_code}`}
                            className="font-medium">{b.payment_status || '-'}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 flex-wrap">
                        {b.status === 'confirmed' && (
                          <button
                            id={`btn-download-${b.booking_code}`}
                            data-testid={`btn-download-${b.booking_code}`}
                            onClick={() => handleDownload(b.booking_code)}
                            className="btn-secondary text-sm py-2 px-4"
                          >
                            📄 Download PDF
                          </button>
                        )}

                        {b.status === 'pending' && (
                          <button
                            id={`btn-pay-${b.booking_code}`}
                            data-testid={`btn-pay-${b.booking_code}`}
                            onClick={() => navigate(`/payment/${b.booking_code}`)}
                            className="btn-primary text-sm py-2 px-4"
                          >
                            💳 Complete Payment
                          </button>
                        )}

                        {b.status !== 'cancelled' && (
                          <button
                            id={`btn-cancel-${b.booking_code}`}
                            data-testid={`btn-cancel-${b.booking_code}`}
                            onClick={() => handleCancel(b.booking_code)}
                            disabled={cancelling === b.booking_code}
                            className="btn-danger text-sm py-2 px-4 disabled:opacity-50"
                          >
                            {cancelling === b.booking_code ? 'Cancelling...' : '✕ Cancel Ticket'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyTicketsPage;
