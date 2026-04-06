const API =
  window.location.hostname === "localhost" &&
  window.location.port &&
  window.location.port !== "5000"
    ? "http://localhost:5000/api"
    : "/api";
const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

async function sendOTP() {
  const name = document.getElementById("name")?.value.trim() || "";
  const address = document.getElementById("address")?.value.trim() || "";
  const phone = document.getElementById("phone")?.value.trim() || "";
  const email = document.getElementById("email").value.trim();

  const requiredFields = [
    { label: "Name", value: name },
    { label: "Address", value: address },
    { label: "Phone Number", value: phone },
    { label: "Email", value: email },
  ];

  for (const field of requiredFields) {
    if (!field.value) {
      alert(`${field.label} input must be given.`);
      return;
    }
  }

  if (!GMAIL_REGEX.test(email)) {
    alert("Only Gmail format is accepted (example@gmail.com).");
    return;
  }

  const res = await fetch(`${API}/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.message || "Failed to send OTP");
    return;
  }

  localStorage.setItem("otp_token", data.otpToken || "");
  localStorage.setItem("otp_email", email);
  window.location.href = `./verify.html?email=${encodeURIComponent(email)}`;
}

async function verifyOTP() {
  const email = document.getElementById("email").value.trim();
  const otp = document.getElementById("otp").value.trim();
  const otpToken = localStorage.getItem("otp_token");

  if (!email || !otp || !otpToken) {
    alert("Please enter email and OTP. Send OTP again if needed.");
    return;
  }

  if (!GMAIL_REGEX.test(email)) {
    alert("Only Gmail format is accepted (example@gmail.com).");
    return;
  }

  const res = await fetch(`${API}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, otpToken }),
  });

  const data = await res.json();
  alert(data.message);

  if (res.ok) {
    localStorage.removeItem("otp_email");
    localStorage.removeItem("otp_token");
    window.location.href = "./index.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email");
  if (!emailInput) return;

  const params = new URLSearchParams(window.location.search);
  const emailFromQuery = params.get("email");
  const emailFromStorage = localStorage.getItem("otp_email");
  const email = emailFromQuery || emailFromStorage;

  if (email) {
    emailInput.value = email;
  }
});
