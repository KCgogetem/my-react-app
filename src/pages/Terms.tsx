import React from "react";
import AppTheme from "../shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import SideMenu from "../components/SideMenu";
import Header from "../components/Header";
import Stack from "@mui/material/Stack";

const Terms: React.FC = () => {
  return (
    <AppTheme>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <SideMenu />
        <Box sx={{ flexGrow: 1 }}>
          <Header />
          <Stack spacing={2} sx={{ p: 4 }}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Terms of Service
              </Typography>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                Effective Date: [Insert Date]
              </Typography>
              <Typography variant="body1" paragraph>
                These Terms of Service (“Terms”) govern access to and use of the Services provided by [Your Company Name, Inc.], a Florida corporation (“Company”). By using the Services, you agree to these Terms.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>1. Eligibility</Typography>
              <Typography variant="body2" paragraph>
                You must be a business entity or authorized professional capable of entering into a binding contract.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>2. Services</Typography>
              <Typography variant="body2" paragraph>
                The Services provide AI-assisted comparative market analysis and data tools for real estate professionals. The Services do not provide appraisals, brokerage, legal, or financial advice.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>3. AI Outputs</Typography>
              <Typography variant="body2" paragraph>
                AI-generated outputs are estimates only and may be inaccurate. Customers are solely responsible for all decisions and representations made using the outputs.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>4. Customer Responsibilities</Typography>
              <Typography variant="body2" paragraph>Customers are responsible for:</Typography>
              <ul>
                <li>Compliance with all laws and professional rules</li>
                <li>Obtaining client consent</li>
                <li>Accuracy of data inputs</li>
                <li>Proper disclosures to clients</li>
              </ul>
              <Typography variant="h6" sx={{ mt: 3 }}>5. Client Data</Typography>
              <Typography variant="body2" paragraph>
                Customers retain ownership of their data. Company acts solely as a data processor.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>6. Intellectual Property</Typography>
              <Typography variant="body2" paragraph>
                Company retains all rights to the Platform, software, and AI models.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>7. License</Typography>
              <Typography variant="body2" paragraph>
                Company grants a limited, non-transferable license during an active subscription.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>8. Prohibited Uses</Typography>
              <Typography variant="body2" paragraph>
                Customers may not misuse the Platform, violate laws, or attempt to reverse engineer the Services.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>9. Fees</Typography>
              <Typography variant="body2" paragraph>
                Fees are billed in advance and are non-refundable except as required by law.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>10. Termination</Typography>
              <Typography variant="body2" paragraph>
                We may suspend or terminate access for violations or risk.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>11. Disclaimers</Typography>
              <Typography variant="body2" paragraph>
                THE SERVICES ARE PROVIDED “AS IS” WITHOUT WARRANTIES.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>12. Limitation of Liability</Typography>
              <Typography variant="body2" paragraph>
                Company’s total liability shall not exceed fees paid in the prior 12 months.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>13. Indemnification</Typography>
              <Typography variant="body2" paragraph>
                Customer agrees to indemnify Company for claims arising from misuse or violations.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>14. Governing Law</Typography>
              <Typography variant="body2" paragraph>
                These Terms are governed by the laws of the State of Florida.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>15. Changes</Typography>
              <Typography variant="body2" paragraph>
                We may update these Terms with notice.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>16. Contact</Typography>
              <Typography variant="body2" paragraph>
                [Your Company Name, Inc.]<br />
                [Address]<br />
                Email: legal@[yourdomain].com
              </Typography>
            </Paper>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default Terms;
