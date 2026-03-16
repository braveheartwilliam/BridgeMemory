<script lang="ts">
	export let isVisible: boolean;
	export let onClose: () => void;
</script>

{#if isVisible}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white p-6 rounded-lg max-w-2xl max-h-96 overflow-y-auto">
			<h2 class="text-2xl font-bold mb-4">Tutorial</h2>
			
			<div class="space-y-4">
				<div>
					<h3 class="font-semibold">Welcome to Bridge Memory Challenge!</h3>
					<p>This app helps you improve your memory skills in the game of Duplicate Bridge.</p>
				</div>
				
				<div>
					<h3 class="font-semibold">How to Play:</h3>
					<ul class="list-disc list-inside ml-4">
						<li>You're playing as South (bottom player)</li>
						<li>Click on cards in your hand to play them</li>
						<li>The robots will play automatically</li>
						<li>Try to remember which cards have been played</li>
					</ul>
				</div>
				
				<div>
					<h3 class="font-semibold">Memory Features:</h3>
					<ul class="list-disc list-inside ml-4">
						<li>Use the Memory Panel to track played cards</li>
						<li>See remaining cards in the deck</li>
						<li>Estimate what cards opponents might have</li>
					</ul>
				</div>
				
				<div>
					<h3 class="font-semibold">Tips:</h3>
					<ul class="list-disc list-inside ml-4">
						<li>Pay attention to the suits being played</li>
						<li>Remember the high cards that have been played</li>
						<li>Use the quiz to test your memory</li>
					</ul>
				</div>
			</div>
			
			<button 
				onclick={onClose}
				class="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
			>
				Close Tutorial
			</button>
		</div>
	</div>
{/if}
