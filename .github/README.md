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

## Contents

- [i4n](#i4n)
- [Installation](#installation)
- [Usage](#usage)
- [Init](#init)
- [Functions](#functions)
  - [`t`](#t)
    - [Fallback keys](#fallback-keys)
    - [Fallback language](#fallback-language)
  - [`switch`](#switch)
  - [Templates](#templates)
- [`I4nException`](#i4nexception)
- [Examples](#examples)

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

> ⚠️ Warning:
> Watch out when making bulk translations, in that case be sure to type it yourself as this may cause the `i4n` package to not work as intended or expected.

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
type Language = "en" | "es" | "fr";
type TranslationSet = {
  [lang in Language]?: LanguageData;
};

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

- **translations**: the translations you just created having `hi`, `earth`, `what.happened` in it.
- **language**: the default language the translation function will start with.
- **fallbackLanguage**: the language it should fall back to.

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

#### Fallback keys

When using `i4n` with an API, you might have different translations for different error codes, but you do not want to type out all the HTTP error codes in your translations. Introducing: fallbacks.

With fallbacks, you can give a second key that should be used instead if the first key does not return a value.

This looks like this:

```ts
const translations = {
  en: {
    errors: {
      "404": "Not found error",
      "500": "Server error",
      unspecified: "unspecified",
    },
  },
};
const i4n = new I4n({ translations, language });

// your api call for example ...
// you get an error code from the `fetch`, e.g:  code: 401
const text = i4n.t([`errors.${code}`, "errors.unspecified"]); // "unspecified"
```

This will make development easier for not having to check if you have all the expected translations present.

#### Fallback Language

You might forget to translate something, this config option makes sure you will have a language to fall back to.

```ts
// ... translations
const i4n = new I4n({ fallbackLanguage: "en" });
i4n.switch("es");

i4n.t("say-hi"); // does not exist in 'es' -> "Hello" from 'en'
```

### `switch`

The `switch` method enables the application to switch languages at runtime, making it very useful for web translations.

```ts
i4n.switch("es");

console.log(i4n.t("hi")); // "Ola"
```

### Templates

When working with `i4n`, you might find that you want to modify the output.

With templates, there are a few small steps required to get started:

**Step 1**: Edit your translations to include a template function.

This can be any function, I chose for it to look like this:

```ts
const translations: TranslationSet = {
  en: {
    sayHiTo: (name: string) => `Hello ${name}`,
  },
  es: {
    sayHiTo: (name: string) => `Ola ${name}`,
  },
};
```

**Step 2**: Call your new template with custom parameters.

You will then call the function `t` the same way, but with the parameters you defined:

```ts
i4n.t("sayHiTo", "John"); // "Hello John"
```

> 💡 As mentioned, this works with the parameters **you** defined. Objects and custom classes will also work!

This may seem small, but this is fully typed, making it very easy to define and use your templates in your code.

## `I4nException`

When using this package, be sure not to force types.

The `translations` prop in the `I4n` class can only accept objects, no `Map`, `Set` or `Array`.

In that case, the module will throw a `I4nException` error.

The same error is thrown when (also forced) switching to a language that is not in the translations.

These errors will need to be catched if you need to force some functionality, but this is strongly discouraged because it may break any end-user experience.

## Examples

To showcase the `i4n` package, there have been made several examples.

The following examples are present in this repository:

<!-- - [**Nextjs.org**](https://nextjs.org/) - [examples/i4n-next](../examples/i4n-next/README.md) -->
<!-- - [**Hono.dev**](https://hono.dev/) - [examples/i4n-hono](../examples/i4n-hono/README.md) -->

- [**React.dev**](https://react.dev/) - [examples/i4n-react](../examples/i4n-react/README.md)

<hr />

[back to top](#i4n)
