<script lang="ts" context="module">
	import '../../app.css';

	// Card type definition
	export interface Card {
		suit: 'S' | 'H' | 'D' | 'C'; // Spades, Hearts, Diamonds, Clubs
		rank: string; // A, 2-10, J, Q, K
		id: string; // Unique identifier for each card
	}

	// Hand display options
	export interface HandDisplayOptions {
		displayMode: 'simple' | 'images' | 'grid' | 'fan';
		arrangement: 'horizontal' | 'vertical';
		flipEnabled: boolean;
		initialState: 'face' | 'back';
		autoFlipEnabled: boolean;
		autoFlipDuration: number; // in seconds
	}
</script>

<script lang="ts">
	// Component props
	export let cards: Card[] = [];
	export let displayOptions: HandDisplayOptions = {
		displayMode: 'simple',
		arrangement: 'horizontal',
		flipEnabled: false,
		initialState: 'face',
		autoFlipEnabled: false,
		autoFlipDuration: 7
	};

	// Reactive state for card flip states
	let cardStates: Record<string, boolean> = {};
	let autoFlipTimeout: number | null = null;
	let isAutoFlipping = false;

	// Initialize card states based on initial display option
	$: {
		if (cards.length > 0) {
			cardStates = {};
			cards.forEach(card => {
				cardStates[card.id] = displayOptions.initialState === 'face';
			});
			
			// Handle auto-flip
			if (displayOptions.autoFlipEnabled && !isAutoFlipping) {
				startAutoFlip();
			} else if (!displayOptions.autoFlipEnabled && autoFlipTimeout) {
				clearAutoFlip();
			}
		}
	}

	// Helper functions
	function getSuitSymbol(suit: string): string {
		switch (suit) {
			case 'S': return '♠';
			case 'H': return '♥';
			case 'D': return '♦';
			case 'C': return '♣';
			default: return '';
		}
	}

	function getSuitColor(suit: string): string {
		return (suit === 'H' || suit === 'D') ? 'text-red-500' : 'text-black';
	}

	function getRankDisplay(rank: string): string {
		switch (rank) {
			case 'A': return 'A';
			case 'J': return 'J';
			case 'Q': return 'Q';
			case 'K': return 'K';
			default: return rank;
		}
	}

	function getCardColor(card: Card): string {
		return (card.suit === 'H' || card.suit === 'D') ? 'border-red-400 bg-red-50' : 'border-black bg-gray-50';
	}

	// Sort cards by suit (S, H, D, C) and rank (high to low)
	function sortCards(cards: Card[]): Card[] {
		const suitOrder: Record<string, number> = { 'S': 0, 'H': 1, 'D': 2, 'C': 3 };
		const rankOrder: Record<string, number> = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2, '1': 1 };
		
		return [...cards].sort((a, b) => {
			const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
			if (suitDiff !== 0) return suitDiff;
			
			return rankOrder[b.rank] - rankOrder[a.rank];
		});
	}

	// Card flip functions
	function flipCard(cardId: string) {
		if (displayOptions.flipEnabled) {
			cardStates[cardId] = !cardStates[cardId];
			cardStates = { ...cardStates }; // Trigger reactivity
		}
	}

	function flipAllCards(faceUp: boolean) {
		const newStates: Record<string, boolean> = {};
		cards.forEach(card => {
			newStates[card.id] = faceUp;
		});
		cardStates = newStates;
	}

	function startAutoFlip() {
		if (displayOptions.initialState === 'back') {
			// Start with back showing, flip to face, then back
			setTimeout(() => {
				flipAllCards(true);
				setTimeout(() => {
					flipAllCards(false);
					isAutoFlipping = false;
				}, displayOptions.autoFlipDuration * 1000);
			}, 500); // Small delay before starting
		} else {
			// Start with face showing, flip to back, then face
			setTimeout(() => {
				flipAllCards(false);
				setTimeout(() => {
					flipAllCards(true);
					isAutoFlipping = false;
				}, displayOptions.autoFlipDuration * 1000);
			}, 500); // Small delay before starting
		}
		isAutoFlipping = true;
	}

	function clearAutoFlip() {
		if (autoFlipTimeout) {
			clearTimeout(autoFlipTimeout);
			autoFlipTimeout = null;
		}
		isAutoFlipping = false;
	}

	// Public functions for external control
	export function flipAllToFace() {
		flipAllCards(true);
	}

	export function flipAllToBack() {
		flipAllCards(false);
	}

	export function startAutoFlipSequence() {
		startAutoFlip();
	}

	$: sortedCards = sortCards(cards);
</script>

