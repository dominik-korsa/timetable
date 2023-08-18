const anyOf = (...parts: string[]) => `(?:${parts.join('|')})`;
const optional = (part: string) => `(?:${part})?`;

const vLo = 'v-lo';

const optivum = 'o,[012],[^\\/,]+,[^\\/,]+';

const rspo = '\\d+';

const slash = '\\/';
const part = (prefix: string) => `${prefix}\\.[^\\/\\.,]+`;
const voivodeship = part('w') + slash;
const county = part('p') + slash;
const city = part('m');
const municipality = part('gm');
const school = `${slash}[^\\/\\.,]+`;

export const triRegex = anyOf(
  vLo,
  optivum,
  rspo,
  optional(voivodeship) + anyOf(
    optional(county) + city,
    county + municipality,
  ) + school,
);
console.log('Tri regex:', triRegex);
