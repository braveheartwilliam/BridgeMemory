# Skills Framework Implementation Files

## Files to Copy

### 1. src/lib/skills/types.ts
```typescript
/**
 * Skills Framework Type Definitions
 * 
 * Comprehensive type definitions for the skills tracking and assessment system
 */

/**
 * Skill category enumeration
 * @enum {string}
 */
export type SkillCategory = 
  | 'technical'
  | 'bridge-game'
  | 'analytical'
  | 'strategic'
  | 'communication'
  | 'leadership'
  | 'problem-solving'
  | 'creativity';

/**
 * Skill level enumeration
 * @enum {string}
 */
export type SkillLevel = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert'
  | 'master';

/**
 * Skill status enumeration
 * @enum {string}
 */
export type SkillStatus = 
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'mastered';

/**
 * Skill interface
 * @interface Skill
 */
export interface Skill {
  /** Unique skill identifier */
  id: string;
  /** Skill name */
  name: string;
  /** Skill description */
  description: string;
  /** Skill category */
  category: SkillCategory;
  /** Current skill level */
  level: SkillLevel;
  /** Target skill level */
  targetLevel: SkillLevel;
  /** Skill status */
  status: SkillStatus;
  /** Progress percentage (0-100) */
  progress: number;
  /** Required skills */
  prerequisites: string[];
  /** Associated learning paths */
  learningPaths: string[];
  /** Assessment criteria */
  assessmentCriteria: AssessmentCriterion[];
  /** Resources for learning */
  resources: SkillResource[];
  /** Badges earned */
  badges: string[];
  /** Created timestamp */
  createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Assessment criterion interface
 * @interface AssessmentCriterion
 */
export interface AssessmentCriterion {
  /** Unique criterion identifier */
  id: string;
  /** Criterion description */
  description: string;
  /** Criterion type */
  type: 'practical' | 'theoretical' | 'project' | 'peer-review';
  /** Required score */
  requiredScore: number;
  /** Maximum possible score */
  maxScore: number;
  /** Weight in overall assessment */
  weight: number;
  /** Evidence requirements */
  evidenceRequired: string[];
}

/**
 * Skill resource interface
 * @interface SkillResource
 */
export interface SkillResource {
  /** Unique resource identifier */
  id: string;
  /** Resource title */
  title: string;
  /** Resource description */
  description: string;
  /** Resource type */
  type: 'article' | 'video' | 'course' | 'book' | 'tool' | 'exercise' | 'project';
  /** Resource URL */
  url?: string;
  /** Resource content */
  content?: string;
  /** Estimated time to complete (minutes) */
  estimatedTime: number;
  /** Difficulty level */
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  /** Resource tags */
  tags: string[];
  /** Resource rating */
  rating: number;
  /** Number of reviews */
  reviewCount: number;
}

/**
 * User skill interface
 * @interface UserSkill
 */
export interface UserSkill {
  /** Unique user skill identifier */
  id: string;
  /** User identifier */
  userId: number;
  /** Skill identifier */
  skillId: string;
  /** Current skill level */
  currentLevel: SkillLevel;
  /** Target skill level */
  targetLevel: SkillLevel;
  /** Progress percentage */
  progress: number;
  /** Skill status */
  status: SkillStatus;
  /** Time spent learning (minutes) */
  timeSpent: number;
  /** Assessment scores */
  assessmentScores: AssessmentScore[];
  /** Completed resources */
  completedResources: string[];
  /** Earned badges */
  earnedBadges: string[];
  /** Notes and reflections */
  notes: string;
  /** Started timestamp */
  startedAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
  /** Completed timestamp */
  completedAt?: Date;
}

/**
 * Assessment score interface
 * @interface AssessmentScore
 */
export interface AssessmentScore {
  /** Unique score identifier */
  id: string;
  /** Criterion identifier */
  criterionId: string;
  /** Score achieved */
  score: number;
  /** Maximum possible score */
  maxScore: number;
  /** Assessment date */
  assessedAt: Date;
  /** Assessor identifier (if peer review) */
  assessorId?: number;
  /** Feedback provided */
  feedback?: string;
  /** Evidence submitted */
  evidence: string[];
}

/**
 * Learning path interface
 * @interface LearningPath
 */
export interface LearningPath {
  /** Unique path identifier */
  id: string;
  /** Path name */
  name: string;
  /** Path description */
  description: string;
  /** Target skill category */
  targetCategory: SkillCategory;
  /** Target skill level */
  targetLevel: SkillLevel;
  /** Estimated duration (days) */
  estimatedDuration: number;
  /** Path difficulty */
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  /** Path modules */
  modules: LearningModule[];
  /** Prerequisites */
  prerequisites: string[];
  /** Learning objectives */
  objectives: string[];
  /** Success metrics */
  successMetrics: string[];
  /** Created timestamp */
  createdAt: Date;
}

/**
 * Learning module interface
 * @interface LearningModule
 */
export interface LearningModule {
  /** Unique module identifier */
  id: string;
  /** Module name */
  name: string;
  /** Module description */
  description: string;
  /** Module order in path */
  order: number;
  /** Module resources */
  resources: string[];
  /** Module assessments */
  assessments: string[];
  /** Estimated duration (hours) */
  estimatedDuration: number;
  /** Module prerequisites */
  prerequisites: string[];
  /** Learning objectives */
  objectives: string[];
  /** Completion criteria */
  completionCriteria: string[];
}

/**
 * Badge interface
 * @interface Badge
 */
export interface Badge {
  /** Unique badge identifier */
  id: string;
  /** Badge name */
  name: string;
  /** Badge description */
  description: string;
  /** Badge category */
  category: SkillCategory;
  /** Badge level */
  level: SkillLevel;
  /** Badge icon */
  icon: string;
  /** Badge color */
  color: string;
  /** Badge requirements */
  requirements: BadgeRequirement[];
  /** Badge rarity */
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  /** Points awarded */
  points: number;
  /** Created timestamp */
  createdAt: Date;
}

/**
 * Badge requirement interface
 * @interface BadgeRequirement
 */
export interface BadgeRequirement {
  /** Requirement type */
  type: 'skill-level' | 'skill-progress' | 'assessment-score' | 'time-spent' | 'projects-completed';
  /** Requirement description */
  description: string;
  /** Required value */
  requiredValue: any;
  /** Skill identifier (if applicable) */
  skillId?: string;
}

/**
 * Skills analytics interface
 * @interface SkillsAnalytics
 */
export interface SkillsAnalytics {
  /** User identifier */
  userId: number;
  /** Total skills */
  totalSkills: number;
  /** Completed skills */
  completedSkills: number;
  /** In-progress skills */
  inProgressSkills: number;
  /** Average progress */
  averageProgress: number;
  /** Skill distribution by category */
  categoryDistribution: Record<SkillCategory, number>;
  /** Skill distribution by level */
  levelDistribution: Record<SkillLevel, number>;
  /** Time spent learning (hours) */
  timeSpentLearning: number;
  /** Badges earned */
  badgesEarned: number;
  /** Learning streak (days) */
  learningStreak: number;
  /** Last activity date */
  lastActivityDate: Date;
  /** Progress over time */
  progressHistory: ProgressPoint[];
  /** Recommendations */
  recommendations: SkillRecommendation[];
}

/**
 * Progress point interface
 * @interface ProgressPoint
 */
export interface ProgressPoint {
  /** Timestamp */
  timestamp: Date;
  /** Total progress percentage */
  totalProgress: number;
  /** Skills completed */
  skillsCompleted: number;
  /** Time spent (hours) */
  timeSpent: number;
  /** Badges earned */
  badgesEarned: number;
}

/**
 * Skill recommendation interface
 * @interface SkillRecommendation
 */
export interface SkillRecommendation {
  /** Skill identifier */
  skillId: string;
  /** Recommendation type */
  type: 'next-skill' | 'prerequisite' | 'related' | 'improvement';
  /** Recommendation reason */
  reason: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Priority level */
  priority: 'low' | 'medium' | 'high';
  /** Estimated time to complete */
  estimatedTime: number;
  /** Benefits of completing */
  benefits: string[];
}

/**
 * Skills assessment interface
 * @interface SkillsAssessment
 */
export interface SkillsAssessment {
  /** Unique assessment identifier */
  id: string;
  /** User identifier */
  userId: number;
  /** Skill identifier */
  skillId: string;
  /** Assessment type */
  type: 'self-assessment' | 'peer-review' | 'automated' | 'project';
  /** Overall score */
  overallScore: number;
  /** Maximum possible score */
  maxScore: number;
  /** Assessment results */
  results: AssessmentResult[];
  /** Assessment status */
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  /** Assessor identifier (if applicable) */
  assessorId?: number;
  /** Assessment feedback */
  feedback?: string;
  /** Next steps */
  nextSteps: string[];
  /** Created timestamp */
  createdAt: Date;
  /** Completed timestamp */
  completedAt?: Date;
}

/**
 * Assessment result interface
 * @interface AssessmentResult
 */
export interface AssessmentResult {
  /** Criterion identifier */
  criterionId: string;
  /** Score achieved */
  score: number;
  /** Maximum possible score */
  maxScore: number;
  /** Performance level */
  performance: 'excellent' | 'good' | 'satisfactory' | 'needs-improvement';
  /** Feedback */
  feedback: string;
  /** Evidence submitted */
  evidence: string[];
}
```