<div class="p-8 bg-white rounded-lg shadow-lg border-2 border-gray-300">
	<h2 class="text-2xl font-bold mb-6 text-center">Hand Display Demo</h2>
	
	{#if displayOptions.displayMode === 'simple'}
		<!-- Simple text display -->
		{#if displayOptions.arrangement === 'horizontal'}
			<!-- Horizontal: suits arranged side by side -->
			<div class="flex justify-center space-x-4">
				{#each ['S', 'H', 'D', 'C'] as suit}
					<div class="flex flex-col space-y-1">
						{#each sortedCards.filter(card => card.suit === suit) as card}
							<div class="px-3 py-2 rounded-lg font-bold text-emerald-800">
								<span class={getSuitColor(card.suit)}>
									{getSuitSymbol(card.suit)}{getRankDisplay(card.rank)}
								</span>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{:else}
			<!-- Vertical: suits stacked, then arranged horizontally -->
			<div class="flex flex-col space-y-4">
				{#each ['S', 'H', 'D', 'C'] as suit}
					<div class="flex items-center space-x-2">
						{#each sortedCards.filter(card => card.suit === suit) as card}
							<div class="px-3 py-2 rounded-lg font-bold text-emerald-800">
								<span class={getSuitColor(card.suit)}>
									{getSuitSymbol(card.suit)}{getRankDisplay(card.rank)}
								</span>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{/if}
	{:else if displayOptions.displayMode === 'images'}
		<!-- Card images display -->
		{#if displayOptions.arrangement === 'horizontal'}
			<!-- Horizontal: suits arranged side by side -->
			<div class="flex justify-center space-x-4">
				{#each ['S', 'H', 'D', 'C'] as suit}
					<div class="flex flex-col space-y-1">
						{#each sortedCards.filter(card => card.suit === suit) as card}
							<div 
								class="w-16 h-24 border-2 rounded-lg shadow-md flex items-center justify-center relative overflow-hidden {getCardColor(card)} {displayOptions.flipEnabled ? 'cursor-pointer' : ''}"
								style="background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjNkNyIvPjxwYXRoIGQ9Ik0wIDUwIEwxMDAgNTAgTDEwMCAxMDBMMCAxMDBaIiBmaWxsPSJub25lIiBzdHJva2U9IiNkNmQ2ZDYiIHN0cm9rZS13aWR0aD0iMSIvPjxwYXRoIGQ9Ik0wIDAgTDEwMCAwIEwxMDAgMTAwTDAgMTAwWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDZkNmQ2IiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4='); background-size: 20px 20px; background-repeat: repeat; transform-style: preserve-3d; transition: transform 0.3s; {cardStates[card.id] ? '' : 'transform: rotateY(180deg)'};"
								on:click={() => flipCard(card.id)}
							>
								<!-- Card face -->
								<div class="absolute inset-0 flex items-center justify-center" style="backface-visibility: hidden; {cardStates[card.id] ? '' : 'transform: rotateY(180deg)'};">
									<!-- Top left corner -->
									<div class="absolute top-0 left-0 text-xs font-bold {getSuitColor(card.suit)}">
										{getRankDisplay(card.rank)}{getSuitSymbol(card.suit)}
									</div>
									<!-- Bottom right corner (rotated) -->
									<div class="absolute bottom-0 right-0 text-xs font-bold {getSuitColor(card.suit)} transform rotate-180">
										{getRankDisplay(card.rank)}{getSuitSymbol(card.suit)}
									</div>
									<!-- Center content -->
									<div class="text-7xl font-bold {getSuitColor(card.suit)} flex items-center justify-center" style="margin-top: -8px;">
										{#if card.rank === 'A'}
											<div style="margin-top: -8px;">{#if card.suit === 'S'}🂡{:else if card.suit === 'H'}🂱{:else if card.suit === 'D'}🃁{:else if card.suit === 'C'}🃑{/if}</div>
										{:else if card.rank === 'K'}
											<div style="margin-top: -8px;">{#if card.suit === 'S'}🂮{:else if card.suit === 'H'}🂾{:else if card.suit === 'D'}🃎{:else if card.suit === 'C'}🃞{/if}</div>
										{:else if card.rank === 'Q'}
											<div style="margin-top: -8px;">{#if card.suit === 'S'}🂭{:else if card.suit === 'H'}🂽{:else if card.suit === 'D'}🃍{:else if card.suit === 'C'}🃝{/if}</div>
										{:else if card.rank === 'J'}
											<div style="margin-top: -8px;">{#if card.suit === 'S'}🂫{:else if card.suit === 'H'}🂻{:else if card.suit === 'D'}🃋{:else if card.suit === 'C'}🃛{/if}</div>
										{:else}
											<div class="text-5xl">{getRankDisplay(card.rank)}</div>
										{/if}
									</div>
								</div>
								<!-- Card back -->
								<div class="absolute inset-0 flex items-center justify-center" style="backface-visibility: hidden; {cardStates[card.id] ? 'transform: rotateY(180deg)' : ''}; background: linear-gradient(45deg, #2c3e50 25%, #34495e 25%, #34495e 50%, #2c3e50 50%, #2c3e50 75%, #34495e 75%, #34495e); background-size: 8px 8px; border: 2px solid #1a252f;">
									<div class="text-white text-2xl font-bold">🂠</div>
								</div>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{:else}
			<!-- Vertical: suits stacked, then arranged horizontally -->
			<div class="flex flex-col space-y-4">
				{#each ['S', 'H', 'D', 'C'] as suit}
					<div class="flex space-x-1">
						{#each sortedCards.filter(card => card.suit === suit) as card}
							<div 
								class="w-16 h-24 border-2 rounded-lg shadow-md flex items-center justify-center relative overflow-hidden {getCardColor(card)} {displayOptions.flipEnabled ? 'cursor-pointer' : ''}"
								style="background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjNkNyIvPjxwYXRoIGQ9Ik0wIDUwIEwxMDAgNTAgTDEwMCAxMDBMMCAxMDBaIiBmaWxsPSJub25lIiBzdHJva2U9IiNkNmQ2ZDYiIHN0cm9rZS13aWR0aD0iMSIvPjxwYXRoIGQ9Ik0wIDAgTDEwMCAwIEwxMDAgMTAwTDAgMTAwWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDZkNmQ2IiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4='); background-size: 20px 20px; background-repeat: repeat; transform-style: preserve-3d; transition: transform 0.3s; {cardStates[card.id] ? '' : 'transform: rotateY(180deg)'};"
								on:click={() => flipCard(card.id)}
							>
								<!-- Card face -->
								<div class="absolute inset-0 flex items-center justify-center" style="backface-visibility: hidden; {cardStates[card.id] ? '' : 'transform: rotateY(180deg)'};">
									<!-- Top left corner -->
									<div class="absolute top-0 left-0 text-xs font-bold {getSuitColor(card.suit)}">
										{getRankDisplay(card.rank)}{getSuitSymbol(card.suit)}
									</div>
									<!-- Bottom right corner (rotated) -->
									<div class="absolute bottom-0 right-0 text-xs font-bold {getSuitColor(card.suit)} transform rotate-180">
										{getRankDisplay(card.rank)}{getSuitSymbol(card.suit)}
									</div>
									<!-- Center content -->
									<div class="text-7xl font-bold {getSuitColor(card.suit)} flex items-center justify-center" style="margin-top: -8px;">
										{#if card.rank === 'A'}
											<div style="margin-top: -8px;">{#if card.suit === 'S'}🂡{:else if card.suit === 'H'}🂱{:else if card.suit === 'D'}🃁{:else if card.suit === 'C'}🃑{/if}</div>
										{:else if card.rank === 'K'}
											<div style="margin-top: -8px;">{#if card.suit === 'S'}🂮{:else if card.suit === 'H'}🂾{:else if card.suit === 'D'}🃎{:else if card.suit === 'C'}🃞{/if}</div>
										{:else if card.rank === 'Q'}
											<div style="margin-top: -8px;">{#if card.suit === 'S'}🂭{:else if card.suit === 'H'}🂽{:else if card.suit === 'D'}🃍{:else if card.suit === 'C'}🃝{/if}</div>
										{:else if card.rank === 'J'}
											<div style="margin-top: -8px;">{#if card.suit === 'S'}🂫{:else if card.suit === 'H'}🂻{:else if card.suit === 'D'}🃋{:else if card.suit === 'C'}🃛{/if}</div>
										{:else}
											<div class="text-5xl">{getRankDisplay(card.rank)}</div>
										{/if}
									</div>
								</div>
								<!-- Card back -->
								<div class="absolute inset-0 flex items-center justify-center" style="backface-visibility: hidden; {cardStates[card.id] ? 'transform: rotateY(180deg)' : ''}; background: linear-gradient(45deg, #2c3e50 25%, #34495e 25%, #34495e 50%, #2c3e50 50%, #2c3e50 75%, #34495e 75%, #34495e); background-size: 8px 8px; border: 2px solid #1a252f;">
									<div class="text-white text-2xl font-bold">🂠</div>
								</div>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{/if}
	{:else if displayOptions.displayMode === 'grid'}
		<!-- Grid display -->
		<div class="grid grid-cols-4 gap-4 max-w-md mx-auto">
			{#each sortedCards as card}
				<div class="w-16 h-24 border-2 rounded-lg shadow-md flex items-center justify-center {getCardColor(card)}">
					<div class="text-2xl font-bold {getSuitColor(card.suit)}">
						{getRankDisplay(card.rank)}
					</div>
				</div>
			{/each}
		</div>
	{:else if displayOptions.displayMode === 'fan'}
		<!-- Fan display -->
		<div class="flex justify-center">
			<div class="relative">
				{#each sortedCards as card, i}
					<div 
						class="absolute w-16 h-24 border-2 rounded-lg shadow-md flex items-center justify-center {getCardColor(card)}"
						style="transform: rotate({i * 5 - 20}deg) translateX({i * 30}px);"
					>
						<div class="text-2xl font-bold {getSuitColor(card.suit)}">
							{getRankDisplay(card.rank)}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
