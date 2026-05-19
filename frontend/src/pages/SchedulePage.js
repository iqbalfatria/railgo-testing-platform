import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { ticketAPI } from '../services/api';
import { TicketCardSkeleton } from '../components/common/Skeleton';
import toast from 'react-hot-toast';

const CITIES = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Malang', 'Bogor'];

const formatTime = (t) => t ? t.slice(0, 5) : '--:--';
const formatPrice = (p) => `Rp ${Number(p).toLocaleString('id-ID')}`;

const SchedulePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    date: searchParams.get('date') || new Date().toISOString().split('T')[0],
    class: searchParams.get('class') || '',
    sort: 'departure',
  });
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('origin') && searchParams.get('destination')) {
      handleSearch();
    }
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!filters.origin || !filters.destination) {
      toast.error('Please select origin and destination city');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await ticketAPI.search({
        origin: filters.origin,
        destination: filters.destination,
        date: filters.date,
        class: filters.class || undefined,
        sort: filters.sort,
      });
      setSchedules(res.data.data.schedules);
    } catch (err) {
      toast.error('Failed to search trains. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (scheduleId) => {
    navigate(`/booking?schedule=${scheduleId}&date=${filters.date}`);
  };

  return (
    <div id="schedule-page" data-testid="schedule-page" className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 id="schedule-title" data-testid="schedule-title"
          className="text-2xl font-extrabold text-gray-900 mb-6">
          Train Schedule
        </h1>

        {/* Search Form */}
        <div className="card mb-6" id="search-form-card" data-testid="search-form-card">
          <form id="form-search-train" data-testid="form-search-train" onSubmit={handleSearch}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label htmlFor="search-origin" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">From</label>
                <select id="search-origin" name="origin" data-testid="select-search-origin"
                  value={filters.origin}
                  onChange={e => setFilters(p => ({ ...p, origin: e.target.value }))}
                  className="input-field">
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="search-destination" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">To</label>
                <select id="search-destination" name="destination" data-testid="select-search-destination"
                  value={filters.destination}
                  onChange={e => setFilters(p => ({ ...p, destination: e.target.value }))}
                  className="input-field">
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="search-date" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Date</label>
                <input type="date" id="search-date" name="date" data-testid="input-search-date"
                  value={filters.date}
                  onChange={e => setFilters(p => ({ ...p, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field" />
              </div>
              <div>
                <label htmlFor="filter-class" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Class</label>
                <select id="filter-class" name="class" data-testid="select-filter-class"
                  value={filters.class}
                  onChange={e => setFilters(p => ({ ...p, class: e.target.value }))}
                  className="input-field">
                  <option value="">All Class</option>
                  <option value="Economy">Economy</option>
                  <option value="Business">Business</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" id="btn-search-schedule" data-testid="btn-search-schedule"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : 'Search'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Sort + Results header */}
        {(searched || schedules.length > 0) && (
          <div className="flex items-center justify-between mb-4">
            <p id="search-results-count" data-testid="search-results-count" className="text-sm text-gray-600">
              {loading ? 'Searching...' : `${schedules.length} train(s) found`}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Sort by:</span>
              <select id="select-sort" data-testid="select-sort"
                value={filters.sort}
                onChange={e => { setFilters(p => ({ ...p, sort: e.target.value })); handleSearch(); }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="departure">Departure Time</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        )}

        {/* Results */}
        <div id="schedule-results" data-testid="schedule-results" className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <TicketCardSkeleton key={i} />)
          ) : schedules.length === 0 && searched ? (
            <div id="no-schedules-found" data-testid="no-schedules-found"
              className="card text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">🚆</p>
              <p className="text-lg font-semibold text-gray-600">No trains found</p>
              <p className="text-sm">Try different route or date</p>
            </div>
          ) : (
            schedules.map((s) => (
              <div
                key={s.id}
                id={`schedule-card-${s.id}`}
                data-testid={`schedule-card-${s.id}`}
                className="card hover:shadow-card-hover transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-bold text-gray-900">{s.train_name}</span>
                      <span className={`badge-info text-xs`}>{s.class}</span>
                      <span className="text-xs text-gray-400">{s.train_code}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p id={`departure-time-${s.id}`} data-testid={`departure-time-${s.id}`}
                          className="text-2xl font-extrabold text-gray-900">{formatTime(s.departure_time)}</p>
                        <p className="text-sm text-gray-500">{s.origin_city}</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <p className="text-xs text-gray-400">{Math.floor(s.duration_minutes / 60)}h {s.duration_minutes % 60}m</p>
                        <div className="flex items-center w-full my-1">
                          <div className="flex-1 h-px bg-gray-200" />
                          <span className="mx-2 text-gray-300">🚆</span>
                          <div className="flex-1 h-px bg-gray-200" />
                        </div>
                      </div>
                      <div className="text-right">
                        <p id={`arrival-time-${s.id}`} data-testid={`arrival-time-${s.id}`}
                          className="text-2xl font-extrabold text-gray-900">{formatTime(s.arrival_time)}</p>
                        <p className="text-sm text-gray-500">{s.destination_city}</p>
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-4 sm:gap-2 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100 sm:pl-4 sm:border-l sm:border-gray-100 sm:min-w-[160px]">
                    <div>
                      <p id={`ticket-price-${s.id}`} data-testid={`ticket-price-${s.id}`}
                        className="text-xl font-extrabold text-blue-600">{formatPrice(s.price)}</p>
                      <p className="text-xs text-gray-400">per person</p>
                    </div>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${s.available_seats > 10 ? 'text-green-600' : s.available_seats > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                        {s.available_seats > 0 ? `${s.available_seats} seats available` : 'SOLD OUT'}
                      </p>
                      <button
                        id={`btn-book-${s.id}`}
                        data-testid={`btn-book-${s.id}`}
                        onClick={() => handleBook(s.id)}
                        disabled={s.available_seats === 0}
                        className="btn-primary text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {s.available_seats === 0 ? 'Sold Out' : 'Book Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
