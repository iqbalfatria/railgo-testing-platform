import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../services/api';
import { DashboardStatSkeleton } from '../components/common/Skeleton';

const statusBadge = (status) => {
  const map = {
    confirmed: 'badge-success',
    pending: 'badge-pending',
    cancelled: 'badge-danger',
  };
  return <span className={map[status] || 'badge-info'}>{status}</span>;
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await bookingAPI.getAll();
        setData(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = data?.stats || {};
  const recentBookings = data?.bookings?.slice(0, 5) || [];

  const getHour = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      <div id="dashboard-page" data-testid="dashboard-page" className="fade-in">
        {/* Welcome */}
        <div className="mb-8">
          <h1 id="dashboard-greeting" data-testid="dashboard-greeting"
            className="text-2xl font-extrabold text-gray-900">
            {getHour()}, {user?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's an overview of your bookings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <DashboardStatSkeleton key={i} />)
          ) : (
            <>
              <div id="stat-total-booking" data-testid="stat-total-booking" className="card">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Bookings</p>
                <p className="text-3xl font-extrabold text-gray-900">{stats.total || 0}</p>
                <p className="text-xs text-gray-400 mt-1">All time</p>
              </div>
              <div id="stat-confirmed" data-testid="stat-confirmed" className="card">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Confirmed</p>
                <p className="text-3xl font-extrabold text-green-600">{stats.confirmed || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Active tickets</p>
              </div>
              <div id="stat-pending" data-testid="stat-pending" className="card">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pending</p>
                <p className="text-3xl font-extrabold text-yellow-600">{stats.pending || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Awaiting payment</p>
              </div>
              <div id="stat-total-spent" data-testid="stat-total-spent" className="card">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Spent</p>
                <p className="text-2xl font-extrabold text-blue-600">
                  Rp {Number(stats.total_spent || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-400 mt-1">Confirmed only</p>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            to="/booking"
            id="quick-action-booking"
            data-testid="quick-action-booking"
            className="card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-4 group"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
              🎫
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Book New Ticket</h3>
              <p className="text-sm text-gray-500">Search available trains</p>
            </div>
            <span className="ml-auto text-gray-400 group-hover:text-blue-600">→</span>
          </Link>

          <Link
            to="/dashboard/tickets"
            id="quick-action-tickets"
            data-testid="quick-action-tickets"
            className="card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-4 group"
          >
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-green-600 group-hover:text-white transition-all">
              🎟️
            </div>
            <div>
              <h3 className="font-bold text-gray-900">My Tickets</h3>
              <p className="text-sm text-gray-500">View all your bookings</p>
            </div>
            <span className="ml-auto text-gray-400 group-hover:text-green-600">→</span>
          </Link>
        </div>

        {/* Recent Transactions */}
        <div className="card" id="recent-transactions" data-testid="recent-transactions">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
            <Link to="/dashboard/tickets" id="link-view-all" data-testid="link-view-all"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <div
              id="no-bookings-message"
              data-testid="no-bookings-message"
              className="text-center py-12 text-gray-400"
            >
              <p className="text-4xl mb-3">🎫</p>
              <p className="font-medium">No bookings yet</p>
              <p className="text-sm">Book your first train ticket!</p>
            </div>
          ) : (
            <div
              id="bookings-list"
              data-testid="bookings-list"
              className="divide-y divide-gray-50"
            >
              {recentBookings.map((b) => (
                <div
                  key={b.id}
                  id={`booking-item-${b.booking_code}`}
                  data-testid={`booking-item-${b.booking_code}`}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{b.booking_code}</p>
                    <p className="text-xs text-gray-500">{b.origin_city} → {b.destination_city}</p>
                    <p className="text-xs text-gray-400">{b.train_name} · {b.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">
                      Rp {Number(b.total_price).toLocaleString('id-ID')}
                    </p>
                    <div className="mt-1">{statusBadge(b.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
