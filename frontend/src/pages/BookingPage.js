import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { ticketAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CITIES = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Malang', 'Bogor'];

const SeatMap = ({ totalSeats, takenSeats, selected, onSelect, maxSelect }) => {
  const seats = Array.from({ length: totalSeats }, (_, i) => {
    const row = Math.floor(i / 4) + 1;
    const col = ['A', 'B', 'C', 'D'][i % 4];
    return `${row}${col}`;
  });

  const handleSeat = (seat) => {
    if (takenSeats.includes(seat)) return;
    if (selected.includes(seat)) {
      onSelect(selected.filter(s => s !== seat));
    } else {
      if (selected.length < maxSelect) {
        onSelect([...selected, seat]);
      } else {
        toast.error(`You can only select ${maxSelect} seat(s)`);
      }
    }
  };

  return (
    <div id="seat-map" data-testid="seat-map">
      <div className="flex gap-4 mb-4 text-xs">
        <div className="flex items-center gap-2"><div className="w-5 h-5 bg-gray-100 border border-gray-300 rounded" /><span>Available</span></div>
        <div className="flex items-center gap-2"><div className="w-5 h-5 bg-blue-600 rounded" /><span>Selected</span></div>
        <div className="flex items-center gap-2"><div className="w-5 h-5 bg-gray-400 rounded" /><span>Taken</span></div>
      </div>
      <div className="grid grid-cols-4 gap-1.5 max-h-64 overflow-y-auto p-2">
        {seats.map((seat) => {
          const isTaken = takenSeats.includes(seat);
          const isSelected = selected.includes(seat);
          return (
            <button
              key={seat}
              id={`seat-${seat}`}
              data-testid={`seat-${seat}`}
              data-seat-status={isTaken ? 'taken' : isSelected ? 'selected' : 'available'}
              onClick={() => handleSeat(seat)}
              disabled={isTaken}
              className={`text-xs font-semibold py-2 px-1 rounded-lg border transition-all
                ${isTaken
                  ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                  : isSelected
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                }`}
            >
              {seat}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [step, setStep] = useState(1); // 1: search, 2: form, 3: confirm
  const [filters, setFilters] = useState({
    origin: '', destination: '',
    date: new Date().toISOString().split('T')[0],
    class: 'Economy',
  });
  const [schedules, setSchedules] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [scheduleDetail, setScheduleDetail] = useState(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState([{ full_name: '', id_number: '' }]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const schedId = searchParams.get('schedule');
    const date = searchParams.get('date');
    if (schedId) {
      loadScheduleDetail(schedId);
      if (date) setFilters(p => ({ ...p, date }));
    }
  }, []);

  const loadScheduleDetail = async (id) => {
    setLoading(true);
    try {
      const res = await ticketAPI.getById(id);
      setScheduleDetail(res.data.data);
      setSelected(res.data.data);
      setStep(2);
    } catch {
      toast.error('Schedule not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!filters.origin || !filters.destination) {
      toast.error('Please select origin and destination');
      return;
    }
    setLoading(true);
    try {
      const res = await ticketAPI.search({ origin: filters.origin, destination: filters.destination, class: filters.class });
      setSchedules(res.data.data.schedules);
    } catch {
      toast.error('Failed to search trains');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSchedule = async (s) => {
    setLoading(true);
    try {
      const res = await ticketAPI.getById(s.id);
      setScheduleDetail(res.data.data);
      setSelected(s);
      setStep(2);
    } catch {
      toast.error('Failed to load schedule details');
    } finally {
      setLoading(false);
    }
  };

  const handlePassengerCountChange = (count) => {
    setPassengerCount(count);
    setPassengers(Array.from({ length: count }, (_, i) => passengers[i] || { full_name: '', id_number: '' }));
    setSelectedSeats([]);
  };

  const handlePassengerChange = (idx, field, value) => {
    setPassengers(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue booking');
      navigate('/login');
      return;
    }
    const invalid = passengers.some(p => !p.full_name || !p.id_number);
    if (invalid) {
      toast.error('Please fill in all passenger details');
      return;
    }
    if (selectedSeats.length !== passengerCount) {
      toast.error(`Please select ${passengerCount} seat(s)`);
      return;
    }

    setSubmitting(true);
    try {
      const passengersWithSeats = passengers.map((p, i) => ({
        ...p,
        seat_number: selectedSeats[i]
      }));
      const res = await bookingAPI.create({
        schedule_id: selected.id,
        departure_date: filters.date,
        passenger_count: passengerCount,
        seat_numbers: selectedSeats,
        passengers: passengersWithSeats,
      });
      toast.success('Booking created! Proceeding to payment...');
      navigate(`/payment/${res.data.data.booking_code}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (p) => `Rp ${Number(p).toLocaleString('id-ID')}`;

  return (
    <div id="booking-page" data-testid="booking-page" className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Book Train Ticket</h1>

        {/* Step Indicator */}
        <div id="booking-steps" data-testid="booking-steps" className="flex items-center gap-4 mb-8">
          {[
            { n: 1, label: 'Select Train' },
            { n: 2, label: 'Passenger Details' },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${step >= n ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {n}
              </div>
              <span className={`text-sm font-medium ${step >= n ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
              {n < 2 && <div className="w-16 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="fade-in">
            {/* Search */}
            <div className="card mb-6">
              <h2 className="font-bold text-gray-900 mb-4">Search Train</h2>
              <form id="form-booking-search" data-testid="form-booking-search" onSubmit={handleSearch}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'From', id: 'booking-origin', name: 'origin', key: 'origin' },
                    { label: 'To', id: 'booking-destination', name: 'destination', key: 'destination' },
                  ].map(f => (
                    <div key={f.key}>
                      <label htmlFor={f.id} className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">{f.label}</label>
                      <select id={f.id} name={f.name} data-testid={`select-${f.key}`}
                        value={filters[f.key]}
                        onChange={e => setFilters(p => ({ ...p, [f.key]: e.target.value }))}
                        className="input-field">
                        <option value="">Select city</option>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  ))}
                  <div>
                    <label htmlFor="booking-date" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Date</label>
                    <input type="date" id="booking-date" name="date" data-testid="input-booking-date"
                      value={filters.date}
                      onChange={e => setFilters(p => ({ ...p, date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="input-field" />
                  </div>
                  <div className="flex items-end">
                    <button type="submit" id="btn-booking-search" data-testid="btn-booking-search"
                      disabled={loading} className="btn-primary w-full">
                      {loading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Results */}
            <div id="booking-search-results" data-testid="booking-search-results" className="space-y-3">
              {schedules.map(s => (
                <div key={s.id} id={`result-card-${s.id}`} data-testid={`result-card-${s.id}`} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{s.train_name} <span className="badge-info ml-2">{s.class}</span></p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xl font-extrabold">{s.departure_time?.slice(0, 5)}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-xl font-extrabold">{s.arrival_time?.slice(0, 5)}</span>
                        <span className="text-sm text-gray-400">{s.origin_city} → {s.destination_city}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-extrabold text-blue-600">{formatPrice(s.price)}</p>
                      <p className="text-xs text-green-600 mb-2">{s.available_seats} seats left</p>
                      <button id={`btn-select-${s.id}`} data-testid={`btn-select-${s.id}`}
                        onClick={() => handleSelectSchedule(s)}
                        className="btn-primary text-sm py-2 px-4">
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selected && (
          <div className="fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Passenger Count */}
              <div className="card">
                <h2 className="font-bold text-gray-900 mb-4">Passenger Details</h2>
                <div className="mb-4">
                  <label htmlFor="passenger-count" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Number of Passengers
                  </label>
                  <select id="passenger-count" name="passenger_count" data-testid="select-passenger-count"
                    value={passengerCount}
                    onChange={e => handlePassengerCountChange(Number(e.target.value))}
                    className="input-field max-w-xs">
                    {[1, 2, 3, 4].map(n => (
                      <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                {passengers.map((p, idx) => (
                  <div key={idx} id={`passenger-form-${idx + 1}`} data-testid={`passenger-form-${idx + 1}`}
                    className="border border-gray-100 rounded-xl p-4 mb-4">
                    <h3 className="font-semibold text-gray-700 mb-3">Passenger {idx + 1}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`passenger-name-${idx}`} className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                        <input type="text" id={`passenger-name-${idx}`} name={`passenger_name_${idx}`}
                          data-testid={`input-passenger-name-${idx + 1}`}
                          placeholder="Full name as on ID"
                          value={p.full_name}
                          onChange={e => handlePassengerChange(idx, 'full_name', e.target.value)}
                          className="input-field" />
                      </div>
                      <div>
                        <label htmlFor={`passenger-id-${idx}`} className="block text-sm font-medium text-gray-700 mb-1.5">ID Number (KTP/Passport)</label>
                        <input type="text" id={`passenger-id-${idx}`} name={`passenger_id_${idx}`}
                          data-testid={`input-passenger-id-${idx + 1}`}
                          placeholder="ID number"
                          value={p.id_number}
                          onChange={e => handlePassengerChange(idx, 'id_number', e.target.value)}
                          className="input-field" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Seat Selection */}
              <div className="card">
                <h2 className="font-bold text-gray-900 mb-4">
                  Seat Selection
                  <span className="text-sm font-normal text-gray-400 ml-2">
                    ({selectedSeats.length}/{passengerCount} selected)
                  </span>
                </h2>
                {scheduleDetail && (
                  <SeatMap
                    totalSeats={Math.min(scheduleDetail.total_seats || 40, 40)}
                    takenSeats={scheduleDetail.taken_seats || []}
                    selected={selectedSeats}
                    onSelect={setSelectedSeats}
                    maxSelect={passengerCount}
                  />
                )}
                {selectedSeats.length > 0 && (
                  <p id="selected-seats-display" data-testid="selected-seats-display"
                    className="mt-3 text-sm text-blue-600 font-medium">
                    Selected seats: {selectedSeats.join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* Summary */}
            <div>
              <div id="booking-summary" data-testid="booking-summary" className="card sticky top-24">
                <h2 className="font-bold text-gray-900 mb-4">Booking Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Train</span><span className="font-medium">{selected.train_name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Route</span><span className="font-medium">{selected.origin_city} → {selected.destination_city}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Class</span><span className="font-medium">{selected.class}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{filters.date}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Passengers</span><span className="font-medium">{passengerCount}</span></div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span id="total-price" data-testid="total-price" className="font-extrabold text-blue-600 text-lg">
                      {formatPrice(Number(selected.price) * passengerCount)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button id="btn-back-step1" data-testid="btn-back-step1"
                    onClick={() => setStep(1)} className="btn-secondary flex-1 text-sm">
                    Back
                  </button>
                  <button id="btn-confirm-booking" data-testid="btn-confirm-booking"
                    onClick={handleSubmit} disabled={submitting}
                    className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                    {submitting ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                    ) : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
