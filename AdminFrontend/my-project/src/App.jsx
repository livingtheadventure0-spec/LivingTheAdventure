import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./Dashboard/Dashboard"
import HomeAnimation from "./components/IntroAnimation/Home_animation";
import EventsListPage from "./Home/EventListPage";
import CreateEventPage from "./CreateEvent/Createeventpage";
import EventDetailPage from "./EventPage/EventDetailPage";
import DashboardPage from "./Dashboard/Dashboard";
import ComingSoonPage from "./components/ComingSoonPage";
import UsersListPage from "./Users/UsersListPage";
import HeroManagementPage from "./Heroes/HeroManagementPage";
import BookingsPage from "./Booking/BookingsPage";
import LogsPage from "./Logs/LogsPage";



function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={
          <Login />}
        />

        <Route
          path="/loading"
          element={
            <ProtectedRoute>
              <HomeAnimation />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
        />
        <Route path="/admin/home" element={
          <ProtectedRoute>
            <EventsListPage />
          </ProtectedRoute>
        }
        />

        <Route path="/admin/events" element={<Navigate to="/admin/home" replace />} />

        <Route path="/admin/events/:eventId/edit" element={
          <ProtectedRoute>
            <CreateEventPage />
          </ProtectedRoute>
        }
        />

        <Route path="/admin/events/new" element={
          <ProtectedRoute>
            <CreateEventPage />
          </ProtectedRoute>
        }
        />

        <Route path="/admin/events/:eventId" element={
          <ProtectedRoute>
            <EventDetailPage />
          </ProtectedRoute>
        }
        />
        <Route path="/admin/logs" element={
          <ProtectedRoute>
            <LogsPage />
          </ProtectedRoute>
        }
        />
        <Route path="/admin/bookings" element={
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        }
        />
        <Route path="/admin/guides" element={
          <ProtectedRoute>
            <ComingSoonPage pageName="Guides" />
          </ProtectedRoute>
        }
        />
        <Route path="/admin/analytics" element={
          <ProtectedRoute>
            <ComingSoonPage pageName="Analytics" />
          </ProtectedRoute>
        }
        />
        <Route path="/admin/heroes" element={
          <ProtectedRoute>
            <HeroManagementPage />
          </ProtectedRoute>
        }
        />

        <Route path="/admin/settings" element={
          <ProtectedRoute>
            <ComingSoonPage pageName="Settings" />
          </ProtectedRoute>
        }
        />

        <Route path="/admin/users" element={
          <ProtectedRoute>
            <UsersListPage />
          </ProtectedRoute>
        }
        />


        <Route path="*" element={<Navigate to="/admin/home" replace />} />
      </Routes>
    </BrowserRouter >
  );
}

export default App;