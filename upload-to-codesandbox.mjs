import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read App.tsx source
const appSource = fs.readFileSync(path.join(__dirname, 'src', 'App.tsx'), 'utf8');

// CodeSandbox classic React TypeScript sandbox format
const files = {
  "package.json": {
    content: {
      name: "partner-center-bungaetalk",
      version: "1.0.0",
      main: "src/index.tsx",
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-scripts": "5.0.1"
      },
      devDependencies: {
        "@types/react": "^18.2.43",
        "@types/react-dom": "^18.2.17",
        "typescript": "^5.2.2"
      },
      scripts: {
        start: "react-scripts start",
        build: "react-scripts build"
      }
    }
  },
  "public/index.html": {
    content: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>파트너센터 — 번개톡</title>
  <style>* { margin: 0; padding: 0; box-sizing: border-box; }</style>
</head>
<body>
  <div id="root"></div>
</body>
</html>`
  },
  "src/index.tsx": {
    content: `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`
  },
  "src/App.tsx": {
    content: appSource
  },
  "tsconfig.json": {
    content: {
      compilerOptions: {
        target: "ES2020",
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        moduleResolution: "node",
        jsx: "react-jsx",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        noUnusedLocals: false,
        noUnusedParameters: false
      },
      include: ["src"]
    }
  }
};

const payload = JSON.stringify({ files });

console.log('Uploading to CodeSandbox...');

const options = {
  hostname: 'codesandbox.io',
  path: '/api/v1/sandboxes/define',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(data);
        const id = response.sandbox_id;
        console.log(`\n✓ Success!`);
        console.log(`Preview:  https://${id}.csb.app/`);
        console.log(`Editor:   https://codesandbox.io/s/${id}`);
      } catch (err) {
        console.error('Parse error:', data.slice(0, 500));
      }
    } else if (res.statusCode === 302 && res.headers.location) {
      const match = res.headers.location.match(/\/s\/([a-z0-9]+)/);
      if (match) {
        const id = match[1];
        console.log(`\n✓ Success!`);
        console.log(`Preview:  https://${id}.csb.app/`);
        console.log(`Editor:   https://codesandbox.io/s/${id}`);
      }
    } else {
      console.error(`Failed (${res.statusCode}):`, data.slice(0, 500));
    }
  });
});

req.on('error', (err) => { console.error('Error:', err.message); });
req.write(payload);
req.end();
