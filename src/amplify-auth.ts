// src/amplify-auth.ts
import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_aw1Jbx6Fd", // <-- Your user pool ID
      userPoolClientId: "4jqv6kurjaggemir5qrqg8pgrg", // <-- Your App Client ID
    },
  },
});