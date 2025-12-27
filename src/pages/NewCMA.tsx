import React from "react";
import AppTheme from "../shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import DashboardLayout from "../components/DashboardLayout";
import CmaSetupChat from "../components/CmaSetupChat";



import CmaPipelineRawResult from "../components/CmaPipelineRawResult";

import { useVerifiedAddress } from "../lib/VerifiedAddressContext";

const NewCMA: React.FC = () => {
  const { verifiedAddress } = useVerifiedAddress();

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <DashboardLayout>
        {!verifiedAddress ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <h2>Please verify an address to start a new CMA.</h2>
            {/* The modal should set the address and redirect here */}
          </div>
        ) : (
          <>
            <CmaSetupChat
              verifiedAddress={{ verifiedAddress }}
              onDone={(answers: any) => {
                // later: call your tool / create CMA request
                console.log("answers for model/tool:", answers);
              }}
            />
            {/* TODO: Replace 'example-request-id' with actual requestId from pipeline start */}
            {/* Show raw pipeline result for the verified address */}
            <CmaPipelineRawResult address={typeof (verifiedAddress as any) === 'string' ? (verifiedAddress as any) : (verifiedAddress as any)?.verifiedAddress} />
          </>
        )}
      </DashboardLayout>
    </AppTheme>
  );
};

export default NewCMA;