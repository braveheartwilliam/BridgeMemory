<script lang="ts">
	import type { Card } from '$lib/types/bridge';

	interface Props {
		card: Card;
		size?: 'small' | 'medium' | 'large';
		clickable?: boolean;
		onClick?: () => void;
	}

	let { card, size = 'medium', clickable = false, onClick }: Props = $props();

	const suitSymbols = {
		hearts: '♥',
		diamonds: '♦',
		clubs: '♣',
		spades: '♠'
	};

	const suitColors = {
		hearts: 'text-red-500',
		diamonds: 'text-red-500',
		clubs: 'text-black',
		spades: 'text-black'
	};

	const sizeClasses = {
		small: 'w-8 h-12 text-sm',
		medium: 'w-12 h-16 text-lg',
		large: 'w-16 h-20 text-xl'
	};
</script>

<div 
	class="{sizeClasses[size]} bg-white border border-gray-300 rounded shadow-sm flex flex-col items-center justify-center cursor-{clickable ? 'pointer' : 'default'} hover:shadow-md transition-shadow"
	onclick={clickable ? onClick : undefined}
>
	<span class="font-bold {suitColors[card.suit]}">{card.rank}</span>
	<span class="text-2xl {suitColors[card.suit]}">{suitSymbols[card.suit]}</span>
</div>
