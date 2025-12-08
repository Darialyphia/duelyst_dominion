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
  useUnits
} from '../composables/useGameClient';
import { isDefined, type Point } from '@game/shared';

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
</script>

<template>
  <PopoverRoot v-model:open="isSandboxPopoverOpened">
    <PopoverTrigger
      class="fixed top-3 left-3 bg-gray-10 px-4 py-2 shadow-md rounded-br-lg font-medium text-sm hover:bg-gray-11 transition-colors"
    >
      Sandbox Tools
    </PopoverTrigger>

    <PopoverContent
      class="flex flex-col gap-4 p-5 bg-gray-9 rounded-lg shadow-lg w-80 max-h-[80vh] overflow-y-auto"
      @keyup.stop
    >
      <!-- Player Controls Section -->
      <section class="flex flex-col gap-2">
        <h3 class="text-xs font-semibold uppercase tracking-wide mb-1">
          Player Controls
        </h3>
        <div class="flex flex-col gap-1.5">
          <button
            v-for="(player, index) in players"
            :key="player.id"
            @click="playerId = player.id"
            class="px-3 py-2 text-sm bg-gray-11 rounded hover:bg-gray-12 transition-colors text-left"
          >
            Switch to Player {{ index + 1 }}
          </button>
        </div>
        <label
          class="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-11 rounded transition-colors"
        >
          <input
            type="checkbox"
            v-model="autoSwitchPlayer"
            class="cursor-pointer"
          />
          <span>Auto Switch to Active Player</span>
        </label>
      </section>

      <div class="border-t border-gray-6"></div>

      <!-- Game Controls Section -->
      <section class="flex flex-col gap-2">
        <h3 class="text-xs font-semibold uppercase tracking-wide mb-1">
          Game Controls
        </h3>
        <div class="flex flex-col gap-1.5">
          <button
            @click="emit('rewindOneStep')"
            class="px-3 py-2 text-sm bg-gray-11 rounded hover:bg-gray-12 transition-colors text-left"
          >
            Rewind One Step
          </button>
          <button
            @click="emit('restart')"
            class="px-3 py-2 text-sm bg-gray-11 rounded hover:bg-gray-12 transition-colors text-left"
          >
            Restart Game
          </button>
        </div>
      </section>

      <div class="border-t border-gray-6"></div>

      <!-- Mana Controls Section -->
      <section class="flex flex-col gap-2">
        <h3 class="text-xs font-semibold uppercase tracking-wide mb-1">
          Mana Controls
        </h3>
        <div class="flex gap-2">
          <input
            id="max-mana-input"
            type="number"
            min="0"
            step="1"
            placeholder="Max"
            class="w-20 px-2 py-2 text-sm border border-gray-7 rounded bg-gray-9 focus:outline-none focus:border-gray-12"
            v-model.number="maxMana"
          />
          <button
            :disabled="!isDefined(maxMana)"
            @click="emit('setMaxMana', maxMana!)"
            class="flex-1 px-3 py-2 text-sm bg-gray-11 rounded hover:bg-gray-12 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Set Max Mana
          </button>
        </div>
        <button
          @click="emit('refillMana')"
          class="px-3 py-2 text-sm bg-gray-11 rounded hover:bg-gray-12 transition-colors text-left"
        >
          Refill Mana
        </button>
      </section>

      <!-- Runes Section -->
      <template v-if="state.config.FEATURES.RUNES">
        <div class="border-t border-gray-6"></div>
        <section class="flex flex-col gap-2">
          <h3 class="text-xs font-semibold uppercase tracking-wide mb-1">
            Runes
          </h3>
          <div class="flex flex-col gap-1.5">
            <button
              @click="emit('addRune', RUNES.RED)"
              class="px-3 py-2 text-sm bg-gray-11 rounded hover:bg-gray-12 transition-colors text-left"
            >
              Add Power Rune
            </button>
            <button
              @click="emit('addRune', RUNES.YELLOW)"
              class="px-3 py-2 text-sm bg-gray-11 rounded hover:bg-gray-12 transition-colors text-left"
            >
              Add Vitality Rune
            </button>
            <button
              @click="emit('addRune', RUNES.BLUE)"
              class="px-3 py-2 text-sm bg-gray-11 rounded hover:bg-gray-12 transition-colors text-left"
            >
              Add Wisdom Rune
            </button>
          </div>
        </section>
      </template>

      <div class="border-t border-gray-6"></div>

      <!-- Cards Section -->
      <section class="flex flex-col gap-2">
        <h3 class="text-xs font-semibold uppercase tracking-wide mb-1">
          Cards
        </h3>
        <ComboboxRoot class="relative" v-model="card">
          <ComboboxAnchor
            class="w-full inline-flex items-center justify-between rounded border border-gray-7 px-3 text-sm leading-none h-[38px] gap-2 bg-gray-9 focus:shadow-[0_0_0_2px] focus:shadow-gray-12 outline-none"
          >
            <ComboboxInput
              class="!bg-transparent outline-none h-full flex-1 placeholder-gray-9"
              placeholder="Search cards..."
            />
            <ComboboxTrigger>
              <Icon
                icon="radix-icons:chevron-down"
                class="h-4 w-4 text-gray-11"
              />
            </ComboboxTrigger>
          </ComboboxAnchor>

          <ComboboxContent
            class="absolute z-10 w-full mt-1 bg-gray-9 border border-gray-7 overflow-auto max-h-60 rounded shadow-lg"
          >
            <ComboboxViewport class="p-1">
              <ComboboxEmpty
                class="text-xs font-medium text-center py-2 text-gray-11"
              />

              <ComboboxItem
                v-for="card in allCards"
                :key="card.id"
                :value="card.id"
                class="text-sm leading-none px-3 py-2 relative select-none hover:bg-gray-10 rounded cursor-pointer"
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
          class="px-3 py-2 text-sm bg-gray-11 rounded hover:bg-gray-12 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          Add to Hand
        </button>
      </section>

      <div class="border-t border-gray-6"></div>

      <!-- Unit section-->
      <h3 class="text-xs font-semibold uppercase tracking-wide mb-1">Units</h3>

      <ComboboxRoot class="relative" v-model="unit">
        <ComboboxAnchor
          class="w-full inline-flex items-center justify-between rounded border border-gray-7 px-3 text-sm leading-none h-[38px] gap-2 bg-gray-9 focus:shadow-[0_0_0_2px] focus:shadow-gray-12 outline-none"
        >
          <ComboboxInput
            class="!bg-transparent outline-none h-full flex-1 placeholder-gray-9"
            placeholder="Search units..."
          />
          <ComboboxTrigger>
            <Icon
              icon="radix-icons:chevron-down"
              class="h-4 w-4 text-gray-11"
            />
          </ComboboxTrigger>
        </ComboboxAnchor>

        <ComboboxContent
          class="absolute z-10 w-full mt-1 bg-gray-9 border border-gray-7 overflow-auto max-h-60 rounded shadow-lg"
        >
          <ComboboxViewport class="p-1">
            <ComboboxEmpty
              class="text-xs font-medium text-center py-2 text-gray-11"
            />

            <ComboboxItem
              v-for="unit in units"
              :key="unit.id"
              :value="unit.id"
              class="text-sm leading-none px-3 py-2 relative select-none hover:bg-gray-10 rounded cursor-pointer"
            >
              {{ unit.getCard().name }} ({{ unit.x + 1 }}, {{ unit.y + 1 }})
            </ComboboxItem>
          </ComboboxViewport>
        </ComboboxContent>
      </ComboboxRoot>

      <div class="flex gap-3 items-center">
        <label>X</label>
        <select v-model="position.x" class="py-1 px-2">
          <option v-for="i in state.board.columns" :key="i" :value="i - 1">
            {{ i }}
          </option>
        </select>
        <label>Y</label>
        <select v-model="position.y" class="py-1 px-2">
          <option v-for="i in state.board.rows" :key="i" :value="i - 1">
            {{ i }}
          </option>
        </select>
      </div>
      <button
        :disabled="!unit"
        @click="
          () => {
            emit('move', unit!, { x: position.x, y: position.y });
            unit = null;
          }
        "
        class="px-3 py-2 text-sm bg-gray-11 rounded hover:bg-gray-12 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
      >
        Move Unit
      </button>

      <button
        :disabled="!unit"
        @click="
          () => {
            emit('activateUnit', unit!);
          }
        "
        class="px-3 py-2 text-sm bg-gray-11 rounded hover:bg-gray-12 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
      >
        Activate Unit
      </button>

      <!-- History Section -->
      <!-- <section class="flex flex-col gap-2">
        <h3 class="text-xs font-semibold uppercase tracking-wide mb-1">
          History
        </h3>
        <div
          class="max-h-40 overflow-y-auto bg-gray-9 rounded border border-gray-7 p-2"
        >
          <div
            v-for="(input, index) in history"
            :key="index"
            class="text-sm px-2 py-1.5 cursor-pointer hover:bg-gray-10 rounded transition-colors"
            @click="emit('rewindTo', index)"
          >
            {{ input.type }}
          </div>
        </div>
      </section> -->
    </PopoverContent>
  </PopoverRoot>
</template>
