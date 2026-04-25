import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';

/**
 * Figma Make Entrypoint
 * This component renders the React Router configuration.
 * It also supports the Next.js directory structure for local download and development.
 */
function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
