<script lang="ts">
	import { goto } from '$app/navigation';

	interface Activity {
		id: string;
		title: string;
		description: string;
		icon: string;
		route: string;
		status: 'available' | 'coming-soon' | 'planned';
		difficulty: 'beginner' | 'intermediate' | 'advanced';
		duration: string;
	}

	const activities: Activity[] = [
		{
			id: 'capture-missing-trump',
			title: 'Capture the Missing Trump',
			description: 'Learn to identify and capture missing trump cards in bridge play scenarios',
			icon: '🎯',
			route: '/bridge-analysis/capture-missing-trump',
			status: 'available',
			difficulty: 'intermediate',
			duration: '15-20 min'
		},
		{
			id: 'card-counting',
			title: 'Advanced Card Counting',
			description: 'Master the art of counting cards to predict opponent holdings',
			icon: '🔢',
			route: '/bridge-analysis/card-counting',
			status: 'coming-soon',
			difficulty: 'advanced',
			duration: '20-30 min'
		},
		{
			id: 'play-analysis',
			title: 'Play Analysis Workshop',
			description: 'Analyze complex bridge hands and identify optimal plays',
			icon: '📊',
			route: '/bridge-analysis/play-analysis',
			status: 'coming-soon',
			difficulty: 'advanced',
			duration: '25-35 min'
		},
		{
			id: 'defensive-strategy',
			title: 'Defensive Strategy Training',
			description: 'Develop defensive techniques to counter opponent strategies',
			icon: '🛡️',
			route: '/bridge-analysis/defensive-strategy',
			status: 'planned',
			difficulty: 'intermediate',
			duration: '20-25 min'
		}
	];

	function navigateToActivity(route: string) {
		goto(route);
	}

	function goBackToMain() {
		goto('/');
	}

	function getStatusColor(status: Activity['status']) {
		switch (status) {
			case 'available':
				return 'bg-green-100 text-green-800';
			case 'coming-soon':
				return 'bg-yellow-100 text-yellow-800';
			case 'planned':
				return 'bg-gray-100 text-gray-800';
		}
	}

	function getDifficultyColor(difficulty: Activity['difficulty']) {
		switch (difficulty) {
			case 'beginner':
				return 'bg-blue-100 text-blue-800';
			case 'intermediate':
				return 'bg-orange-100 text-orange-800';
			case 'advanced':
				return 'bg-red-100 text-red-800';
		}
	}
</script>

<svelte:head>
	<title>Bridge Play Analysis - Training Activities</title>
	<meta name="description" content="Bridge play analysis training activities and exercises" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
	<!-- Breadcrumb Navigation -->
	<nav class="bg-white/80 backdrop-blur-sm border-b border-indigo-100">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
			<ol class="flex items-center space-x-2 text-sm">
				<li class="flex items-center">
					<button 
						onclick={goBackToMain}
						class="text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
					>
						Bridge Intelligence Advancement
					</button>
					<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</li>
				<li class="flex items-center">
					<span class="text-indigo-600 font-semibold">Bridge Play Analysis</span>
				</li>
			</ol>
		</div>
	</nav>

	<!-- Header -->
	<header class="bg-white/90 backdrop-blur-md shadow-lg border-b border-indigo-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-20">
				<div class="flex items-center space-x-3">
					<button 
						onclick={goBackToMain}
						class="p-2 rounded-lg hover:bg-indigo-100 transition-colors"
						aria-label="Back to main menu"
						title="Back to main menu"
					>
						<svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
					</button>
					<div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
						<span class="text-white text-xl">📊</span>
					</div>
					<h1 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
						Bridge Play Analysis
					</h1>
				</div>
				<div class="flex items-center space-x-4">
					<span class="text-sm text-gray-600 font-medium">Training Activities</span>
				</div>
			</div>
		</div>
	</header>

	<!-- Hero Section -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
		<div class="text-center mb-16">
			<h2 class="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
				Master Bridge Play Analysis
			</h2>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mt-4">
				Develop advanced bridge play analysis skills through interactive training activities. Learn to identify patterns, calculate probabilities, and make optimal decisions.
			</p>
		</div>

		<!-- Activities Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
			{#each activities as activity, index}
				<div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group">
					<div class="p-8">
						<div class="flex items-start justify-between mb-6">
							<div class="flex-1">
								<div class="flex items-center space-x-3 mb-4">
									<span class="text-4xl">{activity.icon}</span>
									<div>
										<h3 class="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
											{activity.title}
										</h3>
										<div class="flex items-center space-x-2 mt-1">
											<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(activity.status)}">
												{#if activity.status === 'available'}
													Available Now
												{:else if activity.status === 'coming-soon'}
													Coming Soon
												{:else}
													Planned
												{/if}
											</span>
											<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getDifficultyColor(activity.difficulty)}">
												{activity.difficulty.charAt(0).toUpperCase() + activity.difficulty.slice(1)}
											</span>
										</div>
									</div>
								</div>
								<p class="text-gray-600 mb-4 leading-relaxed">{activity.description}</p>
								<div class="flex items-center text-sm text-gray-500 mb-6">
									<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span>{activity.duration}</span>
								</div>
							</div>
						</div>
						
						<div class="flex items-center justify-between">
							{#if activity.status === 'available'}
								<button 
									onclick={() => navigateToActivity(activity.route)}
									class="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
								>
									Start Activity
								</button>
							{:else}
								<button 
									disabled
									class="w-full px-6 py-3 bg-gray-200 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
								>
									{#if activity.status === 'coming-soon'}
										Coming Soon
									{:else}
										Planned
									{/if}
								</button>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Learning Path -->
		<div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-indigo-100">
			<h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">Recommended Learning Path</h3>
			<div class="grid md:grid-cols-4 gap-6">
				<div class="text-center">
					<div class="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
						<span class="text-white text-2xl font-bold">1</span>
					</div>
					<h4 class="font-semibold text-gray-800 mb-2">Start Here</h4>
					<p class="text-sm text-gray-600">Begin with Capture the Missing Trump</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
						<span class="text-white text-2xl font-bold">2</span>
					</div>
					<h4 class="font-semibold text-gray-800 mb-2">Advance Skills</h4>
					<p class="text-sm text-gray-600">Progress to Card Counting</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
						<span class="text-white text-2xl font-bold">3</span>
					</div>
					<h4 class="font-semibold text-gray-800 mb-2">Master Analysis</h4>
					<p class="text-sm text-gray-600">Try Play Analysis Workshop</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
						<span class="text-white text-2xl font-bold">4</span>
					</div>
					<h4 class="font-semibold text-gray-800 mb-2">Complete Training</h4>
					<p class="text-sm text-gray-600">Finish with Defensive Strategy</p>
				</div>
			</div>
		</div>
	</main>
</div>
