import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { BrowserRouter } from 'react-router-dom';
// import { Router } from './routes/router';
import { OverlayProvider } from './components/overlay';
import { TypingStatsProvider } from './pages/typing-context';

// 🆕 Redux importlari
import { Provider } from 'react-redux';
import { store } from './pages/auth/login/store.tsx';
import AuthObserver from './pages/auth/login/auth-listener.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Provider store={store}> {/* 🧠 Redux Provider */}
			<BrowserRouter>
				<OverlayProvider>
					<TypingStatsProvider>
						<AuthObserver />
					
					</TypingStatsProvider>
				</OverlayProvider>
			</BrowserRouter>
		</Provider>
	</StrictMode>
);
