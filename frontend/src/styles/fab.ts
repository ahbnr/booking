import { Theme } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

export function fabStyle(theme: Theme): CSSProperties {
  return {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  };
}
