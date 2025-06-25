import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import ProfileMenu from '../pages/student/ProfileMenu';
import { getToken } from '../utils/auth';
import { BASE_API_URL } from '../pages/apiurl';
import useAuthRedirect from '../utils/useAuthRedirect';

const DEFAULT_AVATAR = '/default-avatar.png';

const menuItems = [
	{ label: 'Books', key: 'books', children: [
		{ label: 'Class 6', key: 'class6' },
		{ label: 'Class 7', key: 'class7' },
		{ label: 'Class 8', key: 'class8' },
		{ label: 'Class 9', key: 'class9' },
		{ label: 'Class 10', key: 'class10' },
	]},
	{ label: 'Digital Resources', key: 'resources' },
	// Add more menu items as needed
];

export default function StudentSidebar({ userEmail, userData, onProfileUpdate, onMenuSelect }) {
	useAuthRedirect();

	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [profileMenuOpen, setProfileMenuOpen] = useState(false);
	const router = useRouter();

	// Load profile from backend
	useEffect(() => {
		const fetchProfile = async () => {
			setLoading(true);
			try {
				const res = await fetch(`${BASE_API_URL}/profile`, {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${getToken()}`
					}
				});
				const data = await res.json();
				if (res.ok && data.user) {
					setProfile(data.user);
				} else {
					setProfile(null);
				}
			} catch {
				setProfile(null);
			}
			setLoading(false);
		};
		if (getToken()) fetchProfile();
		else {
			setProfile(null);
			setLoading(false);
		}
	}, [userEmail]);

	// Callback to update sidebar after profile edit
	const handleProfileUpdate = () => {
		const fetchProfile = async () => {
			try {
				const res = await fetch(`${BASE_API_URL}/profile`, {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${getToken()}`
					}
				});
				const data = await res.json();
				if (res.ok && data.user) {
					setProfile(data.user);
				}
			} catch {}
		};
		if (getToken()) fetchProfile();
		if (onProfileUpdate) onProfileUpdate();
	};

	// In the sidebar UI, show a skeleton or placeholder while loading
	if (loading) {
		return (
			<div style={{ width: 260, background: '#f7f9fb', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', position: 'fixed', left: 0, top: 0, zIndex: 1000 }}>
				<div style={{ marginBottom: 32, textAlign: 'center' }}>
					<div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e1e5e9', margin: '0 auto' }} />
					<div style={{ height: 20, width: 120, background: '#e1e5e9', borderRadius: 8, margin: '16px auto 8px' }} />
					<div style={{ height: 16, width: 100, background: '#e1e5e9', borderRadius: 8, margin: '0 auto' }} />
				</div>
			</div>
		);
	}

	return (
		<div style={{
			width: 260,
			background: '#f7f9fb',
			height: '100vh',
			boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			padding: '32px 0',
			position: 'fixed',
			left: 0,
			top: 0,
			zIndex: 1000
		}}>
			{/* Profile Section */}
			<div style={{ marginBottom: 32, textAlign: 'center', cursor: 'pointer' }} onClick={() => router.push('/student/profile')}>
				<img
					src={profile?.photo || DEFAULT_AVATAR}
					alt="Profile"
					style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e1e5e9', background: '#fff' }}
				/>
				<div style={{ fontWeight: 700, fontSize: 18, marginTop: 12 }}>{profile?.name || 'Student Name'}</div>
				<div style={{ fontSize: 15, color: '#2a5298', fontWeight: 500 }}>{profile?.class ? `Class: ${profile.class}` : ''}</div>
				<div style={{ fontSize: 14, color: '#888' }}>{profile?.email || userEmail}</div>
			</div>
			{/* ProfileMenu Modal (optional, can be removed if only redirect is needed) */}
			{profileMenuOpen && (
				// <ProfileMenu
				// 	userEmail={userEmail}
				// 	userData={profile}
				// 	onProfileUpdate={() => {
				// 		handleProfileUpdate();
				// 		setProfileMenuOpen(false);
				// 	}}
				// 	avatarStyle={{ display: 'none' }}
				// />
				<></>
			)}
			{/* Menu Section */}
			<nav style={{ width: '100%' }}>
				{menuItems.map(item => (
					<div key={item.key} style={{ marginBottom: 12 }}>
						<div
							style={{
								fontWeight: 600,
								fontSize: 16,
								padding: '10px 24px',
								cursor: 'pointer',
								color: '#1e3c72',
								background: '#eaf0fa',
								borderRadius: 8
							}}
							onClick={() => onMenuSelect && onMenuSelect(item.key)}
						>
							{item.label}
						</div>
						{item.children && (
							<div style={{ marginLeft: 24, marginTop: 6 }}>
								{item.children.map(child => (
									<div
										key={child.key}
										style={{
											fontSize: 15,
											padding: '7px 0',
											color: '#2a5298',
											cursor: 'pointer',
											borderRadius: 6
										}}
										onClick={() => onMenuSelect && onMenuSelect(child.key)}
									>
										{child.label}
									</div>
								))}
							</div>
						)}
					</div>
				))}
			</nav>
		</div>
	);
}
