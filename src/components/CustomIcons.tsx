import * as React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

export function GoogleIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M21.35 11.1h-9.17v2.92h5.3c-.23 1.4-1.38 3.08-5.3 3.08-3.18 0-5.78-2.62-5.78-5.85s2.6-5.85 5.78-5.85c1.82 0 3.04.78 3.74 1.45l2.55-2.46C17.6 3.28 15.6 2.3 12.96 2.3 7.88 2.3 3.97 6.2 3.97 11.3s3.9 9 9 9c5.17 0 8.6-3.63 8.6-8.75 0-.59-.07-1.03-.22-1.45z" />
    </SvgIcon>
  );
}

export function FacebookIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M22 12.07C22 6.48 17.52 2 11.93 2 6.33 2 2 6.48 2 12.07 2 17.06 5.66 21.16 10.44 21.93v-6.9H8.08v-2.96h2.36V9.13c0-2.33 1.38-3.61 3.5-3.61.99 0 2.02.17 2.02.17v2.22h-1.14c-1.12 0-1.47.7-1.47 1.42v1.69h2.5l-.4 2.96h-2.1v6.9C18.34 21.16 22 17.06 22 12.07z" />
    </SvgIcon>
  );
}

export function SitemarkIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" sx={{ fontSize: 48 }}>
      <path d="M12 2L3.5 6.5v6.75C3.5 17.5 7 21 11 21s7.5-3.5 7.5-7.75V6.5L12 2z" />
    </SvgIcon>
  );
}
