<script setup lang="ts">
import {
  PopoverTrigger,
  PopoverRoot,
  PopoverContent,
  ComboboxRoot,
  ComboboxAnchor,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxContent,
  ComboboxViewport,
  ComboboxItem,
  ComboboxEmpty
} from 'reka-ui';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import { Icon } from '@iconify/vue';
import { RUNES, type Rune } from '@game/engine/src/card/card.enums';
import { ref } from 'vue';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import {
  useGameState,
  useGameUi,
  usePlayer1,
  useUnits
} from '../composables/useGameClient';
import { isDefined, type Point } from '@game/shared';
import UiSwitch from '@/ui/components/UiSwitch.vue';

const { players } = defineProps<{
  players: Array<{ id: string }>;
  history: SerializedInput[];
}>();

const emit = defineEmits<{
  rewindOneStep: [];
  rewindTo: [index: number];
  restart: [];
  refillMana: [];
  addRune: [rune: Rune];
  addToHand: [cardId: string];
  setMaxMana: [amount: number];
  move: [unitId: string, pos: Point];
  activateUnit: [unitId: string];
  destroyUnit: [unitId: string, silent: boolean];
}>();

const state = useGameState();
const ui = useGameUi();

const isSandboxPopoverOpened = ref(false);
const card = ref<string | null>(null);
const unit = ref<string | null>(null);
const position = ref({ x: 0, y: 0 });
watch(
  () => ui.value.selectedUnit,
  selected => {
    if (selected) {
      unit.value = selected.id;
      position.value = { x: selected.x, y: selected.y };
    }
  }
);
const playerId = defineModel<string>('playerId', { required: true });
const autoSwitchPlayer = defineModel<boolean>('autoSwitch', {
  required: true
});

const allCards = Object.values(CARDS_DICTIONARY).sort((a, b) =>
  a.name.localeCompare(b.name)
);
const units = useUnits();

const maxMana = ref<number>();

const p1 = usePlayer1();
const shouldTriggerDyingWish = ref(false);
</script>

<template>
  <PopoverRoot v-model:open="isSandboxPopoverOpened">
    <PopoverTrigger class="sandbox-trigger">Sandbox Tools</PopoverTrigger>

    <PopoverContent as-child>
      <div class="sandbox-content fancy-scrollbar" @keyup.stop>
        <!-- Player Controls Section -->
        <section class="section">
          <h3 class="section-title">Player Controls</h3>
          <div class="button-group">
            <button
              v-for="(player, index) in players"
              :key="player.id"
              class="btn"
              :class="{ p1: player.id === p1.id, p2: player.id !== p1.id }"
              @click="playerId = player.id"
            >
              Switch to Player {{ index + 1 }}
            </button>
          </div>
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="autoSwitchPlayer"
              class="checkbox"
            />
            <span>Auto Switch to Active Player</span>
          </label>
        </section>

        <div class="divider"></div>

        <!-- Game Controls Section -->
        <section class="section">
          <h3 class="section-title">Game Controls</h3>
          <div class="button-group">
            <button @click="emit('restart')" class="btn">Restart Game</button>
            <button @click="emit('rewindOneStep')" class="btn">
              Rewind One Step
            </button>
          </div>
          <h3 class="section-title">Rewind to :</h3>
          <div class="history-list fancy-scrollbar">
            <span v-if="history.length === 0" class="history-item italic">
              No history.
            </span>
            <div
              v-for="(input, index) in history.toReversed()"
              :key="index"
              class="history-item"
              :class="{
                p1: input.payload.playerId === p1.id,
                p2: input.payload.playerId !== p1.id
              }"
              @click="emit('rewindTo', index)"
            >
              {{ input.type }}
            </div>
          </div>
        </section>

        <div class="divider"></div>

        <!-- Mana Controls Section -->
        <section class="section">
          <h3 class="section-title">Mana Controls</h3>
          <div class="input-group">
            <input
              id="max-mana-input"
              type="number"
              min="0"
              step="1"
              placeholder="Max"
              class="number-input"
              v-model.number="maxMana"
            />
            <button
              :disabled="!isDefined(maxMana)"
              @click="emit('setMaxMana', maxMana!)"
              class="btn btn-flex"
            >
              Set Max Mana
            </button>
          </div>
          <button @click="emit('refillMana')" class="btn">Refill Mana</button>
        </section>

        <!-- Runes Section -->
        <template v-if="state.config.FEATURES.RUNES">
          <div class="divider"></div>
          <section class="section">
            <h3 class="section-title">Runes</h3>
            <div class="button-group">
              <button @click="emit('addRune', RUNES.RED)" class="btn">
                Add Power Rune
              </button>
              <button @click="emit('addRune', RUNES.YELLOW)" class="btn">
                Add Vitality Rune
              </button>
              <button @click="emit('addRune', RUNES.BLUE)" class="btn">
                Add Wisdom Rune
              </button>
            </div>
          </section>
        </template>

        <div class="divider"></div>

        <!-- Cards Section -->
        <section class="section">
          <h3 class="section-title">Cards</h3>
          <ComboboxRoot class="relative" v-model="card">
            <ComboboxAnchor class="combobox-anchor">
              <ComboboxInput
                class="combobox-input"
                placeholder="Search cards..."
              />
              <ComboboxTrigger>
                <Icon icon="radix-icons:chevron-down" class="chevron-icon" />
              </ComboboxTrigger>
            </ComboboxAnchor>

            <ComboboxContent class="combobox-content">
              <ComboboxViewport class="combobox-viewport">
                <ComboboxEmpty class="combobox-empty" />

                <ComboboxItem
                  v-for="card in allCards"
                  :key="card.id"
                  :value="card.id"
                  class="combobox-item"
                >
                  {{ card.name }}
                </ComboboxItem>
              </ComboboxViewport>
            </ComboboxContent>
          </ComboboxRoot>
          <button
            :disabled="!card"
            @click="
              () => {
                emit('addToHand', card!);
                card = null;
              }
            "
            class="btn"
          >
            Add to Hand
          </button>
        </section>

        <div class="divider"></div>

        <!-- Unit section-->
        <h3 class="section-title">Units</h3>

        <ComboboxRoot class="relative" v-model="unit">
          <ComboboxAnchor class="combobox-anchor">
            <ComboboxInput
              class="combobox-input"
              placeholder="Search units..."
            />
            <ComboboxTrigger>
              <Icon icon="radix-icons:chevron-down" class="chevron-icon" />
            </ComboboxTrigger>
          </ComboboxAnchor>

          <ComboboxContent class="combobox-content">
            <ComboboxViewport class="combobox-viewport">
              <ComboboxEmpty class="combobox-empty" />

              <ComboboxItem
                v-for="unit in units"
                :key="unit.id"
                :value="unit.id"
                class="combobox-item"
              >
                {{ unit.getCard().name }} ({{ unit.x + 1 }}, {{ unit.y + 1 }})
              </ComboboxItem>
            </ComboboxViewport>
          </ComboboxContent>
        </ComboboxRoot>

        <div class="position-controls">
          <label>X</label>
          <select v-model="position.x" class="position-select">
            <option v-for="i in state.board.columns" :key="i" :value="i - 1">
              {{ i }}
            </option>
          </select>
          <label>Y</label>
          <select v-model="position.y" class="position-select">
            <option v-for="i in state.board.rows" :key="i" :value="i - 1">
              {{ i }}
            </option>
          </select>
          <button
            :disabled="!unit"
            @click="
              () => {
                emit('move', unit!, { x: position.x, y: position.y });
                unit = null;
              }
            "
            class="btn flex-1 text-center"
          >
            Move
          </button>
        </div>

        <button
          :disabled="!unit"
          @click="emit('activateUnit', unit!)"
          class="btn"
        >
          Activate
        </button>

        <div class="flex gap-2 items-center">
          <button
            :disabled="!unit"
            @click="
              () => {
                emit('destroyUnit', unit!, !shouldTriggerDyingWish);
                unit = null;
              }
            "
            class="btn"
          >
            Destroy
          </button>
          <UiSwitch v-model="shouldTriggerDyingWish" />
          <span class="option-title">Trigger dying wish</span>
        </div>
      </div>
    </PopoverContent>
  </PopoverRoot>
