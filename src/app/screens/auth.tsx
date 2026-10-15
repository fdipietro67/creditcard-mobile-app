import { useState } from "react";
import corecardLogo from "../../assets/brand/corecard-logo.png";
import { CardFace } from "../CardFace";
import { Ico } from "../icons";
import { useApp } from "../store";

type Step = "signin" | "forgotuser" | "forgotpw" | "signup" | "sent";

/**
 * Sign-in flow, modeled on the CoreCard cardholder app: user name + password (with show/hide),
 * Forgot User Name, Forgot Password and Sign Up. Demo credentials are prefilled; any input works.
 */
export function AuthFlow() {
  const { partner, acct, signIn } = useApp();
  const [step, setStep] = useState<Step>("signin");
  const [sent, setSent] = useState("");
  const [user, setUser] = useState("j.ellis");
  const [pw, setPw] = useState("demo2026");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const done = (msg: string) => {
    setSent(msg);
    setStep("sent");
  };

  return (
    <div className="auth">
      {step === "signin" && (
        <>
          <div className="auth-brand">
            <div className="auth-card">
              <CardFace p={partner} available={acct.available} />
            </div>
            <h2>{partner.product}</h2>
            <p>Sign in to manage your card</p>
          </div>
          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!user.trim() || !pw) return;
              setBusy(true);
              window.setTimeout(signIn, 900);
            }}
          >
            <label className="fld">
              <span className="fld-l">User name</span>
              <input className="inp" value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" />
            </label>
            <label className="fld">
              <span className="fld-l">Password</span>
              <span className="pw">
                <input className="inp" type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
                <button type="button" className="pw-eye" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((v) => !v)}>
                  <Ico n={show ? "eyeoff" : "eye"} />
                </button>
              </span>
            </label>
            <button className="cta" type="submit" disabled={busy || !user.trim() || !pw}>
              {busy ? <span className="spin" aria-label="Signing in" /> : "Sign In"}
            </button>
            <div className="auth-links">
              <button type="button" onClick={() => setStep("forgotuser")}>Forgot User Name</button>
              <button type="button" onClick={() => setStep("forgotpw")}>Forgot Password</button>
            </div>
          </form>
          <div className="auth-foot">
            <span>Not registered?</span>
            <button type="button" onClick={() => setStep("signup")}>Sign Up</button>
          </div>
          <div className="auth-powered">
            <span>Powered by</span>
            <img src={corecardLogo} alt="CoreCard" />
          </div>
        </>
      )}

      {step === "forgotuser" && (
        <AuthForm
          title="Forgot User Name"
          intro="Enter the email address on your account and we'll send your user name."
          fields={[{ label: "Email", type: "email", placeholder: "you@example.com" }]}
          cta="Send user name"
          onBack={() => setStep("signin")}
          onDone={() => done("We've emailed your user name. Check your inbox, then sign in.")}
        />
      )}
      {step === "forgotpw" && (
        <AuthForm
          title="Forgot Password"
          intro="Verify your identity and we'll send a link to reset your password."
          fields={[
            { label: "User name", placeholder: "j.ellis" },
            { label: "Last 4 digits of card", placeholder: "4417", inputMode: "numeric", maxLength: 4 },
          ]}
          cta="Send reset link"
          onBack={() => setStep("signin")}
          onDone={() => done("A password reset link is on its way to the email on your account.")}
        />
      )}
      {step === "signup" && (
        <AuthForm
          title="Sign Up"
          intro="Register your card to use the app."
          fields={[
            { label: "Card number", placeholder: "•••• •••• •••• 4417", inputMode: "numeric" },
            { label: "Expiration (MM/YY)", placeholder: "08/29", inputMode: "numeric", maxLength: 5 },
            { label: "Email", type: "email", placeholder: "you@example.com" },
            { label: "Create user name", placeholder: "j.ellis" },
            { label: "Create password", type: "password", placeholder: "At least 8 characters" },
          ]}
          cta="Create account"
          onBack={() => setStep("signin")}
          onDone={() => done("Your account is set up. Sign in with your new user name and password.")}
        />
      )}
      {step === "sent" && (
        <div className="cw auth-sent">
          <div className="checkwrap"><Ico n="check" size={34} w={2.5} /></div>
          <h2>Done</h2>
          <p>{sent}</p>
          <button className="cta" style={{ marginTop: 22 }} onClick={() => setStep("signin")}>Back to sign in</button>
        </div>
      )}
    </div>
  );
}

type FieldDef = { label: string; placeholder?: string; type?: string; inputMode?: "numeric" | "email"; maxLength?: number };

function AuthForm({ title, intro, fields, cta, onBack, onDone }: { title: string; intro: string; fields: FieldDef[]; cta: string; onBack: () => void; onDone: () => void }) {
  const [vals, setVals] = useState<string[]>(() => fields.map(() => ""));
  const ok = vals.every((v) => v.trim().length >= 2);
  return (
    <form
      className="auth-sub"
      onSubmit={(e) => {
        e.preventDefault();
        if (ok) onDone();
      }}
    >
      <button type="button" className="auth-back" onClick={onBack}>
        <Ico n="back" /> Back
      </button>
      <h2>{title}</h2>
      <p className="rv-note">{intro}</p>
      {fields.map((f, i) => (
        <label className="fld" key={f.label}>
          <span className="fld-l">{f.label}</span>
          <input
            className="inp"
            type={f.type ?? "text"}
            inputMode={f.inputMode}
            maxLength={f.maxLength}
            placeholder={f.placeholder}
            value={vals[i]}
            onChange={(e) => setVals((v) => v.map((x, j) => (j === i ? e.target.value : x)))}
          />
        </label>
      ))}
      <button className="cta" type="submit" disabled={!ok}>{cta}</button>
    </form>
  );
}
