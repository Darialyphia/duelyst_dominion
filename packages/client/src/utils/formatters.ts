export const formatAbilityText = (a: {
  manaCost: number;
  description: string;
}) => `<rt-keyword>Ability ${a.manaCost}</rt-keyword> ${a.description}`;
