
  export type ReadonlyState<T> = {
    readonly [P in keyof T]: ReadOnlyState<T[P]>;
  };