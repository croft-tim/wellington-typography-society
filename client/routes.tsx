/* eslint-disable react/jsx-key */
import { createRoutesFromElements, Route } from 'react-router'
import App from './components/App'
import SignupPage from './components/SignupPage'
import LoginPage from './components/LoginPage'
import ScanPage from './components/ScanPage'

const routes = createRoutesFromElements(
  <>
    <Route index element={<App />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/scan/:token" element={<ScanPage />} />
  </>,
)

export default routes
