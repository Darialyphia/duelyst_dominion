<script setup lang="ts">
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import Card from './Card.vue';
import sprites from 'virtual:sprites';

const { blueprint } = defineProps<{ blueprint: CardBlueprint }>();
const sprite = computed(() => {
  return sprites[blueprint.sprite.id];
});
</script>

<template>
  <Card
    v-if="sprite"
    :card="{
      id: blueprint.id,
      name: blueprint.name,
      description: blueprint.description,
      kind: blueprint.kind,
      manaCost: (blueprint as any).manaCost,
      runeCost: (blueprint as any).runeCost,
      rarity: (blueprint as any).rarity,
      atk:
        (blueprint as any).atk ??
        (blueprint as any).damage ??
        (blueprint as any).atkBonus,
      hp: (blueprint as any).maxHp,
      durability: (blueprint as any).durability,
      cmd: (blueprint as any).cmd,
      faction: blueprint.faction
    }"
    :sprite="sprite"
  />
  <div v-else>
    Missing sprite for card: {{ blueprint.name }} ({{ blueprint.id }})
  </div>
</template>

<style scoped lang="postcss"></style>
