import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Welcome to VK!!</h1>
      <Link href="/login">
        <button>Login</button>
      </Link>
    </main>
  );
}
