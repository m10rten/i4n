# i4n

## 0.6.0

### Minor Changes

- Breaking: removed `loader`, `lazy`, `loaded` and `ready`. Load the data with `await` and pass it to the new synchronous `add(language, dictionary)`, for example `i4n.add("fr", await loadFr())`. `translations` is now required, so pass `{}` to start empty.
- Breaking: removed the `i4n/i4n`, `i4n/errors` and `i4n/types` subpaths. Import everything from `i4n`.
- Breaking: removed the `L` type parameter from `I4n<T, L>` and `I4nConfig<T, L>`. `Path` and `Value` now both take a single dictionary.
- Breaking: `switch` only accepts `keyof T & string`, and `active` is typed `keyof T & string`. Previously `switch` accepted any string and `active` was `string`.
- Breaking: `t([key])` with a single-element array is no longer accepted. Use `t(key)`.
- Breaking: the constructor no longer validates `translations`. It used to throw `invalid-translations` for Map, Set, arrays and similar input.
- Breaking: `I4nException.name` is now `"I4nException"`. It used to be `"Error"`.
- Breaking: `fallbackLanguage` no longer accepts `null`. Leave the property out instead.
- Breaking: `I4nException` is now `(type, message, options)` and uses the standard `cause` instead of `from`. The type union is now only `"invalid-language"`.
- Added: `{name}` placeholders in string values. `t(key, { name })` replaces them, and unknown placeholders are left as they are.
- Added: strict key types. `t` rejects keys that are not in the translations, and this works with interfaces.
- Fixed: package entry points. `import` and `require` now resolve to the built files, with matching types for both. 0.5.2 was not usable from ESM.
- Fixed: template functions that exist only in the fallback language are now called.
- Fixed: the fallback key is looked up in the fallback language.
- Fixed: lookups of prototype names and `switch` to a prototype name are rejected. Lookups also do not traverse arrays, so `t("list.length")` returns `undefined`.
- Fixed: a dynamic key in `t([dynamicKey, fallbackKey])` is used only if its value has the same `typeof` as the fallback key's value, which is resolved first. If the fallback key exists in no language, the dynamic key's value is used as it is.
- Fixed: `new I4n<T>()` no longer types `t` results as `never`.
- Fixed: TS2589 ("Type instantiation is excessively deep") on translations that contain `any` values.
- Consumers need Node >=22.
- Tooling: tests use node:test, releases use tag-triggered npm trusted publishing (OIDC), and development needs Node 26 and pnpm 12.

## 0.5.2

### Patch Changes

- 0550d5f: Updated dependencies & changed type to module

## 0.5.1

### Patch Changes

- 57c766f: Updated types to allow string to be put in loaded and switch

## 0.5.0

### Minor Changes

- ec9dd78: Made lazy loadig possible after the initialization of the `I4n` class. Updated docs accordingly and updated NPM-readme with more high-level details.

## 0.4.1

### Patch Changes

- 10351a6: Fixed bug where the loader would cause an exception when key does not exist

## 0.4.0

### Minor Changes

- 1ed5609: Allow for custom data loader to be used to get translations.

## 0.3.4

### Patch Changes

- 2260d7e: Fixed the missing of files in the output

## 0.3.3

### Patch Changes

- e0f1af1: Update package.json order to work on react/next

## 0.3.2

### Patch Changes

- cd81ed8: Removed comments from package output

## 0.3.1

### Patch Changes

- f85bbf2: Updated readme to be smaller for the package and larger for github with link in package.json

## 0.3.0

### Minor Changes

- 1f78cae: Added support for fallback keys and fallback language

## 0.2.1

### Patch Changes

- eadab70: Fix to be able to detatch `t` and `switch` from the `I4n` instance.

## 0.2.0

### Minor Changes

- 7aaf39a: Added support for template-strings through custom user-functions.

## 0.1.1

### Patch Changes

- 8c8ff4a: Added JSDoc code docs

## 0.1.0

### Minor Changes

- ec0194b: Initial functionality release with `t` & `switch` function, including docs and tests.
