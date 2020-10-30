import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import { boundClass } from 'autobind-decorator';
import { hasProperty } from 'common/dist';

@boundClass
export default class DeleteConfirmer extends React.Component<
  Properties,
  State
> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      dialogOpen: false,
      originalOnClick: undefined,
    };
  }

  handleDelete(event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    this.handleClose();
    if (this.state.originalOnClick != null) {
      this.state.originalOnClick(event);
    }
  }

  handleClose() {
    this.setState({
      dialogOpen: false,
    });
  }

  componentDidMount() {
    this.retrieveOnClick();
  }

  componentDidUpdate(
    prevProps: Readonly<Properties>,
    prevState: Readonly<State>,
    snapshot?: any
  ) {
    this.retrieveOnClick();
  }

  getChild(): React.ReactElement<any> & {
    props: { onClick: State['originalOnClick'] };
  } {
    const child = React.Children.only(this.props.children);

    if (
      !(
        React.isValidElement(child) &&
        child != null &&
        typeof child === 'object' &&
        hasProperty(child, 'props') &&
        hasProperty(child.props, 'onClick') &&
        typeof child.props.onClick === 'function'
      )
    ) {
      throw new Error('Child must have onClick property.');
    }

    return child;
  }

  retrieveOnClick() {
    const child = this.getChild();

    const originalOnClick = child.props.onClick;
    if (originalOnClick != this.state.originalOnClick) {
      this.setState({
        originalOnClick: originalOnClick,
      });
    }
  }

  onClickReplacement(
    _: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) {
    this.setState({
      dialogOpen: true,
    });
  }

  render() {
    const child = this.getChild();
    const newProps = {
      ...child.props,
      onClick: this.onClickReplacement,
    };

    return (
      <>
        {React.cloneElement(child, newProps)}
        <Dialog open={this.state.dialogOpen} onClose={this.handleClose}>
          <DialogTitle>{'Wirklich löschen?'}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Soll {this.props.name} wirklich gelöscht werden?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleClose}
              color="primary"
              autoFocus
            >
              Abbrechen
            </Button>
            <Button
              variant="contained"
              onClick={this.handleDelete}
              color="secondary"
            >
              Löschen
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

interface Properties {
  name: string;
}

interface State {
  dialogOpen: boolean;
  originalOnClick?: (
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) => unknown;
}
