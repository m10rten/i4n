import { I4nException } from "./errors";
import type { Path, Value } from "./types";

export class I4n<T extends Record<string, unknown>, L extends keyof T & string> {
  private _data: T;
  private _lang: L;
  public constructor(props: { translations: T; language: L }) {
    if (props.translations instanceof Set)
      throw new I4nException("Set cannot be used as translations require keys for typesafety");
    this._data = props.translations;
    this._lang = props.language;
  }

  public t<P extends Path<T[L], L>>(path: P): Value<T[L], L, P> {
    const keys = String(path).split(".") as Array<keyof T[L]>;

    let result = this._data[this._lang];

    for (const key of keys) {
      result = result?.[key] as T[L];
      if (result === undefined) {
        return undefined as never;
      }
    }

    return result as Value<T[L], L, P>;
  }

  public switch(language: keyof T): void {
    if (!language) throw new I4nException("Language cannot be empty.");
    if (!this._data[language]) throw new I4nException("Language is not in the translations");
    this._lang = language as L;
  }
}

export default I4n;

// const translations = {
//   en: {
//     hi: "Hello",
//     earth: "World",
//     what: {
//       happened: "What happened?",
//     },
//   },
//   es: {
//     hi: "Ola",
//     earth: "Mundo",
//     what: {
//       happened: "¿Qué pasó?",
//     },
//   },
// } as const;

// const language: keyof typeof translations = "en" as const;
// const i4n = new I4n({
//   translations,
//   language,
// });

// console.log(i4n.t("hi"));

// console.log(i4n.t("what.happened"));
// console.log(i4n.t("what"));

// // console.log(i4n.t("hi"));

// i4n.switch("es");

// console.log(i4n.t("hi"));
// console.log(i4n.t("what.happened"));
