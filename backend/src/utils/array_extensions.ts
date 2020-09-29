export {};

declare global {
    interface Array<T> {
        partition(predicate: (element: T) => boolean): [Array<T>, Array<T>];
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