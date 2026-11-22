import { I4n } from "i4n";
import json from "./translations.json";

interface LanguageData {
  hello: string;
  key?: string;
}
type Language = "en" | "nl";
type TranslationSet = {
  [lang in Language]?: LanguageData;
};

const translations: TranslationSet = json;

const i4n = new I4n({
  translations,
  language: "en",
  fallbackLanguage: "en",
});

const main = () => {
  console.log(i4n.t("hello")); // "Hello"

  console.log("Swapping", i4n.switch("nl"));

  console.log(i4n.t("hello")); // "Hallo"

  console.log(i4n.t("key")); // undefined;
};

main();