### 2. src/lib/skills/skills-service.ts
```typescript
/**
 * Skills Service
 * 
 * Comprehensive skills tracking and management service
 */

import type {
  Skill,
  UserSkill,
  SkillsAnalytics,
  LearningPath,
  Badge,
  SkillsAssessment,
  SkillRecommendation,
  SkillCategory,
  SkillLevel,
  SkillStatus
} from './types';

/**
 * Skills Service Class
 * 
 * Manages all aspects of the skills framework including tracking,
 * assessment, learning paths, and analytics
 */
export class SkillsService {
  /**
   * Get all available skills
   */
  async getAllSkills(): Promise<Skill[]> {
    // In a real implementation, this would query the database
    return this.getMockSkills();
  }

  /**
   * Get skills by category
   */
  async getSkillsByCategory(category: SkillCategory): Promise<Skill[]> {
    const allSkills = await this.getAllSkills();
    return allSkills.filter(skill => skill.category === category);
  }

  /**
   * Get skill by ID
   */
  async getSkillById(id: string): Promise<Skill | null> {
    const allSkills = await this.getAllSkills();
    return allSkills.find(skill => skill.id === id) || null;
  }

  /**
   * Get user skills
   */
  async getUserSkills(userId: number): Promise<UserSkill[]> {
    // In a real implementation, this would query the database
    return this.getMockUserSkills(userId);
  }

  /**
   * Update user skill progress
   */
  async updateUserSkill(
    userId: number,
    skillId: string,
    updates: Partial<UserSkill>
  ): Promise<UserSkill> {
    const userSkills = await this.getUserSkills(userId);
    const existingSkill = userSkills.find(us => us.skillId === skillId);
    
    if (!existingSkill) {
      throw new Error('User skill not found');
    }

    const updatedSkill: UserSkill = {
      ...existingSkill,
      ...updates,
      updatedAt: new Date()
    };

    // In a real implementation, this would update the database
    console.log(`Updated user skill ${skillId} for user ${userId}`);
    
    return updatedSkill;
  }

  /**
   * Start learning a skill
   */
  async startSkill(userId: number, skillId: string): Promise<UserSkill> {
    const skill = await this.getSkillById(skillId);
    if (!skill) {
      throw new Error('Skill not found');
    }

    const userSkills = await this.getUserSkills(userId);
    const existingUserSkill = userSkills.find(us => us.skillId === skillId);

    if (existingUserSkill) {
      return existingUserSkill;
    }

    const newUserSkill: UserSkill = {
      id: `user-skill-${userId}-${skillId}`,
      userId,
      skillId,
      currentLevel: 'beginner',
      targetLevel: skill.targetLevel,
      progress: 0,
      status: 'in-progress',
      timeSpent: 0,
      assessmentScores: [],
      completedResources: [],
      earnedBadges: [],
      notes: '',
      startedAt: new Date(),
      updatedAt: new Date()
    };

    // In a real implementation, this would insert into the database
    console.log(`Started skill ${skillId} for user ${userId}`);
    
    return newUserSkill;
  }

  /**
   * Complete a skill
   */
  async completeSkill(userId: number, skillId: string): Promise<UserSkill> {
    const userSkill = await this.updateUserSkill(userId, skillId, {
      status: 'completed',
      progress: 100,
      completedAt: new Date()
    });

    // Check for badge eligibility
    await this.checkBadgeEligibility(userId, skillId);

    return userSkill;
  }

  /**
   * Get skills analytics
   */
  async getSkillsAnalytics(userId: number): Promise<SkillsAnalytics> {
    const userSkills = await this.getUserSkills(userId);
    const allSkills = await this.getAllSkills();

    const totalSkills = userSkills.length;
    const completedSkills = userSkills.filter(us => us.status === 'completed').length;
    const inProgressSkills = userSkills.filter(us => us.status === 'in-progress').length;
    const averageProgress = userSkills.reduce((sum, us) => sum + us.progress, 0) / totalSkills || 0;

    // Calculate category distribution
    const categoryDistribution: Record<SkillCategory, number> = {
      technical: 0,
      'bridge-game': 0,
      analytical: 0,
      strategic: 0,
      communication: 0,
      leadership: 0,
      'problem-solving': 0,
      creativity: 0
    };

    userSkills.forEach(us => {
      const skill = allSkills.find(s => s.id === us.skillId);
      if (skill) {
        categoryDistribution[skill.category]++;
      }
    });

    // Calculate level distribution
    const levelDistribution: Record<SkillLevel, number> = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      expert: 0,
      master: 0
    };

    userSkills.forEach(us => {
      levelDistribution[us.currentLevel]++;
    });

    const timeSpentLearning = userSkills.reduce((sum, us) => sum + us.timeSpent, 0) / 60; // Convert to hours

    return {
      userId,
      totalSkills,
      completedSkills,
      inProgressSkills,
      averageProgress,
      categoryDistribution,
      levelDistribution,
      timeSpentLearning,
      badgesEarned: userSkills.reduce((sum, us) => sum + us.earnedBadges.length, 0),
      learningStreak: this.calculateLearningStreak(userSkills),
      lastActivityDate: this.getLastActivityDate(userSkills),
      progressHistory: await this.getProgressHistory(userId),
      recommendations: await this.generateRecommendations(userId)
    };
  }

  /**
   * Get learning paths
   */
  async getLearningPaths(): Promise<LearningPath[]> {
    return this.getMockLearningPaths();
  }

  /**
   * Get learning path by ID
   */
  async getLearningPathById(id: string): Promise<LearningPath | null> {
    const paths = await this.getLearningPaths();
    return paths.find(path => path.id === id) || null;
  }

  /**
   * Get recommended learning paths for user
   */
  async getRecommendedLearningPaths(userId: number): Promise<LearningPath[]> {
    const userSkills = await this.getUserSkills(userId);
    const allPaths = await this.getLearningPaths();

    // Filter paths based on user's current skills and goals
    return allPaths.filter(path => {
      return path.prerequisites.every(prereq => 
        userSkills.some(us => us.skillId === prereq && us.status === 'completed')
      );
    });
  }

  /**
   * Get badges
   */
  async getBadges(): Promise<Badge[]> {
    return this.getMockBadges();
  }

  /**
   * Get user badges
   */
  async getUserBadges(userId: number): Promise<Badge[]> {
    const userSkills = await this.getUserSkills(userId);
    const allBadges = await getBadges();
    
    const userBadgeIds = userSkills.reduce((set, us) => {
      us.earnedBadges.forEach(badgeId => set.add(badgeId));
      return set;
    }, new Set<string>());

    return allBadges.filter(badge => userBadgeIds.has(badge.id));
  }

  /**
   * Create skills assessment
   */
  async createAssessment(
    userId: number,
    skillId: string,
    type: SkillsAssessment['type']
  ): Promise<SkillsAssessment> {
    const skill = await this.getSkillById(skillId);
    if (!skill) {
      throw new Error('Skill not found');
    }

    const assessment: SkillsAssessment = {
      id: `assessment-${userId}-${skillId}-${Date.now()}`,
      userId,
      skillId,
      type,
      overallScore: 0,
      maxScore: skill.assessmentCriteria.reduce((sum, criterion) => sum + criterion.maxScore, 0),
      results: [],
      status: 'pending',
      nextSteps: [],
      createdAt: new Date()
    };

    // In a real implementation, this would insert into the database
    console.log(`Created assessment for user ${userId}, skill ${skillId}`);
    
    return assessment;
  }

  /**
   * Submit assessment
   */
  async submitAssessment(
    assessmentId: string,
    results: SkillsAssessment['results']
  ): Promise<SkillsAssessment> {
    // Calculate overall score
    const overallScore = results.reduce((sum, result) => sum + result.score, 0);
    const maxScore = results.reduce((sum, result) => sum + result.maxScore, 0);

    const assessment: SkillsAssessment = {
      id: assessmentId,
      userId: 0, // Would be fetched from database
      skillId: '', // Would be fetched from database
      type: 'self-assessment',
      overallScore,
      maxScore,
      results,
      status: overallScore >= maxScore * 0.7 ? 'completed' : 'failed',
      nextSteps: this.generateNextSteps(results),
      createdAt: new Date(),
      completedAt: new Date()
    };

    // Update user skill progress based on assessment
    await this.updateSkillProgressFromAssessment(assessment);

    return assessment;
  }

  /**
   * Generate skill recommendations
   */
  async generateRecommendations(userId: number): Promise<SkillRecommendation[]> {
    const userSkills = await this.getUserSkills(userId);
    const allSkills = await this.getAllSkills();
    
    const recommendations: SkillRecommendation[] = [];

    // Recommend next skills in categories user is working on
    const userCategories = new Set<SkillCategory>();
    userSkills.forEach(us => {
      const skill = allSkills.find(s => s.id === us.skillId);
      if (skill) {
        userCategories.add(skill.category);
      }
    });

    userCategories.forEach(category => {
      const categorySkills = allSkills.filter(s => s.category === category);
      const userSkillIds = userSkills.map(us => us.skillId);
      
      const unlearnedSkills = categorySkills.filter(s => !userSkillIds.includes(s.id));
      
      unlearnedSkills.forEach(skill => {
        recommendations.push({
          skillId: skill.id,
          type: 'next-skill',
          reason: `Continue learning in ${category}`,
          confidence: 0.8,
          priority: 'medium',
          estimatedTime: skill.resources.reduce((sum, r) => sum + r.estimatedTime, 0),
          benefits: [
            `Expand your ${category} knowledge`,
            `Build on existing skills`,
            `Unlock new opportunities`
          ]
        });
      });
    });

    // Recommend prerequisite skills
    userSkills.forEach(us => {
      if (us.status === 'in-progress') {
        const skill = allSkills.find(s => s.id === us.skillId);
        if (skill) {
          skill.prerequisites.forEach(prereqId => {
            const hasPrereq = userSkills.some(us => us.skillId === prereqId && us.status === 'completed');
            if (!hasPrereq) {
              recommendations.push({
                skillId: prereqId,
                type: 'prerequisite',
                reason: `Required for ${skill.name}`,
                confidence: 0.9,
                priority: 'high',
                estimatedTime: 0, // Would be calculated
                benefits: [
                  'Unlock current skill',
                  'Build foundational knowledge',
                  'Ensure success in learning path'
                ]
              });
            }
          });
        }
      }
    });

    return recommendations.sort((a, b) => {
      // Sort by priority first, then by confidence
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.confidence - a.confidence;
    });
  }

  /**
   * Private helper methods
   */
  private calculateLearningStreak(userSkills: UserSkill[]): number {
    // Simplified streak calculation
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const recentActivity = userSkills.some(us => 
      us.updatedAt >= yesterday
    );

    return recentActivity ? 1 : 0;
  }

  private getLastActivityDate(userSkills: UserSkill[]): Date {
    if (userSkills.length === 0) return new Date();
    
    return userSkills.reduce((latest, us) => 
      us.updatedAt > latest ? us.updatedAt : latest,
      userSkills[0].updatedAt
    );
  }

  private async getProgressHistory(userId: number): Promise<any[]> {
    // In a real implementation, this would query historical data
    return [];
  }

  private generateNextSteps(results: SkillsAssessment['results']): string[] {
    const nextSteps: string[] = [];
    
    results.forEach(result => {
      if (result.performance === 'needs-improvement') {
        nextSteps.push(`Improve performance on: ${result.criterionId}`);
      }
    });

    if (nextSteps.length === 0) {
      nextSteps.push('Continue to next skill level');
      nextSteps.push('Apply skills in practical projects');
    }

    return nextSteps;
  }

  private async updateSkillProgressFromAssessment(assessment: SkillsAssessment): Promise<void> {
    // Update user skill progress based on assessment results
    const progressPercentage = (assessment.overallScore / assessment.maxScore) * 100;
    
    await this.updateUserSkill(assessment.userId, assessment.skillId, {
      progress: Math.min(100, progressPercentage),
      assessmentScores: [{
        id: `score-${Date.now()}`,
        criterionId: 'overall',
        score: assessment.overallScore,
        maxScore: assessment.maxScore,
        assessedAt: new Date(),
        evidence: []
      }]
    });
  }

  private async checkBadgeEligibility(userId: number, skillId: string): Promise<void> {
    const userSkills = await this.getUserSkills(userId);
    const allBadges = await this.getBadges();
    
    allBadges.forEach(badge => {
      if (this.isBadgeEligible(userSkills, badge)) {
        // Award badge to user
        console.log(`Awarded badge ${badge.id} to user ${userId}`);
      }
    });
  }

  private isBadgeEligible(userSkills: UserSkill[], badge: Badge): boolean {
    return badge.requirements.every(req => {
      switch (req.type) {
        case 'skill-level':
          return userSkills.some(us => 
            us.skillId === req.skillId && us.currentLevel === req.requiredValue
          );
        case 'skill-progress':
          return userSkills.some(us => 
            us.skillId === req.skillId && us.progress >= req.requiredValue
          );
        default:
          return false;
      }
    });
  }

  // Mock data methods (in real implementation, these would query the database)
  private getMockSkills(): Skill[] {
    return [
      {
        id: 'bridge-basics',
        name: 'Bridge Fundamentals',
        description: 'Learn the basic rules and concepts of Bridge',
        category: 'bridge-game',
        level: 'beginner',
        targetLevel: 'intermediate',
        status: 'not-started',
        progress: 0,
        prerequisites: [],
        learningPaths: ['bridge-beginner-path'],
        assessmentCriteria: [
          {
            id: 'rules-knowledge',
            description: 'Demonstrate knowledge of Bridge rules',
            type: 'theoretical',
            requiredScore: 80,
            maxScore: 100,
            weight: 0.4,
            evidenceRequired: ['quiz-results', 'written-explanation']
          },
          {
            id: 'basic-play',
            description: 'Demonstrate basic playing ability',
            type: 'practical',
            requiredScore: 70,
            maxScore: 100,
            weight: 0.6,
            evidenceRequired: ['game-recordings', 'peer-review']
          }
        ],
        resources: [
          {
            id: 'bridge-rules-video',
            title: 'Bridge Rules Explained',
            description: 'Comprehensive video guide to Bridge rules',
            type: 'video',
            url: 'https://example.com/bridge-rules',
            estimatedTime: 45,
            difficulty: 'beginner',
            tags: ['rules', 'basics'],
            rating: 4.8,
            reviewCount: 156
          }
        ],
        badges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private getMockUserSkills(userId: number): UserSkill[] {
    return [
      {
        id: `user-skill-${userId}-bridge-basics`,
        userId,
        skillId: 'bridge-basics',
        currentLevel: 'beginner',
        targetLevel: 'intermediate',
        progress: 25,
        status: 'in-progress',
        timeSpent: 120,
        assessmentScores: [],
        completedResources: [],
        earnedBadges: [],
        notes: 'Making good progress on basic concepts',
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];
  }

  private getMockLearningPaths(): LearningPath[] {
    return [
      {
        id: 'bridge-beginner-path',
        name: 'Bridge Beginner Path',
        description: 'Complete learning path for Bridge beginners',
        targetCategory: 'bridge-game',
        targetLevel: 'intermediate',
        estimatedDuration: 30,
        difficulty: 'beginner',
        modules: [
          {
            id: 'module-1',
            name: 'Basic Rules',
            description: 'Learn the fundamental rules of Bridge',
            order: 1,
            resources: ['bridge-rules-video'],
            assessments: ['bridge-rules-quiz'],
            estimatedDuration: 2,
            prerequisites: [],
            objectives: ['Understand basic rules', 'Learn card values'],
            completionCriteria: ['Complete quiz with 80% score']
          }
        ],
        prerequisites: [],
        objectives: ['Master Bridge basics', 'Play basic games'],
        successMetrics: ['Quiz scores', 'Game performance'],
        createdAt: new Date()
      }
    ];
  }

  private getMockBadges(): Badge[] {
    return [
      {
        id: 'bridge-novice',
        name: 'Bridge Novice',
        description: 'Complete your first Bridge lesson',
        category: 'bridge-game',
        level: 'beginner',
        icon: 'card-club',
        color: '#3B82F6',
        requirements: [
          {
            type: 'skill-progress',
            description: 'Complete Bridge Fundamentals skill',
            requiredValue: 100,
            skillId: 'bridge-basics'
          }
        ],
        rarity: 'common',
        points: 10,
        createdAt: new Date()
      }
    ];
  }
}
```

