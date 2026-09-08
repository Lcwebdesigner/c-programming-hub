const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const JUDGE0_URL = (process.env.JUDGE0_URL || "https://ce.judge0.com").replace(/\/$/, "");

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
}

function judgeHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (process.env.JUDGE0_API_KEY) headers["X-Auth-Token"] = process.env.JUDGE0_API_KEY;
  if (process.env.JUDGE0_API_HOST) headers["X-RapidAPI-Key"] = process.env.JUDGE0_API_KEY || "";
  if (process.env.JUDGE0_API_HOST) headers["X-RapidAPI-Host"] = process.env.JUDGE0_API_HOST;
  return headers;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function judgeFetch(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const sourceCode = typeof body.source_code === "string" ? body.source_code : "";
    const stdin = typeof body.stdin === "string" ? body.stdin : "";

    if (!sourceCode.trim()) return res.status(400).json({ error: "Please enter some C code." });
    if (sourceCode.length > 30000) return res.status(400).json({ error: "Code is too long. Maximum allowed is 30,000 characters." });
    if (stdin.length > 10000) return res.status(400).json({ error: "Input is too long. Maximum allowed is 10,000 characters." });

    const payload = {
      source_code: sourceCode,
      language_id: 50,
      stdin,
      cpu_time_limit: 2,
      wall_time_limit: 5,
      memory_limit: 128000,
      enable_network: false
    };

    // Create the submission without wait=true. The official Judge0 docs note
    // that wait=true may be disabled on some hosts, so we poll the token instead.
    const createResponse = await judgeFetch(`${JUDGE0_URL}/submissions?wait=false&base64_encoded=false`, {
      method: "POST",
      headers: judgeHeaders(),
      body: JSON.stringify(payload)
    });

    const createText = await createResponse.text();
    let created;
    try { created = JSON.parse(createText); } catch { created = { message: createText }; }

    if (!createResponse.ok || !created.token) {
      return res.status(502).json({ error: created.message || created.error || "Compiler service rejected the submission.", details: created });
    }

    let result = null;
    for (let attempt = 0; attempt < 12; attempt++) {
      await sleep(550);
      const resultResponse = await judgeFetch(`${JUDGE0_URL}/submissions/${encodeURIComponent(created.token)}?base64_encoded=false`, {
        method: "GET",
        headers: judgeHeaders()
      });
      const resultText = await resultResponse.text();
      let candidate;
      try { candidate = JSON.parse(resultText); } catch { candidate = null; }
      if (!resultResponse.ok || !candidate) {
        return res.status(502).json({ error: "Compiler service could not return the result." });
      }
      result = candidate;
      const statusId = Number(candidate.status && candidate.status.id);
      if (statusId >= 3) break;
    }

    if (!result || !result.status || [1, 2].includes(Number(result.status.id))) {
      return res.status(504).json({ error: "The compiler is taking too long. Please run the program again." });
    }

    return res.status(200).json({
      status: result.status || null,
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      compile_output: result.compile_output || "",
      message: result.message || "",
      time: result.time || null,
      memory: result.memory || null
    });
  } catch (error) {
    console.error("Compiler error:", error);
    const message = error && error.name === "AbortError"
      ? "The compiler service timed out. Please try again."
      : "Unable to reach the C compiler service. Please try again.";
    return res.status(500).json({ error: message });
  }
};
                                            
