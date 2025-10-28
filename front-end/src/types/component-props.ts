export type WithClassName<T = Record<string, unknown>> = T & {
  className?: string;
};
