/* eslint-disable react/jsx-key */
import { createRoutesFromElements, Route } from 'react-router'
import App from './components/App'
import SignupPage from './components/SignupPage'
import LoginPage from './components/LoginPage'

const routes = createRoutesFromElements(
  <>
    <Route index element={<App />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/login" element={<LoginPage />} />
  </>,
)

export default routes
