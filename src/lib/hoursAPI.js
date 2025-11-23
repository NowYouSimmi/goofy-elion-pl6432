// src/lib/hoursApi.js

export const HOURS_URLS = {
  josie:
    "https://script.google.com/a/macros/nyu.edu/s/AKfycbyLrm0teiyErCveQrFYaTT_O8ACgiZwnhm2-MZs7b0KEQMAXy8_g-c0Fzy4sWUssOH_tA/exec",
  gareth:
    "https://script.google.com/macros/s/AKfycbwybkPiO3FJxOm_HnB74ittjWrEcLY7SU0037l9GyDlrOxwH1XZl7PqvMQPJHhU_NtqQw/exec",

  // ✅ updated working URLs
  sabr: "https://script.google.com/macros/s/AKfycbw_aDbG3ZU2rPtejOOjXYJi6dstQy3sTIqrxrgaNwDT5kYZsghlcxGRBxAPzGfc8chJ/exec",
  tim: "https://script.google.com/macros/s/AKfycbzPNbb0vAM2YmICtU-nyQsJI_w-nSjYuvMtyBhyfqqBMZAzfDJGrDQOGQVzLTvN0XW0Ng/exec",
  subin:
    "https://script.google.com/macros/s/AKfycbwFdjrkf0ErhC1W8Opn-jWcL9IcIoeJBYUiDFZ7ls5u-cASDWK3Yd7A_R1sujs5JnmX/exec",
  roger:
    "https://script.google.com/macros/s/AKfycby-CYwhLucPleQOjzpLQNx8CzwhW74chkYhesVlIZ4Lmla-Yr5mPOx9rtulaYCAHR1FqA/exec",
  philip:
    "https://script.google.com/macros/s/AKfycbznDG6avbv_VaPJ7U8P5TDlCTgPMo6hHO4g61M-m7rvSmipSumuDFhOuHnB_4cR8XPX/exec",
  liriana:
    "https://script.google.com/macros/s/AKfycbxtFlnZwfglnM_ftygmRv1w-dLmZALg-xF51l7Nbl014kYDANvP6mkc8xBdOy5MZy9b/exec",
  estelle:
    "https://script.google.com/macros/s/AKfycbyPTfJv6KUuQBCpFypZdRoqdasMjF8-UXUcZNQwy1V3aw4YRybSV12aLID70PJual4y/exec",

  // jon: "https://script.google.com/macros/s/....../exec", // when ready
};

export async function fetchPersonHours(person, params = {}) {
  const base = HOURS_URLS[person];
  if (!base) throw new Error(`No API URL configured for ${person}`);

  const usp = new URLSearchParams();
  Object.entries(params).forEach(
    ([k, v]) => v != null && v !== "" && usp.append(k, v)
  );

  const url = `${base}${usp.toString() ? "?" + usp.toString() : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Hours API error ${res.status}`);

  const json = await res.json();
  return json.data || [];
}
