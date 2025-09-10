import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import theme from './theme';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/layout/navbar';
import AppRoutes from './routes/appRoutes';
import './styles/global.css';

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CartProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <AppRoutes />
            </main>
          </div>
        </CartProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
