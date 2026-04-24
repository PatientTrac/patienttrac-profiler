import { Routes, Route } from 'react-router-dom'
import Home            from './pages/Home'
import ProfilerApp     from './pages/ProfilerApp'
import Pricing         from './pages/Pricing'
import CheckoutSuccess from './pages/CheckoutSuccess'
import Privacy         from './pages/Privacy'
import Terms           from './pages/Terms'
import Hipaa           from './pages/Hipaa'
import Contact         from './pages/Contact'
import Admin           from './pages/Admin'
import AdminPanel      from './pages/AdminPanel'

export default function App() {
  return (
    <Routes>
      <Route path="/"                 element={<Home />} />
      <Route path="/profile"          element={<ProfilerApp />} />
      <Route path="/pricing"          element={<Pricing />} />
      <Route path="/checkout/success" element={<CheckoutSuccess />} />
      <Route path="/privacy"          element={<Privacy />} />
      <Route path="/terms"            element={<Terms />} />
      <Route path="/hipaa"            element={<Hipaa />} />
      <Route path="/contact"          element={<Contact />} />
      <Route path="/admin"            element={<Admin />} />
      <Route path="/admin/panel"      element={<AdminPanel />} />
      <Route path="*"                 element={<ProfilerApp />} />
    </Routes>
  )
}
