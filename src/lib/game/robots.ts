import type { RobotPlayer, Card, GameState, SkillLevel } from '$lib/types/bridge';

export function getRobotMove(robot: RobotPlayer, gameState: GameState): Card {
	// For now, just play a random card
	const randomIndex = Math.floor(Math.random() * robot.hand.length);
	return robot.hand[randomIndex];
}

export function getRobotSkillDescription(skillLevel: SkillLevel): string {
	const descriptions = {
		beginner: 'Plays randomly',
		intermediate: 'Follows basic suit rules',
		advanced: 'Considers trick winners',
		expert: 'Optimal play'
	};
	return descriptions[skillLevel];
}
