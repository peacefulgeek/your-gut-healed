import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './styles/tokens.css';

const container = document.getElementById('app')!;

hydrateRoot(
  container,
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
