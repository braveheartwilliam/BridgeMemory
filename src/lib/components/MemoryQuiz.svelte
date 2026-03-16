<script lang="ts">
	import type { Card } from '$lib/types/bridge';

	export let isVisible: boolean;
	export let onClose: () => void;
	export let playedCards: Card[];
	export let onAnswer: (correct: boolean) => void;
	
	let question: string = '';
	let options: string[] = [];
	let correctAnswer: string = '';
	
	function generateQuestion() {
		if (playedCards.length < 2) return;
		
		const randomCard = playedCards[Math.floor(Math.random() * playedCards.length)];
		const suit = randomCard.suit;
		const rank = randomCard.rank;
		
		const suitCards = playedCards.filter(c => c.suit === suit);
		
		if (Math.random() > 0.5) {
			// Ask about a played card
			question = `Has the ${rank} of ${suit} been played?`;
			correctAnswer = 'Yes';
			options = ['Yes', 'No'];
		} else {
			// Ask about remaining cards
			const remainingRanks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
				.filter(r => !suitCards.some(c => c.rank === r));
			if (remainingRanks.length > 0) {
				const randomRank = remainingRanks[Math.floor(Math.random() * remainingRanks.length)];
				question = `Has the ${randomRank} of ${suit} been played?`;
				correctAnswer = 'No';
				options = ['Yes', 'No'];
			}
		}
	}
	
	function handleAnswer(answer: string) {
		const correct = answer === correctAnswer;
		onAnswer(correct);
		generateQuestion();
	}
	
	$: if (isVisible && !question) {
		generateQuestion();
	}
</script>

{#if isVisible}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white p-6 rounded-lg max-w-md">
			<h2 class="text-2xl font-bold mb-4">Memory Quiz</h2>
			
			{#if question}
				<div class="mb-4">
					<p class="text-lg mb-4">{question}</p>
					<div class="space-y-2">
						{#each options as option}
							<button 
								on:click={() => handleAnswer(option)}
								class="block w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
							>
								{option}
							</button>
						{/each}
					</div>
				</div>
			{:else}
				<p class="text-center">Not enough cards played yet for quiz.</p>
			{/if}
			
			<button 
				on:click={onClose}
				class="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
			>
				Close Quiz
			</button>
		</div>
	</div>
{/if}
