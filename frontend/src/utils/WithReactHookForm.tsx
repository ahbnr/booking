import React, { FunctionComponent } from 'react';
import { FieldValues, Mode, useForm, UseFormReturn } from 'react-hook-form';

export type WithForm<
  TFieldValues extends FieldValues = FieldValues
> = UseFormReturn<TFieldValues>;

export function withForm(
  useFormProps: {
    mode?: Mode;
  } = {}
): <TFieldValues extends FieldValues, P>(
  Component: React.ComponentType<P>
) => FunctionComponent<P & WithForm<TFieldValues>> {
  return function <TFieldValues extends FieldValues, P>(
    Component: React.ComponentType<P>
  ) {
    const WithFormWrapper = (props: P) => {
      const formProps = useForm<TFieldValues>(useFormProps);

      return <Component {...props} {...formProps} />;
    };

    return WithFormWrapper;
  };
}
