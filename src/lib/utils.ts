export function assertIsDefined<T>(
    value: T,
    message?: string
): asserts value is NonNullable<T> {
    if (value === undefined || value === null) {
        throw new Error(
            message !== undefined
                ? message
                : `Expected value to be defined, but received ${value}`
        )
    }
}
