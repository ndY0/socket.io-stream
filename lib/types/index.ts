import { IOStream } from "../iostream";

type AnyOf<T> = T | T[] | ObjectOf<T>[] | ObjectOf<T>;

interface ObjectOf<T> {
    [x: string]: T | T[],
    [y: number]: T | T[],
}

export type {AnyOf, ObjectOf}