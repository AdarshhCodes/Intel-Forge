import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout';
import {
  Dashboard,
  EvidenceInbox,
  InvestigationSearch,
  Connections,
  Reports,
} from './pages';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/evidence-inbox" element={<EvidenceInbox />} />
          <Route path="/investigation-search" element={<InvestigationSearch />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
