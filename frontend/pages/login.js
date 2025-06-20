import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../service/api';

export default function Login() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.post('/send-otp', { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.post('/verify-otp', { email, otp });
      setMessage(res.data.message);
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/home');
    } catch (err) {
      setMessage(err.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <main>
      <h1>Login with OTP</h1>
      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          /><br />
          <button type="submit">Send OTP</button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            required
          /><br />
          <button type="submit">Verify OTP</button>
        </form>
      )}
      {message && <p>{message}</p>}
    </main>
  );
}
