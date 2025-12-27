import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";



type Role = "assistant" | "user";

type Message = {
  id: string;
  role: Role;
  text: string;
  stepKey?: StepKey; // which step produced this assistant question / user answer
};

type StepKey = "goal" | "timeframe" | "condition" | "radius" | "notes" | "done";

type Answers = {
  goal?: "quick_sale" | "maximize_price" | "market_test";
  timeframe?: 30 | 60 | 90;
  condition?: "needs_work" | "average" | "updated" | "renovated";
  radius?: 0.5 | 1 | 2;
  notes?: string;
};

type VerifiedAddress = {
  verifiedAddress?: string; // whatever your verify endpoint returns
  placeId?: string;
  lat?: number;
  lng?: number;
  [k: string]: any;
};

type Props = {
  verifiedAddress: VerifiedAddress;
  onDone?: (answers: Answers) => void; // later: feed into tools
};

function uid() {
  return Math.random().toString(16).slice(2);
}

function storageKey(placeId?: string) {
  // tie persistence to address (placeId is best); fallback to generic
  return `cma_setup_chat_v1:${placeId || "unknown-address"}`;
}

const STEP_ORDER: StepKey[] = ["goal", "timeframe", "condition", "radius", "notes", "done"];

const STEP_QUESTION: Record<Exclude<StepKey, "done">, string> = {
  goal: "What’s your goal for this listing?",
  timeframe: "How soon are you hoping to sell?",
  condition: "How would you rate the home’s condition compared to nearby homes?",
  radius: "How close should sold comps be?",
  notes: "Anything else I should account for? (Upgrades, pool, busy road, premium lot, etc.)",
};

const STEP_WHY: Record<Exclude<StepKey, "done">, string> = {
  goal: "This changes the pricing strategy and how aggressive the recommended list price should be.",
  timeframe: "This affects how we weight days-on-market and how we interpret comp recency and pricing.",
  condition: "Condition helps adjust comp selection and explain pricing differences in the CMA narrative.",
  radius: "Radius controls how similar the neighborhood comps are. Too tight may yield too few comps; too wide can dilute accuracy.",
  notes: "Notes let you flag upgrades or negatives that the comps might not reflect (roof, pool, traffic, lot premium).",
};

type QuickReply = { label: string; value: any };

function quickRepliesFor(step: StepKey): QuickReply[] {
  if (step === "goal") {
    return [
      { label: "Quick sale", value: "quick_sale" },
      { label: "Maximize price", value: "maximize_price" },
      { label: "Test the market", value: "market_test" },
    ];
  }
  if (step === "timeframe") {
    return [
      { label: "30 days", value: 30 },
      { label: "60 days", value: 60 },
      { label: "90+ days", value: 90 },
    ];
  }
  if (step === "condition") {
    return [
      { label: "Needs work", value: "needs_work" },
      { label: "Average", value: "average" },
      { label: "Updated", value: "updated" },
      { label: "Renovated", value: "renovated" },
    ];
  }
  if (step === "radius") {
    return [
      { label: "0.5 miles", value: 0.5 },
      { label: "1 mile (recommended)", value: 1 },
      { label: "2 miles", value: 2 },
    ];
  }
  return [];
}

function formatAnswer(key: keyof Answers, value: any) {
  if (!value && value !== 0) return "—";
  if (key === "timeframe") return `${value} days`;
  if (key === "radius") return `${value} miles`;
  if (key === "goal") {
    if (value === "quick_sale") return "Quick sale";
    if (value === "maximize_price") return "Maximize price";
    if (value === "market_test") return "Test the market";
  }
  if (key === "condition") {
    if (value === "needs_work") return "Needs work";
    if (value === "average") return "Average";
    if (value === "updated") return "Updated";
    if (value === "renovated") return "Renovated";
  }
  return String(value);
}

