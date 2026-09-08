C PROGRAMMING HUB - ONLINE C COMPILER

FILES ADDED/UPDATED
- compiler.html       Online compiler page
- compiler.js         Compiler UI, examples, input/output and API calls
- api/compile.js      Vercel serverless endpoint that calls Judge0
- index.html          Added Compiler navigation link and homepage CTA
- style.css           Added responsive compiler styling

VERCEL SETUP
1. Upload these files/folders to the same Vercel project:
   index.html
   style.css
   script.js
   compiler.html
   compiler.js
   api/compile.js

2. The API defaults to:
   https://ce.judge0.com

3. If the Judge0 instance you use requires authentication, add a Vercel environment variable:
   JUDGE0_API_KEY = your-token

4. If you use a RapidAPI Judge0 endpoint, also add:
   JUDGE0_URL = https://your-judge0-endpoint
   JUDGE0_API_KEY = your-rapidapi-key
   JUDGE0_API_HOST = your-rapidapi-host

5. Redeploy after adding environment variables.

IMPORTANT
- Never put a private Judge0 API key in compiler.js or any browser-side file.
- The compiler endpoint is /api/compile.
- C is sent as Judge0 language_id 50 (GNU C11).
- Execution is limited to reduce abuse: 2 CPU seconds, 5 wall seconds, 128 MB memory and network disabled.
- Test the site at /compiler.html after deployment.
