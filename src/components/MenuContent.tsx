import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import { useNavigate } from 'react-router-dom';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';

const mainListItems = [
  { text: 'Home', icon: <HomeRoundedIcon />, href: '/dashboard' },
  { text: 'Users', icon: <PeopleRoundedIcon />, href: '/users' },
  { text: 'CMAs', icon: <AssignmentRoundedIcon />, href: '/cma-results' },
  { text: 'Tasks', icon: <AssignmentRoundedIcon />, href: '/tasks' },
];

const secondaryListItems = [
  { text: 'Settings', icon: <SettingsRoundedIcon />, href: '/settings' },
  { text: 'About', icon: <InfoRoundedIcon />, href: '/privacy-policy' },
  { text: 'Feedback', icon: <HelpRoundedIcon />, href: '/feedback' },
];

export default function MenuContent() {
  const navigate = useNavigate();
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <Link href={item.href} underline="none" color="inherit" sx={{ display: 'flex', width: '100%' }}>
              <ListItemButton selected={index === 0}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <Link href={item.href} underline="none" color="inherit" sx={{ display: 'flex', width: '100%' }}>
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
