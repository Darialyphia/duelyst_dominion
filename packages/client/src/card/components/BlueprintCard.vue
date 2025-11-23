<script setup lang="ts">
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import Card from './Card.vue';

const { blueprint } = defineProps<{ blueprint: CardBlueprint }>();
</script>

<template>
  <Card
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
    :sprite="blueprint.sprite"
  />
</template>

<style scoped lang="postcss"></style>
