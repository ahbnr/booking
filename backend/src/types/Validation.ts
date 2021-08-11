type ValidationErrorT = {
  kind: 'error';
  message: string;
};

type ValidationSuccessT = {
  kind: 'success';
};

export type Validation = ValidationSuccessT | ValidationErrorT;

export function ValidationSuccess(): ValidationSuccessT {
  return { kind: 'success' };
}
export function ValidationError(message: string): ValidationErrorT {
  return { kind: 'error', message: message };
}
