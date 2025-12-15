import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_Aw1JbX6Fd",
      userPoolClientId: "4jqv6kurjaqgemir5qrgq8pgrg",
      loginWith: {
        oauth: {
          domain: "us-east-1aw1jbx6fd.auth.us-east-1.amazoncognito.com",
          scopes: ["openid", "email", "profile"],
          redirectSignIn: [
            "http://localhost:5173/auth/callback",
            "https://main.dbzudgnwb8c4k.amplifyapp.com/auth/callback",
          ],
          redirectSignOut: [
            "http://localhost:5173/",
            "https://main.dbzudgnwb8c4k.amplifyapp.com/",
          ],
          responseType: "code",
        },
      },
    },
  },
});