### 3. src/lib/components/skills/SkillsDashboard.svelte
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import type { SkillsAnalytics, UserSkill, Badge, LearningPath } from '$lib/skills/types';
  import { SkillsService } from '$lib/skills/services/skills-service';

  export let userId: number;

  let analytics: SkillsAnalytics | null = null;
  let userSkills: UserSkill[] = [];
  let userBadges: Badge[] = [];
  let recommendedPaths: LearningPath[] = [];
  let loading = true;
  let error: string | null = null;

  const skillsService = new SkillsService();

  onMount(async () => {
    try {
      await loadData();
    } catch (err) {
      error = 'Failed to load skills data';
      console.error(err);
    } finally {
      loading = false;
    }
  });

  async function loadData() {
    const [analyticsData, skillsData, badgesData, pathsData] = await Promise.all([
      skillsService.getSkillsAnalytics(userId),
      skillsService.getUserSkills(userId),
      skillsService.getUserBadges(userId),
      skillsService.getRecommendedLearningPaths(userId)
    ]);

    analytics = analyticsData;
    userSkills = skillsData;
    userBadges = badgesData;
    recommendedPaths = pathsData;
  }

  function getProgressColor(progress: number): string {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  function getLevelColor(level: string): string {
    const colors = {
      beginner: 'text-gray-500',
      intermediate: 'text-blue-500',
      advanced: 'text-purple-500',
      expert: 'text-orange-500',
      master: 'text-red-500'
    };
    return colors[level as keyof typeof colors] || 'text-gray-500';
  }
</script>

<div class="skills-dashboard">
  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{error}</p>
    </div>
  {:else if analytics}
    <!-- Overview Section -->
    <section class="mb-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Skills Overview</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-3xl font-bold text-blue-600">{analytics.totalSkills}</div>
          <div class="text-gray-600">Total Skills</div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-3xl font-bold text-green-600">{analytics.completedSkills}</div>
          <div class="text-gray-600">Completed</div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-3xl font-bold text-yellow-600">{analytics.inProgressSkills}</div>
          <div class="text-gray-600">In Progress</div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-3xl font-bold text-purple-600">{Math.round(analytics.averageProgress)}%</div>
          <div class="text-gray-600">Average Progress</div>
        </div>
      </div>

      <!-- Learning Streak -->
      <div class="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg p-6 text-white mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold">Learning Streak</h3>
            <p class="text-orange-100">Keep up the great work!</p>
          </div>
          <div class="text-4xl font-bold">{analytics.learningStreak} days</div>
        </div>
      </div>
    </section>

    <!-- Current Skills Section -->
    <section class="mb-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Current Skills</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each userSkills as userSkill}
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-bold text-lg mb-2">{userSkill.skillId}</h3>
            
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{userSkill.progress}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="{getProgressColor(userSkill.progress)} h-2 rounded-full transition-all duration-300"
                  style="width: {userSkill.progress}%"
                ></div>
              </div>
            </div>
            
            <div class="flex justify-between items-center text-sm">
              <span class="{getLevelColor(userSkill.currentLevel)}">
                {userSkill.currentLevel}
              </span>
              <span class="text-gray-500">
                {Math.round(userSkill.timeSpent / 60)}h spent
              </span>
            </div>
            
            <div class="mt-4">
              <span class="inline-block px-2 py-1 text-xs rounded-full 
                {userSkill.status === 'completed' ? 'bg-green-100 text-green-800' : 
                 userSkill.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                 'bg-gray-100 text-gray-800'}">
                {userSkill.status}
              </span>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Badges Section -->
    <section class="mb-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Badges Earned</h2>
      
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {#each userBadges as badge}
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center"
                 style="background-color: {badge.color}">
              <span class="text-2xl">{badge.icon}</span>
            </div>
            <div class="text-sm font-medium">{badge.name}</div>
            <div class="text-xs text-gray-500">{badge.points} pts</div>
          </div>
        {/each}
      </div>
      
      {#if userBadges.length === 0}
        <div class="text-center text-gray-500 py-8">
          <p>No badges earned yet. Keep learning to unlock achievements!</p>
        </div>
      {/if}
    </section>

    <!-- Learning Paths Section -->
    <section>
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Recommended Learning Paths</h2>
      
      <div class="space-y-4">
        {#each recommendedPaths as path}
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-bold text-lg mb-2">{path.name}</h3>
            <p class="text-gray-600 mb-4">{path.description}</p>
            
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500">
                {path.estimatedDuration} days
              </span>
              <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {path.difficulty}
              </span>
            </div>
            
            <button class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              Start Path
            </button>
          </div>
        {/each}
      </div>
      
      {#if recommendedPaths.length === 0}
        <div class="text-center text-gray-500 py-8">
          <p>No recommended paths available. Complete current skills to unlock new paths!</p>
        </div>
      {/if}
    </section>
  {/if}
</div>

<style>
  .skills-dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
</style>
```

### 4. src/lib/components/skills/SkillAssessment.svelte
```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { SkillsAssessment, AssessmentResult } from '$lib/skills/types';

  export let assessment: SkillsAssessment;
  export let onSubmit: (results: AssessmentResult[]) => void;

  let currentResults: AssessmentResult[] = [];
  let isSubmitting = false;
  let error: string | null = null;

  const dispatch = createEventDispatcher();

  function updateResult(criterionId: string, score: number, feedback: string) {
    const existingIndex = currentResults.findIndex(r => r.criterionId === criterionId);
    
    if (existingIndex >= 0) {
      currentResults[existingIndex] = {
        ...currentResults[existingIndex],
        score,
        feedback,
        performance: getPerformanceLevel(score, currentResults[existingIndex].maxScore)
      };
    } else {
      currentResults.push({
        criterionId,
        score,
        maxScore: 100, // Would come from the criterion
        performance: getPerformanceLevel(score, 100),
        feedback,
        evidence: []
      });
    }
  }

  function getPerformanceLevel(score: number, maxScore: number): AssessmentResult['performance'] {
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 90) return 'excellent';
    if (percentage >= 75) return 'good';
    if (percentage >= 60) return 'satisfactory';
    return 'needs-improvement';
  }

  async function handleSubmit() {
    if (currentResults.length === 0) {
      error = 'Please complete all assessment criteria';
      return;
    }

    isSubmitting = true;
    error = null;

    try {
      await onSubmit(currentResults);
      dispatch('assessment-submitted', { assessmentId: assessment.id });
    } catch (err) {
      error = 'Failed to submit assessment';
      console.error(err);
    } finally {
      isSubmitting = false;
    }
  }

  function getScoreColor(score: number, maxScore: number): string {
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }
</script>

<div class="skill-assessment">
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Skills Assessment</h2>
    
    {#if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{error}</p>
      </div>
    {/if}

    <div class="space-y-6">
      {#each assessment.assessmentCriteria as criterion}
        <div class="border rounded-lg p-4">
          <h3 class="font-semibold text-lg mb-2">{criterion.description}</h3>
          
          <div class="text-sm text-gray-600 mb-4">
            <p>Type: {criterion.type}</p>
            <p>Required Score: {criterion.requiredScore}/{criterion.maxScore}</p>
            <p>Weight: {criterion.weight * 100}%</p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Score (0-{criterion.maxScore})
              </label>
              <input
                type="number"
                min="0"
                max={criterion.maxScore}
                class="w-full border rounded-lg px-3 py-2"
                placeholder="Enter your score"
                on:input={(e) => updateResult(criterion.id, parseInt(e.target.value), '')}
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Feedback
              </label>
              <textarea
                class="w-full border rounded-lg px-3 py-2"
                rows="3"
                placeholder="Provide feedback on your performance..."
                on:input={(e) => {
                  const result = currentResults.find(r => r.criterionId === criterion.id);
                  if (result) {
                    updateResult(criterion.id, result.score, e.target.value);
                  }
                }}
              ></textarea>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <div class="mt-8 flex justify-between items-center">
      <div class="text-sm text-gray-600">
        <p>Total Score: {currentResults.reduce((sum, r) => sum + r.score, 0)}/{assessment.maxScore}</p>
        <p>Criteria Completed: {currentResults.length}/{assessment.assessmentCriteria.length}</p>
      </div>

      <button
        class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        on:click={handleSubmit}
        disabled={isSubmitting || currentResults.length === 0}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
      </button>
    </div>
  </div>
</div>

<style>
  .skill-assessment {
    max-width: 800px;
    margin: 0 auto;
  }
</style>
```

## Installation Instructions

1. Create directories:
```bash
mkdir -p src/lib/skills
mkdir -p src/lib/components/skills
mkdir -p src/lib/skills/services
```

2. Copy the files above to their respective locations

3. The skills framework is now ready to use with:
- Comprehensive skill tracking
- Assessment system
- Learning paths
- Badge system
- Analytics and recommendations

## Usage

### Skills Dashboard
```svelte
<script>
  import SkillsDashboard from '$lib/components/skills/SkillsDashboard.svelte';
</script>

<SkillsDashboard userId={currentUserId} />
```

### Skills Assessment
```svelte
<script>
  import SkillAssessment from '$lib/components/skills/SkillAssessment.svelte';
</script>

<SkillAssessment 
  assessment={currentAssessment}
  onSubmit={handleAssessmentSubmit}
/>
```