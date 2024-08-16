import I4n, { I4nException } from "../src";

type TranslationData = {
  earth: string;
  nested: {
    key: string;
  };
};
type TranslationSet = Record<string, TranslationData>;

const testTranslations: TranslationSet = {
  en: {
    earth: "world",

    nested: {
      key: "english key",
    },
  },
  es: {
    earth: "Mundo",

    nested: {
      key: "key espanol",
    },
  },
};

const testDefaultLanguage = "en" satisfies keyof typeof testTranslations;

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
});
