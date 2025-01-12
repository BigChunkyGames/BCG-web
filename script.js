document.addEventListener('DOMContentLoaded', () => {
	const content = document.getElementById('content');
	const navLinks = document.querySelectorAll('.nav-link');
	const cloudsContainer = document.getElementById('clouds-container');
	const subNav = document.getElementById('sub-nav');
	const subNavLinks = document.querySelectorAll('.sub-nav-link');

	const pages = {
		home: `
			<h2>Welcome to Big Chunky Games</h2>
			<p>We create fun and engaging indie games. Check out our latest releases!</p>
			<a href="https://bigchunkygames.itch.io" target="_blank" class="button">See all our games on itch.io</a>
		`,
		'ace-of-space': `
			<h2>Ace of Space</h2>
			<a href="https://bigchunkygames.itch.io/ace-of-space" target="_blank" class="button">Play on itch.io</a>

			<p>Ace of Space is a roguelike deckbuilder about growing your armada and rescuing the galaxy from the forces of chaos. </p>

			<p>Select a flagship and embark on a journey across a universe on the brink of annihilation. Construct your deck of ships and science, obtain powerful artifacts to enhance your strategy, and make tough choices for the good of the galaxy. Warp across sectors, battle hostile factions, and face impossible odds as the universe itself collapses around you. </p>
			<a href="https://store.steampowered.com/app/3242880/Ace_of_Space/" target="_blank" class="button">Wishlist on Steam</a>
			</br></br>

			<p>When the idea for Ace of Space first occurred to us, we knew instantly that we had what it would take to make it, we knew how, and most importantly, we knew that it would be a lot of fun to make all the little ships. So for almost every day from August to December of 2024 we spent time creating the game. A few 13 hour Saturdays can really go a long way. It was fast progress at first - now that its January when I'm writing this the game is in a state that I think a lot of people could enjoy. Too bad nobody knows about it yet. We're working on that. 
			</br></br>
			<h3>[Status: Active Development!]</h3>
		`,
		'adventure-dodge': `
			<h2>Adventure Dodge</h2>
			<p>Our first fully finished gaming experience.</p>
			
			<p>Drive your unstoppable green cube through the perils of life in this colorfully musical level-based runner.</p>
			<a href="https://porchlight.itch.io/adventure-dodge" target="_blank" class="button">Download on itch.io</a>
			<a href="https://porchlightgames.bandcamp.com/album/adventure-dodge-ost" target="_blank" class="button">Listen to the soundtrack on Bandcamp</a>
			</br></br>
			<h3>Watch the trailer</h3>
			<iframe width="420" height="315"
			src="https://youtube.com/embed/rv0CerFiCwY">
			</iframe>
			</br></br>
			<h3>[Status: Complete]</h3>
		`,
		'black-perpetuum': `
			<h2>Black Perpetuum</h2>
			<p>A first-person puzzle game.</p>
			<img src="bp images/bp.png" alt="Black Perpetuum game scene">
			<p>Intuit a path forward on a desolate foggy mountainside, explore a lush sprawling hubworld, and slide around in a funky desert in this [very much unfinished] first person puzzle game. 
			</br></br>
			Talk to NPCs, become a ball, collect stars, and more.
			</br></br>
			<a href="https://bigchunkygames.itch.io/black-perpetuum" target="_blank" class="button">Download Black Perpetuum on itch.io</a>
			</br></br>
			<div id="imageCarousel"></div>
			</br></br>
			<h3>[Status: Discontinued]</h3>
			This game was how we spent 2023. But after a year of development we realized something. This game is going to take 5 years to complete.
			</br></br>
			So we decided to move on.
			</br></br>
			There is no ending, but if you collect all the stars we will personally congratulate you.</p>
		`,
		'dot-wars': `
			<h2>Dot Wars</h2>
			<p>It's a physics simulation competition youtube channel! Kind of like multiply and release videos but with more features!</p>
			<a href="https://www.youtube.com/@Dot_Wars/videos" target="_blank" class="button">Check out the youtube channel!</a>
			</br></br>

			<iframe width="420" height="315"
src="https://www.youtube.com/embed/Suc-KLHwXbc?autoplay=1&mute=1">
</iframe>
</br></br>
<h3>[Status: On Hold]</h3>
		`,
		'guy-kingdom': `
			<h2>Guy Kingdom</h2>
			<p>A large scope idle game about delivering resources to your capital and growing your workforce, army, and kingdom. Defend from waves of enemies and unlock upgrades to evolve your kingdom. Play at your own pace.</p>
			</br></br>
			<p>This game is far from finished, but its still pretty fun to play. </p>
			<a href="https://bigchunkygames.itch.io/guy-kingdom" target="_blank" class="button">Play on itch.io</a>
			</br></br>
			<h3>[Status: On Hold]</h3>
			<p>July 2024</p>
		`,
		'advance-quest': `
			<h2>Advance Quest</h2>
			<p>What if Advance Wars was a real time strategy game? 
			</br></br>
Drive your little jeep around and control units to capture structures and lead the charge to victory in this quick paced RTS campaign. There's even a little bit of story!
</br></br>
<a href="https://bigchunkygames.itch.io/advance-quest" target="_blank" class="button">Download now on itch.io</a>
</br></br>
<img src="aq images/aw1.png">
<img src="aq images/aw2.png">
<img src="aq images/aw3.png">
</br></br>
Inspired by: Thronefall, SC2, advance wars, bloons TD, vampire survivors, age of war, star wars battlefront 2, tooth and tail, pikmin, starcraft
</br></br>
<h3>[Status: Discontinued]</h3>
I can only work 1 project at a time sorry D:</p>
		`,
		'cannon-miner': `
			<h2>Cannon Miner</h2>
			<p>Fire a cannon ball, watch it soar through the sky, then dig deep into the ground to and collect valuable ores!
			</p>
			<a href="https://bigchunkygames.itch.io/cannon-miner" target="_blank" class="button">Play it on itch.io</a>
			</br>
			<img src="cm images/cm1.png">
			<img src="cm images/cm2.png">
			</br></br>
			<h3>[Status: Complete (rudimentary) ]
			<p>We're particularly proud of the procedural generation code on this one. It is still the most advanced code we have ever written from scratch! I mean look at this:</p>
			<div id="code-container" class="code-container">
            	<pre id="code-content"></pre>
        	</div>
			
		`,
		'ridiculous-fish': `
			<h2>Ridiculous Fish</h2>
			<p>Its a game about growing an ever expanding fish tank!</p>
			<a href="https://bigchunkygames.itch.io/ridiculous-fish" target="_blank" class="button">Play it on itch.io</a>
			<img src="rf images/rf1.png">
			<img src="rf images/rf2.png">
			<img src="rf images/rf3.png">
			<p>Overcome with nostalgia for Insane Aquarium, we became determined to remake the game with modern graphics and more lasers. We started this project in August 2019 working primarily during college classes instead of paying attention.</p>
			<h3>[Status: Complete (rudimentary)]</h3>
		`,
		about: `
			<h2>About Big Chunky Games</h2>
			<p>We are an indie game development studio passionate about creating unique gaming experiences. By we I mean me, Jackson, but we sounds more legit right? No its just me. I'm addicted to making games.</p>
			<a href="https://github.com/BigChunkyGames" target="_blank" class="button">Find all the code here</a>
			</br></br>
			<p>It all started in 2017 when my friend <a href="https://github.com/TrebbleBiscuit" class="link" target="_blank">TrebbleBiscuit</a> and I  decided to make a text based adventure game called <a href="https://github.com/BigChunkyGames/AdventureQuest" class="link" target="_blank" >Adventure Quest</a>. Not long after that it was clear that console python wasn't exactly the most ideal development platform. So I moved on to Unity and created my first ever serious game, Adventure Dodge.</p><p>During this time I was also helped spearhead an indie game studio called <a href="https://porchlight.itch.io/" class="link" target="_blank">Porchlight Games</a> with some college buddies. The goal of Porchlight Games was for us to get a taste of what collaborative game development was like and get some hands on experience in the field. To do this, we decided to smash as many genres into a single title as possible and called it <a href="https://github.com/porchlight-games/Ruminant" class="link" target="_blank">Ruminant</a>, an experimental Tower Defense/Walking Sim/RPG hybrid. We didn't finish it of course but we got a ton of experience and <a href="https://github.com/timecomplexity" class="link" target="_blank"> Alex </a> got a hired by <a href="https://www.babaroga.com/" class="link" target="_blank">Babaroga</a>! After that we went our seperate ways but my addiction to game developement had not subsided. So I kept at it and made all those other games linked in the nav bar up there ^.

			
		`,
		music: `
			<h2>Music!</h2>
			<p>I love music!</p>

			<a href="https://porchlightgames.bandcamp.com/album/adventure-dodge-ost" target="_blank" class="button">Listen to the Adventure Dodge soundtrack on Bandcamp</a>

			<a href="https://soundcloud.com/officialmethod" target="_blank" class="button">Check out my soundcloud!</a>

			<p>Pumas&Pandas is <a href="https://soundcloud.com/snackrat84rat987" target="_blank" class="link">snack_rat</a> and my drum and bass band.
			<a href="https://open.spotify.com/artist/5TlvSzMvecvh7OfMznHETk" target="_blank" class="button">Pumas&Pandas on Spotify</a>
			
			
		`,
		contact: `
			<p>Get in touch 😉</p> 
			<a href="mailto:jacksonbbush@gmail.com" class="button">Email Us</a>
		`,
		secrets: `
			<h2>Secrets</h2>
			<button id="rainbowModeButton" class="button">Rainbow Mode</button>
		`
	};
	
	function loadPage(pageId) {
		content.innerHTML = pages[pageId] || 'Page not found';
		if (['black-perpetuum', 'dot-wars', 'advance-quest', 'cannon-miner', 'ridiculous-fish', 'adventure-dodge'].includes(pageId)) {
			subNav.classList.remove('hidden');
			if (pageId === 'black-perpetuum') {
				createImageCarousel();
			}
			if(pageId === 'cannon-miner'){
				loadCodeSegment();
			}
		} else {
			subNav.classList.add('hidden');
		}
		if (pageId === 'secrets') {
			const rainbowModeButton = document.getElementById('rainbowModeButton');
			rainbowModeButton.addEventListener('click', () => {
				// Select all div, body, and header elements, excluding the cloud container
				const elements = document.querySelectorAll('div:not(#clouds-container), body, header');
				elements.forEach(element => {
					element.classList.toggle('rainbow');
				});
			});
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
		}, 100); // Duration of the fade transition
	}

	function loadCodeSegment() {
		const script = document.createElement('script');
		script.src = 'procedural_generation.js';
		script.onload = () => {
			const codeContent = document.getElementById('code-content');
			codeContent.textContent = code;
		};
		document.head.appendChild(script);
	}

	navLinks.forEach(link => {
		link.addEventListener('click', (e) => {
			e.preventDefault();
			const pageId = e.target.getAttribute('href').substr(1);
			loadPage(pageId);
		});
	});

	subNavLinks.forEach(link => {
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
		const size = Math.floor(Math.random() * 150) + 50; // Sizes between 50 and 100 pixels
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

const cloud = document.getElementById('cloud');
let isDragging = false;
let startX, startY;

cloud.addEventListener('touchstart', (e) => {
	isDragging = true;
	const touch = e.touches[0];
	startX = touch.clientX - cloud.offsetLeft;
	startY = touch.clientY - cloud.offsetTop;
});

cloud.addEventListener('touchmove', (e) => {
	if (!isDragging) return;
	e.preventDefault(); // Prevent default behavior like scrolling
	const touch = e.touches[0];
	cloud.style.left = `${touch.clientX - startX}px`;
	cloud.style.top = `${touch.clientY - startY}px`;
});

cloud.addEventListener('touchend', () => {
	isDragging = false;
	// Add fling effect or inertia here if desired
});
