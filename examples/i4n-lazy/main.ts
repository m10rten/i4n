import { I4n } from "i4n";

interface LanguageData {
  hello: string;
  key?: string;
}
type Language = "en" | "nl" | "fr";
type TranslationSet = {
  [lang in Language]?: LanguageData;
};

async function loadFrench(): Promise<TranslationSet> {
  return await import("./fr.json");
}

export const translations = {
  en: {
    hello: "Hello World!",
    key: "Somehow we do",
  },
  nl: {
    hello: "Hallo Wereld!",
  },
} satisfies TranslationSet;

const i4n = new I4n({
  translations,
  language: "en",
  fallbackLanguage: "en",
});

const main = async () => {
  console.log(i4n.t("hello")); // "Hello"

  console.log("Swapping", i4n.switch("nl"));

  console.log(i4n.t("hello"));

  console.log(i4n.t("key"));

  i4n.lazy({ loader: loadFrench });
  await i4n.loaded({ lang: "fr" });
  i4n.switch("fr");
  console.log(i4n.t("hello"));
};

main();
