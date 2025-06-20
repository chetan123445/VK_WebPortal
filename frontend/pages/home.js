import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check login status
    if (typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') !== 'true') {
      router.replace('/login');
    }
  }, [router]);

  return (
    <main>
      <h1>This is the home page</h1>
    </main>
  );
}
