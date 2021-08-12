type ValidationErrorT<ErrorT> = {
  kind: 'error';
  error: ErrorT;
};

type ValidationSuccessT<SuccessT> = { kind: 'success'; result: SuccessT };

export type Validation<SuccessT, ErrorT> =
  | ValidationSuccessT<SuccessT>
  | ValidationErrorT<ErrorT>;

export function ValidationSuccess<SuccessT>(
  result: SuccessT
): ValidationSuccessT<SuccessT> {
  return { kind: 'success', result };
}

export function ValidationError<ErrorT>(
  error: ErrorT
): ValidationErrorT<ErrorT> {
  return { kind: 'error', error };
}
