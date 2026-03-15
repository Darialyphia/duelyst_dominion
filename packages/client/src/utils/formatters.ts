export const formatAbilityText = (a: {
  manaCost: number;
  description: string;
}) => `@Ability (${a.manaCost})@: ${a.description}`;
