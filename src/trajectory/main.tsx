import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import TrajectoryPage from './TrajectoryPage';
import '../index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TrajectoryPage />
  </StrictMode>,
);
