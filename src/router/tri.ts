const anyOf = (...parts: string[]) => `(?:${parts.join('|')})`;
const optional = (part: string) => `(?:${part})?`;

const timetableLiteral = 'plan';

const schoolSlugs = {
  'v-lo': 4735,
};

const vLo = anyOf(...Object.keys(schoolSlugs));

const optivum = 'o,[012],[^\\/,]+,[^\\/,]+';

const rspo = '\\d+';

const slash = '\\/';
const slug = '[^\\/\\.,]+';
const part = (prefix: string) => `${prefix}\\.${slug}`;

const voivodeship = part('w') + slash;
const county = part('p') + slash;
const city = part('m');
const commune = part('gm');
const schoolOrRspo = slug;

const url = '\'[^\']+\'';

const version = '\\+\\d+';

export const triRegex = anyOf(
  vLo,
  optivum,
  url,
  timetableLiteral + version,
  anyOf(
    rspo,
    optional(voivodeship) + anyOf(
      optional(county) + city,
      county + commune,
    ) + slash + schoolOrRspo,
  ) + optional(version),
);
console.log('Tri regex:', triRegex);
