import { Routes, Route } from 'react-router-dom'
import ProfilerApp     from './pages/ProfilerApp'
import Pricing         from './pages/Pricing'
import CheckoutSuccess from './pages/CheckoutSuccess'

export default function App() {
  return (
    <Routes>
      <Route path="/pricing"          element={<Pricing />} />
      <Route path="/checkout/success" element={<CheckoutSuccess />} />
      <Route path="*"                 element={<ProfilerApp />} />
    </Routes>
  )
}
