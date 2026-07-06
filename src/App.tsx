import { ToastProvider } from './context/ToastContext';
import { Dashboard } from './components/dashboard';

function App() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  );
}

export default App;
