export default async function handler(req, res) {
    try {

        // ==========================================
        // CREATE NEW COMPILATION
        // ==========================================

        if (req.method === "POST") {

            const { code, input = "" } = req.body || {};

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

            const response = await fetch(
                "https://ce.judge0.com/submissions/?base64_encoded=false",
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
                token: result.token
            });
        }


        // ==========================================
        // GET COMPILATION RESULT
        // ==========================================

        if (req.method === "GET") {

            const { token } = req.query;

            if (!token) {
                return res.status(400).json({
                    error: "Compilation token is required."
                });
            }

            const response = await fetch(
                `https://ce.judge0.com/submissions/${encodeURIComponent(token)}?base64_encoded=false`,
                {
                    method: "GET"
                }
            );

            const result = await response.json();

            if (!response.ok) {
                return res.status(response.status).json({
                    error: result.error || "Unable to get compilation result."
                });
            }

            return res.status(200).json(result);
        }


        // ==========================================
        // INVALID METHOD
        // ==========================================

        return res.status(405).json({
            error: "Method not allowed."
        });

    } catch (error) {

        console.error("Compiler error:", error);

        return res.status(500).json({
            error: "Unable to connect to the compiler service."
        });
    }
}