import I4n, { type Path, type Value } from "../src/index.ts";

type Equal<A, B> = (<X>() => X extends A ? 1 : 2) extends <X>() => X extends B ? 1 : 2 ? true : false;
declare function typeOf<Actual>(value: Actual): {
  is<Expected>(...mismatch: Equal<Actual, Expected> extends true ? [] : [mismatch: never]): void;
};

type Dictionary = {
  hi: string;
  nested: { key: string };
  greet: (name: string) => string;
};
declare const translations: { en: Dictionary; es: Dictionary & { only_in_spanish: string } };
declare const dynamic: string;

const i4n = new I4n({ translations, language: "en", fallbackLanguage: "es" });

typeOf(i4n.t("hi")).is<string>();
typeOf(i4n.t("nested")).is<{ key: string }>();
typeOf(i4n.t("nested.key")).is<string>();
typeOf(i4n.t("only_in_spanish")).is<string>();
typeOf(i4n.t([dynamic, "nested.key"])).is<string>();
typeOf(i4n.t("hi", { name: "Ada", count: 1 })).is<string>();
typeOf(i4n.t("greet")).is<(name: string) => string>();
typeOf(i4n.t("greet", "Ada")).is<string>();

// @ts-expect-error unknown key
i4n.t("hii");
// @ts-expect-error unknown nested key
i4n.t("nested.missing");
// @ts-expect-error the fallback key is checked
i4n.t([dynamic, "hii"]);
// @ts-expect-error template arguments are checked
i4n.t("greet", 1);
// @ts-expect-error vars are an object
i4n.t("hi", "Ada");
// @ts-expect-error object values take no arguments
i4n.t("nested", {});
// @ts-expect-error unknown language
i4n.switch("de");
// @ts-expect-error unknown language
i4n.add("de", {});
// @ts-expect-error unknown fallback language
new I4n({ translations, language: "en", fallbackLanguage: "de" });

const declared = new I4n<{ en?: Dictionary; fr?: Dictionary }>({ translations: {}, language: "en" });
typeOf(declared.t("hi")).is<string>();
declared.add("fr", { hi: "Salut" });

interface Greeting {
  key: string;
}
interface Messages {
  nested: Greeting;
  list: string[];
}
declare const interfaced: { en: Messages };
const fromInterface = new I4n({ translations: interfaced, language: "en" });
typeOf(fromInterface.t("nested.key")).is<string>();
typeOf(fromInterface.t("list")).is<string[]>();
// @ts-expect-error array items are not paths
fromInterface.t("list.0");
// @ts-expect-error array properties are not paths
fromInterface.t("list.length");

const json = new I4n({ translations: { en: { hi: "Hello", nested: { key: "Key" } } }, language: "en" });
typeOf(json.t("nested.key")).is<string>();
// @ts-expect-error unknown nested key
json.t("nested.missing");

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- an `any` value is the case under test
declare const loose: { en: { hi: string; meta: any } };
const untyped = new I4n({ translations: loose, language: "en" });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
typeOf(untyped.t("meta.anything")).is<any>();

typeOf<Path<Dictionary>>("hi").is<"hi" | "nested" | "nested.key" | "greet">();
typeOf<Value<Dictionary, "nested.key">>("").is<string>();
