/* eslint-disable @typescript-eslint/no-explicit-any */
import I4n, { I4nException } from "../src";

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
type TranslationSet = Record<string, TranslationData>;

const testTranslations: TranslationSet = {
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
};

const testDefaultLanguage = "en" satisfies keyof typeof testTranslations;

const testJsonLoader = async () => testTranslations;
const testEmptyLoader = async () => ({}) as typeof testTranslations;

describe("I4n", () => {
  let i4n: I4n<TranslationSet, typeof testDefaultLanguage>;
  beforeEach(() => {
    i4n = new I4n({
      translations: testTranslations,
      language: testDefaultLanguage,
    });
  });

  test("If basic init works", () => {
    i4n = new I4n({
      translations: testTranslations,
      language: testDefaultLanguage,
    });

    expect(i4n).toBeInstanceOf(I4n);
  });

  test("If simple retrieval works for single key", () => {
    expect(i4n.t("earth")).toEqual(testTranslations["en"]?.earth);
  });

  test("If nested translations can be retrieved with a dot notation", () => {
    expect(i4n.t("nested.key")).toEqual(testTranslations["en"]?.nested.key);
  });

  test("If the module throws an error when passing a Set", () => {
    try {
      new I4n({ translations: new Set([]) as any, language: "en" });
    } catch (e) {
      expect(e).toBeInstanceOf(I4nException);
    }
  });

  test("If switching the language works", () => {
    expect(i4n.t("earth")).toBe(testTranslations["en"]?.earth);

    expect(i4n.switch("es")).toBe(void 0);

    expect(i4n.t("earth")).toBe(testTranslations["es"]?.earth);
  });

  test("If the module throws when switching to a language that does not exist", () => {
    try {
      i4n.switch("not-a-country-code");
    } catch (e) {
      expect(e).toBeInstanceOf(I4nException);
    }
  });

  test("If the module can handle templating with a single string parameter", () => {
    expect(i4n.t("single_template")).toBeInstanceOf(Function);
    const test_data = "john";
    expect(i4n.t("single_template", test_data)).toBe(testTranslations["en"]?.single_template(test_data));
  });

  test("If the module can handle templating with an object parameter", () => {
    expect(i4n.t("object_template")).toBeInstanceOf(Function);
    const test_input = { count: 4, type: "ice" };
    expect(i4n.t("object_template", test_input)).toBe(testTranslations["en"]?.object_template(test_input));
  });

  test("If the t works detached from the i4n instance", () => {
    const { t } = i4n;
    expect(t("earth")).toBe(testTranslations["en"]?.earth);
  });

  test("If it works with a fallback key and random strings", () => {
    expect(i4n.t("to_fallback")).toBe(undefined);
    expect(i4n.t(["to_fallback"])).toBe(undefined);
    expect(i4n.t(["to_fallback", "fallback"])).toBe(testTranslations["en"]?.fallback);
  });

  test("An undefined key should return undefined", () => {
    expect(i4n.t(undefined as unknown as string)).toBe(undefined);
  });

  test("To see if an empty language switch thrws error", () => {
    try {
      i4n.switch(undefined as unknown as string);
    } catch (e) {
      expect(e).toBeInstanceOf(I4nException);
      if (e instanceof I4nException) {
        expect(e.type).toBe("invalid-language");
      }
    }
  });

  test("To see if a fallback language works", () => {
    i4n.switch("es");
    expect(i4n.t("only_in_english")).toBe(undefined);
    const _i4n = new I4n({ translations: testTranslations, language: "es", fallbackLanguage: "en" });
    expect(_i4n.t("only_in_english")).toBe(testTranslations["en"]?.only_in_english);
  });

  test("If the active language can be get", () => {
    i4n.switch("en");
    expect(i4n.active).toBe("en");

    i4n.switch("es");
    expect(i4n.active).toBe("es");
  });

  test("If the list of languages can be get", () => {
    expect(i4n.languages).toEqual(["en", "es"]);
  });

  test("If the loader can load in any data through lazyloading", async () => {
    const i4n = new I4n<typeof testTranslations>({ language: "en", loader: testJsonLoader });
    await i4n.loaded();
    expect(i4n.t("earth")).toBe(testTranslations["en"]?.earth);
  });

  test("If the ready state is good before and after the loader", async () => {
    const i4n = new I4n<typeof testTranslations>({ language: "en", loader: testJsonLoader });
    expect(i4n.ready).toBe(false);
    await i4n.loaded();
    expect(i4n.ready).toBe(true);
    expect(i4n.t("earth")).toBe(testTranslations["en"]?.earth);
  });

  test("If the t function returns undefined if the data is undefined from the loader", async () => {
    const i4n = new I4n<typeof testTranslations>({ language: "en", loader: testEmptyLoader });
    expect(i4n.ready).toBe(false);
    await i4n.loaded();
    expect(i4n.ready).toBe(true);
    expect(i4n.t("earth")).toBe(undefined);
  });
});
