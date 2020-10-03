export {};

declare global {
    interface Array<T> {
        partition(predicate: (element: T) => boolean): [Array<T>, Array<T>];
        asyncPartition(predicate: (element: T) => Promise<boolean>): Promise<[Array<T>, Array<T>]>;
    }
}

Array.prototype.partition = function<T>(predicate: (element: T) => boolean): [Array<T>, Array<T>] {
    return this
        // based on https://codereview.stackexchange.com/a/162879
        .reduce((result, element) => {
                result[predicate(element) ? 0 : 1]
                    .push(element);

                return result;
            },
            [[], []]
        );
}
Array.prototype.asyncPartition = async function<T>(predicate: (element: T) => Promise<boolean>): Promise<[Array<T>, Array<T>]> {
    const self = this as T[];

    const promiseMap: Promise<[T, boolean]>[] = self.map(element => (
            async () => {
                return [element, await predicate(element)] as [T, boolean]
            }
        )()
    );

    return (
            await Promise.all(promiseMap)
        )
        // based on https://codereview.stackexchange.com/a/162879
        .reduce((
                result: [T[], T[]],
                elementPair: [T, boolean]
            ) => {
                const [element, predResult] = elementPair;

                result[predResult ? 0 : 1]
                    .push(element);

                return result;
            },
            [[], []]
        );
}
