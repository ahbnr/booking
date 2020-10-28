import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from '@material-ui/core';
import React from 'react';
import { boundClass } from 'autobind-decorator';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

@boundClass
export default class SplitButton extends React.Component<Properties, State> {
  private anchorRef = React.createRef<HTMLDivElement>();

  constructor(props: Properties) {
    super(props);

    this.state = {
      selectedIndex: 0,
      dropDownOpen: false,
    };
  }

  handleClick() {
    this.props.onClick(
      this.props.options[this.state.selectedIndex],
      this.state.selectedIndex
    );
  }

  handleToggle() {
    this.setState({
      dropDownOpen: !this.state.dropDownOpen,
    });
  }

  handleClose(event: React.MouseEvent<Document, MouseEvent>) {
    if (
      this.anchorRef.current != null &&
      this.anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    this.setState({
      dropDownOpen: false,
    });
  }

  handleMenuItemClick(
    event:
      | React.MouseEvent<HTMLLIElement>
      | React.MouseEvent<HTMLAnchorElement>,
    index: number
  ) {
    this.setState({
      selectedIndex: index,
      dropDownOpen: false,
    });
  }

  render() {
    return (
      <>
        <ButtonGroup variant="contained" color="primary" ref={this.anchorRef}>
          <Button onClick={this.handleClick}>
            {this.props.options[this.state.selectedIndex]}
          </Button>
          <Button color="primary" size="small" onClick={this.handleToggle}>
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
        <Popper
          open={this.state.dropDownOpen}
          anchorEl={this.anchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={this.handleClose}>
                  <MenuList id="split-button-menu">
                    {this.props.options.map((option, index) => (
                      <MenuItem
                        key={option}
                        selected={index === this.state.selectedIndex}
                        onClick={(event) =>
                          this.handleMenuItemClick(event, index)
                        }
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </>
    );
  }
}

interface Properties {
  onClick: (item: string, index: number) => unknown;
  options: string[];
}

interface State {
  selectedIndex: number;
  dropDownOpen: boolean;
}
