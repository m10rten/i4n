[![NPM Version](https://img.shields.io/npm/v/i4n?style=flat-square&color=indigo)](https://npmjs.com/i4n/)
[![NPM Downloads](https://img.shields.io/npm/d18m/i4n?style=flat-square&color=indigo)](https://npmjs.com/i4n/)
[![NPM License](https://img.shields.io/npm/l/i4n?style=flat-square&color=indigo)](https://npmjs.com/i4n/)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/i4n?style=flat-square&color=indigo)](https://npmjs.com/i4n/)
[![NPM Type Definitions](https://img.shields.io/npm/types/i4n?style=flat-square&color=indigo)](https://npmjs.com/i4n/)

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
  },
  es: {
    hi: "Ola",
  },
} as const;
```

To improve this, implement your own types:

```ts
type TranslationData = {
  earth: string;
};
type Language = "en" | "es" | "fr";
type TranslationSet = Record<Language, TranslationData>;

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
const i4n = new I4n({ translations, language: "en", fallbackLanguage: "fr" });
```

- **translations**: the translations you just created.
- **language**: the default language the translation function will start with.
- **fallbackLanguage**: the language it should fall back to.

## API

### I4n Constructor

```ts
new I4n(config: {
  translations: Record<string, any>;
  language: string;
  fallbackLanguage?: string;
});
```

- **translations**: An object containing the translation data, organized by language codes.
- **language**: The default language to use.
- **fallbackLanguage**: (Optional) The language to fall back to if a translation is missing.

### Methods

#### `t(key: string | string[], ...args: any[])`

Retrieves a translation value based on the provided key. Supports dot notation for nested keys and fallback keys.

- **key**: The translation key or array of keys for fallback.
- **args**: Additional arguments for template functions.

**Usage Example:**

```ts
i4n.t("hi"); // Returns "Hello"
i4n.t([`errors.${code}`, "errors.unspecified"]); // Fallback example
```

#### `switch(language: string)`

Switches the current language at runtime.

- **language**: The language code to switch to.

**Usage Example:**

```ts
i4n.switch("es");
i4n.t("hi"); // Returns "Ola"
```

### Error Handling

- **I4nException**: Thrown if invalid types are used or if a language not present in the translations is selected.

## Docs

For more and more in depth documentation, go to: [github.com/m10rten/i4n](https://github.com/m10rten/i4n#readme).
