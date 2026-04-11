<script lang="ts">
	import Card from './Card.svelte';
	import type { Card as CardType } from '$lib/types/bridge';

	export let playedCards: CardType[];
	export let remainingCards: CardType[];
	export let playerHandEstimates: CardType[][];

	function getCardsBySuit(cards: CardType[], suit: string): CardType[] {
		return cards.filter(card => card.suit === suit);
	}

	const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
</script>

<div class="bg-gray-100 p-4 rounded-lg">
	<h3 class="text-lg font-bold mb-4">Memory Panel</h3>
	
	<div class="mb-4">
		<h4 class="font-semibold">Played Cards by Suit:</h4>
		{#each suits as suit}
			<div class="mb-2">
				<span class="capitalize font-medium">{suit}:</span>
				<div class="flex flex-wrap gap-1 mt-1">
					{#each getCardsBySuit(playedCards, suit) as card}
						<Card card={{...card, id: `${card.suit}-${card.rank}`}} size="small" />
					{/each}
				</div>
			</div>
		{/each}
	</div>
	
	<div class="mb-4">
		<h4 class="font-semibold">Remaining Cards: {remainingCards.length}</h4>
		<div class="flex flex-wrap gap-1">
			{#each remainingCards.slice(0, 20) as card}
				<Card card={{...card, id: `${card.suit}-${card.rank}`}} size="small" />
			{/each}
			{#if remainingCards.length > 20}
				<span class="text-sm text-gray-500">...and {remainingCards.length - 20} more</span>
			{/if}
		</div>
	</div>
	
	<div>
		<h4 class="font-semibold">Estimated Player Hands:</h4>
		{#each playerHandEstimates as hand, index}
			<div class="mb-2">
				<span class="font-medium">Player {index + 1}:</span>
				<span class="text-sm text-gray-600 ml-2">~{hand.length} cards estimated</span>
			</div>
		{/each}
	</div>
</div>
