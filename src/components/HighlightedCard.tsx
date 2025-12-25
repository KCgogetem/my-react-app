import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function HighlightedCard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      sx={{
        height: '100%',
        bgcolor: 'rgba(23, 25, 35, 0.7)',
        border: '1px solid',
        borderColor: 'rgba(255,255,255,0.07)',
        boxShadow: '0 2px 16px 0 rgba(0,0,0,0.25)',
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        p: 2.5,
        minWidth: 220,
        maxWidth: 260,
        minHeight: 140,
        maxHeight: 260,
      }}
    >
      <CardContent sx={{ p: 0, width: '100%' }}>
        <InsightsRoundedIcon sx={{ color: '#b4c0d3', fontSize: 32, mb: 1 }} />
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{ fontWeight: 600, color: 'white', mb: 0.5 }}
        >
          Explore your data
        </Typography>
        <Typography sx={{ color: '#b4c0d3', mb: 2, fontSize: 15, fontWeight: 400 }}>
          Uncover performance and visitor insights with our data wizardry.
        </Typography>
        <Button
          variant="contained"
          size="small"
          color="primary"
          endIcon={<ChevronRightRoundedIcon />}
          fullWidth={isSmallScreen}
          sx={{
            background: 'linear-gradient(90deg, #23272f 0%, #23272f 100%)',
            color: 'white',
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: '0 1px 4px 0 rgba(0,0,0,0.15)',
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(90deg, #2a2e38 0%, #23272f 100%)',
            },
          }}
        >
          Get insights
        </Button>
      </CardContent>
    </Card>
  );
}
