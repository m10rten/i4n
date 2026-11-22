type SubPath<V, K extends string> =
  // An `any` value would recurse without end (TS2589), so it accepts any sub path.
  0 extends 1 & V
    ? `${K}.${string}`
    : V extends ((...args: never[]) => unknown) | readonly unknown[]
      ? never
      : V extends object
        ? `${K}.${Path<V>}`
        : never;

export type Path<D> = D extends unknown ? { [K in keyof D & string]: K | SubPath<D[K], K> }[keyof D & string] : never;

export type Value<D, P extends string> = D extends unknown
  ? P extends keyof D
    ? D[P]
    : P extends `${infer K}.${infer Rest}`
      ? K extends keyof D
        ? Value<D[K], Rest>
        : never
      : never
  : never;
