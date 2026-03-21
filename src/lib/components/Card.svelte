<script lang="ts">
	import type { Card } from '$lib/types/bridge';

	// Props using Svelte 5 runes
	let { card, size = 'medium', clickable = false, onClick, flipped = false, bridgeTheme = false } = $props();

	// Support both card interfaces (bridge types and game types)
	const suitSymbols = {
		hearts: '♥', 'H': '♥',
		diamonds: '♦', 'D': '♦',
		clubs: '♣', 'C': '♣',
		spades: '♠', 'S': '♠'
	};

	const suitColors = {
		hearts: 'text-red-600',
		diamonds: 'text-red-600',
		clubs: 'text-black',
		spades: 'text-black'
	};

	const sizeClasses = {
		small: 'w-12 h-16',
		medium: 'w-16 h-24',
		large: 'w-20 h-28'
	};

	// Helper functions instead of derived
	function getShowBack(): boolean {
		return !flipped;
	}

	function getCardColor(): string {
		return suitColors[card.suit];
	}

	function getSuitSymbol(): string {
		return suitSymbols[card.suit];
	}

	// Get face card Unicode symbols
	function getFaceCardSymbol(rank: string, suit: string): string {
		if (rank === 'A') {
			if (suit === 'S' || suit === 'spades') return '🂡';
			if (suit === 'H' || suit === 'hearts') return '🂱';
			if (suit === 'D' || suit === 'diamonds') return '🂢';
			if (suit === 'C' || suit === 'clubs') return '🂣';
		}
		if (rank === 'K') {
			if (suit === 'S' || suit === 'spades') return '🂮';
			if (suit === 'H' || suit === 'hearts') return '🂾';
			if (suit === 'D' || suit === 'diamonds') return '🂿';
			if (suit === 'C' || suit === 'clubs') return '🃞';
		}
		if (rank === 'Q') {
			if (suit === 'S' || suit === 'spades') return '🂭';
			if (suit === 'H' || suit === 'hearts') return '🂭';
			if (suit === 'D' || suit === 'diamonds') return '🂭';
			if (suit === 'C' || suit === 'clubs') return '🂭';
		}
		if (rank === 'J') {
			if (suit === 'S' || suit === 'spades') return '🂫';
			if (suit === 'H' || suit === 'hearts') return '🂫';
			if (suit === 'D' || suit === 'diamonds') return '🂫';
			if (suit === 'C' || suit === 'clubs') return '🂫';
		}
		if (rank === '10') {
			if (suit === 'S' || suit === 'spades') return '🂪';
			if (suit === 'H' || suit === 'hearts') return '🂪';
			if (suit === 'D' || suit === 'diamonds') return '🂪';
			if (suit === 'C' || suit === 'clubs') return '🂪';
		}
		if (rank === '9') {
			if (suit === 'S' || suit === 'spades') return '🂩';
			if (suit === 'H' || suit === 'hearts') return '🂩';
			if (suit === 'D' || suit === 'diamonds') return '🂩';
			if (suit === 'C' || suit === 'clubs') return '🂩';
		}
		if (rank === '8') {
			if (suit === 'S' || suit === 'spades') return '🂨';
			if (suit === 'H' || suit === 'hearts') return '🂨';
			if (suit === 'D' || suit === 'diamonds') return '🂨';
			if (suit === 'C' || suit === 'clubs') return '🂨';
		}
		if (rank === '7') {
			if (suit === 'S' || suit === 'spades') return '🂧';
			if (suit === 'H' || suit === 'hearts') return '🂧';
			if (suit === 'D' || suit === 'diamonds') return '🂧';
			if (suit === 'C' || suit === 'clubs') return '🂧';
		}
		if (rank === '6') {
			if (suit === 'S' || suit === 'spades') return '🂦';
			if (suit === 'H' || suit === 'hearts') return '🂦';
			if (suit === 'D' || suit === 'diamonds') return '🂦';
			if (suit === 'C' || suit === 'clubs') return '🂦';
		}
		if (rank === '5') {
			if (suit === 'S' || suit === 'spades') return '🂤';
			if (suit === 'H' || suit === 'hearts') return '🂤';
			if (suit === 'D' || suit === 'diamonds') return '🂤';
			if (suit === 'C' || suit === 'clubs') return '🂤';
		}
		if (rank === '4') {
			if (suit === 'S' || suit === 'spades') return '�';
			if (suit === 'H' || suit === 'hearts') return '�';
			if (suit === 'D' || suit === 'diamonds') return '�';
			if (suit === 'C' || suit === 'clubs') return '�';
		}
		if (rank === '3') {
			if (suit === 'S' || suit === 'spades') return '🂣';
			if (suit === 'H' || suit === 'hearts') return '🂣';
			if (suit === 'D' || suit === 'diamonds') return '🂢';
			if (suit === 'C' || suit === 'clubs') return '🂢';
		}
		if (rank === '2') {
			if (suit === 'S' || suit === 'spades') return '🂢';
			if (suit === 'H' || suit === 'hearts') return '🂢';
			if (suit === 'D' || suit === 'diamonds') return '🂢';
			if (suit === 'C' || suit === 'clubs') return '🂢';
		}
		return rank;
	}

	// Check if card is a face card
	function isFaceCard(rank: string): boolean {
		return ['A', 'K', 'Q', 'J'].includes(rank);
	}
