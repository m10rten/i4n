import { I4n } from "i4n";

interface LanguageData {
  hello: string;
  key?: string;
}
type Language = "en" | "nl";
type TranslationSet = {
  [lang in Language]?: LanguageData;
};

const jsonLoader = async () => await import("./translations.json");

const i4n = new I4n<TranslationSet, Language>({
  language: "en",
  fallbackLanguage: "en",
  loader: jsonLoader,
});

console.log(i4n.t("hello")); // "Hello"

console.log("Swapping", i4n.switch("nl"));

console.log(i4n.t("hello"));

console.log(i4n.t("key"));
