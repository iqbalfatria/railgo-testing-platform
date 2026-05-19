import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const sidebarItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊', testId: 'sidebar-dashboard', exact: true },
  { to: '/booking', label: 'Book Ticket', icon: '🎫', testId: 'sidebar-booking' },
  { to: '/dashboard/tickets', label: 'My Tickets', icon: '🎟️', testId: 'sidebar-tickets' },
  { to: '/dashboard/profile', label: 'Profile', icon: '👤', testId: 'sidebar-profile' },
  { to: '/qa-sandbox', label: 'QA Sandbox', icon: '🧪', testId: 'sidebar-qa' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <aside
      id="sidebar"
      data-testid="sidebar"
      className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2 font-extrabold text-xl text-blue-600">
          <span className="text-2xl">🚆</span>
          <span>Rail<span className="text-gray-900">Go</span></span>
        </div>
      </div>

      {/* User Info */}
      <div
        id="sidebar-user-info"
        data-testid="sidebar-user-info"
        className="p-4 mx-3 my-3 bg-blue-50 rounded-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm truncate max-w-[130px]"
               id="sidebar-user-name"
               data-testid="sidebar-user-name">
              {user?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-[130px]"
               id="sidebar-user-email"
               data-testid="sidebar-user-email">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 pb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
          Main Menu
        </p>
        {sidebarItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            id={item.testId}
            data-testid={item.testId}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          id="btn-sidebar-logout"
          data-testid="btn-sidebar-logout"
          onClick={handleLogout}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <span className="text-lg">🚪</span>
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
