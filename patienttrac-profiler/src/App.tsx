import { Routes, Route } from 'react-router-dom'
import Home            from './pages/Home'
import ProfilerApp     from './pages/ProfilerApp'
import Pricing         from './pages/Pricing'
import CheckoutSuccess from './pages/CheckoutSuccess'
import Privacy         from './pages/Privacy'
import Terms           from './pages/Terms'
import Hipaa           from './pages/Hipaa'

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
      <Route path="*"                 element={<ProfilerApp />} />
    </Routes>
  )
}
