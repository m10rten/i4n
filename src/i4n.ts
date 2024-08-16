import { I4nException } from "./errors";
import type { Path, Value } from "./types";

/**
 * @prop {translations} - the data required for the translation module to return text.
 *
 * Should be in [lang: string]: {key: string | object} structure
 * @example
 * ```ts
 * const translations = {
 *   en: {
 *     hi: "Hello",
 *   },
 * };
 * ```
 *
 * @prop {language} - the default language
 * should be string and a key of the translations object.
 *
 * @class I4n
 * @module I4n
 *
 * @example
 * ```ts
 * const i4n = new I4n({translations, language});
 * const text = i4n.t("hi"); // "Hello"
 * ```
 */
export class I4n<T extends Record<string, unknown>, L extends keyof T & string> {
  private _data: T;
  private _lang: L;
  public constructor(props: { translations: T; language: L }) {
    if (props.translations instanceof Set || props.translations instanceof Map || Array.isArray(props.translations))
      throw new I4nException("Array, Set or Map cannot be used as translations require keys");
    this._data = props.translations;
    this._lang = props.language;
  }

  /**
   * Get translations from your translations object with typesafety, input & output are typesafe meaning you always know if it works.
   * @param path the path to the translation, this is is typed for you based on the translations.
   * @returns string or undefined based on the path you provide.
   */
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

  /**
   * Switch languages in the translations and get different language output.
   * @param language language to switch to
   * @returns {void} - nothing.
   */
  public switch(language: keyof T): void {
    if (!language) throw new I4nException("Language cannot be empty.");
    if (!this._data[language]) throw new I4nException("Language is not in the translations");
    this._lang = language as L;
  }
}

export default I4n;
