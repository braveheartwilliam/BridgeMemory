<script lang="ts">
	import '../app.css';

	interface ExpandableButton {
		id: string;
		title: string;
		subOptions: string[];
		selectedSubOption: string | null;
	}

	let expandableButtons: ExpandableButton[] = [
		{
			id: 'remember-cards-played',
			title: 'Remember Cards Played',
			subOptions: ['All Players', 'Specific Player'],
			selectedSubOption: null
		},
		{
			id: 'remember-cards-remaining',
			title: 'Remember Cards Remaining',
			subOptions: ['All Players', 'Specific Player'],
			selectedSubOption: null
		}
	];

	let activeDropdown: string | null = null;

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

	function handleMouseEnter(buttonId: string) {
		activeDropdown = buttonId;
	}

	function handleMouseLeave() {
		activeDropdown = null;
	}
</script>

<svelte:head>
	<title>Bridge Memory Challenge</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
	<!-- Header -->
	<header class="bg-white/90 backdrop-blur-md shadow-lg border-b border-emerald-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-20">
				<div class="flex items-center space-x-3">
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

	<!-- Top Navigation Menu -->
	<nav class="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-xl">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-center space-x-6 py-6" style="display: flex; flex-direction: row; width: 100%; justify-content: center;">
				{#each expandableButtons as button (button.id)}
					<div 
						class="relative"
						role="navigation"
						aria-label="Memory training options"
						on:mouseenter={() => handleMouseEnter(button.id)}
						on:mouseleave={handleMouseLeave}
					>
						<!-- Main Menu Button -->
						<button 
							class="px-8 py-4 bg-emerald-500 text-white font-bold text-lg rounded-xl hover:bg-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-emerald-700 flex items-center justify-center min-w-[220px] animate-bounce-in"
							aria-haspopup="true"
							aria-expanded={activeDropdown === button.id}
							on:click={() => toggleDropdown(button.id)}
						>
							<span class="text-lg font-bold">{button.title}</span>
							{#if button.selectedSubOption}
								<span class="ml-3 px-3 py-1 bg-emerald-300 text-emerald-900 text-sm font-bold rounded-full border-2 border-emerald-400">
									{button.selectedSubOption}
								</span>
							{/if}
						</button>

						<!-- Dropdown Sub-menu -->
						<div 
							class="absolute top-full left-0 right-0 mt-2 z-50 transition-all duration-300 origin-top"
							class:opacity-0={activeDropdown !== button.id}
							class:invisible={activeDropdown !== button.id}
							class:scale-95={activeDropdown !== button.id}
							class:opacity-100={activeDropdown === button.id}
							class:visible={activeDropdown === button.id}
							class:scale-100={activeDropdown === button.id}
							role="menu"
						>
							<div class="bg-white rounded-xl shadow-2xl border-2 border-emerald-200 overflow-hidden animate-slide-down">
								{#each button.subOptions as subOption}
									<button 
										class="w-full px-6 py-4 text-left bg-white hover:bg-emerald-500 hover:text-white transition-all duration-300 transform hover:scale-105 border-b-2 border-emerald-100 last:border-b-0 flex items-center justify-between group/sub-option animate-bounce-in"
										role="menuitem"
										on:click={() => selectSubOption(button.id, subOption)}
									>
										<span class="text-lg font-bold text-gray-800 group-hover/sub-option:text-white transition-colors duration-200">
											{subOption}
										</span>
									</button>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</nav>

	<!-- Hero Section -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
		<div class="text-center mb-16 animate-fade-in">
			<h2 class="text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
				Master Your Bridge Memory
			</h2>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
				Elevate your Bridge game with advanced memory training. Track played cards, anticipate remaining cards, and gain the competitive edge that separates good players from great ones.
			</p>
		</div>

		<!-- Feature Cards -->
		<div class="grid md:grid-cols-2 gap-8 mb-16">
			<div class="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-emerald-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-bounce-in">
				<div class="flex items-center mb-4">
					<div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-4">
						<span class="text-white text-2xl font-bold">🃏</span>
					</div>
					<h3 class="text-2xl font-bold text-gray-800">Track Cards Played</h3>
				</div>
				<p class="text-gray-600 leading-relaxed">
					Develop the ability to remember every card that hits the table. Practice with all four players or focus on specific opponents to sharpen your observational skills.
				</p>
			</div>

			<div class="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-teal-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-bounce-in" style="animation-delay: 0.2s;">
				<div class="flex items-center mb-4">
					<div class="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mr-4">
						<span class="text-white text-2xl font-bold">🎯</span>
					</div>
					<h3 class="text-2xl font-bold text-gray-800">Anticipate Cards Remaining</h3>
				</div>
				<p class="text-gray-600 leading-relaxed">
					Learn to calculate which cards are still in the deck. This crucial skill helps you make better decisions and predict your opponents' likely holdings.
				</p>
			</div>
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
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	
	@keyframes slideDown {
		from { 
			opacity: 0;
			transform: translateY(-10px) scale(0.95);
		}
		to { 
			opacity: 1;
			transform: translateY(0) scale(1);
		}
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
	
	.animate-slide-down {
		animation: slideDown 0.3s ease-out;
	}
	
	.animate-bounce-in {
		animation: bounceIn 0.6s ease-out;
		animation-fill-mode: both;
	}
</style>
