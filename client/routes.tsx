/* eslint-disable react/jsx-key */
import { createRoutesFromElements, Route } from 'react-router'
import App from './components/App'
import SignupPage from './components/SignupPage'
import LoginPage from './components/LoginPage'
import ScanPage from './components/ScanPage'
import LocationPage from './components/LocationPage'

const routes = createRoutesFromElements(
  <>
    <Route index element={<App />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/scan/:token" element={<ScanPage />} />
    <Route path="/location/:slug" element={<LocationPage />} />
  </>,
)

export default routes
