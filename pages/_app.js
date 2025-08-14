import '../app/globals.css';
import { useEffect } from 'react';

// Example: import your context providers here
// import { MyProvider } from '../components/my-context';

export default function MyApp({ Component, pageProps }) {
  // Wrap with providers as needed
  // return <MyProvider><Component {...pageProps} /></MyProvider>;
  return <Component {...pageProps} />;
}
