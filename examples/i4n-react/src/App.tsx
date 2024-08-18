import { useState } from "react";
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

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "nl" : "en";
    setLang(newLang);
    i4n.switch(newLang);
  };

  return (
    <div>
      <button onClick={toggleLanguage}>Switch to {lang === "en" ? "Dutch" : "English"}</button>
      <hr />
      <p>{i4n.t("hello")}</p>
    </div>
  );
}

export default App;
