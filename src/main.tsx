import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { BrowserRouter } from 'react-router-dom';
import { OverlayProvider } from './components/overlay';
import { TypingStatsProvider } from './pages/typing-context';

import { Provider } from 'react-redux';
import { store } from './pages/auth/login/store.tsx';
import AuthObserver from './pages/auth/login/auth-listener.tsx';
import { TypingProvider } from './context/typing-context.tsx';
import { AuthProvider } from './context/auth-context.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Provider store={store}> 
			<BrowserRouter>
				<OverlayProvider>
					<TypingStatsProvider>
						<TypingProvider>
							<AuthProvider>
								<AuthObserver />
							</AuthProvider>
						</TypingProvider>
					</TypingStatsProvider>
				</OverlayProvider>
			</BrowserRouter>
		</Provider>
	</StrictMode>
);
