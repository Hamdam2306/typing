import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { BrowserRouter } from 'react-router-dom';
import { Router } from './routes/router';
import { OverlayProvider } from './components/overlay';
// import Timer from './components/timer';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
		    <OverlayProvider>
			  <Router/>
			</OverlayProvider>
		</BrowserRouter>
	</StrictMode>
);
