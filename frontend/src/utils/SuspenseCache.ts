import { ADT, matchI } from 'ts-adt';
import { construct } from './constructAdt';
import { boundClass } from 'autobind-decorator';

type State<T> = ADT<{
  // eslint-disable-next-line @typescript-eslint/ban-types
  uninitialized: {};
  // eslint-disable-next-line @typescript-eslint/ban-types
  loading: { runningPromise: Promise<T> };
  loaded: { value: T };
}>;

@boundClass
export default class SuspenseCache<T> {
  private state: State<T> = construct('uninitialized', {});

  private promiseConstructor: () => Promise<T>;

  constructor(promiseConstructor: SuspenseCache<T>['promiseConstructor']) {
    console.log('Reconstructing');
    this.promiseConstructor = promiseConstructor;
  }

  async load(): Promise<T> {
    const result = await this.promiseConstructor();

    this.state = construct('loaded', { value: result });

    return result;
  }

  public renew(): SuspenseCache<T> {
    console.log('Renewing');
    return new SuspenseCache<T>(this.promiseConstructor);
  }

  public read(): T {
    return matchI(this.state)({
      uninitialized: () => {
        console.log('Initializing');
        const promise = this.load();
        this.state = construct('loading', { runningPromise: promise });
        throw promise;
      },
      loading: ({ runningPromise }) => {
        console.log('Rethrowing');
        throw runningPromise;
      },
      loaded: ({ value }) => value,
    });
  }
}
