export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { code, input = "" } = req.body || {};

        // Validate code
        if (!code || typeof code !== "string") {
            return res.status(400).json({
                error: "C code is required."
            });
        }

        if (code.length > 50000) {
            return res.status(400).json({
                error: "Code is too large."
            });
        }

        // Send code to Judge0
        const response = await fetch(
            "https://ce.judge0.com/submissions/?base64_encoded=false&wait=true",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    source_code: code,
                    language_id: 50,
                    stdin: input
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: result.error || "Compiler service error."
            });
        }

        return res.status(200).json({
            status: result.status,
            stdout: result.stdout || "",
            stderr: result.stderr || "",
            compile_output: result.compile_output || "",
            message: result.message || "",
            time: result.time || null,
            memory: result.memory || null
        });

    } catch (error) {
        console.error("Compiler error:", error);

        return res.status(500).json({
            error: "Unable to connect to the compiler service."
        });
    }
}