function CmaSetupChat({ verifiedAddress, onDone }: Props) {
  const placeId = verifiedAddress?.placeId;
  const LS_KEY = useMemo(() => storageKey(placeId), [placeId]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<StepKey>("goal");
  const [answers, setAnswers] = useState<Answers>({});
  const [draft, setDraft] = useState("");

  // typing indicator state
  const [assistantTyping, setAssistantTyping] = useState(false);

  const transcriptRef = useRef<HTMLDivElement | null>(null);

  // --- Persistence: load
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.messages?.length) setMessages(parsed.messages);
        if (parsed?.step) setStep(parsed.step);
        if (parsed?.answers) setAnswers(parsed.answers);
        return;
      } catch {
        // ignore corrupted data
      }
    }

    // First-time init transcript
    const addrLine =
      verifiedAddress?.verifiedAddress ||
      verifiedAddress?.formattedAddress ||
      verifiedAddress?.address ||
      "your verified address";

    setMessages([
      {
        id: uid(),
        role: "assistant",
        text: `✅ Address verified: ${addrLine}\n\nBefore I pull comps, I’m going to ask a few quick questions to tailor the CMA.`,
      },
      {
        id: uid(),
        role: "assistant",
        text: STEP_QUESTION.goal,
        stepKey: "goal",
      },
    ]);
    setStep("goal");
    setAnswers({});
  }, [LS_KEY, verifiedAddress]);

  // --- Persistence: save (messages/answers/step)
  useEffect(() => {
    if (messages.length === 0) return;
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        messages,
        step,
        answers,
        savedAt: new Date().toISOString(),
      })
    );
  }, [LS_KEY, messages, step, answers]);

  // --- Auto scroll to bottom when messages change or typing changes
  useEffect(() => {
    const el = transcriptRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, assistantTyping]);

  const quickReplies = useMemo(() => quickRepliesFor(step), [step]);
  const canSendText = step === "notes";

  function push(role: Role, text: string, stepKey?: StepKey) {
    setMessages((prev) => [...prev, { id: uid(), role, text, stepKey }]);
  }

  function simulateAssistantNextQuestion(next: StepKey) {
    if (next === "done") {
      setAssistantTyping(true);
      setTimeout(() => {
        setAssistantTyping(false);
        push("assistant", "Perfect. I’m ready to generate the CMA when you are.", "done");
        setStep("done");
      }, 550);
      return;
    }

    setAssistantTyping(true);
    setTimeout(() => {
      setAssistantTyping(false);
      push("assistant", STEP_QUESTION[next as Exclude<StepKey, "done">], next);
      setStep(next);
    }, 450);
  }

  function advanceFrom(current: StepKey) {
    const idx = STEP_ORDER.indexOf(current);
    const next = STEP_ORDER[Math.min(idx + 1, STEP_ORDER.length - 1)];
    simulateAssistantNextQuestion(next);
  }

  function setAnswerForCurrentStep(value: any) {
    if (step === "goal") setAnswers((a) => ({ ...a, goal: value }));
    if (step === "timeframe") setAnswers((a) => ({ ...a, timeframe: value }));
    if (step === "condition") setAnswers((a) => ({ ...a, condition: value }));
    if (step === "radius") setAnswers((a) => ({ ...a, radius: value }));
    // notes handled separately
  }

  function selectQuickReply(label: string, value: any) {
    push("user", label, step);
    setAnswerForCurrentStep(value);
    advanceFrom(step);
  }

  function sendNotes() {
    const text = draft.trim();
    if (!text) {
      push("user", "No extra notes.", "notes");
      setAnswers((a) => ({ ...a, notes: "" }));
    } else {
      push("user", text, "notes");
      setAnswers((a) => ({ ...a, notes: text }));
    }
    setDraft("");
    advanceFrom("notes");
  }

  function resetChat() {
    localStorage.removeItem(LS_KEY);
    // re-trigger init by clearing state; effect will rebuild from scratch
    setMessages([]);
  }

  // --- Edit/jump: rewind conversation to a step
  function jumpToStep(target: StepKey) {
    if (target === "done") return;

    // Keep everything up to (but not including) the assistant question for target,
    // then re-ask target question.
    const newMsgs: Message[] = [];
    for (const m of messages) {
      // Keep intro assistant message(s)
      if (!m.stepKey) {
        newMsgs.push(m);
        continue;
      }

      // Keep prior steps only
      const mIndex = STEP_ORDER.indexOf(m.stepKey);
      const tIndex = STEP_ORDER.indexOf(target);
      if (mIndex < tIndex) newMsgs.push(m);
    }

    // Clear answers from target onward
    const tIndex = STEP_ORDER.indexOf(target);
    const cleared: Answers = { ...answers };
    (STEP_ORDER.slice(tIndex) as StepKey[]).forEach((k) => {
      if (k === "done") return;
      if (k === "goal") delete cleared.goal;
      if (k === "timeframe") delete cleared.timeframe;
      if (k === "condition") delete cleared.condition;
      if (k === "radius") delete cleared.radius;
      if (k === "notes") delete cleared.notes;
    });

    setAnswers(cleared);
    setMessages([
      ...newMsgs,
      { id: uid(), role: "assistant", text: STEP_QUESTION[target], stepKey: target },
    ]);
    setStep(target);
    setDraft("");
  }

  const readyToGenerate = step === "done";
  const profileSummary = [
    { key: "goal", label: "Goal", value: formatAnswer("goal", answers.goal) },
    { key: "timeframe", label: "Timeframe", value: formatAnswer("timeframe", answers.timeframe) },
    { key: "condition", label: "Condition", value: formatAnswer("condition", answers.condition) },
    { key: "radius", label: "Comp radius", value: formatAnswer("radius", answers.radius) },
    { key: "notes", label: "Notes", value: formatAnswer("notes", answers.notes) },
  ] as const;

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.6fr 1fr" }, gap: 2 }}>
      {/* Chat */}
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="h6" fontWeight={800}>
              CMA Setup
            </Typography>
          </Stack>

          <Box
            ref={transcriptRef}
            sx={{
              maxHeight: "60vh",
              overflow: "auto",
              pr: 1,
              mb: 2,
              borderRadius: 2,
            }}
          >
            <Stack spacing={1.25}>
              {messages.map((m) => (
                <Bubble key={m.id} role={m.role} text={m.text} />
              ))}

              {assistantTyping && <TypingBubble />}
            </Stack>
          </Box>

          {/* Current question helper / why tooltip */}
          {step !== "done" && step !== "notes" && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                Choose an option below
              </Typography>
              <Tooltip title={STEP_WHY[step as Exclude<StepKey, "done">] || ""} placement="right">
                <InfoOutlinedIcon fontSize="small" sx={{ opacity: 0.7, cursor: "help" }} />
              </Tooltip>
            </Stack>
          )}

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
              placeholder={
                step === "notes"
                  ? "Type any notes (or leave blank to skip)..."
                  : "Use the options above"
              }
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
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  onDone?.(answers);
                }}
              >
                Generate CMA
              </Button>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                Next step: we’ll use these answers + the verified address to fetch comps.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Summary panel */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            Your inputs
          </Typography>

          <Stack spacing={1}>
            {profileSummary.map((row) => (
              <Box
                key={row.key}
                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}
              >
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    {row.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {row.value || "—"}
                  </Typography>
                </Box>

                {/* Edit button to jump back */}
                {row.key !== "notes" ? (
                  <Tooltip title="Edit">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => jumpToStep(row.key as StepKey)}
                        disabled={step === "done" ? false : false}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                ) : (
                  <Tooltip title="Edit">
                    <span>
                      <IconButton size="small" onClick={() => jumpToStep("notes")}> 
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Box>
            ))}
          </Stack>

          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
            <Typography variant="body2" fontWeight={700}>
              Address context
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, whiteSpace: "pre-wrap" }}>
              {verifiedAddress?.verifiedAddress ||
                verifiedAddress?.formattedAddress ||
                verifiedAddress?.address ||
                "—"}
            </Typography>
            {(verifiedAddress?.lat || verifiedAddress?.lng) && (
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                lat/lng: {verifiedAddress?.lat}, {verifiedAddress?.lng}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default CmaSetupChat;

function Bubble({ role, text }: { role: Role; text: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: role === "assistant" ? "flex-start" : "flex-end" }}>
      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderRadius: 2,
          maxWidth: "80%",
          bgcolor: role === "assistant" ? "action.hover" : "primary.main",
          color: role === "assistant" ? "text.primary" : "primary.contrastText",
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
          {text}
        </Typography>
      </Box>
    </Box>
  );
}

function TypingBubble() {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderRadius: 2,
          bgcolor: "action.hover",
          color: "text.primary",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <CircularProgress size={14} />
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Thinking…
        </Typography>
      </Box>
    </Box>
  );
}
