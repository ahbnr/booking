import { Model } from 'sequelize-typescript';
import { nameof } from 'ts-simple-nameof/index';
import { hasProperty } from 'common/dist';

export function LazyGetter<ModelType extends Model>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propertyResolver: (obj: ModelType) => any,
  options: { shouldBePresent?: boolean; convertNullToEmptyArray?: boolean } = {}
) {
  const shouldBePresent = options?.shouldBePresent || false;
  const convertNullToEmptyArray = options?.convertNullToEmptyArray || false;

  if (shouldBePresent && convertNullToEmptyArray) {
    throw new Error(
      'The options "shouldBePresent" and "convertNullToEmptyArray" are mutually exclusive.'
    );
  }

  const targetPropertyName = nameof<ModelType>(
    propertyResolver
  ) as keyof ModelType;

  const storageName = `_lazy${targetPropertyName}Storage`;

  return function (targetPrototype: ModelType, propertyKey: string) {
    const getter = async function (this: ModelType): Promise<unknown | null> {
      if (!hasProperty(this, storageName)) {
        Object.defineProperty(this, storageName, {
          value: null,
          writable: true,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyThis = this as any;
      const value = anyThis[storageName];

      if (value != null) {
        return value;
      } else {
        let queryResult = await this.$get(targetPropertyName);

        if (queryResult == null) {
          if (convertNullToEmptyArray) {
            queryResult = ([] as unknown) as typeof queryResult;
          } else if (shouldBePresent) {
            throw new Error(
              `The field ${targetPropertyName} should always be present but it is not right now. This should never happen and means there is an INCONSISTENCY IN THE DATABASE.`
            );
          }
        }

        anyThis[storageName] = queryResult;

        return queryResult;
      }
    };

    Object.defineProperty(targetPrototype, propertyKey, {
      get: getter,
      set: setReject,
    });
  };
}

function setReject(_: unknown) {
  throw new Error('Read-only property. Can not set value.');
}
