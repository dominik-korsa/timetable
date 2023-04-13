export const pluralRules = new Intl.PluralRules('pl-PL');

export const groupPlural: Record<Intl.LDMLPluralRule, string> = {
  zero: 'grup',
  one: 'grupa',
  two: 'grupy',
  few: 'grupy',
  many: 'grup',
  other: 'grupy',
};

export const otherLessonsPlural: Record<Intl.LDMLPluralRule, string> = {
  zero: 'innych grup',
  one: 'inna grupa',
  two: 'inne grupy',
  few: 'inne grupy',
  many: 'innych grup',
  other: 'innych grup',
};

export const changesPlural: Record<Intl.LDMLPluralRule, string> = {
  zero: 'zmiany',
  one: 'zmiana',
  two: 'zmiany',
  few: 'zmiany',
  many: 'zmian',
  other: 'zmian',
};
