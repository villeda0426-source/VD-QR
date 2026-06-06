import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CampaignPage from './pages/CampaignPage.jsx';
import AdminPage    from './pages/AdminPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"      element={<CampaignPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
