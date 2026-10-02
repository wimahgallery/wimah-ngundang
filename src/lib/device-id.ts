const DEVICE_KEY = "wimah_device_id";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let memoryId = "";

function randomUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const hex = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) out += "-";
    else if (i === 14) out += "4";
    else if (i === 19) out += hex[(Math.floor(Math.random() * 16) & 0x3) | 0x8];
    else out += hex[Math.floor(Math.random() * 16)];
  }
  return out;
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return memoryId;
  try {
    const existing = window.localStorage.getItem(DEVICE_KEY);
    if (existing && UUID_RE.test(existing)) return existing;
    const id = randomUUID();
    window.localStorage.setItem(DEVICE_KEY, id);
    memoryId = id;
    return id;
  } catch {
    if (!memoryId) memoryId = randomUUID();
    return memoryId;
  }
}
