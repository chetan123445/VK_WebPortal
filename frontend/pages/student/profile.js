import React, { useEffect, useState } from 'react';
import ProfileMenu from './ProfileMenu';
import { getToken } from '../../utils/auth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (!getToken()) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      }
    } else {
      setUserEmail(localStorage.getItem('userEmail') || '');
      setCheckedAuth(true);
    }
  }, [router]);

  if (!checkedAuth) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fa', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <ProfileMenu userEmail={userEmail} userData={{}} avatarStyle={{ display: 'none' }} forceOpen />
    </div>
  );
}
