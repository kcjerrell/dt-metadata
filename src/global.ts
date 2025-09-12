declare type ReadonlyState<T> = {
	readonly [P in keyof T]: ReadonlyState<T[P]>
}
