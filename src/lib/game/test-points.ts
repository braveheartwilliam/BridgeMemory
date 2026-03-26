import { createDeck, dealCardsWithValidation } from './deck';
import { calculateHandPoints, calculateDeclarerPoints, calculateDummyPoints, validateDeal } from './points';

// Test function to verify bridge rules implementation
export function testBridgeRules() {
	console.log('🎯 Testing Bridge Rules Implementation...\n');
	
	const deck = createDeck();
	const { hands, validation, attempts } = dealCardsWithValidation(deck);
	
	console.log(`📊 Deal Statistics:`);
	console.log(`   Attempts needed: ${attempts}`);
	console.log(`   Valid deal: ${validation.isValid}`);
	console.log(`   Declarer points: ${validation.declarerPoints}`);
	console.log(`   Dummy points: ${validation.dummyPoints}`);
	console.log(`   Total points: ${validation.totalPoints}`);
	
	if (validation.errors.length > 0) {
		console.log(`   Errors: ${validation.errors.join(', ')}`);
	}
	
	// Test individual hands
	const declarerHand = hands[2]; // South
	const dummyHand = hands[0]; // North
	
	console.log(`\n🃏 Declarer Hand (South):`);
	console.log(`   Cards: ${declarerHand.map(c => `${c.rank}${c.suit[0].toUpperCase()}`).join(', ')}`);
	console.log(`   Face card points: ${calculateHandPoints(declarerHand)}`);
	console.log(`   Hearts count: ${declarerHand.filter(c => c.suit === 'hearts').length}`);
	
	console.log(`\n🃏 Dummy Hand (North):`);
	console.log(`   Cards: ${dummyHand.map(c => `${c.rank}${c.suit[0].toUpperCase()}`).join(', ')}`);
	console.log(`   Face card points: ${calculateHandPoints(dummyHand)}`);
	console.log(`   Hearts count: ${dummyHand.filter(c => c.suit === 'hearts').length}`);
	
	// Test suit shortages for dummy
	const suits = ['diamonds', 'clubs', 'spades'];
	console.log(`\n📈 Dummy Suit Shortages:`);
	for (const suit of suits) {
		const count = dummyHand.filter(c => c.suit === suit).length;
		let points = 0;
		switch (count) {
			case 0: points = 5; break;
			case 1: points = 3; break;
			case 2: points = 1; break;
		}
		console.log(`   ${suit}: ${count} cards = ${points} points`);
	}
	
	return validation;
}

// Test card point values
export function testCardPoints() {
	console.log('\n🎯 Testing Card Point Values...');
	
	const testCards = [
		{ rank: 'A', expected: 4 },
		{ rank: 'K', expected: 3 },
		{ rank: 'Q', expected: 2 },
		{ rank: 'J', expected: 1 },
		{ rank: '10', expected: 0 },
		{ rank: '2', expected: 0 }
	];
	
	for (const test of testCards) {
		const card = { suit: 'hearts', rank: test.rank };
		const points = calculateHandPoints([card]);
		const status = points === test.expected ? '✅' : '❌';
		console.log(`   ${status} ${test.rank}: ${points} points (expected ${test.expected})`);
	}
}
