import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

// Components
import Navbar from './components/Layout/Navbar';

// Pages
import Landing from './pages/Landing';
// We will uncomment these as we build them
// import Onboarding from './pages/Onboarding';
// import Dashboard from './pages/Dashboard';
// import Stats from './pages/Stats';
// import Teacher from './pages/Teacher';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-white flex flex-col font-sans selection:bg-primary/30">
          <Navbar />
          <main className="flex-1 relative">
            <Routes>
              <Route path="/" element={<Landing />} />
              {/* <Route path="/onboard" element={<Onboarding />} /> */}
              {/* <Route path="/dashboard" element={<Dashboard />} /> */}
              {/* <Route path="/stats" element={<Stats />} /> */}
              {/* <Route path="/teacher" element={<Teacher />} /> */}
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;