import { I4nException } from "./errors.ts";
import type { Path, Value } from "./types.ts";

export type I4nConfig<T> = {
  translations: T;
  language: keyof T & string;
  fallbackLanguage?: keyof T & string;
};

type Dictionary<T> = NonNullable<T[keyof T]>;
type Vars = Record<string, string | number>;
type Args<V> = V extends (...args: infer A) => unknown ? A : V extends string ? [vars: Vars] : never;
type Result<V> = V extends (...args: never[]) => infer R ? R : V;

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
export class I4n<T extends Record<string, unknown>> {
  private _data: T;
  private _language: keyof T & string;
  private readonly _fallbackLanguage: (keyof T & string) | undefined;
  public constructor({ translations, language, fallbackLanguage }: I4nConfig<T>) {
    this._data = translations;
    this._language = language;
    this._fallbackLanguage = fallbackLanguage;

    this.t = this.t.bind(this);
    this.switch = this.switch.bind(this);
    this.add = this.add.bind(this);
  }

  /**
   * Get translations from your translations object with typesafety, input & output are typesafe meaning you always know if it works.
   * @param path the path to the translation, this is is typed for you based on the translations.
   * @returns the string, template function or nested object at the path. A key that is missing at runtime, for example in a partially filled language, returns `undefined`.
   */
  public t<P extends Path<Dictionary<T>>>(path: P | [string, P]): Value<Dictionary<T>, P>;

  /**
   * Call a template function with its typed arguments, or replace the `{name}` placeholders of a string with `vars`.
   * @param path the path to the function or string
   * @param args the typed parameters for the function, or the vars for the string
   */
  public t<P extends Path<Dictionary<T>>>(
    path: P | [string, P],
    ...args: Args<Value<Dictionary<T>, P>>
  ): Result<Value<Dictionary<T>, P>>;

  public t(path: string | [string, string], ...args: unknown[]): unknown {
    const value = this._lookup(Array.isArray(path) ? path : [path]);
    if (args.length === 0) return value;
    if (typeof value === "function") return value(...args);
    if (typeof value === "string") {
      const vars = (args[0] ?? {}) as Vars;
      return value.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
        Object.hasOwn(vars, name) ? String(vars[name]) : placeholder,
      );
    }
    return value;
  }

  public get active(): keyof T & string {
    return this._language;
  }

  public get languages(): Array<keyof T & string> {
    return Object.keys(this._data).filter((language) => this._data[language] != null) as Array<keyof T & string>;
  }

  private _get(language: string, key: string): unknown {
    return [language, ...key.split(".")].reduce<unknown>(
      (node, part) =>
        typeof node === "object" && node !== null && !Array.isArray(node) && Object.hasOwn(node, part)
          ? (node as Record<string, unknown>)[part]
          : undefined,
      this._data,
    );
  }

  private _lookup(keys: string[]): unknown {
    const [dynamicKey, typedKey] = keys;
    const languages = [this._language, this._fallbackLanguage].filter((language) => language !== undefined);
    const reference =
      typedKey === undefined
        ? undefined
        : languages.map((language) => this._get(language, typedKey)).find((value) => value !== undefined);
    for (const language of languages) {
      for (const key of keys) {
        const value = this._get(language, key);
        if (value === undefined) continue;
        if (key !== dynamicKey || reference === undefined || typeof value === typeof reference) return value;
      }
    }
    return undefined;
  }

  /**
   * Add translations to a language, or add a language. Top-level keys of the dictionary replace those of the language.
   * @param language the language to add to
   * @param dictionary the translations to add
   */
  public add(language: keyof T & string, dictionary: Partial<Dictionary<T>>): void {
    this._data = {
      ...this._data,
      [language]: { ...(Object.hasOwn(this._data, language) ? (this._data[language] as object) : {}), ...dictionary },
    };
  }

  /**
   * Switch languages in the translations and get different language output.
   * @param language language to switch to
   * @returns {void} - nothing.
   */
  public switch(language: keyof T & string): void {
    if (!Object.hasOwn(this._data, language) || this._data[language] == null)
      throw new I4nException("invalid-language", `Language "${language}" is not in the translations.`);
    this._language = language;
  }
}

export default I4n;
