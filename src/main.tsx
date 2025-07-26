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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Provider store={store}>
			<BrowserRouter>
				<QueryClientProvider client={queryClient}>
					<OverlayProvider>
						<TypingStatsProvider>
							<TypingProvider>
								<AuthProvider>
									<AuthObserver />
								</AuthProvider>
							</TypingProvider>
						</TypingStatsProvider>
					</OverlayProvider>
				</QueryClientProvider>
			</BrowserRouter>
		</Provider>
	</StrictMode>
);
