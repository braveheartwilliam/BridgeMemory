<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// Application data
	const applications = [
		{
			title: 'Bridge Memory Challenge',
			description: 'Master your bridge card memory with advanced training exercises',
			icon: '??',
			route: '/bridge-memory',
			status: 'available',
			features: ['Card Recognition', 'Memory Training', 'Skill Progression']
		},
		{
			title: 'Bridge Bidding Practice',
			description: 'Improve your bidding skills with interactive scenarios',
			icon: '??',
			route: '/bridge-bidding',
			status: 'coming-soon',
			features: ['Bidding Systems', 'Scenario Practice', 'Partnership Coordination']
		},
		{
			title: 'Bridge Play Analysis',
			description: 'Analyze and improve your card play techniques',
			icon: '??',
			route: '/bridge-analysis',
			status: 'coming-soon',
			features: ['Play Review', 'Optimal Strategies', 'Mistake Detection']
		},
		{
			title: 'Bridge Conventions Master',
			description: 'Learn and practice advanced bridge conventions',
			icon: '??',
			route: '/bridge-conventions',
			status: 'planned',
			features: ['Convention Library', 'Interactive Lessons', 'Practice Hands']
		}
	];

	function navigateToApp(route: string) {
		goto(route);
	}

	// Animation on mount
	onMount(() => {
		const elements = document.querySelectorAll('.fade-in');
		elements.forEach((el, index) => {
			setTimeout(() => {
				el.classList.add('opacity-100');
				el.classList.remove('opacity-0');
			}, index * 100);
		});
	});
</script>

<svelte:head>
	<title>Bridge Intelligence Advancement - Master Your Bridge Skills</title>
	<meta name="description" content="Advanced bridge training applications to improve your memory, bidding, and play skills" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
	<!-- Hero Section -->
	<section class="relative overflow-hidden">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
			<div class="text-center fade-in opacity-0 transition-opacity duration-1000">
				<h1 class="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
					Bridge Intelligence
					<br />
					<span class="text-4xl md:text-6xl">Advancement</span>
				</h1>
				<p class="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
					Master your bridge skills with our comprehensive suite of advanced training applications
				</p>
				<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<div class="flex items-center space-x-2 text-gray-600">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>Expert-Designed Training</span>
					</div>
					<div class="flex items-center space-x-2 text-gray-600">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
						<span>Progressive Learning</span>
					</div>
					<div class="flex items-center space-x-2 text-gray-600">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
						</svg>
						<span>Skill Tracking</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Applications Section -->
	<section class="py-20">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-16 fade-in opacity-0 transition-opacity duration-1000">
				<h2 class="text-4xl font-bold text-gray-900 mb-4">Training Applications</h2>
				<p class="text-xl text-gray-600 max-w-2xl mx-auto">
					Choose from our specialized training modules to enhance specific aspects of your bridge game
				</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
				{#each applications as app, index}
					<div class="fade-in opacity-0 transition-opacity duration-1000 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden group">
						<div class="p-8">
							<div class="flex items-start justify-between mb-6">
								<div class="flex-1">
									<div class="flex items-center space-x-3 mb-4">
										<span class="text-4xl">{app.icon}</span>
										<div>
											<h3 class="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
												{app.title}
											</h3>
											<div class="flex items-center space-x-2 mt-1">
												{#if app.status === 'available'}
													<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
														Available Now
													</span>
												{:else if app.status === 'coming-soon' && app.title === 'Bridge Play Analysis'}
													<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
														Under Development
													</span>
												{:else}
													<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
														Planned
													</span>
												{/if}
											</div>
										</div>
									</div>
									<p class="text-gray-600 mb-6 leading-relaxed">{app.description}</p>
									<div class="space-y-2 mb-6">
										{#each app.features as feature}
											<div class="flex items-center space-x-2 text-sm text-gray-500">
												<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
												</svg>
												<span>{feature}</span>
											</div>
										{/each}
									</div>
								</div>
							</div>
							
							<div class="flex items-center justify-between">
								{#if app.status === 'available'}
									<button 
										onclick={() => navigateToApp(app.route)}
										class="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
									>
										Launch Application
									</button>
								{:else if app.status === 'coming-soon' && app.title === 'Bridge Play Analysis'}
									<button 
										onclick={() => navigateToApp(app.route)}
										class="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
									>
										Launch Application
									</button>
								{:else if app.status === 'coming-soon'}
									<button 
										disabled
										class="w-full px-6 py-3 bg-gray-200 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
									>
										Coming Soon
									</button>
								{:else}
									<button 
										disabled
										class="w-full px-6 py-3 bg-gray-200 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
									>
										Planned
									</button>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>
</div>

<style>
	.fade-in {
		transition: opacity 1s ease-in-out;
	}
</style>
