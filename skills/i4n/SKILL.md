---
name: i4n
description: Use when a project depends on the i4n npm package and needs translations, localization, or i18n. Covers typed translation keys from JSON files, {name} placeholders, runtime language switching with switch, loading languages on demand with add, and fallback languages. Load it before writing or changing code that calls new I4n, t, add, or switch.
---

## Usage

Install with `npm install i4n` and import from the root only: `import { I4n } from "i4n";`. Requires Node.js 22 or later. Keep one JSON file per language and import each with `with { type: "json" }`, which needs `resolveJsonModule` in `tsconfig.json`. Type the translations as `Record<"en" | "es", Messages>`, where `Messages` is `typeof en`, so every language must have every key.

```ts
import { I4n, I4nException } from "i4n";
import en from "./locales/en.json" with { type: "json" };
import es from "./locales/es.json" with { type: "json" };

// en.json: { "greeting": "Hello, {name}!", "bye": "Bye" }
type Messages = typeof en;

const i4n = new I4n<Record<"en" | "es", Messages>>({
  translations: { en, es },
  language: "en",
  fallbackLanguage: "en",
});

i4n.t("greeting", { name: "Ada" }); // "Hello, Ada!"
i4n.switch("es");

// @ts-expect-error "greting" is a typo, not a key
i4n.t("greting");

try {
  // @ts-expect-error "fr" is not a language in the type
  i4n.switch("fr");
} catch (error) {
  if (error instanceof I4nException) i4n.switch("en");
}
```

`t(key)` returns the value at a dot path such as `"what.happened"`. The value can be a string, a nested object, or a template function. `t(key, vars)` replaces each `{name}` placeholder that has a matching string or number, and leaves other placeholders as they are. `t([dynamicKey, fallbackKey])` takes a runtime string as the first key and uses the fallback key when the dynamic key has no value or a value of a different `typeof` than the fallback key's value. Template functions go in the TypeScript translations object, since JSON cannot hold functions, and are called as `t(key, ...args)`.

`add(language, dictionary)` is synchronous. It merges the top-level keys of `dictionary` into `language`, replaces a key that exists in both as a whole, and creates the language if it is missing. To load on demand, `await import(...)` the JSON file, pass its `.default` to `add`, and include the language in the type, for example `Partial<Record<"en" | "fr", Messages>>`, because `language` must be a key of `T`. `switch(language)` sets the active language and throws `I4nException` with `type` `"invalid-language"` when the language has no data. Check with `instanceof I4nException`.

## Gotchas

`t` returns `undefined` at runtime for a missing key, but the return type does not include `undefined`. Without the `Record<...>` pattern, a key that exists in one language is accepted in all of them, so it can be missing at runtime. The constructor does not check `language` or `fallbackLanguage` against `translations`. JSON values are typed as plain `string`, so placeholder names are not checked against the code that passes `vars`.
