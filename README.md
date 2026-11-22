[![NPM Version](https://img.shields.io/npm/v/i4n?style=flat-square&color=indigo)](https://npmjs.com/i4n/)
[![NPM Downloads](https://img.shields.io/npm/d18m/i4n?style=flat-square&color=indigo)](https://npmjs.com/i4n/)
[![NPM License](https://img.shields.io/npm/l/i4n?style=flat-square&color=indigo)](https://npmjs.com/i4n/)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/i4n?style=flat-square&color=indigo)](https://npmjs.com/i4n/)
[![NPM Type Definitions](https://img.shields.io/npm/types/i4n?style=flat-square&color=indigo)](https://npmjs.com/i4n/)

# i4n

Zero-dependency, typesafe translations for TypeScript.

## Install

```bash
npm install i4n
```

Requires Node.js 22 or later. Works with ESM `import` and CJS `require`. Always import from the root `i4n` entry.

```ts
import { I4n } from "i4n"; // ESM
const { I4n } = require("i4n"); // CJS
```

## Quick start

Keep one JSON file per language. Values can contain `{name}` placeholders:

```json
{ "greeting": "Hello, {name}!", "bye": "Bye" }
```

```ts
import { I4n } from "i4n";
import en from "./locales/en.json" with { type: "json" };
import es from "./locales/es.json" with { type: "json" };

const i4n = new I4n({
  translations: { en, es },
  language: "en",
});

i4n.t("greeting", { name: "Ada" }); // "Hello, Ada!"
i4n.switch("es");
i4n.t("bye"); // the value from es.json
// @ts-expect-error - "greting" is not a key
i4n.t("greting");
```

### Typing translations

Keys are checked against all languages together. A key that exists in one language is accepted, and it returns `undefined` at runtime in the others. To require the same keys in every language, pass the type explicitly:

```ts
type Messages = typeof en;

const i4n = new I4n<Record<"en" | "es", Messages>>({
  translations: { en, es },
  language: "en",
});
```

With this, a key missing from `es.json` is a type error.

JSON imports need `resolveJsonModule` in `tsconfig.json`. TypeScript types JSON values as `string`, so the type system does not check placeholders.

## API

### `new I4n<T>(config)`

```ts
new I4n<T>({ translations, language, fallbackLanguage? });
```

- `translations: T`: one dictionary per language. Required. Pass `{}` to start empty and add languages with `add`.
- `language: keyof T & string`: the active language. The constructor does not check it against `translations`. Lookups return `undefined` until the language has data.
- `fallbackLanguage?: keyof T & string`: used when a key is missing in the active language. Leave the property out to have no fallback. `null` is not accepted.

The config type is exported as `I4nConfig<T>`.

### `t`

```ts
i4n.t(key);
i4n.t([dynamicKey, fallbackKey]);
i4n.t(key, vars);
i4n.t(key, ...args);
```

Returns the value at the key: a string, a nested object or a template function. The return type follows the key.

- `key`: a dot path such as `"what.happened"`. Typed from the translations.
- `[dynamicKey, fallbackKey]`: the first key is a plain `string`, so you can build it at runtime. The second key must be a typed path, and its type is the return type.
- `vars`: for string values. Replaces `{name}` placeholders. Values are `string | number`. Call `t(key)` without vars to get the raw string.
- `...args`: for template functions. Typed from the function's parameters.

Missing keys return `undefined` at runtime. The return type does not include `undefined`, so check the value or keep every language complete (see [Typing translations](#typing-translations)).

Lookups read own properties only. `t("constructor")` and `t("toString")` return `undefined`. Arrays are not traversed, so `t("list.length")` returns `undefined`.

#### Fallback order

Each step runs until one returns a value:

1. `key` in the active language
2. `fallbackKey` in the active language
3. `key` in the fallback language
4. `fallbackKey` in the fallback language

Without a fallback key, only steps 1 and 3 run.

With `[dynamicKey, fallbackKey]`, the fallback key's value is looked up first, in the active language and then in the fallback language. The dynamic key is used at steps 1 and 3 only if its value has the same `typeof` as that value. If the fallback key exists in no language, the dynamic key's value is used as it is.

```ts
const translations = {
  en: { "say-hi": "Hello", errors: { unspecified: "Unspecified error" } },
  es: { errors: { "404": "No encontrado" } },
};
const i4n = new I4n({ translations, language: "es", fallbackLanguage: "en" });

i4n.t("say-hi"); // "Hello", from en
const code = 500;
i4n.t([`errors.${code}`, "errors.unspecified"]); // "Unspecified error", from en
```

#### Placeholders

A placeholder is `{name}`, where `name` matches `\w+` (ASCII letters, digits and underscore). Every occurrence is replaced. A placeholder without a matching var is left as it is.

```ts
// { "greeting": "Hello, {name}! You have {count} messages." }
i4n.t("greeting", { name: "Ada", count: 3 }); // "Hello, Ada! You have 3 messages."
i4n.t("greeting", { name: "Ada" }); // "Hello, Ada! You have {count} messages."
```

#### Template functions

Functions cannot be stored in JSON, so define them in a TypeScript translations object:

```ts
const en = {
  sayHiTo: (name: string) => `Hello ${name}`,
  today: () => new Date().toDateString(),
};

const i4n = new I4n({ translations: { en }, language: "en" });

i4n.t("sayHiTo", "John"); // "Hello John"
i4n.t("today")(); // today's date as a string
```

`t` calls a function only when arguments are passed. Without arguments, it returns the function, so a function with no parameters is returned rather than called. Call it yourself with `i4n.t("today")()`.

### `add`

```ts
i4n.add(language, dictionary);
```

Synchronous. Merges the top-level keys of `dictionary` into the dictionary of `language`. A key that exists in both is replaced as a whole. Nested objects are not merged. If the language does not exist yet, it is created.

`language` must be one of the keys of `T`, so declare every language you plan to add in the type.

```ts
type Messages = typeof en;

const i4n = new I4n<Partial<Record<"en" | "fr", Messages>>>({
  translations: { en },
  language: "en",
});

// later, for example after the user picks French
const fr = (await import("./locales/fr.json", { with: { type: "json" } })).default;
i4n.add("fr", fr);
i4n.switch("fr");
```

### `switch`

```ts
i4n.switch(language);
```

Sets the active language. Throws `I4nException` with type `"invalid-language"` if `language` is not in `translations`, or if its value is `null` or `undefined`.

### `active` and `languages`

- `active`: the active language (read-only).
- `languages`: the keys of `translations` whose value is not `null` or `undefined`, including languages added with `add` (read-only).

### `I4nException`

```ts
new I4nException(type, message, options?);
```

Extends `Error`. `name` is `"I4nException"`, the message starts with `I4n: `, and `type` is `"invalid-language"`. The union is exported as `I4nExceptionType`.

```ts
try {
  i4n.switch(userLanguage);
} catch (error) {
  if (error instanceof I4nException && error.type === "invalid-language") {
    i4n.switch("en");
  }
}
```

### `Path` and `Value`

```ts
type Path<D>;
type Value<D, P extends string>;
```

- `Path<D>`: every dot path in the dictionary `D`. Functions and arrays are leaves.
- `Value<D, P>`: the type at path `P` in `D`.

```ts
type Messages = { hi: string; what: { happened: string } };

type Keys = Path<Messages>; // "hi" | "what" | "what.happened"
type Happened = Value<Messages, "what.happened">; // string
```

## Migrating from 0.5

- `loader` is removed, and `translations` is now required. Load the data with `await`, then pass it to the constructor or to `add`:

  ```ts
  const fr = (await import("./locales/fr.json", { with: { type: "json" } })).default;
  i4n.add("fr", fr);
  ```

- `lazy`, `loaded` and `ready` are removed. Use `await` and `add` instead. There is no `ready` replacement: once `add` returns, the language is available.
- `fallbackLanguage: null` is no longer accepted. Leave the property out.
- `I4n<T, L>` and `I4nConfig<T, L>` lose the `L` type parameter. `Path` and `Value` take a single dictionary.
- `switch` accepts only `keyof T & string`, and `active` is typed `keyof T & string`. Pass a language key of `translations`.
- `t([key])` with a single-element array is no longer accepted. Use `t(key)`.
- Keys are checked. Code that used untyped keys may no longer compile.
- `I4nException` uses `cause` instead of `from`. Its `type` is only `"invalid-language"`. `"unexpected-exception"` is removed.
- Subpath imports are removed. `i4n/i4n`, `i4n/errors` and `i4n/types` now import from `i4n`.

## Examples

- [React](examples/i4n-react/README.md)
- [Node.js](examples/i4n-node/README.md)
- [JSON](examples/i4n-json/README.md)
- [Lazy loading](examples/i4n-lazy/README.md), a language loaded on demand with `add`
