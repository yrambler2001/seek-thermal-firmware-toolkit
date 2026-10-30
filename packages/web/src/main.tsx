import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { followLanguageChoice, initI18n } from './i18n';
import './styles.css';

const container = document.getElementById('root');
if (container === null) throw new Error('#root is missing from index.html');

/* The language is picked and loaded before the first render (src/i18n), so a
 * page opened in another language never shows English first. A language that
 * fails to load leaves English; initI18n never rejects. */
await initI18n();
/* A language picked in another tab of the page applies here too. */
followLanguageChoice();

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
