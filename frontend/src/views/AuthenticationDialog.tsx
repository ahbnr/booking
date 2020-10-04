import React, { ChangeEvent } from 'react';
import { boundClass } from 'autobind-decorator';
import { Button, Paper, TextField } from '@material-ui/core';
import { Client } from '../Client';
import { InteractionState, ViewingWeekdays } from '../InteractionState';

@boundClass
export default class AuthenticationDialog extends React.Component<
  Properties,
  State
> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      userName: '',
      userNameError: undefined,
      password: '',
      passwordError: undefined,
    };
  }

  onUsernameChanged(
    changeEvent: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    const value = changeEvent.target.value;

    this.setState({
      userName: value,
      userNameError: value.length > 0 ? undefined : 'Bitte ausfüllen',
    });
  }

  onPasswordChanged(
    changeEvent: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    const value = changeEvent.target.value;

    this.setState({
      password: value,
      passwordError: value.length > 0 ? undefined : 'Bitte ausfüllen',
    });
  }

  canBeSubmitted(): boolean {
    return (
      this.state.userName.length > 0 &&
      this.state.userNameError == null &&
      this.state.password.length > 0 &&
      this.state.passwordError == null
    );
  }

  async onSubmit() {
    await this.props.client.authenticate(
      this.state.userName,
      this.state.password
    );

    this.props.changeInteractionState(new ViewingWeekdays());
  }

  render() {
    return (
      <>
        <Paper>
          <TextField
            required
            label={'Nutzer'}
            value={this.state.userName}
            error={this.state.userNameError != null}
            helperText={this.state.userNameError}
            onChange={this.onUsernameChanged}
          />
          <TextField
            required
            type="password"
            label={'Passwort'}
            value={this.state.password}
            error={this.state.passwordError != null}
            helperText={this.state.passwordError}
            onChange={this.onPasswordChanged}
          />
          <Button disabled={!this.canBeSubmitted()} onClick={this.onSubmit}>
            Anmelden
          </Button>
        </Paper>
      </>
    );
  }
}

interface Properties {
  client: Client;
  changeInteractionState: (interactionState: InteractionState) => unknown;
}

interface State {
  userName: string;
  userNameError?: string;
  password: string;
  passwordError?: string;
}
