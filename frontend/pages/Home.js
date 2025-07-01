"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const featuredBooks = [
	{
		title: "Atomic Habits",
		author: "James Clear",
		img: "https://images-na.ssl-images-amazon.com/images/I/91bYsX41DVL.jpg",
	},
	{
		title: "Ikigai",
		author: "Héctor García, Francesc Miralles",
		img: "https://images-na.ssl-images-amazon.com/images/I/81l3rZK4lnL.jpg",
	},
	{
		title: "The Almanack of Naval Ravikant",
		author: "Naval Ravikant",
		img: "https://images-na.ssl-images-amazon.com/images/I/71U0pT9yTGL.jpg",
	},
	{
		title: "Deep Work",
		author: "Cal Newport",
		img: "https://images-na.ssl-images-amazon.com/images/I/81l3rZK4lnL._AC_UL600_SR600,600_.jpg",
	},
	{
		title: "The Subtle Art of Not Giving a F*ck",
		author: "Mark Manson",
		img: "https://images-na.ssl-images-amazon.com/images/I/71QKQ9mwV7L.jpg",
	},
	{
		title: "Rich Dad Poor Dad",
		author: "Robert Kiyosaki",
		img: "https://images-na.ssl-images-amazon.com/images/I/81bsw6fnUiL.jpg",
	},
	{
		title: "Thinking, Fast and Slow",
		author: "Daniel Kahneman",
		img: "https://images-na.ssl-images-amazon.com/images/I/71p8G+YQJwL.jpg",
	},
];

const recommendedBooks = [
	{
		title: "Emotional Intelligence",
		author: "Danyel Goleman",
		img: "https://images-na.ssl-images-amazon.com/images/I/81-350uU6yL.jpg",
		rating: 4.9,
		price: 32,
	},
	{
		title: "How to talk to anyone",
		author: "Leil Lowndes",
		img: "https://images-na.ssl-images-amazon.com/images/I/81QpkIctqPL.jpg",
		rating: 4.9,
		price: 32,
	},
	{
		title: "Who Moved My Cheese?",
		author: "Spencer Johnson",
		img: "https://images-na.ssl-images-amazon.com/images/I/71kxa1-0mfL.jpg",
		rating: 4.9,
		price: 32,
	},
	{
		title: "The Psychology of Money",
		author: "Morgan Housel",
		img: "https://images-na.ssl-images-amazon.com/images/I/71g2ednj0JL.jpg",
		rating: 4.9,
		price: 32,
	},
];

const authors = [
	{
		name: "James Clear",
		img: "https://randomuser.me/api/portraits/men/32.jpg",
	},
	{
		name: "Nepoleon Hill",
		img: "https://randomuser.me/api/portraits/men/45.jpg",
	},
	{
		name: "Robert Kiyosaki",
		img: "https://randomuser.me/api/portraits/men/52.jpg",
	},
	{
		name: "Brian Tracy",
		img: "https://randomuser.me/api/portraits/men/60.jpg",
	},
];

