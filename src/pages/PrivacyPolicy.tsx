import React from "react";
import AppTheme from "../shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import SideMenu from "../components/SideMenu";
import Header from "../components/Header";
import Stack from "@mui/material/Stack";

const PrivacyPolicy: React.FC = () => {
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
                Privacy Policy
              </Typography>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                Effective Date: 1/1/2026
              </Typography>
              <Typography variant="body1" paragraph>
                This Privacy Policy describes the privacy practices of CMPR inc, a Florida corporation (“Company,” “we,” “our,” or “us”) with respect to our websites, web applications, software platforms, and related services (collectively, the “Platform” or “Services”).
              </Typography>
              <Typography variant="body1" paragraph>
                We provide technology solutions that assist real estate professionals with comparative market analyses (CMAs), property valuation insights, and related analytics, including features powered by artificial intelligence (“AI”). We are committed to protecting the privacy and security of personal information entrusted to us.
              </Typography>
              <Typography variant="body1" paragraph>
                This Privacy Policy explains:
              </Typography>
              <ul>
                <li>What information we collect</li>
                <li>How we use it</li>
                <li>How it is shared</li>
                <li>How it is protected</li>
                <li>The rights available to individuals under applicable privacy laws</li>
              </ul>
              <Typography variant="h6" sx={{ mt: 3 }}>1. Definitions</Typography>
              <ul>
                <li><b>Personal Information</b> means information that identifies, relates to, describes, or can reasonably be linked to an identifiable individual.</li>
                <li><b>Customer</b> refers to real estate agents, brokers, teams, or firms that subscribe to or use our Services.</li>
                <li><b>Client</b> refers to a customer’s consumer, seller, buyer, or prospective buyer/seller.</li>
                <li><b>Non-Personal Information</b> means aggregated, anonymized, or de-identified data that cannot reasonably be linked to an individual.</li>
              </ul>
              <Typography variant="h6" sx={{ mt: 3 }}>2. Scope</Typography>
              <Typography variant="body1" paragraph>
                This Privacy Policy applies to:
              </Typography>
              <ul>
                <li>All users of our Platform</li>
                <li>Information collected through our Services</li>
                <li>Information collected through customer support, onboarding, and communications</li>
              </ul>
              <Typography variant="body2" paragraph>
                This Policy does not apply to third-party websites, MLS systems, or services linked from our Platform.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>3. Information We Collect</Typography>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>A. Information Collected From Customers</Typography>
              <Typography variant="body2" paragraph>
                We may collect the following categories of Personal Information from Customers:
              </Typography>
              <ul>
                <li><b>Account Information:</b> Name, business name, mailing address, phone number, email address, username, password</li>
                <li><b>Billing Information:</b> Payment method details (processed securely through third-party payment processors; we do not store full credit card numbers)</li>
                <li><b>Usage & Technical Data:</b> IP address, device identifiers, browser type, operating system, pages viewed, session duration, feature usage, and error logs</li>
                <li><b>Communications:</b> Support requests, feedback, survey responses, and other communications</li>
              </ul>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>B. Information Relating to Clients of Customers</Typography>
              <Typography variant="body2" paragraph>
                We process Client information solely on behalf of and at the direction of our Customers. This may include:
              </Typography>
              <ul>
                <li>Name, email address, phone number</li>
                <li>Property address and real estate characteristics</li>
                <li>Valuation data, CMA inputs, and outputs</li>
                <li>Publicly available real estate data</li>
              </ul>
              <Typography variant="body2" paragraph>
                Clients are not our customers. Customers are responsible for obtaining all required consents from their Clients.
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>C. Data From Third-Party Sources</Typography>
              <Typography variant="body2" paragraph>
                We may receive data from:
              </Typography>
              <ul>
                <li>Multiple Listing Services (MLS)</li>
                <li>Public records and government databases</li>
                <li>Third-party data providers</li>
              </ul>
              <Typography variant="body2" paragraph>
                Such data is subject to the terms and privacy practices of those sources.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>4. Use of Artificial Intelligence</Typography>
              <Typography variant="body2" paragraph>
                Our Platform uses AI and machine-learning technologies to:
              </Typography>
              <ul>
                <li>Analyze property data</li>
                <li>Generate CMA insights and suggested valuation ranges</li>
                <li>Identify comparable properties</li>
              </ul>
              <Typography variant="body2" paragraph>Important AI Disclosures:</Typography>
              <ul>
                <li>AI-generated outputs are informational only</li>
                <li>They are not appraisals, guarantees, or professional advice</li>
                <li>Customers remain solely responsible for reviewing, validating, and determining final conclusions</li>
                <li>AI models may produce inaccurate or incomplete results</li>
              </ul>
              <Typography variant="body2" paragraph>
                We do not use Personal Information to train generalized AI models for unrelated third parties.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>5. How We Use Information</Typography>
              <Typography variant="body2" paragraph>
                We use Personal Information to:
              </Typography>
              <ul>
                <li>Provide, operate, and maintain our Services</li>
                <li>Generate CMA reports and analytics</li>
                <li>Authenticate users and manage accounts</li>
                <li>Process payments and subscriptions</li>
                <li>Improve Platform performance and features</li>
                <li>Detect fraud, misuse, or security incidents</li>
                <li>Comply with legal obligations</li>
                <li>Communicate with Customers regarding updates, support, and notices</li>
              </ul>
              <Typography variant="h6" sx={{ mt: 3 }}>6. Disclosure of Information</Typography>
              <Typography variant="body2" paragraph>
                We do not sell Personal Information. We may share information with:
              </Typography>
              <ul>
                <li>Service Providers (cloud hosting, analytics, payment processing) under strict confidentiality obligations</li>
                <li>Legal Authorities when required by law or legal process</li>
                <li>Successor Entities in the event of a merger, acquisition, or asset sale</li>
              </ul>
              <Typography variant="body2" paragraph>
                We do not share Personal Information for third-party marketing purposes.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>7. Data Retention</Typography>
              <Typography variant="body2" paragraph>
                We retain Personal Information only as long as necessary to:
              </Typography>
              <ul>
                <li>Provide the Services</li>
                <li>Fulfill contractual obligations</li>
                <li>Comply with legal requirements</li>
                <li>Resolve disputes and enforce agreements</li>
              </ul>
              <Typography variant="body2" paragraph>
                Customers may request deletion subject to applicable legal exceptions.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>8. Security Measures</Typography>
              <Typography variant="body2" paragraph>
                We use commercially reasonable administrative, technical, and physical safeguards, including:
              </Typography>
              <ul>
                <li>Encryption in transit and at rest</li>
                <li>Access controls and authentication</li>
                <li>Secure infrastructure providers</li>
              </ul>
              <Typography variant="body2" paragraph>
                No system is 100% secure. Users acknowledge and accept this risk.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>9. Cookies & Tracking Technologies</Typography>
              <Typography variant="body2" paragraph>
                We use cookies and similar technologies to:
              </Typography>
              <ul>
                <li>Maintain sessions</li>
                <li>Analyze usage trends</li>
                <li>Improve functionality</li>
              </ul>
              <Typography variant="body2" paragraph>
                Users may control cookies through browser settings.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>10. Children’s Privacy</Typography>
              <Typography variant="body2" paragraph>
                Our Services are not intended for individuals under 18. We do not knowingly collect Personal Information from minors.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>11. State, National & International Rights</Typography>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>California Residents (CCPA/CPRA)</Typography>
              <Typography variant="body2" paragraph>
                California residents may request:
              </Typography>
              <ul>
                <li>Access to personal data</li>
                <li>Correction or deletion</li>
                <li>Information about data sharing</li>
              </ul>
              <Typography variant="body2" paragraph>
                We will respond to verified requests as required by law.
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>EU & UK Residents (GDPR)</Typography>
              <Typography variant="body2" paragraph>
                Where applicable, we act as a data processor on behalf of Customers. Individuals may exercise rights through the Customer who controls the data.
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Canadian Residents (PIPEDA)</Typography>
              <Typography variant="body2" paragraph>
                We process Personal Information only with consent or as permitted by law and honor valid access and deletion requests.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>12. Links to Third-Party Sites</Typography>
              <Typography variant="body2" paragraph>
                Our Platform may contain links to third-party websites. We are not responsible for their privacy practices.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>13. Changes to This Privacy Policy</Typography>
              <Typography variant="body2" paragraph>
                We may update this Privacy Policy periodically. Changes will be posted with an updated effective date.
              </Typography>
              <Typography variant="h6" sx={{ mt: 3 }}>14. Contact Information</Typography>
              <Typography variant="body2" paragraph>
                For questions or privacy requests, contact:<br />
                CMPR, Inc.<br />
                5739 Byron Anthony PL<br />
                Suite 2001<br />
                Sanford FL 32771<br />
                Email: info@cmpr.com
              </Typography>
            </Paper>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default PrivacyPolicy;