</script>

<button 
	type="button"
	class="{sizeClasses[size]} relative border-2 rounded-lg shadow-md flex items-center justify-center hover:shadow-lg transition-all {bridgeTheme ? 'overflow-hidden' : 'bg-white border-gray-300'}"
	style="transform-style: preserve-3d; transition: transform 0.3s;"
	onclick={clickable ? onClick : undefined}
>
	{#if bridgeTheme}
		<!-- Bridge-themed card with face/back -->
		{#if !flipped}
			<!-- Card back -->
			<div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-800 to-blue-600 border-2 border-blue-900 rounded-lg">
				<!-- Bridge-themed pattern with suit symbols -->
				<svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
					<!-- Background pattern -->
					<defs>
						<pattern id="bridgePattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
							<rect width="20" height="20" fill="#2a5298"/>
							<text x="10" y="12" font-size="8" fill="#ffffff" text-anchor="middle" opacity="0.3">♠</text>
							<text x="0" y="12" font-size="6" fill="#ffffff" text-anchor="middle" opacity="0.2">♥</text>
							<text x="20" y="12" font-size="6" fill="#ffffff" text-anchor="middle" opacity="0.2">♦</text>
							<text x="10" y="0" font-size="6" fill="#ffffff" text-anchor="middle" opacity="0.2">♣</text>
							<text x="10" y="20" font-size="6" fill="#ffffff" text-anchor="middle" opacity="0.2">♣</text>
						</pattern>
					</defs>
					<rect width="100" height="100" fill="url(#bridgePattern)"/>
					<!-- Central bridge logo -->
					<circle cx="50" cy="50" r="15" fill="#ffffff" opacity="0.1"/>
					<text x="50" y="55" font-size="12" fill="#ffffff" text-anchor="middle" font-weight="bold">BRIDGE</text>
				</svg>
				<div class="relative z-10 text-white text-xl font-bold">🂠</div>
			</div>
		{:else}
			<!-- Card face -->
			<div class="absolute inset-0 flex flex-col items-center justify-center bg-white border-2 border-gray-800 rounded-lg">
				<!-- Top left corner -->
				<div class="absolute top-1 left-1 text-xs font-bold {suitColors[card.suit]}">
					{card.rank}{suitSymbols[card.suit]}
				</div>
				<!-- Bottom right corner (rotated) -->
				<div class="absolute bottom-1 right-1 text-xs font-bold {suitColors[card.suit]} transform rotate-180">
					{card.rank}{suitSymbols[card.suit]}
				</div>
				<!-- Center content -->
				<div class="text-6xl font-bold {suitColors[card.suit]} flex items-center justify-center">
					{#if isFaceCard(card.rank)}
						<div>{getFaceCardSymbol(card.rank, card.suit)}</div>
					{:else}
						<div class="text-4xl">{card.rank}</div>
					{/if}
				</div>
			</div>
		{/if}
	{:else}
		<!-- Simple card display -->
		<span class="font-bold {suitColors[card.suit]}">{card.rank}</span>
		<span class="text-2xl {suitColors[card.suit]}">{suitSymbols[card.suit]}</span>
	{/if}
</button>
