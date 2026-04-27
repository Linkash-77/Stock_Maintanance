import React, { useState, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { authApi } from "../services/api";
import { useToast } from "../components/Toast";

/* ─── Animations ─── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

/* ─── Layout ─── */
const Scene = styled.div`
  min-height: 100vh;
  background: #f7f8fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
`;

const Card = styled.div`
  background: #ffffff;
  border: 1px solid #e4e6eb;
  border-radius: 16px;
  padding: 36px 32px 32px;
  width: 100%;
  max-width: 380px;
  animation: ${fadeUp} 0.32s ease both;
`;

/* ─── Brand ─── */
const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
  animation: ${fadeUp} 0.22s ease both;
`;

const LogoMark = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #1a6b3a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const BrandName = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: #0f1117;
  letter-spacing: -0.01em;
`;

/* ─── Typography ─── */
const Eyebrow = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: #1a6b3a;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 500;
  color: #0f1117;
  margin-bottom: 6px;
  line-height: 1.3;
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: #8b909c;
  margin-bottom: 24px;
  line-height: 1.6;
`;

/* ─── Form ─── */
const Field = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #4a4f5c;
  margin-bottom: 6px;
`;

const PhoneRow = styled.div`
  display: flex;
`;

const CountryBadge = styled.div`
  height: 40px;
  padding: 0 12px;
  border: 1px solid #d0d3da;
  border-right: none;
  border-radius: 6px 0 0 6px;
  background: #f7f8fa;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #4a4f5c;
  flex-shrink: 0;
  user-select: none;
`;

const PhoneInput = styled.input`
  flex: 1;
  min-width: 0;
  height: 40px;
  padding: 0 12px;
  font-size: 14px;
  border: 1px solid #d0d3da;
  border-radius: 0 6px 6px 0;
  background: #ffffff;
  color: #0f1117;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
  letter-spacing: 0.3px;

  &:focus {
    border-color: #1a6b3a;
  }

  &::placeholder {
    color: #c0c4cc;
    letter-spacing: 0;
  }
`;

/* ─── PIN Boxes ─── */
const PinRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const PinBox = styled.input`
  width: 56px;
  height: 60px;
  text-align: center;
  font-size: 22px;
  font-weight: 500;
  border: 1.5px solid ${({ $filled }) => ($filled ? "#2d9155" : "#d0d3da")};
  border-radius: 10px;
  background: ${({ $filled }) => ($filled ? "#e8f5ee" : "#ffffff")};
  color: #0f1117;
  outline: none;
  transition: border-color 0.15s, background 0.15s;
  font-family: inherit;
  caret-color: #1a6b3a;

  &:focus {
    border-color: #1a6b3a;
    background: #f4faf0;
  }

  /* Hide number spinners */
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
`;

/* ─── Button ─── */
const Btn = styled.button`
  width: 100%;
  height: 42px;
  background: #1a6b3a;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.01em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.12s, transform 0.1s;
  margin-top: 4px;

  &:hover:not(:disabled) {
    background: #145530;
  }

  &:active:not(:disabled) {
    transform: scale(0.99);
  }

  &:disabled {
    background: #f0f2f5;
    color: #8b909c;
    cursor: not-allowed;
    border: 1px solid #e4e6eb;
  }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
  flex-shrink: 0;
`;

/* ─── Notice ─── */
const Notice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 20px;
  background: #e8f5ee;
  border: 1px solid #b7dfc8;
  border-radius: 6px;
  padding: 10px 12px;
`;

const NoticeText = styled.span`
  font-size: 12px;
  color: #0e4423;
  line-height: 1.6;
`;

/* ─────────────────────────────────────────────── */
const Login = () => {
  const { success, error } = useToast();

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login");
  const [secret, setSecret] = useState("");

  const pinRefs = useRef([]);

  /* ── PIN box handlers with auto-advance & backspace ── */
  const handlePinChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const chars = pin.split("");
    chars[i] = val;
    const newPin = chars.join("").slice(0, 4);
    setPin(newPin);
    if (val && i < 3) pinRefs.current[i + 1]?.focus();
  };

  const handlePinKeyDown = (i, e) => {
    if (e.key === "Backspace" && !pin[i] && i > 0) {
      pinRefs.current[i - 1]?.focus();
    }
    if (e.key === "Enter") handleLogin();
  };

  /* ── Login — unchanged logic ── */
  const handleLogin = async () => {
    if (phone.length !== 10) return error("Invalid phone");
    if (pin.length !== 4) return error("Enter 4-digit PIN");

    setLoading(true);

    try {
      const res = await authApi.login({
        phone: `+91${phone}`,
        pin,
      });

      sessionStorage.setItem("token", res.data.token);
      success("Login successful");
      window.location.href = "/";
    } catch (err) {
      error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  /* ── Reset PIN — new logic ── */
  const handleReset = async () => {
    if (phone.length !== 10) return error("Invalid phone");
    if (pin.length !== 4) return error("Enter 4-digit PIN");
    if (!secret) return error("Enter shop code");

    setLoading(true);

    try {
      await authApi.resetPin({
        phone: `+91${phone}`,
        newPin: pin,
        secret,
      });

      success("PIN updated successfully");

      // switch back to login
      setMode("login");
      setPin("");
      setSecret("");

    } catch (err) {
      error(err.response?.data?.error || "Reset failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Scene>
      <Brand>
        <LogoMark>
          <svg width="18" height="18" viewBox="0 0 14 14" fill="#fff">
            <rect x="1" y="4" width="12" height="2" rx="1" />
            <rect x="1" y="8" width="8" height="2" rx="1" />
            <circle cx="11" cy="9" r="2" />
          </svg>
        </LogoMark>
        <BrandName>SR Protein</BrandName>
      </Brand>

      <Card>
        <Eyebrow>Staff access</Eyebrow>
        <Title>
          {mode === "login" ? "Sign in to continue" : "Reset your PIN"}
        </Title>

        <Subtitle>
          {mode === "login"
            ? "Enter your phone number and PIN"
            : "Enter phone, shop code and new PIN"}
        </Subtitle>

        {/* Phone field */}
        <Field>
          <Label htmlFor="phone-input">Phone number</Label>
          <PhoneRow>
            <CountryBadge>+91</CountryBadge>
            <PhoneInput
              id="phone-input"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="98765 43210"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoComplete="tel-national"
              autoFocus
            />
          </PhoneRow>
        </Field>
        {mode === "reset" && (
          <Field>
            <Label>Shop code</Label>
            <PhoneInput
              placeholder="Enter shop code"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
          </Field>
        )}

        {/* PIN field */}
        <Field>
          <Label style={{ textAlign: "center" }}>4-digit PIN</Label>
          <PinRow>
            {[0, 1, 2, 3].map((i) => (
              <PinBox
                key={i}
                ref={(el) => (pinRefs.current[i] = el)}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={pin[i] || ""}
                $filled={!!pin[i]}
                onChange={(e) => handlePinChange(i, e)}
                onKeyDown={(e) => handlePinKeyDown(i, e)}
              />
            ))}
          </PinRow>
        </Field>
        <div style={{ textAlign: "right", marginTop: "-6px", marginBottom: "10px" }}>
          <span
            style={{
              fontSize: "12px",
              color: "#1a6b3a",
              cursor: "pointer",
              fontWeight: 500
            }}
            onClick={() => setMode("reset")}
          >
            Forgot PIN?
          </span>
        </div>
        {mode === "reset" && (
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <span
            style={{
              fontSize: "12px",
              color: "#4a4f5c",
              cursor: "pointer"
            }}
            onClick={() => setMode("login")}
          >
            ← Back to login
          </span>
        </div>
      )}

        <Btn
          onClick={mode === "login" ? handleLogin : handleReset}
          disabled={loading || phone.length !== 10 || pin.length !== 4}
        >
        {loading ? (
          <>
            <Spinner />
            {mode === "login" ? "Signing in…" : "Updating…"}
          </>
        ) : mode === "login" ? (
          "Login"
        ) : (
          "Reset PIN"
        )}        
        </Btn>

        <Notice>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{ flexShrink: 0, marginTop: 1 }}
          >
            <circle cx="7" cy="7" r="6" stroke="#3B6D11" strokeWidth="1.2" />
            <rect x="6.25" y="6" width="1.5" height="4.5" rx=".75" fill="#3B6D11" />
            <circle cx="7" cy="4.5" r=".75" fill="#3B6D11" />
          </svg>
          <NoticeText>
            Only authorized staff members can access this system.
          </NoticeText>
        </Notice>
      </Card>
    </Scene>
  );
};

export default Login;