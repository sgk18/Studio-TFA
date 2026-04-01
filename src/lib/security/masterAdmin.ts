export type MasterAdminAccessReason =
  | "allowed"
  | "development-bypass"
  | "not-authenticated"
  | "not-master-admin"
  | "master-admin-email-missing"
  | "admin-ip-list-missing"
  | "ip-unavailable"
  | "ip-not-allowed";

export type MasterAdminAccessDecision =
  | { allowed: true; reason: "allowed" | "development-bypass" }
  | { allowed: false; reason: Exclude<MasterAdminAccessReason, "allowed" | "development-bypass"> };

export type MasterAdminEvaluationOptions = {
  userEmail?: string | null;
  clientIp?: string | null;
  masterAdminEmail?: string | null;
  allowedIpsRaw?: string | null;
  environment?: string | null;
};

const IP_HEADER_CANDIDATES = [
  "x-vercel-forwarded-for",
  "x-forwarded-for",
  "x-real-ip",
  "cf-connecting-ip",
  "forwarded",
] as const;

function normalizeEmail(email?: string | null): string {
  return (email || "").trim().toLowerCase();
}

function normalizeIp(rawIp?: string | null): string {
  if (!rawIp) return "";

  const trimmed = rawIp.trim().replace(/^for=/i, "").replace(/^"|"$/g, "");
  const noBrackets = trimmed.replace(/^\[|\]$/g, "");

  if (noBrackets === "::1") return "127.0.0.1";
  if (noBrackets.startsWith("::ffff:")) return noBrackets.slice(7);

  return noBrackets;
}

function parseForwardedHeader(forwardedHeader: string): string {
  const segments = forwardedHeader.split(",");
  for (const segment of segments) {
    const match = segment.match(/for=([^;]+)/i);
    if (match?.[1]) {
      return normalizeIp(match[1]);
    }
  }

  return "";
}

export function getClientIpFromHeaderGetter(
  getHeader: (headerName: string) => string | null
): string {
  for (const headerName of IP_HEADER_CANDIDATES) {
    const value = getHeader(headerName);
    if (!value) continue;

    if (headerName === "forwarded") {
      const forwardedIp = parseForwardedHeader(value);
      if (forwardedIp) return forwardedIp;
      continue;
    }

    // x-forwarded-for and similar headers can include multiple entries.
    const firstCandidate = value.split(",")[0];
    const normalized = normalizeIp(firstCandidate);
    if (normalized) return normalized;
  }

  return "";
}

export function parseAllowedIps(allowedIpsRaw?: string | null): string[] {
  return (allowedIpsRaw || "")
    .split(",")
    .map((ip) => normalizeIp(ip))
    .filter(Boolean);
}

function isIPv4(ip: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
}

function ipv4ToInt(ip: string): number {
  return ip
    .split(".")
    .map((segment) => Number(segment))
    .reduce((acc, segment) => (acc << 8) + (segment & 255), 0) >>> 0;
}

function isCidrMatch(clientIp: string, cidrRule: string): boolean {
  const [network, maskBitsRaw] = cidrRule.split("/");
  const maskBits = Number(maskBitsRaw);

  if (!network || Number.isNaN(maskBits) || maskBits < 0 || maskBits > 32) return false;
  if (!isIPv4(clientIp) || !isIPv4(network)) return false;

  const clientInt = ipv4ToInt(clientIp);
  const networkInt = ipv4ToInt(network);
  const mask = maskBits === 0 ? 0 : (0xffffffff << (32 - maskBits)) >>> 0;

  return (clientInt & mask) === (networkInt & mask);
}

function matchesRule(clientIp: string, rule: string): boolean {
  if (rule === "*") return true;

  if (rule.includes("/")) {
    return isCidrMatch(clientIp, rule);
  }

  if (rule.endsWith(".*")) {
    const prefix = rule.slice(0, -1);
    return clientIp.startsWith(prefix);
  }

  return clientIp === rule;
}

export function isIpAllowed(clientIpRaw: string, allowedRules: string[]): boolean {
  const clientIp = normalizeIp(clientIpRaw);
  if (!clientIp) return false;

  return allowedRules.some((rule) => matchesRule(clientIp, rule));
}

export function evaluateMasterAdminAccess(
  options: MasterAdminEvaluationOptions
): MasterAdminAccessDecision {
  const userEmail = normalizeEmail(options.userEmail);
  if (!userEmail) {
    return { allowed: false, reason: "not-authenticated" };
  }

  const isProduction = options.environment === "production";

  const masterAdminEmail = normalizeEmail(options.masterAdminEmail);
  if (!masterAdminEmail) {
    if (isProduction) {
      return { allowed: false, reason: "master-admin-email-missing" };
    }

    return { allowed: true, reason: "development-bypass" };
  }

  if (userEmail !== masterAdminEmail) {
    return { allowed: false, reason: "not-master-admin" };
  }

  const allowedIps = parseAllowedIps(options.allowedIpsRaw);
  if (allowedIps.length === 0) {
    if (isProduction) {
      return { allowed: false, reason: "admin-ip-list-missing" };
    }

    return { allowed: true, reason: "development-bypass" };
  }

  const clientIp = normalizeIp(options.clientIp);
  if (!clientIp) {
    return { allowed: false, reason: "ip-unavailable" };
  }

  if (!isIpAllowed(clientIp, allowedIps)) {
    return { allowed: false, reason: "ip-not-allowed" };
  }

  return { allowed: true, reason: "allowed" };
}

export function getMasterAdminErrorMessage(reason: MasterAdminAccessReason): string {
  switch (reason) {
    case "not-authenticated":
      return "Sign in required for admin access.";
    case "not-master-admin":
      return "Only the master admin account can access this area.";
    case "master-admin-email-missing":
      return "Admin policy is not configured: MASTER_ADMIN_EMAIL is missing.";
    case "admin-ip-list-missing":
      return "Admin policy is not configured: MASTER_ADMIN_ALLOWED_IPS is missing.";
    case "ip-unavailable":
      return "Unable to verify your network IP for admin access.";
    case "ip-not-allowed":
      return "Your current IP is not allowed for admin access.";
    case "development-bypass":
      return "Admin policy bypassed in development mode.";
    default:
      return "Access granted.";
  }
}
