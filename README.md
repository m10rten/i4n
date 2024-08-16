# i4n

🌐🪶 Lightweight, Zero dependencies, Typesafe and Simple to use translations for TypeScript.

## Installation

To use this package, install with npm:

```bash
npm install i4n
```

## Usage

To get started with translating, import the I4n class:

```ts
import { I4n } from "i4n";
```

Then create a set of translations:

```ts
const translations = {
  en: {
    hi: "Hello",
    earth: "World",
    what: {
      happened: "What happened?",
    },
  },
  es: {
    hi: "Ola",
    earth: "Mundo",
    what: {
      happened: "¿Qué pasó?",
    },
  },
} as const;
```

> This package will not validate this structure or types inbetween translations(!), but having an object with languages is required for this module to work.

This will **not** work:

```ts
// BAD:
const translations = {
  hi: "Hello",
  earth: "World",
  what: {
    happened: "What happened?",
  },
} as const;
```

> ⚠️ Warning

Watch out when making bulk translations, in that case be sure to type it yourself as this may cause the `i4n` package to not work as intended or expected.

For example:

```ts
const translations = {
  en: {
    earth: "World",
  },
  es: {
    aerth: "Mundo",
  },
} as const;
```

This does not raise typescript errors because it is a valid object.

To overcome this, implement your own types:

```ts
type TranslationData = {
  earth: string;
};
type TranslationSet = Record<string, TranslationData>;

const translations: TranslationSet = {
  en: {
    earth: "world",
  },
  es: {
    aerth: "Mundo",
    // ^ Typescript error
  },
};
```

## Init

Then initialize the class with your translations and default language:

```ts
const i4n = new I4n({ translations, language: "en" });
```

- **translations**: the translations you just created having `hi`, `earth`, `what.happened` in it.
- **language**: the default language the translation function will start with.

## Functions

To use it there are 2 functions: `t` and `switch`.

### `t`

The `t` function allows you to call your translations with a `dot.notation` so you may get nested fields.

```ts
console.log(i4n.t("hi")); // "Hello"
```

Calling the `t` method for just an object (not the nested key), will result in the object being returned.

```ts
console.log(i4n.t("what")); // { happened: "What happened?" }
```

### `switch`

The `switch` method enables the application to switch languages at runtime, making it very useful for web translations.

```ts
i4n.switch("es");

console.log(i4n.t("hi")); // "Ola"
```
