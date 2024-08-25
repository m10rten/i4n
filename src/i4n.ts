/* eslint-disable @typescript-eslint/no-explicit-any */
import { I4nException } from "./errors";
import type { Path, Value } from "./types";

export type I4nConfig<T, L extends keyof T & string> = {
  language: L;
  fallbackLanguage?: string | undefined | null;
} & (
  | {
      translations: T;
      loader?: never;
    }
  | {
      translations?: never;
      loader: (() => Promise<T> | (T & Record<string, unknown>)) | undefined;
    }
);

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
export class I4n<T extends Record<string, unknown>, L extends keyof T & string = string> {
  private _loading: boolean = false;
  private _data: T = undefined as unknown as T;
  private _config: I4nConfig<T, L>;
  public constructor(config: I4nConfig<T, L>) {
    if (!config?.loader && !config?.translations)
      throw new I4nException({
        message: "Expected `loader` or `translations` but found neither.",
        type: "invalid-translations",
      });
    if (config.translations instanceof Set || config.translations instanceof Map || Array.isArray(config.translations))
      throw new I4nException({
        type: "invalid-translations",
        message: "Array, Set or Map cannot be used as translations require keys",
      });
    if (config.translations) {
      this._data = config.translations;
    }
    this._config = {
      language: config.language,
      fallbackLanguage: config.fallbackLanguage,
      ...(config?.loader !== undefined && !config.translations ? { loader: config?.loader } : {}),
      ...(config?.translations && !config.loader ? { translations: config?.translations } : {}),
    } as I4nConfig<T, L>;

    if (!config?.translations && !!config?.loader) {
      this._startLoader(config?.loader);
    }

    this.t = this.t.bind(this);
    this.switch = this.switch.bind(this);
  }

  private async _startLoader(loader?: undefined | (() => unknown), merge?: boolean | undefined) {
    try {
      if (loader === undefined) {
        return;
      }
      this._loading = true;
      const data = await loader();
      this._loading = false;

      if (merge) {
        this._data = { ...this._data, ...(data as T) };
      } else {
        this._data = data as T;
      }
    } catch (error: unknown) {
      if (error instanceof Error && !(error instanceof I4nException)) {
        throw new I4nException({ error });
      } else {
        throw new I4nException();
      }
    }
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
    if (!this._data) return undefined;
    const result = this._lookup(path);

    if (typeof result === "function" && args.length !== 0) return result(...args);

    const fbl = this._config.fallbackLanguage;
    const hasFallbackLang = fbl !== null && fbl !== undefined;

    const returned = result ?? (hasFallbackLang ? this._lookup(path, this._config.fallbackLanguage) : undefined);

    return returned;
  }

  public get active(): string {
    return this._config.language;
  }

  public get languages(): Array<keyof typeof this._data> {
    if (!this._data) throw new I4nException();
    return Object.keys(this._data);
  }

  private _lookup(
    path: string | undefined | [string] | [string, string],
    language: string | null | undefined = this._config.language,
  ): any {
    if (path === undefined) return undefined;
    language ??= this._config.language;

    if (!this._data) return undefined;

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

  public get ready(): boolean {
    return this._loading === false || this._data !== undefined;
  }

  public async loaded(options?: { interval?: number; signal?: AbortSignal; key?: string | undefined; lang?: L }) {
    const _options = { interval: 50, ...options };
    if (_options.signal?.aborted) return;

    const check = () => {
      return (
        this._loading === false &&
        (_options?.key ? this._lookup(_options?.key, options?.lang) : this._data) !== undefined
      );
    };

    return new Promise((resolve, reject) => {
      const checker = setInterval(() => {
        if (_options.signal?.aborted) {
          clearInterval(checker);
          return reject(false);
        }
        if (check()) {
          clearInterval(checker);
          return resolve(true);
        }
      }, _options.interval);
    });
  }

  public lazy({
    loader,
    data,
    lang,
  }:
    | {
        loader?: never;
        data?: Record<string, unknown>;
        lang?: string;
      }
    | {
        data?: never;
        lang?: never;
        loader?: undefined | (() => Record<string, unknown> | Promise<Record<string, unknown>>);
      }) {
    if (data && loader)
      throw new I4nException({
        type: "invalid-translations",
        message: "`data` or `loader` were both set while lazy loading, pick one to continue",
      });
    if (!data && !loader)
      throw new I4nException({
        type: "invalid-translations",
        message: "`data` or `loader` was not set while lazy loading, pick either to start lazy loading",
      });
    if (lang && data) this._data = { ...this._data, ...{ [lang]: data } };
    if (!lang && data) this._data = { ...this._data, ...data };
    if (loader !== undefined) {
      this._startLoader(loader, true);
    }
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
    this._config.language = language as L;
  }
}

export default I4n;
