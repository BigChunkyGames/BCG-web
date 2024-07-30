document.addEventListener('DOMContentLoaded', () => {
	const content = document.getElementById('content');
	const navLinks = document.querySelectorAll('.nav-link');
	const cloudsContainer = document.getElementById('clouds-container');

	const pages = {
		home: `
			<h2>Welcome to Big Chunky Games</h2>
			<p>We create fun and engaging indie games. Check out our latest releases!</p>
			<a href="https://bigchunkygames.itch.io" target="_blank" class="download-link">See all our games on itch.io</a>
		`,
		'black-perpetuum': `
			<h2>Black Perpetuum</h2>
			<p>A first-person puzzle game.</p>
			<img src="bp images/bp.png" alt="Black Perpetuum game scene">
			<p>Intuit a path forward on a desolate foggy mountainside, explore a lush sprawling hubworld, and slide around in a funky desert in this [very much unfinished] first person puzzle game. 
			</br></br>
			Talk to NPCs, become a ball, collect stars, and more.
			</br></br>
			<a href="https://bigchunkygames.itch.io/black-perpetuum" target="_blank" class="download-link">Download Black Perpetuum on itch.io</a>
			</br></br>
			<h3>More Images</h3>
			<div id="imageCarousel"></div>
			</br></br>
			<h3>[Devnote]</h3>
			</br></br>
			This game was how I spent 2023. But after a year of development I realized something. This game is going to take 5 years to complete.
			</br></br>
			So I decided to move on.
			</br></br>
			There is no ending, but if you collect all the stars I will personally congratulate you.</p>
		`,
		about: `
			<h2>About Big Chunky Games</h2>
			<p>We are an indie game development studio passionate about creating unique gaming experiences. By we I mean me, Jackson, but we sounds more legit right? No its just me. I'm addicted to making games.</p>
		`,
		contact: `
			<h2>Contact Us</h2>
			<p>Get in touch with Big Chunky Games:</p> 
			<a href="mailto:jacksonbbush@gmail.com" class="email-button">Email Us</a>
		`
	};

	function loadPage(pageId) {
		content.innerHTML = pages[pageId] || 'Page not found';
		if (pageId === 'black-perpetuum') {
			createImageCarousel();
		}
	}

	function createImageCarousel() {
		const carouselContainer = document.getElementById('imageCarousel');
		const images = ['bp1.png', 'bp2.png', 'bp3.png', 'bp4.png', 'bp5.png', 'bp6.png', 'bp7.png', 'bp8.png', 'bp9.png', 'bp10.png', 'bp11.png', 'bp12.png'];
		let currentImageIndex = 0;

		const carouselHTML = `
			<div class="carousel-container">
				<div class="carousel-controls">
					<button id="prevButton">Previous</button>
					<button id="nextButton">Next</button>
				</div>
				<img id="carouselImage" src="bp images/${images[0]}" alt="Black Perpetuum screenshot">
			</div>
		`;

		carouselContainer.innerHTML = carouselHTML;

		const carouselImage = document.getElementById('carouselImage');
		const prevButton = document.getElementById('prevButton');
		const nextButton = document.getElementById('nextButton');

		prevButton.addEventListener('click', () => {
			currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
			fadeImage(carouselImage, `bp images/${images[currentImageIndex]}`);
		});

		nextButton.addEventListener('click', () => {
			currentImageIndex = (currentImageIndex + 1) % images.length;
			fadeImage(carouselImage, `bp images/${images[currentImageIndex]}`);
		});
	}

	function fadeImage(imageElement, newSrc) {
		imageElement.style.opacity = 0;
		setTimeout(() => {
			imageElement.src = newSrc;
			imageElement.style.opacity = 1;
		}, 500); // Duration of the fade transition
	}

	navLinks.forEach(link => {
		link.addEventListener('click', (e) => {
			e.preventDefault();
			const pageId = e.target.getAttribute('href').substr(1);
			loadPage(pageId);
		});
	});

	// Load home page by default
	loadPage('home');

	// Helper function to generate random dark colors
	function getRandomDarkColor() {
		const greyScale = Math.floor(Math.random() * 70);
		return `rgb(${greyScale}, ${greyScale}, ${greyScale})`;
	}

	// Helper function to generate random sizes
	function getRandomSize() {
		const size = Math.floor(Math.random() * 50) + 50; // Sizes between 50 and 100 pixels
		return `${size}px`;
	}

	// Create cloud elements
	for (let i = 0; i < 100; i++) {
		const cloud = document.createElement('div');
		cloud.classList.add('cloud');
		cloud.style.top = `${Math.random() * 100}vh`;
		cloud.style.left = `${Math.random() * 100}vw`;
		cloud.style.backgroundColor = getRandomDarkColor();
		cloud.style.width = getRandomSize();
		cloud.style.height = getRandomSize();
		cloudsContainer.appendChild(cloud);
	}

	// Cloud effect
	document.addEventListener('mousemove', (e) => {
		const clouds = document.querySelectorAll('.cloud');
		const mouseX = e.clientX;
		const mouseY = e.clientY;

		clouds.forEach(cloud => {
			const cloudRect = cloud.getBoundingClientRect();
			const cloudX = cloudRect.left + cloudRect.width / 2;
			const cloudY = cloudRect.top + cloudRect.height / 2;
			const distX = cloudX - mouseX;
			const distY = cloudY - mouseY;
			const dist = Math.sqrt(distX * distX + distY * distY);

			if (dist < 150 && !cloud.classList.contains('flung')) {
				const angle = Math.atan2(distY, distX);
				const moveX = Math.cos(angle) * 200;
				const moveY = Math.sin(angle) * 200;
				cloud.style.transform = `translate(${moveX}px, ${moveY}px)`;
				cloud.style.opacity = 0;
				cloud.classList.add('flung');
			}
		});
	});
});
