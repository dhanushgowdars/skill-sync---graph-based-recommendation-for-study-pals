import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Pages
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Stats from './pages/Stats';
import Teacher from './pages/Teacher';
import Navbar from './components/Layout/Navbar';

// Placeholder Context (We will build the real one next)
const UserProvider = ({children}) => <div>{children}</div>; 

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-white flex flex-col">
          <Navbar />
          <main className="flex-1 relative">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/onboard" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/teacher" element={<Teacher />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;