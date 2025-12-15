// src/amplify-auth.ts
import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: ( {
    Cognito: {
      userPoolId: "us-east-1_aw1Jbx6Fd", // <-- your real values
      userPoolClientId: "4jqv6kurjaggemir5qrqg8pgrg",
      identityPoolId: "",
    },
    OAuth: {
      domain: "us-east-1aw1jbx6fd.auth.us-east-1.amazoncognito.com",
      scopes: ["openid", "email", "profile"],
      redirectSignIn: "http://localhost:5173/dashboard",
      redirectSignOut: "http://localhost:5173/login",
      responseType: "code",
    },
  } as unknown) as any,
});