/**
 * Configuration presets for behavior strategies.
 * These define weight profiles for different playstyles.
 */

export interface BehaviorWeights {
  lethal: number; // Priority for lethal threats and opportunities
  trade: number; // Priority for favorable trades
  damage: number; // Priority based on raw damage output
  value: number; // Priority based on target value/vulnerability
  mobility: number; // Priority for mobile/positioning threats
  positional: number; // Priority based on board position
}

export class BehaviorConfig {
  /**
   * AGGRESSIVE: Prioritizes offense, less concerned with self-preservation.
   * Good for glass cannon units or when ahead.
   */
  static readonly AGGRESSIVE: BehaviorWeights = {
    lethal: 10.0, // Always prioritize lethal opportunities
    trade: 4.0, // Lower concern for trades
    damage: 8.0, // High value on damage dealers
    value: 6.0, // Target high-value enemies
    mobility: 5.0, // Care about mobile threats
    positional: 2.0 // Less concerned with position
  };

  /**
   * DEFENSIVE: Prioritizes survival and protection.
   * Good for protecting the general or when behind.
   */
  static readonly DEFENSIVE: BehaviorWeights = {
    lethal: 10.0, // Always prioritize lethal opportunities
    trade: 9.0, // Very concerned with favorable trades
    damage: 4.0, // Less focus on raw damage
    value: 3.0, // Less focus on target value
    mobility: 6.0, // Very concerned about mobile threats
    positional: 7.0 // Care about board position
  };

  /**
   * OPPORTUNISTIC: Looks for easy, high-value kills.
   * Good for efficient trading and cleanup.
   */
  static readonly OPPORTUNISTIC: BehaviorWeights = {
    lethal: 10.0, // Always prioritize lethal opportunities
    trade: 7.0, // Good trades are important
    damage: 5.0, // Moderate damage priority
    value: 9.0, // Highly prioritize vulnerable, valuable targets
    mobility: 4.0, // Moderate mobility concern
    positional: 3.0 // Moderate position concern
  };

  /**
   * BALANCED: Default balanced approach.
   * Uses the standard weights from evaluators.
   */
  static readonly BALANCED: BehaviorWeights = {
    lethal: 10.0,
    trade: 6.0,
    damage: 5.0,
    value: 4.0,
    mobility: 3.0,
    positional: 2.0
  };

  /**
   * GENERAL_HUNTER: Focuses on reaching and killing the enemy general.
   * Ignores most other concerns.
   */
  static readonly GENERAL_HUNTER: BehaviorWeights = {
    lethal: 15.0, // Extremely high lethal priority
    trade: 3.0, // Willing to make bad trades to reach general
    damage: 3.0, // Don't care about regular damage
    value: 8.0, // Only if it helps reach general
    mobility: 9.0, // Very important to reach general
    positional: 8.0 // Care about getting closer to general
  };
}
