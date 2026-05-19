import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50" id="dashboard-layout" data-testid="dashboard-layout">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto" id="dashboard-main" data-testid="dashboard-main">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