</template>

<style lang="postcss" scoped>
.sandbox-trigger {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  background-color: var(--gray-10);
  padding: 0.5rem 1rem;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-radius: 0 0 0.5rem 0;
  font-weight: 500;
  font-size: 0.875rem;
  transition: background-color 150ms;
}

.sandbox-trigger:hover {
  background-color: var(--gray-11);
}

.sandbox-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  background-color: var(--gray-9);
  border-radius: 0.5rem;
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
  width: 20rem;
  max-height: 80vh;
  overflow-y: auto;
}

.p1 {
  color: var(--green-5);
}

.p2 {
  color: var(--red-6);
}

.section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.25rem;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.btn {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background-color: var(--gray-11);
  border-radius: 0.25rem;
  text-align: left;
  transition: background-color 150ms;
}

.btn:hover:not(:disabled) {
  background-color: var(--gray-12);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-flex {
  flex: 1;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 150ms;
}

.checkbox-label:hover {
  background-color: var(--gray-11);
}

.checkbox {
  cursor: pointer;
}

.divider {
  border-top: 1px solid var(--gray-6);
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.number-input {
  width: 5rem;
  padding: 0.5rem;
  font-size: 0.875rem;
  border: 1px solid var(--gray-7);
  border-radius: 0.25rem;
  background-color: var(--gray-9);
}

.number-input:focus {
  outline: none;
  border-color: var(--gray-12);
}

.combobox-anchor {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.25rem;
  border: 1px solid var(--gray-7);
  padding: 0 0.75rem;
  font-size: 0.875rem;
  line-height: 1;
  height: 38px;
  gap: 0.5rem;
  background-color: var(--gray-9);
  outline: none;
}

.combobox-anchor:focus-within {
  box-shadow: 0 0 0 2px var(--gray-12);
}

.combobox-input {
  background-color: transparent !important;
  outline: none;
  height: 100%;
  flex: 1;
}

.combobox-input::placeholder {
  color: var(--gray-9);
}

.chevron-icon {
  height: 1rem;
  width: 1rem;
  color: currentColor;
}

.combobox-content {
  position: absolute;
  z-index: 10;
  width: 100%;
  margin-top: 0.25rem;
  background-color: var(--gray-9);
  border: 1px solid var(--gray-7);
  overflow: auto;
  max-height: 15rem;
  border-radius: 0.25rem;
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.combobox-viewport {
  padding: 0.25rem;
}

.combobox-empty {
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  padding: 0.5rem 0;
  color: var(--gray-11);
}

.combobox-item {
  font-size: 0.875rem;
  line-height: 1;
  padding: 0.5rem 0.75rem;
  position: relative;
  user-select: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.combobox-item:hover {
  background-color: var(--gray-10);
}

.position-controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.position-select {
  padding: 0.25rem 0.5rem;
}

.history-list {
  max-height: 10rem;
  overflow-y: auto;
  background-color: var(--gray-9);
  border-radius: 0.25rem;
  border: 1px solid var(--gray-7);
  padding: 0.5rem;
}

.history-item {
  font-size: 0.875rem;
  padding: 0.375rem 0.5rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 150ms;
}

.history-item:hover {
  background-color: var(--gray-10);
}
</style>
