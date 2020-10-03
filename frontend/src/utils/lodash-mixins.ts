import * as _ from 'lodash';

declare module "lodash" {
    interface LoDashStatic {
        minWith<TValue>(array: TValue[], comparator: (lhs: TValue, rhs:TValue) => number): TValue;
        sortWith<TValue>(array: TValue[], comparator: (lhs: TValue, rhs:TValue) => number): TValue[];
    }
    interface CollectionChain<T> {
        minWith(comparator: (lhs: T, rhs: T) => number): T;
        sortWith(comparator: (lhs: T, rhs: T) => number): CollectionChain<T>;
    }
}

_.mixin({
    minWith: function<T>(arr: T[], comparator: (lhs: T, rhs: T) => number): T {
        return _
            .map(arr)
            .reduce((min, next) => {
                if (comparator(min, next) > 0) {
                    return next;
                } else {
                    return min;
                }
            });
    },

    sortWith: function<T>(arr: T[], comparator: (lhs: T, rhs: T) => number): T[] {
        return [...arr].sort(comparator);
    }
});

export default _;