import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import I4n, { I4nException } from "../src/index.ts";

type TranslationData = {
  earth: string;
  nested: {
    key: string;
  };
  to_fallback?: string | undefined;
  only_in_english?: string | undefined;
  fallback: string;
  single_template: (name: string) => string;
  farewell?: (name: string) => string;

  object_template: ({ type, count }: { type: string; count: number }) => string;
};
type Language = "fr" | "en" | "es";

type TranslationSet = {
  [lang in Language]?: TranslationData;
};
const testTranslations = {
  en: {
    earth: "world",

    nested: {
      key: "english key",
    },
    fallback: "fallback",
    only_in_english: "Hello fallback language",

    single_template: (name) => `Hello ${name}`,
    farewell: (name) => `Goodbye ${name}`,

    object_template: ({ type, count }) => `[${type}]: has ${count}`,
  },
  es: {
    earth: "Mundo",

    nested: {
      key: "key espanol",
    },
    fallback: "fallback",

    single_template: (name) => `Ola ${name}`,

    object_template: ({ type, count }) => `[${type}]: a ${count}`,
  },
} satisfies TranslationSet;

const testDefaultLanguage = "en" satisfies keyof typeof testTranslations;

describe("I4n", () => {
  let i4n: I4n<typeof testTranslations>;
  beforeEach(() => {
    i4n = new I4n({
      translations: testTranslations,
      language: testDefaultLanguage,
    });
  });

  it("If switching the language works", () => {
    assert.strictEqual(i4n.t("earth"), testTranslations["en"]?.earth);

    assert.strictEqual(i4n.switch("es"), undefined);

    assert.strictEqual(i4n.t("earth"), testTranslations["es"]?.earth);
    assert.strictEqual(i4n.active, "es");
  });

  const invalidLanguages = ["not-a-country-code", "", undefined, "toString", "__proto__"];
  for (const language of invalidLanguages) {
    it(`Switching to ${JSON.stringify(language)} throws an invalid-language exception`, () => {
      assert.throws(() => i4n.switch(language as "en"), {
        name: "I4nException",
        type: "invalid-language",
        message: `I4n: Language "${language}" is not in the translations.`,
      });
    });
  }

  it("I4nException keeps the cause of a wrapped error", () => {
    const cause = new Error("not found");
    assert.strictEqual(new I4nException("invalid-language", "Wrapped", { cause }).cause, cause);
  });

  describe("lookup", () => {
    const english = new I4n({ translations: testTranslations, language: "en" });
    const spanishOnly = new I4n({ translations: testTranslations, language: "es" });
    const spanish = new I4n<TranslationSet>({
      translations: testTranslations,
      language: "es",
      fallbackLanguage: "en",
    });
    const sameFallback = new I4n<TranslationSet>({
      translations: testTranslations,
      language: "en",
      fallbackLanguage: "en",
    });
    const kinds = new I4n({
      translations: {
        en: {
          hi: "Hello {name}",
          greeting: "Hi {name}",
          list: ["a"],
          nested: { key: "x" },
          fn_template: (name: string) => `fn ${name}`,
        },
      },
      language: "en",
    });
    const partial = new I4n<Record<string, { hi?: string; greeting?: string; other?: string }>>({
      translations: { es: { greeting: "Hola" }, en: { hi: "Hello", greeting: "Hi" } },
      language: "es",
      fallbackLanguage: "en",
    });
    const testcases = [
      { name: "returns a string", actual: () => english.t("earth"), expected: "world" },
      {
        name: "returns a nested string by its dot path",
        actual: () => english.t("nested.key"),
        expected: "english key",
      },
      {
        name: "works detached from the instance",
        actual: () => {
          const { t } = english;
          return t("earth");
        },
        expected: "world",
      },
      {
        name: "returns a template without arguments as a function",
        actual: () => typeof english.t("single_template"),
        expected: "function",
      },
      {
        name: "calls a template with a string argument",
        actual: () => english.t("single_template", "Ada"),
        expected: "Hello Ada",
      },
      {
        name: "calls a template with an object argument",
        actual: () => english.t("object_template", { type: "ice", count: 4 }),
        expected: "[ice]: has 4",
      },
      {
        name: "finds a fallback key in the active language",
        actual: () => english.t(["to_fallback", "fallback"]),
        expected: "fallback",
      },
      {
        name: "returns undefined for a key missing in the active language without a fallback language",
        actual: () => spanishOnly.t("only_in_english"),
        expected: undefined,
      },
      {
        name: "calls a template that exists only in the fallback language",
        actual: () => spanish.t("farewell", "Ada"),
        expected: "Goodbye Ada",
      },
      {
        name: "finds a fallback key that exists only in the fallback language",
        actual: () => spanish.t(["missing", "only_in_english"]),
        expected: "Hello fallback language",
      },
      {
        name: "prefers the fallback key in the active language over the key in the fallback language",
        actual: () => spanish.t(["only_in_english", "earth"]),
        expected: "Mundo",
      },
      {
        name: "returns undefined when no language has either key",
        actual: () => spanish.t(["missing", "to_fallback"]),
        expected: undefined,
      },
      {
        name: "skips an inherited method as a key",
        actual: () => english.t(["toString", "earth"]),
        expected: "world",
      },
      {
        name: "skips an inherited constructor as a key",
        actual: () => english.t(["constructor", "earth"]),
        expected: "world",
      },
      {
        name: "skips __proto__ as a key",
        actual: () => english.t(["__proto__", "earth"]),
        expected: "world",
      },
      {
        name: "does not call an inherited constructor with the arguments",
        actual: () => english.t(["constructor.constructor", "single_template"], "Ada"),
        expected: "Hello Ada",
      },
      {
        name: "skips a property of a string value",
        actual: () => english.t(["earth.length", "earth"]),
        expected: "world",
      },
      {
        name: "skips a property of an array",
        actual: () => kinds.t(["list.length", "hi"]),
        expected: "Hello {name}",
      },
      {
        name: "uses the fallback key when the dynamic key is an object",
        actual: () => kinds.t(["nested", "hi"]),
        expected: "Hello {name}",
      },
      {
        name: "uses the fallback key instead of calling a function behind the dynamic key",
        actual: () => kinds.t(["fn_template", "hi"], { name: "Ada" }),
        expected: "Hello Ada",
      },
      {
        name: "uses the dynamic key when its value is the same kind as the fallback key",
        actual: () => kinds.t(["greeting", "hi"], { name: "Ada" }),
        expected: "Hi Ada",
      },
      {
        name: "uses the dynamic key of the active language when only the fallback language has the fallback key",
        actual: () => partial.t(["greeting", "hi"]),
        expected: "Hola",
      },
      {
        name: "uses the dynamic key when no language has the fallback key",
        actual: () => partial.t(["greeting", "other"]),
        expected: "Hola",
      },
      {
        name: "returns undefined for a missing key when the fallback language is the active language",
        actual: () => sameFallback.t("to_fallback"),
        expected: undefined,
      },
      {
        name: "returns a present key when the fallback language is the active language",
        actual: () => sameFallback.t("earth"),
        expected: "world",
      },
      {
        name: "finds a fallback key when the fallback language is the active language",
        actual: () => sameFallback.t(["to_fallback", "fallback"]),
        expected: "fallback",
      },
      {
        name: "skips an inherited property as the language",
        actual: () =>
          new I4n<Record<string, { name: string }>>({ translations: {}, language: "constructor" }).t("name"),
        expected: undefined,
      },
      {
        name: "skips an inherited property as the fallback language",
        actual: () =>
          new I4n<Record<string, { name: string }>>({
            translations: {},
            language: "en",
            fallbackLanguage: "toString",
          }).t("name"),
        expected: undefined,
      },
    ];
    for (const { name, actual, expected } of testcases) {
      it(name, () => {
        assert.strictEqual(actual(), expected);
      });
    }
  });

  describe("interpolation", () => {
    const testcases: { name: string; text: string; args: unknown[]; expected: string }[] = [
      { name: "replaces a placeholder", text: "Hello {name}", args: [{ name: "Ada" }], expected: "Hello Ada" },
      { name: "replaces a repeated placeholder", text: "{n} and {n}", args: [{ n: 2 }], expected: "2 and 2" },
      { name: "replaces a placeholder with 0", text: "{n} items", args: [{ n: 0 }], expected: "0 items" },
      { name: "keeps a placeholder without a var", text: "Hello {name}", args: [{}], expected: "Hello {name}" },
      {
        name: "keeps a placeholder named after an inherited property",
        text: "{toString}",
        args: [{}],
        expected: "{toString}",
      },
      {
        name: "keeps a placeholder with a character outside a word",
        text: "Hello {first-name}",
        args: [{ "first-name": "Ada" }],
        expected: "Hello {first-name}",
      },
      {
        name: "inserts a var value literally without interpolating it again",
        text: "Hello {name}",
        args: [{ name: "$& $1 {name}" }],
        expected: "Hello $& $1 {name}",
      },
      { name: "returns the string as is without vars", text: "Hello {name}", args: [], expected: "Hello {name}" },
      {
        name: "returns the string as is with undefined vars",
        text: "Hello {name}",
        args: [undefined],
        expected: "Hello {name}",
      },
      {
        name: "returns the string as is with null vars",
        text: "Hello {name}",
        args: [null],
        expected: "Hello {name}",
      },
    ];
    for (const { name, text, args, expected } of testcases) {
      it(name, () => {
        const { t } = new I4n({ translations: { en: { text } }, language: "en" });
        assert.strictEqual(Reflect.apply(t, undefined, ["text", ...args]), expected);
      });
    }
  });

  it("add makes a language available to switch and t", () => {
    const i4n = new I4n<TranslationSet>({ translations: {}, language: "en" });
    assert.throws(() => i4n.switch("fr"), I4nException);

    i4n.add("fr", { earth: "Terre" });
    i4n.switch("fr");

    assert.deepStrictEqual(i4n.languages, ["fr"]);
    assert.strictEqual(i4n.t("earth"), "Terre");
  });

  describe("a language without a dictionary", () => {
    const withEmptyFrench = () =>
      new I4n<TranslationSet>({ translations: { en: { ...testTranslations.en }, fr: undefined }, language: "en" });

    it("switch throws an invalid-language exception", () => {
      assert.throws(() => withEmptyFrench().switch("fr"), { type: "invalid-language" });
    });

    it("is not listed in languages", () => {
      assert.deepStrictEqual(withEmptyFrench().languages, ["en"]);
    });
  });

  it("add gives a language without a dictionary its dictionary", () => {
    const i4n = new I4n<Record<string, { greeting: string } | undefined>>({
      translations: { en: { greeting: "Hello" }, fr: undefined },
      language: "en",
    });

    i4n.add("fr", { greeting: "Salut" });
    i4n.switch("fr");

    assert.strictEqual(i4n.t("greeting"), "Salut");
    assert.deepStrictEqual(i4n.languages, ["en", "fr"]);
  });

  it("add creates __proto__ as an own language without touching the prototype", () => {
    const i4n = new I4n<Record<string, { greeting: string }>>({ translations: {}, language: "en" });

    i4n.add("__proto__", { greeting: "Salut" });

    assert.strictEqual(({} as Record<string, unknown>)["greeting"], undefined);
    assert.deepStrictEqual(i4n.languages, ["__proto__"]);
  });

  it("add ignores an inherited language", () => {
    const translations = Object.create({ en: { earth: "inherited" } }) as TranslationSet;
    const i4n = new I4n({ translations, language: "en" });

    i4n.add("en", { to_fallback: "added" });

    assert.strictEqual(i4n.t("to_fallback"), "added");
    assert.strictEqual(i4n.t("earth"), undefined);
  });

  it("add merges top-level keys into the language without changing the given translations", () => {
    const translations: TranslationSet = { en: { ...testTranslations.en } };
    const i4n = new I4n({ translations, language: "en" });

    i4n.add("en", { earth: "Earth", to_fallback: "added" });

    assert.strictEqual(i4n.t("earth"), "Earth");
    assert.strictEqual(i4n.t("to_fallback"), "added");
    assert.strictEqual(i4n.t("nested.key"), testTranslations.en.nested.key);
    assert.strictEqual(translations.en?.earth, testTranslations.en.earth);
  });
});
