import { useEffect, useState } from "react";
import { I4n } from "i4n";

import "./App.css";

interface LanguageData {
  hello: string;
}
type Language = "en" | "nl";
type TranslationSet = {
  [lang in Language]?: LanguageData;
};

const translations = {
  en: {
    hello: "Hello World!",
  },
  nl: {
    hello: "Hallo Wereld!",
  },
} satisfies TranslationSet;

const i4n = new I4n({ translations, language: "en", fallbackLanguage: "en" });

function App() {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    i4n.switch(lang === "en" ? "nl" : "en");
  }, [lang]);

  return (
    <>
      <button onClick={() => setLang("nl")}>NL</button>
      <button onClick={() => setLang("en")}>EN</button>
      <hr />
      {i4n.t("hello")}
    </>
  );
}

export default App;
