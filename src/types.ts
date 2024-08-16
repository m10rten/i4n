type Extraction<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Record<string, unknown>
    ?
        | `${Key}.${Extraction<T[Key], Exclude<keyof T[Key], keyof unknown[]>> & string}`
        | `${Key}.${Exclude<keyof T[Key], keyof unknown[]> & string}`
    : never
  : never;

type Implementation<T> = Extraction<T, keyof T & string> | (keyof T & string);
export type Path<T, L extends string | number> = Implementation<T> extends string | keyof T
  ? RemovePrefix<`${L}.`, Implementation<T>>
  : keyof T;

export type Value<T, L extends string | number, P extends Path<T, L>> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends Path<T[Key], L>
      ? Value<T[Key], L, Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;

type RemovePrefix<TPrefix extends string, TString extends string> = TString extends `${TPrefix}${infer Rest}`
  ? Rest
  : TString;