export default function Home() {
	const router = useRouter();
	const [slideIdx, setSlideIdx] = useState(0);
	const [coverIdx, setCoverIdx] = useState(1); // center index for coverflow
	const visibleCount = 3;

	const handlePrev = () => {
		setSlideIdx((prev) =>
			prev === 0 ? featuredBooks.length - visibleCount : prev - 1
		);
	};
	const handleNext = () => {
		setSlideIdx((prev) =>
			prev >= featuredBooks.length - visibleCount ? 0 : prev + 1
		);
	};
	const handleCoverPrev = () => {
		setCoverIdx((prev) => (prev === 0 ? featuredBooks.length - 1 : prev - 1));
	};
	const handleCoverNext = () => {
		setCoverIdx((prev) => (prev === featuredBooks.length - 1 ? 0 : prev + 1));
	};

	// Auto-slide for coverflow every 1.5s
	useEffect(() => {
		const interval = setInterval(() => {
			setCoverIdx((prev) => (prev === featuredBooks.length - 1 ? 0 : prev + 1));
		}, 1500);
		return () => clearInterval(interval);
	}, []);

	return (
		<div
			style={{
				minHeight: "100vh",
				width: "100vw",
				background: "#f9f7f2",
				fontFamily: "Georgia, 'Segoe UI', Arial, sans-serif",
			}}
		>
			{/* Navbar */}
			<div
				style={{
					width: "100%",
					background: "#fff",
					boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "0 48px",
					height: 72,
					position: "sticky",
					top: 0,
					zIndex: 10,
				}}
			>
				<div
					style={{
						fontWeight: 700,
						fontSize: 24,
						color: "#c97a2b",
						letterSpacing: 1,
					}}
				>
					<img
						src="/vkpublications.png"
						alt="logo"
						style={{ height: 48, width: "auto", verticalAlign: "middle" }}
					/>
				</div>
				<div
					style={{
						display: "flex",
						gap: 18,
						alignItems: "center",
					}}
				>
					{["Home", "E-book", "About", "Wishlist", "My cart"].map((label, idx) => {
						let props = {
							style: {
								color: "#222",
								textDecoration: "none",
								fontWeight: 500,
								padding: "8px 22px",
								borderRadius: 10,
								background: "#fff",
								boxShadow: "0 4px 24px 0 rgba(31, 38, 135, 0.10)",
								border: "1px solid rgba(200,200,200,0.25)",
								transition: "background 0.2s, box-shadow 0.2s, transform 0.18s cubic-bezier(.36,.07,.19,.97)",
								cursor: "pointer",
								display: "inline-block"
							},
							onMouseEnter: e => {
								e.currentTarget.style.transform = "scale(0.92)";
							},
							onMouseLeave: e => {
								e.currentTarget.style.transform = "none";
							}
						};
						// Routing logic
						if (label === "Home") {
							props.href = "#";
							props.onClick = e => { e.preventDefault(); router.push("/"); };
						} else if (label === "About") {
							props.href = "https://vkpublications.com/pages/vk";
							props.target = "_blank";
							props.rel = "noopener noreferrer";
						} else {
							props.href = "#";
						}
						return (
							<a key={label} {...props}>
								{label}
							</a>
						);
					})}
				</div>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 24,
					}}
				>
					{/* Replace search, EN, and profile pic with Login button */}
					<button
						style={{
							background: "#c97a2b",
							color: "#fff",
							border: "none",
							borderRadius: 8,
							padding: "10px 32px",
							fontWeight: 600,
							fontSize: 17,
							cursor: "pointer",
							boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
							transition: "background 0.2s",
						}}
						onClick={() => router.push("/login")}
					>
						Login
					</button>
				</div>
			</div>
			{/* Hero Section */}
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "center",
					padding: "56px 0 32px 0",
					gap: 64,
				}}
			>
				<div style={{ maxWidth: 420 }}>
					<div
						style={{
							fontSize: "3rem",
							fontWeight: 600,
							color: "#3a2e1a",
							lineHeight: 1.1,
							marginBottom: 16,
						}}
					>
						Find Your
						<br />
						Next Book
					</div>
					<div
						style={{
							color: "#6d5c3d",
							fontSize: "1.15rem",
							marginBottom: 32,
						}}
					>
						Discover a world where every page brings a new adventure. At Paper
						Haven, we curate a diverse collection of books.
					</div>
					<button
						style={{
							background: "#c97a2b",
							color: "#fff",
							border: "none",
							borderRadius: 6,
							padding: "12px 32px",
							fontSize: "1.1rem",
							fontWeight: 600,
							cursor: "pointer",
							boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
							transition: "background 0.2s",
						}}
						onClick={() => window.open("https://vkpublications.com/", "_blank")}
					>
						Explore Now &rarr;
					</button>
				</div>
				{/* Book Carousel */}
				<div style={{ position: "relative", width: 600, height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
					<button
						onClick={handlePrev}
						style={{
							position: "absolute",
							left: -32,
							top: "50%",
							transform: "translateY(-50%)",
							background: "#fff",
							border: "1px solid #ccc",
							borderRadius: "50%",
							width: 32,
							height: 32,
							cursor: "pointer",
							boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
							zIndex: 2,
						}}
						aria-label="Previous"
					>
						&#8592;
					</button>
					<div
						style={{
							width: 540,
							height: 280,
							overflow: "hidden",
							position: "relative",
						}}
					>
						<div
							style={{
								display: "flex",
								transition: "transform 0.5s cubic-bezier(.36,.07,.19,.97)",
								transform: `translateX(-${slideIdx * 180}px)`,
								width: `${featuredBooks.length * 180}px`,
							}}
						>
							{featuredBooks.map((book, idx) => (
								<div
									key={book.title}
									style={{
										background: "#fff",
										borderRadius: 16,
										boxShadow: "0 4px 24px 0 rgba(31, 38, 135, 0.09)",
										padding: "32px 24px 40px 24px",
										textAlign: "center",
										minWidth: 140,
										minHeight: 220,
										width: 180,
										margin: "0 10px",
										position: "relative",
										transition: "box-shadow 0.2s",
									}}
								>
									<img
										src={book.img}
										alt={book.title}
										style={{
											width: 110,
											height: 160,
											objectFit: "cover",
											borderRadius: 8,
											boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
											marginBottom: 12,
										}}
									/>
									<div
										style={{
											fontWeight: 600,
											fontSize: 16,
											color: "#3a2e1a",
										}}
									>
										{book.title}
									</div>
									<div
										style={{
											color: "#a08b6b",
											fontSize: 14,
										}}
									>
										{book.author}
									</div>
								</div>
							))}
						</div>
					</div>
					<button
						onClick={handleNext}
						style={{
							position: "absolute",
							right: -32,
							top: "50%",
							transform: "translateY(-50%)",
							background: "#fff",
							border: "1px solid #ccc",
							borderRadius: "50%",
							width: 32,
							height: 32,
							cursor: "pointer",
							boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
							zIndex: 2,
						}}
						aria-label="Next"
					>
						&#8594;
					</button>
				</div>
			</div>

			{/* Author Highlights */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					gap: 32,
					margin: "32px 0 0 0",
				}}
			>
				{authors.map((author, idx) => (
					<div
						key={author.name}
						style={{
							display: "flex",
							alignItems: "center",
							gap: 8,
							color: "#6d5c3d",
							fontSize: 15,
							fontWeight: 500,
						}}
					>
						<img
							src={author.img}
							alt={author.name}
							style={{
								width: 32,
								height: 32,
								borderRadius: "50%",
								border: "2px solid #eee",
							}}
						/>
						<span>Latest from {author.name}</span>
						{idx < authors.length - 1 && (
							<span
								style={{
									fontSize: 18,
									color: "#bdbdbd",
									margin: "0 8px",
								}}
							>
								›
							</span>
						)}
					</div>
				))}
			</div>

			{/* Recommended For You */}
			<div
				style={{
					margin: "48px auto 0 auto",
					maxWidth: 1100,
					width: "95%",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						marginBottom: 16,
					}}
				>
					<div
						style={{
							fontSize: "1.5rem",
							fontWeight: 500,
							color: "#3a2e1a",
						}}
					>
						Recommended For You
					</div>
					<a
						href="#"
						style={{
							color: "#c97a2b",
							fontWeight: 500,
							textDecoration: "none",
							fontSize: 15,
						}}
					>
						See all &rarr;
					</a>
				</div>
				<div
					style={{
						display: "flex",
						gap: 24,
						flexWrap: "wrap",
					}}
				>
					{recommendedBooks.map((book) => (
						<div
							key={book.title}
							style={{
								background: "#fff",
								borderRadius: 12,
								boxShadow:
									"0 2px 12px 0 rgba(31, 38, 135, 0.07)",
								padding: 18,
								minWidth: 200,
								maxWidth: 220,
								flex: "1 1 200px",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
							}}
						>
							<img
								src={book.img}
								alt={book.title}
								style={{
									width: 90,
									height: 130,
									objectFit: "cover",
									borderRadius: 6,
									marginBottom: 14,
								}}
							/>
							<div
								style={{
									fontWeight: 600,
									fontSize: 15,
									color: "#3a2e1a",
									textAlign: "center",
								}}
							>
								{book.title}
							</div>
							<div
								style={{
									color: "#a08b6b",
									fontSize: 13,
									marginBottom: 6,
									textAlign: "center",
								}}
							>
								By : {book.author}
							</div>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 6,
									marginBottom: 10,
								}}
							>
								<span
									style={{
										color: "#f5b942",
										fontWeight: 700,
									}}
								>
									{book.rating}
								</span>
								<span style={{ color: "#bdbdbd" }}>★</span>
								<span
									style={{
										color: "#3a2e1a",
										fontWeight: 500,
									}}
								>
									${book.price}
								</span>
							</div>
							<button
								style={{
									background: "#c97a2b",
									color: "#fff",
									border: "none",
									borderRadius: 6,
									padding: "8px 18px",
									fontWeight: 600,
									cursor: "pointer",
									fontSize: 15,
									marginTop: 4,
								}}
							>
								Add to cart
							</button>
						</div>
					))}
				</div>
			</div>

			{/* 3D Coverflow Carousel */}
			<div style={{
				width: "100%",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				padding: "80px 0 80px 0",
				background: "linear-gradient(180deg, #f9f7f2 60%, #e9e7e2 100%)"
			}}>
				<div style={{ position: "relative", width: 1200, height: 480 }}>
					<button
						onClick={handleCoverPrev}
						style={{
							position: "absolute",
							left: 0,
							top: "50%",
							transform: "translateY(-50%)",
							background: "#fff",
							border: "1px solid #ccc",
							borderRadius: "50%",
							width: 56,
							height: 56,
							cursor: "pointer",
							boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
							zIndex: 2,
							fontSize: 32,
						}}
						aria-label="Previous"
					>
						&#8592;
					</button>
					<div style={{
						width: 1100,
						height: 480,
						margin: "0 auto",
						perspective: 1800,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						overflow: "visible",
					}}>
						{featuredBooks.map((book, idx) => {
							const offset = idx - coverIdx;
							let transform = "";
							let zIndex = 10 - Math.abs(offset);
							let opacity = Math.abs(offset) > 2 ? 0 : 1;
							if (offset === 0) {
								transform = "translateX(0px) scale(1.18) rotateY(0deg)";
							} else if (offset < 0) {
								transform = `translateX(${offset * 220}px) scale(0.98) rotateY(30deg)`;
							} else {
								transform = `translateX(${offset * 220}px) scale(0.98) rotateY(-30deg)`;
							}
							return (
								<div key={book.title}
									style={{
										position: "absolute",
										left: "50%",
										top: "50%",
										transform: `translate(-50%, -50%) ${transform}`,
										transition: "transform 0.5s cubic-bezier(.36,.07,.19,.97), opacity 0.4s",
										zIndex,
										opacity,
										boxShadow: offset === 0
											? "0 12px 48px rgba(0,0,0,0.18)"
											: "0 4px 18px rgba(0,0,0,0.10)",
										background: "#fff",
										borderRadius: 28,
										width: 260,
										height: 380,
										display: opacity === 0 ? "none" : "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
										cursor: offset === 0 ? "default" : "pointer",
										border: offset === 0 ? "3px solid #c97a2b" : "none",
									}}
								>
									<img
										src={book.img}
										alt={book.title}
										style={{
											width: 180,
											height: 260,
											objectFit: "cover",
											borderRadius: 16,
											marginBottom: 22,
											boxShadow: offset === 0
												? "0 12px 32px rgba(0,0,0,0.13)"
												: "0 2px 8px rgba(0,0,0,0.07)",
										}}
									/>
									<div style={{
										fontWeight: 700,
										fontSize: 22,
										color: "#3a2e1a",
										textAlign: "center",
										marginBottom: 6,
									}}>
										{book.title}
									</div>
									<div style={{
										color: "#a08b6b",
										fontSize: 17,
										textAlign: "center",
									}}>
										{book.author}
									</div>
								</div>
							);
						})}
					</div>
					<button
						onClick={handleCoverNext}
						style={{
							position: "absolute",
							right: 0,
							top: "50%",
							transform: "translateY(-50%)",
							background: "#fff",
							border: "1px solid #ccc",
							borderRadius: "50%",
							width: 56,
							height: 56,
							cursor: "pointer",
							boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
							zIndex: 2,
							fontSize: 32,
						}}
						aria-label="Next"
					>
						&#8594;
					</button>
				</div>
			</div>
			
			{/* Footer */}
			<div
				style={{
					marginTop: 56,
					background: "#fff",
					borderTop: "1px solid #eee",
					padding: "40px 0 0 0",
					color: "#222",
					fontFamily: "Segoe UI, Arial, sans-serif",
				}}
			>
				<div
					style={{
						maxWidth: 1300,
						margin: "0 auto",
						padding: "0 32px",
						display: "flex",
						justifyContent: "space-between",
						flexWrap: "wrap",
						gap: 32,
					}}
				>
					{/* Logo and copyright */}
					<div style={{ minWidth: 220, flex: "1 1 220px" }}>
						<img
							src="/vkpublications.png"
							alt="VK Global Group"
							style={{ height: 56, marginBottom: 12 }}
						/>
						<div
							style={{
								fontWeight: 700,
								fontSize: 20,
								marginBottom: 2,
							}}
						>
							VK Global Group
						</div>
						<div
							style={{
								fontSize: 13,
								color: "#444",
								marginBottom: 8,
							}}
						>
							since 1979
						</div>
						<div
							style={{
								fontSize: 13,
								color: "#888",
								marginBottom: 8,
							}}
						>
							Publishing • Packaging • Printing
						</div>
						<div
							style={{
								fontSize: 13,
								color: "#888",
								marginBottom: 8,
							}}
						>
							© Copyright,
							<br />
							<a
								href="https://vkpublications.com/"
								target="_blank"
								rel="noopener noreferrer"
								style={{
									color: "#1e3c72",
									textDecoration: "underline",
								}}
							>
								VK Global Publications Pvt. Ltd.
							</a>
							<br />
							{new Date().getFullYear()}
						</div>
					</div>
					{/* About VK Global Group */}
					<div style={{ minWidth: 180, flex: "1 1 180px" }}>
						<div
							style={{ fontWeight: 600, marginBottom: 10 }}
						>
							About VK Global Group
						</div>
						<div>
							<a
								href="#"
								style={{
									color: "#1e3c72",
									textDecoration: "underline",
									fontSize: 15,
								}}
							>
								Packaging
							</a>
						</div>
						<div>
							<a
								href="#"
								style={{
									color: "#1e3c72",
									textDecoration: "underline",
									fontSize: 15,
								}}
							>
								Printing
							</a>
						</div>
						<div>
							<a
								href="#"
								style={{
									color: "#1e3c72",
									textDecoration: "underline",
									fontSize: 15,
								}}
							>
								Holographic Films
							</a>
						</div>
						<div>
							<a
								href="#"
								style={{
									color: "#1e3c72",
									textDecoration: "underline",
									fontSize: 15,
								}}
							>
								Future Kids Publications
							</a>
						</div>
					</div>
					{/* For Learners */}
					<div style={{ minWidth: 140, flex: "1 1 140px" }}>
						<div
							style={{ fontWeight: 600, marginBottom: 10 }}
						>
							For Learners
						</div>
						<div>
							<a
								href="#"
								style={{
									color: "#1e3c72",
									textDecoration: "underline",
									fontSize: 15,
								}}
							>
								Home
							</a>
						</div>
						<div>
							<a
								href="#"
								style={{
									color: "#1e3c72",
									textDecoration: "underline",
									fontSize: 15,
								}}
							>
								Catalogue
							</a>
						</div>
						<div>
							<a
								href="#"
								style={{
									color: "#1e3c72",
									textDecoration: "underline",
									fontSize: 15,
								}}
							>
								Resources
							</a>
						</div>
					</div>
					{/* For Educators */}
					<div style={{ minWidth: 160, flex: "1 1 160px" }}>
						<div
							style={{ fontWeight: 600, marginBottom: 10 }}
						>
							For Educators
						</div>
						<div>
							<a
								href="#"
								style={{
									color: "#1e3c72",
									textDecoration: "underline",
									fontSize: 15,
								}}
							>
								Publish with Us
							</a>
						</div>
						<div>
							<a
								href="#"
								style={{
									color: "#1e3c72",
									textDecoration: "underline",
									fontSize: 15,
								}}
							>
								Sample Request
							</a>
						</div>
						<div>
							<a
								href="#"
								style={{
									color: "#1e3c72",
									textDecoration: "underline",
									fontSize: 15,
								}}
							>
								Teachers Resources
							</a>
						</div>
						<div>
							<a
								href="#"
								style={{
									color: "#1e3c72",
									textDecoration: "underline",
									fontSize: 15,
								}}
							>
								Blogs
							</a>
						</div>
					</div>
					{/* The Company */}
					<div style={{ minWidth: 200, flex: "1 1 200px" }}>
						<div
							style={{ fontWeight: 600, marginBottom: 10 }}
						>
							The Company
						</div>
						<div>
							<a
								href="#"
								style={{
									color: "#1e3c72",
									textDecoration: "underline",
									fontSize: 15,
								}}
							>
								Careers
							</a>
						</div>
						<div>
							<a
								href="#"
								style={{
									color: "#1e3c72",
									textDecoration: "underline",
									fontSize: 15,
								}}
							>
								Cookies
							</a>
						</div>
						<div>
							<a
								href="#"
								style={{
									color: "#1e3c72",
									textDecoration: "underline",
									fontSize: 15,
								}}
							>
								Privacy Policy
							</a>
						</div>
						<div>
							<a
								href="#"
								style={{
									color: "#1e3c72",
									textDecoration: "underline",
									fontSize: 15,
								}}
							>
								Terms and Conditions
							</a>
						</div>
						<div>
							<a
								href="#"
								style={{
									color: "#1e3c72",
									textDecoration: "underline",
									fontSize: 15,
								}}
							>
								Orders, Shipping and Refund Policy
							</a>
						</div>
					</div>
					{/* Address */}
					<div style={{ minWidth: 220, flex: "1 1 220px" }}>
						<div
							style={{ fontWeight: 600, marginBottom: 10 }}
						>
							&nbsp;
						</div>
						<div
							style={{
								color: "#222",
								fontSize: 15,
								fontWeight: 500,
								marginBottom: 2,
							}}
						>
							15/1, Main Mathura Road
							<br />
							Sector 31, Faridabad,
							<br />
							Haryana, 121003
						</div>
						<div
							style={{
								color: "#1e3c72",
								fontWeight: 700,
								fontSize: 15,
								marginTop: 8,
							}}
						>
							VK Global Publications Private Limited
						</div>
					</div>
				</div>
				<hr
					style={{
						margin: "36px 0 24px 0",
						border: "none",
						borderTop: "1px solid #eee",
					}}
				/>
				<div
					style={{
						maxWidth: 1300,
						margin: "0 auto",
						padding: "0 32px 24px 32px",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: 24,
					}}
				>
					{/* Payment and Social */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 48,
							flexWrap: "wrap",
						}}
					>
						<div>
							<div
								style={{
									fontSize: 14,
									color: "#222",
									marginBottom: 6,
								}}
							>
								We accept:
							</div>
							<img
								src="https://cdn.shopify.com/s/files/1/0778/7931/2666/t/9/assets/payment%20(1).jpg?v=1694000428"
								alt="Payment Methods"
								style={{ height: 32 }}
							/>
						</div>
						<div>
							<div
								style={{
									fontSize: 14,
									color: "#222",
									marginBottom: 6,
								}}
							>
								Follow Us:
								{/* Vev Social Buttons */}
								<div id="eUp0fRwDVidc" className="frame frame __wc __c" style={{ display: "flex", gap: 8 }}>
									<a className="__a external-link external-link" href="https://www.instagram.com/vkglobalgroup/" target="_blank" rel="noopener noreferrer">
										<img src="https://cdn.vev.design/cdn-cgi/image/f=auto,q=82/private/pK53XiUzGnRFw1uPeFta7gdedx22/image/qMh_Qmg1Vr.png" width="24" alt="Instagram" />
									</a>
									<a className="__a external-link external-link" href="https://twitter.com/vkglobalgroup" target="_blank" rel="noopener noreferrer">
										<img src="https://cdn.vev.design/cdn-cgi/image/f=auto,q=82/private/pK53XiUzGnRFw1uPeFta7gdedx22/image/bVmS3Ns9Fp.png" width="24" alt="Twitter" />
									</a>
									<a className="__a external-link external-link" href="https://www.facebook.com/vkglobalgroup" target="_blank" rel="noopener noreferrer">
										<img src="https://cdn.vev.design/cdn-cgi/image/f=auto,q=82/private/pK53XiUzGnRFw1uPeFta7gdedx22/image/7mwpwrHh5p.png" width="24" alt="Facebook" />
									</a>
									<a className="__a external-link external-link" href="https://www.youtube.com/@VKGlobalGroup" target="_blank" rel="noopener noreferrer">
										<img src="https://cdn.vev.design/cdn-cgi/image/f=auto,q=82/private/pK53XiUzGnRFw1uPeFta7gdedx22/image/mp0umN_6b2.png" width="24" alt="YouTube" />
									</a>
								</div>
							</div>
						</div>
					</div>
					{/* Subscribe */}
					<form
						onSubmit={(e) => {
							e.preventDefault();
							alert("Subscribed!");
						}}
						style={{
							display: "flex",
							alignItems: "center",
							gap: 0,
							flexWrap: "wrap",
						}}
					>
						<div
							style={{
								fontWeight: 500,
								fontSize: 16,
								marginRight: 18,
								marginBottom: 8,
							}}
						>
							Subscribe and
							<br />
							Discover More
						</div>
						<input
							type="email"
							required
							placeholder="E-mail*"
							style={{
								padding: "12px 18px",
								border: "1px solid #ccc",
								borderRadius: "6px 0 0 6px",
								fontSize: 15,
								outline: "none",
								width: 220,
								marginBottom: 8,
							}}
						/>
						<button
							type="submit"
							style={{
								padding: "12px 28px",
								border: "none",
								borderRadius: "0 6px 6px 0",
								background: "#e5e5e5",
								color: "#222",
								fontWeight: 600,
								fontSize: 15,
								cursor: "pointer",
								marginBottom: 8,
							}}
						>
							Subscribe
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}


