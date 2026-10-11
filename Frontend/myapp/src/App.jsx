// App.jsx
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home/Home.jsx'
import EventDetail from './components/EventDetails/EventDetail.jsx'
import ViewAll from './components/View/ViewAll.jsx';
import Auth from './Authentication/Auth.jsx';
import SignupForm from './Authentication/SignupForm.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Profile from './components/Profile/Profile.jsx';
import AboutUs from './components/Legal/AboutUs.jsx';
import ContactUs from './components/Legal/ContactUs.jsx';
import PrivacyPolicyPage from './components/Legal/PrivacyPolicyPage.jsx';
import TermsConditions from './components/Legal/TermsConditions.jsx';
import RefundPolicy from './components/Legal/RefundPolicy.jsx';
import HelpCenter from './components/Legal/HelpCenter.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home heroType="home" />} />
          <Route path="/treks" element={<Home heroType="trek" />} />
          <Route path="/trips" element={<Home heroType="trip" />} />
          <Route path="/adventure-activity" element={<Home heroType="adventure" />} />
          <Route path="/peak-expedition" element={<Home heroType="peek" />} />
          <Route path="/park-development-design" element={<Home heroType="parkdev" />} />
          <Route path="/eventDetails/:id" element={<EventDetail />} />

          <Route path="/adventure" element={<ViewAll event_type="adventure" />} />
          <Route path="/trip" element={<ViewAll event_type="trip" />} />
          <Route path="/trek" element={<ViewAll event_type="trek" />} />
          <Route path="/peak" element={<ViewAll event_type="peak" />} />
          <Route path="/special_event" element={<ViewAll event_type="special_event" />} />
          <Route path="/best_of_the_year" element={<ViewAll event_type="best_of_the_year" />} />

          <Route path="/adventure/upcoming" element={<ViewAll event_type="adventure" state="Upcoming" />} />
          <Route path="/adventure/launched" element={<ViewAll event_type="adventure" state="Launched Now!" />} />
          <Route path="/adventure/completed" element={<ViewAll event_type="adventure" state="Completed" />} />
          <Route path="/adventure/inprogress" element={<ViewAll event_type="adventure" state="In Progress" />} />
          <Route path="/adventure/launch" element={<ViewAll event_type="adventure" state="Launch" />} />


          <Route path="/trip/upcoming" element={<ViewAll event_type="trip" state="Upcoming" />} />
          <Route path="/trip/launched" element={<ViewAll event_type="trip" state="Launched Now!" />} />
          <Route path="/trip/completed" element={<ViewAll event_type="trip" state="Completed" />} />
          <Route path="/trip/inprogress" element={<ViewAll event_type="trip" state="In Progress" />} />
          <Route path="/trip/launch" element={<ViewAll event_type="trip" state="Launch" />} />


          <Route path="/trek/upcoming" element={<ViewAll event_type="trek" state="Upcoming" />} />
          <Route path="/trek/launched" element={<ViewAll event_type="trek" state="Launched Now!" />} />
          <Route path="/trek/completed" element={<ViewAll event_type="trek" state="Completed" />} />
          <Route path="/trek/inprogress" element={<ViewAll event_type="trek" state="In Progress" />} />
          <Route path="/trek/launch" element={<ViewAll event_type="trek" state="Launch" />} />

          <Route path="/peek/upcoming" element={<ViewAll event_type="peak" state="Upcoming" />} />
          <Route path="/peek/launched" element={<ViewAll event_type="peak" state="Launched Now!" />} />
          <Route path="/peek/completed" element={<ViewAll event_type="peak" state="Completed" />} />
          <Route path="/peek/inprogress" element={<ViewAll event_type="peak" state="In Progress" />} />
          <Route path="/pee k/launch" element={<ViewAll event_type="peak" state="Launch" />} />

          <Route path="/special_event/upcoming" element={<ViewAll event_type="special_event" state="Upcoming" />} />
          <Route path="/special_event/launched" element={<ViewAll event_type="special_event" state="Launched Now!" />} />
          <Route path="/special_event/completed" element={<ViewAll event_type="special_event" state="Completed" />} />
          <Route path="/special_event/inprogress" element={<ViewAll event_type="special_event" state="In Progress" />} />
          <Route path="/special_event/launch" element={<ViewAll event_type="special_event" state="Launch" />} />

          <Route path="/best_of_the_year/upcoming" element={<ViewAll event_type="best_of_the_year" state="Upcoming" />} />
          <Route path="/best_of_the_year/launched" element={<ViewAll event_type="best_of_the_year" state="Launched Now!" />} />
          <Route path="/best_of_the_year/completed" element={<ViewAll event_type="best_of_the_year" state="Completed" />} />
          <Route path="/best_of_the_year/inprogress" element={<ViewAll event_type="best_of_the_year" state="In Progress" />} />
          <Route path="/best_of_the_year/launch" element={<ViewAll event_type="best_of_the_year" state="Launch" />} />

          <Route path="/auth" element={<Auth />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/profile" element={<Profile />} />

          {/* Legal & Info pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/help" element={<HelpCenter />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
