import { Routes, Route } from 'react-router-dom'
import Home            from './pages/Home'
import ProfilerApp     from './pages/ProfilerApp'
import Pricing         from './pages/Pricing'
import CheckoutSuccess from './pages/CheckoutSuccess'

export default function App() {
  return (
    <Routes>
      <Route path="/"                 element={<Home />} />
      <Route path="/profile"          element={<ProfilerApp />} />
      <Route path="/pricing"          element={<Pricing />} />
      <Route path="/checkout/success" element={<CheckoutSuccess />} />
      {/* Token-based intake — ?token=xxx still works on /profile */}
      <Route path="*"                 element={<ProfilerApp />} />
    </Routes>
  )
}
