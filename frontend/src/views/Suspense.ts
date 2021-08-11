import { ADT, matchI } from 'ts-adt';
import React from 'react';
import { construct } from '../utils/constructAdt';
import { boundClass } from 'autobind-decorator';

type ActionState<T> = ADT<{
  // eslint-disable-next-line @typescript-eslint/ban-types
  uninitialized: {};
  // eslint-disable-next-line @typescript-eslint/ban-types
  loading: {};
  loaded: { value: T };
}>;

@boundClass
export default class Suspense<T> extends React.PureComponent<
  Properties<T>,
  State<T>
> {
  constructor(props: Properties<T>) {
    super(props);

    this.state = {
      actionState: construct('uninitialized', {}),
    };
  }
  async componentDidMount() {
    await this.load();
  }

  async componentDidUpdate(
    prevProps: Readonly<Properties<T>>,
    _prevState: Readonly<State<T>>,
    _snapshot?: any
  ) {
    if (prevProps.asyncAction !== this.props.asyncAction) {
      await this.load();
    }
  }

  async load() {
    this.setState({
      actionState: construct('uninitialized', {}),
    });

    if (this.props.asyncAction != null) {
      this.setState({
        actionState: construct('loading', {}),
      });

      try {
        const value = await this.props.asyncAction;

        if (this.props.onLoaded != null) {
          this.props.onLoaded(value);
        }

        this.setState({
          actionState: construct('loaded', { value }),
        });
      } catch (e) {
        this.setState(
          {
            actionState: construct('uninitialized', {}),
          },
          () => {
            // Make async exception catchable by ErrorBoundary by rethrowing in React lifecycle
            throw e;
          }
        );
      }
    }
  }

  render() {
    return matchI(this.state.actionState)({
      uninitialized: () => this.props.fallback,
      loading: () => this.props.fallback,
      loaded: ({ value }) => this.props.content(value),
    });
  }
}

interface Properties<T> {
  asyncAction: Promise<T> | undefined;
  fallback: React.ReactNode;
  onLoaded?: (actionResult: T) => unknown;
  content: (actionResult: T) => React.ReactNode;
}

interface State<T> {
  actionState: ActionState<T>;
}
