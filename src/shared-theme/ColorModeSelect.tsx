import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Icon from '@mui/material/Icon';
import { ColorModeContext } from './AppTheme';
import { useTheme } from '@mui/material/styles';

export default function ColorModeSelect(props: any) {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  return (
    <Tooltip title={`Toggle ${theme.palette.mode === 'dark' ? 'light' : 'dark'} mode`}>
      <IconButton onClick={colorMode.toggleColorMode} color="inherit" {...props}>
        {theme.palette.mode === 'dark' ? <Icon>brightness_7</Icon> : <Icon>brightness_4</Icon>}
      </IconButton>
    </Tooltip>
  );
}
