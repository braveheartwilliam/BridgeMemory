<script lang="ts">
	import Card from './Card.svelte';
	import type { GameState, Card as CardType } from '$lib/types/bridge';

	export let gameState: GameState;
	export let onCardClick: (card: CardType) => void;
</script>

<div class="bg-white p-6 rounded-lg shadow-lg">
	<h2 class="text-2xl font-bold mb-4">Bridge Game</h2>
	
	<div class="mb-4">
		<h3 class="font-semibold">Trick #{gameState.trickNumber}</h3>
		<div class="flex gap-2">
			{#each gameState.trick as card}
				<Card card={{...card, id: `${card.suit}-${card.rank}`}} />
			{/each}
		</div>
	</div>
	
	<div class="grid grid-cols-2 gap-4 mb-4">
		{#each gameState.players as player, index}
			<div class="border p-4 rounded">
				<h4 class="font-semibold">{player.name} {player.isHuman ? '(You)' : '(Robot)'}</h4>
				<div class="flex flex-wrap gap-1 mt-2">
					{#each player.hand as card}
						<Card 
							card={{...card, id: `${card.suit}-${card.rank}`}}
							size="small" 
							clickable={player.isHuman && gameState.currentPlayer === index} 
							onclick={() => onCardClick(card)}
						/>
					{/each}
				</div>
			</div>
		{/each}
	</div>
	
	{#if gameState.isGameOver}
		<div class="text-center text-xl font-bold text-green-600">
			Game Over!
		</div>
	{:else}
		<div class="text-center">
			Current Player: {gameState.players[gameState.currentPlayer].name}
		</div>
	{/if}
</div>
