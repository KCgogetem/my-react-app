import { fetchAuthSession } from "aws-amplify/auth";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";

export default function TestButton() {
  const handleTest = async () => {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      const accessToken = session.tokens?.accessToken?.toString();

      console.log("idToken:", idToken);
      console.log("accessToken:", accessToken);
    } catch (err) {
      console.error("Error fetching session:", err);
    }
  };

  return (
    <Button
      onClick={handleTest}
      variant="contained"
      startIcon={<Icon>vpn_key</Icon>}
      sx={{ bgcolor: 'pink', color: 'white', fontWeight: 600, '&:hover': { bgcolor: 'hotpink' } }}
    >
      Print Tokens
    </Button>
  );
}
