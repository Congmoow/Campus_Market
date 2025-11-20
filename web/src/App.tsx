import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './app/Router';
import 'antd/dist/reset.css';
import './styles/theme.css';
import './styles/layout.css';
import './App.css';
import { useThemeStore } from './store/themeStore';
import { ConfigProvider as AntdConfigProvider, theme as antdTheme } from 'antd';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { theme } = useThemeStore();
  try {
    document.documentElement.setAttribute('data-theme', theme);
  } catch {}
  return (
    <AntdConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#3b82f6', // blue-500
          colorInfo: '#3b82f6',
          colorSuccess: '#10b981', // emerald-500
          colorWarning: '#f97316', // orange-500
          colorError: '#ef4444', // red-500
          borderRadius: 12,
          wireframe: false,
          fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
          fontSizeHeading1: 32,
          fontSizeHeading2: 24,
          fontSizeHeading3: 20,
        },
        components: {
          Button: {
            controlHeight: 40,
            controlHeightSM: 32,
            controlHeightLG: 48,
            borderRadius: 12,
            borderRadiusSM: 8,
            borderRadiusLG: 16,
            primaryShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
          },
          Card: {
            borderRadiusLG: 16,
            boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
          },
          Input: {
            controlHeight: 42,
            controlHeightSM: 34,
            controlHeightLG: 50,
            borderRadius: 10,
            activeShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
          },
          Select: {
            controlHeight: 42,
            borderRadius: 10,
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </QueryClientProvider>
    </AntdConfigProvider>
  );
}

export default App;

