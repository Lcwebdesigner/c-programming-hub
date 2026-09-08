const examples = {
  hello: {
    code: `#include <stdio.h>\n\nint main(void) {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
    input: ""
  },
  even: {
    code: `#include <stdio.h>\n\nint main(void) {\n    int number;\n    printf("Enter a number: ");\n    scanf("%d", &number);\n\n    if (number % 2 == 0)\n        printf("%d is even.\\n", number);\n    else\n        printf("%d is odd.\\n", number);\n\n    return 0;\n}`,
    input: "10"
  },
  sum: {
    code: `#include <stdio.h>\n\nint main(void) {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("Sum = %d\\n", a + b);\n    return 0;\n}`,
    input: "12 8"
  },
  prime: {
    code: `#include <stdio.h>\n\nint main(void) {\n    int n, i, prime = 1;\n    scanf("%d", &n);\n\n    if (n < 2) prime = 0;\n    for (i = 2; i * i <= n && prime; i++) {\n        if (n % i == 0) prime = 0;\n    }\n\n    if (prime) printf("%d is prime.\\n", n);\n    else printf("%d is not prime.\\n", n);\n    return 0;\n}`,
    input: "17"
  },
  factorial: {
    code: `#include <stdio.h>\n\nint main(void) {\n    int n, i;\n    unsigned long long factorial = 1;\n    scanf("%d", &n);\n\n    if (n < 0) {\n        printf("Factorial is not defined for negative numbers.\\n");\n        return 0;\n    }\n\n    for (i = 1; i <= n; i++)\n        factorial *= i;\n\n    printf("%d! = %llu\\n", n, factorial);\n    return 0;\n}`,
    input: "5"
  }
};

const $ = (id) => document.getElementById(id);
const editor = $("codeEditor");
const stdin = $("stdin");
const output = $("output");
const runBtn = $("runBtn");
const statusText = $("statusText");
const resultMeta = $("resultMeta");
const exampleSelect = $("exampleSelect");

function loadExample(name) {
  const example = examples[name] || examples.hello;
  editor.value = example.code;
  stdin.value = example.input;
  output.textContent = "Run your program to see the output here.";
  statusText.textContent = "Ready";
  resultMeta.textContent = "";
}

function showResult(result) {
  const compileError = result.compile_output || "";
  const runtimeError = result.stderr || "";
  const text = result.stdout || compileError || runtimeError || result.message || "Program finished with no output.";
  output.textContent = text;
  resultMeta.textContent = result.status?.description || "Finished";
  if (result.time) resultMeta.textContent += ` · ${result.time}s`;
}

async function runCode() {
  if (!editor.value.trim()) return;
  runBtn.disabled = true;
  runBtn.textContent = "⏳ Running...";
  statusText.textContent = "Compiling...";
  resultMeta.textContent = "";
  output.textContent = "Running your C program...";

  try {
    const response = await fetch("/api/compile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_code: editor.value, stdin: stdin.value })
    });
    const result = await response.json().catch(() => ({ error: "Invalid response from server." }));
    if (!response.ok) throw new Error(result.error || "Compilation service failed.");
    showResult(result);
    statusText.textContent = "Done";
  } catch (error) {
    output.textContent = error.message || "Something went wrong. Please try again.";
    statusText.textContent = "Error";
    resultMeta.textContent = "";
  } finally {
    runBtn.disabled = false;
    runBtn.textContent = "▶ Run Code";
  }
}

$("copyCompilerBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(editor.value);
    statusText.textContent = "Copied";
    setTimeout(() => statusText.textContent = "Ready", 1500);
  } catch {
    statusText.textContent = "Copy failed";
  }
});

$("clearBtn").addEventListener("click", () => {
  editor.value = "";
  stdin.value = "";
  output.textContent = "Run your program to see the output here.";
  statusText.textContent = "Ready";
  resultMeta.textContent = "";
  editor.focus();
});

exampleSelect.addEventListener("change", () => loadExample(exampleSelect.value));
runBtn.addEventListener("click", runCode);
editor.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") runCode();
  if (event.key === "Tab") {
    event.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.value = editor.value.slice(0, start) + "    " + editor.value.slice(end);
    editor.selectionStart = editor.selectionEnd = start + 4;
  }
});

// Keep the mobile navigation behaviour consistent with the existing site.
const menuToggle = $("menuToggle");
const navLinks = $("navLinks");
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
}

loadExample("hello");
