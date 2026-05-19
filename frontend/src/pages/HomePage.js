import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const features = [
  {
    icon: '⚡',
    title: 'Fast Booking',
    desc: 'Book your train ticket in under 2 minutes with our streamlined process.',
    testId: 'feature-fast-booking'
  },
  {
    icon: '📱',
    title: 'E-Ticket',
    desc: 'Get your ticket delivered instantly to your account. No printing needed.',
    testId: 'feature-eticket'
  },
  {
    icon: '💺',
    title: 'Real-time Seat',
    desc: 'Check seat availability in real-time and choose your preferred seat.',
    testId: 'feature-seat'
  },
  {
    icon: '🔒',
    title: 'Secure Payment',
    desc: 'Multiple payment methods with bank-level security encryption.',
    testId: 'feature-payment'
  },
];

const cities = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Malang', 'Bogor'];

const HomePage = () => {
  const navigate = useNavigate();

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const form = e.target;
    const origin = form.origin.value;
    const destination = form.destination.value;
    const date = form.date.value;
    if (origin && destination && date) {
      navigate(`/schedule?origin=${origin}&destination=${destination}&date=${date}`);
    }
  };

  return (
    <div id="home-page" data-testid="home-page" className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section
        id="hero-section"
        data-testid="hero-section"
        className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white overflow-hidden"
      >
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full opacity-20" />
          <div className="absolute bottom-0 -left-12 w-72 h-72 bg-blue-400 rounded-full opacity-10" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[20rem] opacity-5 select-none">
            🚆
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-2xl slide-up">
            <div
              id="hero-badge"
              data-testid="hero-badge"
              className="inline-flex items-center gap-2 bg-blue-500 bg-opacity-50 backdrop-blur-sm border border-blue-400 border-opacity-50 rounded-full px-4 py-2 text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              QA Testing Platform — v1.0
            </div>

            <h1
              id="hero-headline"
              data-testid="hero-headline"
              className="text-4xl lg:text-6xl font-extrabold leading-tight mb-4"
            >
              Easy Train Ticket<br />
              <span className="text-blue-200">Booking</span>
            </h1>

            <p
              id="hero-subtitle"
              data-testid="hero-subtitle"
              className="text-lg text-blue-100 mb-8 max-w-lg leading-relaxed"
            >
              Simulasi platform booking untuk pembelajaran QA Testing &amp;
              Automation Testing menggunakan Katalon Studio.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/booking"
                id="btn-hero-book"
                data-testid="btn-hero-book"
                className="bg-white text-blue-600 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Book Now →
              </Link>
              <Link
                to="/schedule"
                id="btn-hero-explore"
                data-testid="btn-hero-explore"
                className="bg-blue-500 bg-opacity-40 backdrop-blur-sm text-white font-bold px-8 py-3.5 rounded-xl border border-blue-400 border-opacity-50 hover:bg-opacity-60 transition-all duration-200"
              >
                Explore Schedule
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Section */}
      <section
        id="quick-search-section"
        data-testid="quick-search-section"
        className="max-w-5xl mx-auto px-4 -mt-8 relative z-10"
      >
        <div className="card shadow-xl fade-in">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Search</h2>
          <form
            id="form-quick-search"
            data-testid="form-quick-search"
            onSubmit={handleQuickSearch}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="origin-city" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  From
                </label>
                <select
                  id="origin-city"
                  name="origin"
                  data-testid="select-origin"
                  className="input-field"
                  defaultValue=""
                >
                  <option value="" disabled>Select city</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="destination-city" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  To
                </label>
                <select
                  id="destination-city"
                  name="destination"
                  data-testid="select-destination"
                  className="input-field"
                  defaultValue=""
                >
                  <option value="" disabled>Select city</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="departure-date" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Date
                </label>
                <input
                  type="date"
                  id="departure-date"
                  name="date"
                  data-testid="input-departure-date"
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  id="btn-search-train"
                  data-testid="btn-search-train"
                  className="btn-primary w-full"
                >
                  Search Train
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features-section"
        data-testid="features-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Why Choose RailGo?</h2>
          <p className="text-gray-500 text-lg">Platform terlengkap untuk belajar QA Testing</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.testId}
              id={f.testId}
              data-testid={f.testId}
              className="card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 text-center"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section
        id="stats-section"
        data-testid="stats-section"
        className="bg-blue-600 text-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '50+', label: 'Test Cases', testId: 'stat-testcases' },
              { value: '17+', label: 'Train Routes', testId: 'stat-routes' },
              { value: '7', label: 'API Endpoints', testId: 'stat-endpoints' },
              { value: '100%', label: 'QA Ready', testId: 'stat-qa' },
            ].map(s => (
              <div key={s.testId} id={s.testId} data-testid={s.testId}>
                <p className="text-4xl font-extrabold mb-1">{s.value}</p>
                <p className="text-blue-200 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" data-testid="footer" className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 font-extrabold text-xl text-white mb-3">
                <span>🚆</span>
                <span>RailGo</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Platform simulasi booking tiket kereta untuk pembelajaran QA Testing dan Automation Testing.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Contact</h4>
              <ul id="footer-contact" data-testid="footer-contact" className="space-y-2 text-sm">
                <li>📧 qa@railgo.com</li>
                <li>📞 +62 21 1234 5678</li>
                <li>📍 Jakarta, Indonesia</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Social Media</h4>
              <div id="footer-social" data-testid="footer-social" className="flex gap-4">
                {['GitHub', 'Twitter', 'LinkedIn'].map(s => (
                  <a key={s} href="#" data-testid={`social-${s.toLowerCase()}`}
                     className="text-sm text-gray-400 hover:text-white transition-colors">
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center">
            <p id="footer-copyright" data-testid="footer-copyright" className="text-sm text-gray-500">
              © 2024 RailGo Testing Platform. Dibuat untuk pembelajaran QA Testing.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
