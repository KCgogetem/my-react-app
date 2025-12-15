import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

interface Props {
  children?: React.ReactNode;
  disableCustomTheme?: boolean;
}

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});

export default function AppTheme({ children, disableCustomTheme }: Props) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = React.useState<'light' | 'dark'>(
    prefersDark ? 'dark' : 'light'
  );

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const theme = React.useMemo(() => {
    const t = createTheme({
      palette: {
        mode,
      },
    });

    // add a small helper to conditionally apply styles based on mode
    (t as any).applyStyles = (m: string, styles: any) => {
      return m === mode ? styles : {};
    };

    return t;
  }, [mode]);

  if (disableCustomTheme) return <>{children}</>;

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}
