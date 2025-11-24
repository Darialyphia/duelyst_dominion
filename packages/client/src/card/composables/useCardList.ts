import { useSafeInject } from '@/shared/composables/useSafeInject';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { KEYWORDS } from '@game/engine/src/card/card-keywords';
import {
  CARD_KINDS,
  type CardKind,
  type Faction,
  FACTIONS
} from '@game/engine/src/card/card.enums';
import { CARD_SET_DICTIONARY } from '@game/engine/src/card/sets';
import { isString } from '@game/shared';
import type { Ref, ComputedRef, InjectionKey } from 'vue';
import { api } from '@game/api';
import { useAuthedQuery } from '@/auth/composables/useAuth';

export type CardListContext = {
  isLoading: Ref<boolean>;
  cards: ComputedRef<
    Array<{
      card: CardBlueprint;
      id: string;
      blueprintId: string;
      isFoil: boolean;
      copiesOwned: number;
    }>
  >;
  cardPool: CardBlueprint[];
  textFilter: Ref<string, string>;

  hasKindFilter(kind: CardKind): boolean;
  toggleKindFilter(kind: CardKind): void;
  clearKindFilter(): void;

  hasFactionFilter(faction: Faction): boolean;
  toggleFactionFilter(faction: Faction): void;
  clearFactionFilter(): void;
};

const CardListInjectionKey = Symbol(
  'cardList'
) as InjectionKey<CardListContext>;

export const provideCardList = () => {
  const { isLoading, data: myCollection } = useAuthedQuery(
    api.cards.myCollection,
    {}
  );

  const FACTION_ORDER = {
    [FACTIONS.F1]: 1,
    [FACTIONS.F2]: 2,
    [FACTIONS.F3]: 3,
    [FACTIONS.F4]: 4,
    [FACTIONS.F5]: 5,
    [FACTIONS.F6]: 6,
    [FACTIONS.NEUTRAL]: 7
  };

  const kindFilter = ref(new Set<CardKind>());
  const factionFilter = ref(new Set<Faction>());
  const textFilter = ref('');

  const allBlueprints = Object.values(CARD_SET_DICTIONARY).flatMap(
    set => set.cards
  );
  const cards = computed(() => {
    if (!myCollection.value) return [];
    return myCollection.value
      .map(c => {
        return {
          ...c,
          card: allBlueprints.find(b => b.id === c.blueprintId)!
        };
      })
      .filter(({ card }) => {
        if (kindFilter.value.size > 0 && !kindFilter.value.has(card.kind)) {
          return false;
        }

        if (
          factionFilter.value.size > 0 &&
          !factionFilter.value.has(card.faction)
        ) {
          return false;
        }

        if (textFilter.value) {
          const searchText = textFilter.value.toLocaleLowerCase();

          return (
            card.name.toLocaleLowerCase().includes(searchText) ||
            card.description.toLocaleLowerCase().includes(searchText) ||
            card.tags.some(tag =>
              tag.toLocaleLowerCase().includes(searchText)
            ) ||
            Object.values(KEYWORDS).some(k => {
              return (
                (k.name.toLocaleLowerCase().includes(searchText) &&
                  card.description.includes(searchText)) ||
                k.aliases.some(alias => {
                  return isString(alias)
                    ? alias.includes(searchText) &&
                        card.description
                          .toLocaleLowerCase()
                          .includes(alias.toLocaleLowerCase())
                    : searchText.match(alias) &&
                        card.description.toLocaleLowerCase().match(alias);
                })
              );
            })
          );
        }

        return true;
      })
      .sort((a, b) => {
        const factionA = FACTION_ORDER[a.card.faction] ?? 999;
        const factionB = FACTION_ORDER[b.card.faction] ?? 999;
        if (factionA !== factionB) {
          return factionA - factionB;
        }

        if (
          a.card.kind === CARD_KINDS.GENERAL &&
          b.card.kind !== CARD_KINDS.GENERAL
        ) {
          return -1;
        }
        if (
          a.card.kind !== CARD_KINDS.GENERAL &&
          b.card.kind === CARD_KINDS.GENERAL
        ) {
          return 1;
        }

        const costA = 'manaCost' in a.card ? a.card.manaCost : 0;
        const costB = 'manaCost' in b.card ? b.card.manaCost : 0;
        if (costA !== costB) {
          return costA - costB;
        }

        return a.card.name.localeCompare(b.card.name);
      });
  });

  const ctx: CardListContext = {
    isLoading,
    cards,
    cardPool: allBlueprints,
    textFilter,

    hasKindFilter(kind: CardKind) {
      return kindFilter.value.has(kind);
    },
    toggleKindFilter(kind: CardKind) {
      if (kindFilter.value.has(kind)) {
        kindFilter.value.delete(kind);
      } else {
        kindFilter.value.add(kind);
      }
    },
    clearKindFilter: () => {
      kindFilter.value.clear();
    },

    hasFactionFilter(faction: Faction) {
      return factionFilter.value.has(faction);
    },
    toggleFactionFilter(faction: Faction) {
      if (factionFilter.value.has(faction)) {
        factionFilter.value.delete(faction);
      } else {
        factionFilter.value.add(faction as Faction);
      }
    },
    clearFactionFilter() {
      factionFilter.value.clear();
    }
  };

  provide(CardListInjectionKey, ctx);

  return ctx;
};

export const useCardList = () => useSafeInject(CardListInjectionKey);
