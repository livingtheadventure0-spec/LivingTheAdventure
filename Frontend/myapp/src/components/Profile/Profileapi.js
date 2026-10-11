import axios from "axios";
import { API_BASE_URL } from "../../api/config.js";

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export async function fetchMe(token) {
  const res = await axios.get(`${API_BASE_URL}/auth/me`, {
    headers: authHeaders(token),
  });
  return res.data;
}

export async function updateProfile(token, { first_name, last_name, email }) {
  const res = await axios.put(
    `${API_BASE_URL}/auth/me`,
    { first_name, last_name, email },
    { headers: authHeaders(token) }
  );
  return res.data;
}

export async function requestEmailOtp(token, email) {
  const res = await axios.post(
    `${API_BASE_URL}/auth/me/request-email-otp`,
    { email },
    { headers: authHeaders(token) }
  );
  return res.data;
}

export async function verifyEmailOtp(token, { email, otp }) {
  const res = await axios.post(
    `${API_BASE_URL}/auth/me/verify-email-otp`,
    { email, otp },
    { headers: authHeaders(token) }
  );
  return res.data;
}