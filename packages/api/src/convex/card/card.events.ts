import { BoosterPackOpenedEvent } from './events/boosterPackOpened.event';
import { BoosterPacksPurchasedEvent } from './events/boosterPacksPurchased.event';

export type CardEventMap = {
  [BoosterPackOpenedEvent.EVENT_NAME]: BoosterPackOpenedEvent;
  [BoosterPacksPurchasedEvent.EVENT_NAME]: BoosterPacksPurchasedEvent;
};
