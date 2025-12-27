import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DashboardLayout from "../components/DashboardLayout";

type Role = "assistant" | "user";

type Message = {
  id: string;
  role: Role;
  text: string;
};

type StepKey = "goal" | "timeframe" | "condition" | "radius" | "notes" | "done";

type Answers = {
  goal?: "quick_sale" | "maximize_price" | "market_test";
  timeframe?: 30 | 60 | 90;
  condition?: "needs_work" | "average" | "updated" | "renovated";
  radius?: 0.5 | 1 | 2;
  notes?: string;
};

function uid() {
  return Math.random().toString(16).slice(2);
}

export default function CmaChatSetupPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: "assistant",
      text: "Before I pull comps, I’m going to ask a few quick questions to tailor the CMA.",
    },
    { id: uid(), role: "assistant", text: "What’s your goal for this listing?" },
  ]);

  const [step, setStep] = useState<StepKey>("goal");
  const [answers, setAnswers] = useState<Answers>({});
  const [draft, setDraft] = useState("");

  const canSendText = useMemo(() => step === "notes", [step]);

  function push(role: Role, text: string) {
    setMessages((prev) => [...prev, { id: uid(), role, text }]);
  }

  function nextStep() {
    if (step === "goal") {
      setStep("timeframe");
      push("assistant", "How soon are you hoping to sell?");
      return;
    }
    if (step === "timeframe") {
      setStep("condition");
      push("assistant", "How would you rate the home’s condition compared to nearby homes?");
      return;
    }
    if (step === "condition") {
      setStep("radius");
      push("assistant", "How close should sold comps be?");
      return;
    }
    if (step === "radius") {
      setStep("notes");
      push("assistant", "Anything else I should account for? (Upgrades, pool, busy road, premium lot, etc.)");
      return;
    }
    if (step === "notes") {
      setStep("done");
      push("assistant", "Perfect. I’m ready to generate the CMA when you are.");
      return;
    }
  }

  function selectQuickReply(label: string, value: any) {
    // show user reply
    push("user", label);

    // store answer + advance
    if (step === "goal") setAnswers((a) => ({ ...a, goal: value }));
    if (step === "timeframe") setAnswers((a) => ({ ...a, timeframe: value }));
    if (step === "condition") setAnswers((a) => ({ ...a, condition: value }));
    if (step === "radius") setAnswers((a) => ({ ...a, radius: value }));

    nextStep();
  }

  function sendNotes() {
    const text = draft.trim();
    if (!text) {
      // allow skipping notes
      push("user", "No extra notes.");
      setAnswers((a) => ({ ...a, notes: "" }));
    } else {
      push("user", text);
      setAnswers((a) => ({ ...a, notes: text }));
    }
    setDraft("");
    nextStep();
  }

  const quickReplies = useMemo(() => {
    if (step === "goal") {
      return [
        { label: "Quick sale", value: "quick_sale" },
        { label: "Maximize price", value: "maximize_price" },
        { label: "Test the market", value: "market_test" },
      ] as const;
    }
    if (step === "timeframe") {
      return [
        { label: "30 days", value: 30 },
        { label: "60 days", value: 60 },
        { label: "90+ days", value: 90 },
      ] as const;
    }
    if (step === "condition") {
      return [
        { label: "Needs work", value: "needs_work" },
        { label: "Average", value: "average" },
        { label: "Updated", value: "updated" },
        { label: "Renovated", value: "renovated" },
      ] as const;
    }
    if (step === "radius") {
      return [
        { label: "0.5 miles", value: 0.5 },
        { label: "1 mile (recommended)", value: 1 },
        { label: "2 miles", value: 2 },
      ] as const;
    }
    return [];
  }, [step]);

  const readyToGenerate = step === "done";

  return (
    <DashboardLayout>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.6fr 1fr" }, gap: 2 }}>
        {/* Chat */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              CMA Setup
            </Typography>

            <Stack spacing={1.25} sx={{ maxHeight: "60vh", overflow: "auto", pr: 1, mb: 2 }}>
              {messages.map((m) => (
                <Box
                  key={m.id}
                  sx={{
                    display: "flex",
                    justifyContent: m.role === "assistant" ? "flex-start" : "flex-end",
                  }}
                >
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      maxWidth: "80%",
                      bgcolor: m.role === "assistant" ? "action.hover" : "primary.main",
                      color: m.role === "assistant" ? "text.primary" : "primary.contrastText",
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {m.text}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>

            {/* Quick replies */}
            {quickReplies.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
                {quickReplies.map((q) => (
                  <Chip
                    key={q.label}
                    label={q.label}
                    clickable
                    onClick={() => selectQuickReply(q.label, q.value)}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            )}

            {/* Composer */}
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                placeholder={step === "notes" ? "Type any notes (or leave blank to skip)..." : "Use the options above"}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={!canSendText}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && canSendText) {
                    e.preventDefault();
                    sendNotes();
                  }
                }}
              />
              <Button variant="contained" onClick={sendNotes} disabled={!canSendText}>
                Send
              </Button>
            </Stack>

            {readyToGenerate && (
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" fullWidth>
                  Generate CMA
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Summary (optional but very useful) */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              Your inputs
            </Typography>

            <Stack spacing={1}>
              <Row label="Goal" value={answers.goal} />
              <Row label="Timeframe" value={answers.timeframe ? `${answers.timeframe} days` : ""} />
              <Row label="Condition" value={answers.condition} />
              <Row label="Comp radius" value={answers.radius ? `${answers.radius} miles` : ""} />
              <Row label="Notes" value={answers.notes} />
            </Stack>

            <Typography variant="body2" sx={{ mt: 2, opacity: 0.7 }}>
              (We’ll use these answers to tailor comp selection and the final CMA write-up.)
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  const display = value ? String(value) : "—";
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <Typography variant="body2" sx={{ opacity: 0.7 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {display}
      </Typography>
    </Box>
  );
}
