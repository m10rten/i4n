import { I4n } from "i4n";

interface LanguageData {
  hello: string;
  key?: string;
}
type Language = "en" | "nl";
type TranslationSet = {
  [lang in Language]?: LanguageData;
};

export const translations = {
  en: {
    hello: "Hello World!",
    key: "Somehow we do",
  },
  nl: {
    hello: "Hallo Wereld!",
  },
} satisfies TranslationSet;

const i4n = new I4n({ translations, language: "en", fallbackLanguage: "en" });

console.log(i4n.t("hello")); // "Hello"

console.log("Swapping", i4n.switch("nl"));

console.log(i4n.t("hello"));

console.log(i4n.t("key"));
