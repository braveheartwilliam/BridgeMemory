<script lang="ts">
	import '../../app.css';
	import { goto } from '$app/navigation';

	interface ExpandableButton {
		id: string;
		title: string;
		subOptions: string[];
		selectedSubOption: string | null;
	}

	let expandableButtons: ExpandableButton[] = [
		{
			id: 'track-cards-played',
			title: 'Track Cards Played',
			subOptions: ['All Players', 'Specific Player'],
			selectedSubOption: null
		},
		{
			id: 'anticipate-cards-remaining',
			title: 'Anticipate Cards Remaining',
			subOptions: ['All Players', 'Specific Player'],
			selectedSubOption: null
		}
	];

	let activeDropdown: string | null = null;
	let buttonClickAnimation: string | null = null;

	function toggleDropdown(buttonId: string) {
		activeDropdown = activeDropdown === buttonId ? null : buttonId;
	}

	function selectSubOption(buttonId: string, subOption: string) {
		const button = expandableButtons.find(b => b.id === buttonId);
		if (button) {
			button.selectedSubOption = subOption;
			console.log(`Selected: ${button.title} - ${subOption}`);
			activeDropdown = null;
		}
	}

	function handleButtonClick(buttonId: string, targetPage: string) {
		// Add click animation
		buttonClickAnimation = buttonId;
		setTimeout(() => {
			buttonClickAnimation = null;
		}, 300);
		
		// Navigate to target page
		goto(targetPage);
	}

	function handleMouseEnter(buttonId: string) {
		activeDropdown = buttonId;
	}

	function handleMouseLeave() {
		activeDropdown = null;
	}

	function goBackToMain() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Bridge Memory Challenge</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
	<!-- Breadcrumb Navigation -->
	<nav class="bg-white/80 backdrop-blur-sm border-b border-emerald-100">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
			<ol class="flex items-center space-x-2 text-sm">
				<li class="flex items-center">
					<button 
						onclick={goBackToMain}
						class="text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
					>
						Bridge Play Analysis
					</button>
					<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</li>
				<li class="flex items-center">
					<span class="text-emerald-600 font-semibold">Bridge Memory Challenge</span>
				</li>
			</ol>
		</div>
	</nav>

	<!-- Header -->
	<header class="bg-white/90 backdrop-blur-md shadow-lg border-b border-emerald-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-20">
				<div class="flex items-center space-x-3">
					<button 
						onclick={goBackToMain}
						class="p-2 rounded-lg hover:bg-emerald-100 transition-colors"
						aria-label="Back to main menu"
						title="Back to main menu"
					>
						<svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
					</button>
					<div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
						<span class="text-white text-xl">♠</span>
					</div>
					<h1 class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
						Bridge Memory Challenge
					</h1>
				</div>
				<div class="flex items-center space-x-4">
					<span class="text-sm text-gray-600 font-medium">Welcome, Player</span>
				</div>
			</div>
		</div>
	</header>

	<!-- Hero Section -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
		<div class="text-center mb-16 animate-fade-in">
			<h2 class="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
				Master Your Bridge Memory
			</h2>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
				Elevate your Bridge game with advanced memory training. Track played cards, anticipate remaining cards, and gain competitive edge that separates good players from great ones.
			</p>
		</div>

		<!-- Feature Cards -->
		<div class="grid md:grid-cols-2 gap-8 mb-16">
			<button 
				class="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-emerald-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-bounce-in text-left hover:bg-emerald-50 cursor-pointer {buttonClickAnimation === 'track-cards-played' ? 'animate-pulse scale-95' : ''}"
				onclick={() => handleButtonClick('track-cards-played', '/bridge-memory/track-cards-played')}
			>
				<div class="flex items-center mb-4">
					<div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-4">
						<span class="text-white text-2xl font-bold">🃏</span>
					</div>
					<h3 class="text-2xl font-bold text-gray-800">Track Cards Played</h3>
				</div>
				<p class="text-gray-600 leading-relaxed">
					Develops ability to remember every card that hits the table. Practice with all four players or focus on specific opponents to sharpen your observational skills.
				</p>
			</button>

			<button 
				class="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-teal-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-bounce-in text-left hover:bg-teal-50 cursor-pointer {buttonClickAnimation === 'anticipate-cards-remaining' ? 'animate-pulse scale-95' : ''}"
				style="animation-delay: 0.2s;"
				onclick={() => handleButtonClick('anticipate-cards-remaining', '/bridge-memory/anticipate-cards-remaining')}
			>
				<div class="flex items-center mb-4">
					<div class="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mr-4">
						<span class="text-white text-2xl font-bold">🎯</span>
					</div>
					<h3 class="text-2xl font-bold text-gray-800">Anticipate Cards Remaining</h3>
				</div>
				<p class="text-gray-600 leading-relaxed">
					Learns to calculate which cards are still in the deck. This crucial skill helps you make better decisions and predict your opponents' likely holdings.
				</p>
			</button>
		</div>

		<!-- How It Works -->
		<div class="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-cyan-100 animate-fade-in" style="animation-delay: 0.4s;">
			<h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">How It Works</h3>
			<div class="grid md:grid-cols-4 gap-6">
				<div class="text-center">
					<div class="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in" style="animation-delay: 0.6s;">
						<span class="text-white text-2xl font-bold">1</span>
					</div>
					<h4 class="font-semibold text-gray-800 mb-2">Choose Focus</h4>
					<p class="text-sm text-gray-600">Select cards played or remaining</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in" style="animation-delay: 0.8s;">
						<span class="text-white text-2xl font-bold">2</span>
					</div>
					<h4 class="font-semibold text-gray-800 mb-2">Select Players</h4>
					<p class="text-sm text-gray-600">All players or specific focus</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in" style="animation-delay: 1s;">
						<span class="text-white text-2xl font-bold">3</span>
					</div>
					<h4 class="font-semibold text-gray-800 mb-2">Practice</h4>
					<p class="text-sm text-gray-600">Engage in memory exercises</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in" style="animation-delay: 1.2s;">
						<span class="text-white text-2xl font-bold">4</span>
					</div>
					<h4 class="font-semibold text-gray-800 mb-2">Improve</h4>
					<p class="text-sm text-gray-600">Track progress and advance</p>
				</div>
			</div>
		</div>
	</main>
</div>

<style>
	@keyframes animate-pulse {
		0% { transform: scale(1); }
		50% { transform: scale(0.95); }
		100% { transform: scale(1); }
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	
	@keyframes bounceIn {
		0% { 
			opacity: 0;
			transform: scale(0.3);
		}
		50% { 
			transform: scale(1.05);
		}
		70% { 
			transform: scale(0.9);
		}
		100% { 
			opacity: 1;
			transform: scale(1);
		}
	}
	
	.animate-fade-in {
		animation: fadeIn 0.8s ease-out;
	}
	
	.animate-bounce-in {
		animation: bounceIn 0.6s ease-out;
		animation-fill-mode: both;
	}
</style>
