/* eslint-disable @typescript-eslint/no-explicit-any */
import { I4nException } from "./errors";
import type { Path, Value } from "./types";

export interface I4nConfig<T, L extends keyof T & string> {
  language: L;
  fallbackLanguage?: string | undefined | null;
}

/**
 * @prop {translations} - the data required for the translation module to return text.
 *
 * @link https://github.com/m10rten/i4n/ - for more information
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
  private config: I4nConfig<T, L>;
  public constructor(config: { translations: T; language: L; fallbackLanguage?: string | undefined | null }) {
    if (config.translations instanceof Set || config.translations instanceof Map || Array.isArray(config.translations))
      throw new I4nException({
        type: "invalid-translations",
        message: "Array, Set or Map cannot be used as translations require keys",
      });
    this._data = config.translations;
    this.config = {
      language: config.language,
      fallbackLanguage: config.fallbackLanguage,
    };

    this.t = this.t.bind(this);
    this.switch = this.switch.bind(this);
  }

  /**
   * Get translations from your translations object with typesafety, input & output are typesafe meaning you always know if it works.
   * @param path the path to the translation, this is is typed for you based on the translations.
   * @returns string or undefined based on the path you provide.
   */
  public t<P extends Path<T[L], L>, P2 extends Path<T[L], L>, V extends Value<T[L], L, P>>(
    path: P | (string & {}) | [P | (string & {})] | [P | (string & {}), P2 | (string & {})],
  ): V;

  /**
   * You added parameters, expecting to find a function, do not force extra arguments if you are not expecting to find a function since that will confuse the type system and give you as a user the wrong types.
   * @param path the path to the function
   * @param args the typed parameters for this function
   */
  public t<
    P extends Path<T[L], L>,
    P2 extends Path<T[L], L>,
    V extends Value<T[L], L, P>,
    A extends V extends (...args: infer A) => any ? A : never,
    R extends V extends (...args: any[]) => any ? ReturnType<V> : V,
  >(path: (P | (string & {})) | [P | (string & {})] | [P | (string & {}), P2 | (string & {})], ...args: A): R;

  /**
   * `t` function on the `I4n` class.
   * @param path string to find in your translations.
   * @param args optional arguments to execute a template function.
   * @returns a string from the translations, a function or object, or the result of a function.
   */
  public t(path: (string & {}) | [string & {}] | [string & {}, string & {}], ...args: unknown[]): unknown {
    const result = this._lookup(path);

    if (typeof result === "function" && args.length !== 0) return result(...args);

    const fbl = this.config.fallbackLanguage;
    const hasFallbackLang = fbl !== null && fbl !== undefined;

    const returned = result ?? (hasFallbackLang ? this._lookup(path, this.config.fallbackLanguage) : undefined);

    return returned;
  }

  public get active(): string {
    return this.config.language;
  }

  public get languages(): Array<keyof typeof this._data> {
    return Object.keys(this._data);
  }

  private _lookup(
    path: string | undefined | [string] | [string, string],
    language: string | null | undefined = this.config.language,
  ): any {
    if (path === undefined) return undefined;
    language ??= this.config.language;
    const key = Array.isArray(path) ? path[0] : path;
    let hasFallbackKey = false;

    if (Array.isArray(path) && path.length === 2) hasFallbackKey = true;
    const fallbackKey = hasFallbackKey ? path[1] : undefined;

    if (key === undefined) return undefined;
    let result: any = this._data[language];

    const keys = String(key).split(".");
    for (const key of keys) {
      result = result?.[key];
      if (result === undefined && hasFallbackKey === false) {
        return undefined as never;
      } else if (result === undefined && hasFallbackKey) {
        break;
      }
    }

    return result ?? (fallbackKey ? this._lookup(fallbackKey) : undefined);
  }

  /**
   * Switch languages in the translations and get different language output.
   * @param language language to switch to
   * @returns {void} - nothing.
   */
  public switch(language: keyof T): void {
    if (!language) throw new I4nException({ type: "invalid-language", message: "Language cannot be empty." });
    if (!this._data[language])
      throw new I4nException({ type: "invalid-language", message: "Language is not in the translations" });
    this.config.language = language as L;
  }
}

export default I4n;
