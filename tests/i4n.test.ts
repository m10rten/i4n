/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import I4n, { I4nException } from "../src/index.js";

type TranslationData = {
  earth: string;
  nested: {
    key: string;
  };
  to_fallback?: string | undefined;
  only_in_english?: string | undefined;
  fallback: string;
  single_template: (name: string) => string;

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

const testJsonLoader = async () => testTranslations;
const testEmptyLoader = async () => ({}) as typeof testTranslations;
const testAnotherLoader = async () => ({
  fr: {
    earth: "Terre",
  },
});

describe("I4n", () => {
  let i4n: I4n<typeof testTranslations, typeof testDefaultLanguage>;
  beforeEach(() => {
    i4n = new I4n({
      translations: testTranslations,
      language: testDefaultLanguage,
    });
  });

  it("If basic init works", () => {
    i4n = new I4n({
      translations: testTranslations,
      language: testDefaultLanguage,
    });

    assert.ok(i4n instanceof I4n);
  });

  it("If simple retrieval works for single key", () => {
    assert.deepStrictEqual(i4n.t("earth"), testTranslations["en"]?.earth);
  });

  it("If nested translations can be retrieved with a dot notation", () => {
    assert.deepStrictEqual(i4n.t("nested.key"), testTranslations["en"]?.nested.key);
  });

  it("If the module throws an error when passing a Set", () => {
    assert.throws(() => new I4n({ translations: new Set([]) as any, language: "en" }), I4nException);
  });

  it("If switching the language works", () => {
    assert.strictEqual(i4n.t("earth"), testTranslations["en"]?.earth);

    assert.strictEqual(i4n.switch("es"), undefined);

    assert.strictEqual(i4n.t("earth"), testTranslations["es"]?.earth);
  });

  it("If the module throws when switching to a language that does not exist", () => {
    assert.throws(() => i4n.switch("not-a-country-code"), I4nException);
  });

  it("If the module can handle templating with a single string parameter", () => {
    assert.ok(i4n.t("single_template") instanceof Function);
    const test_data = "john";
    assert.strictEqual(i4n.t("single_template", test_data), testTranslations["en"]?.single_template(test_data));
  });

  it("If the module can handle templating with an object parameter", () => {
    assert.ok(i4n.t("object_template") instanceof Function);
    const test_input = { count: 4, type: "ice" };
    assert.strictEqual(i4n.t("object_template", test_input), testTranslations["en"]?.object_template(test_input));
  });

  it("If the t works detached from the i4n instance", () => {
    const { t } = i4n;
    assert.strictEqual(t("earth"), testTranslations["en"]?.earth);
  });

  it("If it works with a fallback key and random strings", () => {
    assert.strictEqual(i4n.t("to_fallback"), undefined);
    assert.strictEqual(i4n.t(["to_fallback"]), undefined);
    assert.strictEqual(i4n.t(["to_fallback", "fallback"]), testTranslations["en"]?.fallback);
  });

  it("An undefined key should return undefined", () => {
    assert.strictEqual(i4n.t(undefined as unknown as string), undefined);
  });

  it("To see if an empty language switch thrws error", () => {
    assert.throws(
      () => i4n.switch(undefined as unknown as string),
      (e) => e instanceof I4nException && e.type === "invalid-language",
    );
  });

  it("To see if a fallback language works", () => {
    i4n.switch("es");
    assert.strictEqual(i4n.t("only_in_english"), undefined);
    const _i4n = new I4n({ translations: testTranslations, language: "es", fallbackLanguage: "en" });
    assert.strictEqual(_i4n.t("only_in_english"), testTranslations["en"]?.only_in_english);
  });

  it("If the active language can be get", () => {
    i4n.switch("en");
    assert.strictEqual(i4n.active, "en");

    i4n.switch("es");
    assert.strictEqual(i4n.active, "es");
  });

  it("If the list of languages can be get", () => {
    assert.deepStrictEqual(i4n.languages, ["en", "es"]);
  });

  it("If the loader can load in any data through lazyloading", async () => {
    const i4n = new I4n<typeof testTranslations>({ language: "en", loader: testJsonLoader });
    await i4n.loaded();
    assert.strictEqual(i4n.t("earth"), testTranslations["en"]?.earth);
  });

  it("If the ready state is good before and after the loader", async () => {
    const i4n = new I4n<typeof testTranslations>({ language: "en", loader: testJsonLoader });
    assert.strictEqual(i4n.ready, false);
    await i4n.loaded();
    assert.strictEqual(i4n.ready, true);
    assert.strictEqual(i4n.t("earth"), testTranslations["en"]?.earth);
  });

  it("If the t function returns undefined if the data is undefined from the loader", async () => {
    const i4n = new I4n<typeof testTranslations>({ language: "en", loader: testEmptyLoader });
    assert.strictEqual(i4n.ready, false);
    await i4n.loaded();
    assert.strictEqual(i4n.ready, true);
    assert.strictEqual(i4n.t("earth"), undefined);
  });

  it("If the t function will return an undefined when not loaded", async () => {
    const i4n = new I4n<typeof testTranslations>({ language: "en", loader: testJsonLoader });
    assert.strictEqual(i4n.ready, false);
    assert.strictEqual(i4n.t("earth"), undefined);
    await i4n.loaded();
    assert.strictEqual(i4n.ready, true);
    assert.strictEqual(i4n.t("earth"), testTranslations["en"]?.earth);
  });

  it("If the late lazy loading works after init", async () => {
    const i4n = new I4n<typeof testTranslations>({ language: "en", loader: testJsonLoader });
    await i4n.loaded();

    i4n.lazy({ loader: testAnotherLoader });
    await i4n.loaded({ lang: "fr" });
    assert.ok(new Set<string>(i4n.languages).has("fr"));

    i4n.switch("fr");
    assert.strictEqual(i4n.t("earth"), "Terre");
  });

  it("If the late lazy loading still makes the existing keys work", async () => {
    const i4n = new I4n<typeof testTranslations>({ language: "en", loader: testJsonLoader });
    await i4n.loaded();

    i4n.lazy({ loader: testAnotherLoader });
    await i4n.loaded({ lang: "fr" });

    i4n.switch("en");
    assert.strictEqual(i4n.t("earth"), testTranslations["en"]?.earth);
  });

  it("If the lazy loading works with just data and no loader", () => {
    const i4n = new I4n<TranslationSet>({ language: "en", translations: {} });
    assert.strictEqual(i4n.t("earth"), undefined);
    i4n.lazy({
      data: {
        ...testTranslations["en"],
      },
      lang: "en",
    });

    assert.strictEqual(i4n.t("earth"), testTranslations["en"]?.earth);
  });

  it("If the lazy loading throws when no data and loader is passed, and when both are passed", () => {
    const i4n = new I4n<TranslationSet>({ language: "en", translations: {} });
    assert.throws(() => i4n.lazy({ data: testTranslations as any, loader: testJsonLoader as any }), I4nException);

    assert.throws(() => i4n.lazy({}), I4nException);
  });
});
