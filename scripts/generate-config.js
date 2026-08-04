const fs = require("fs");
const path = require("path");

console.log("🚀 Generating runtime config.js and syncing public build assets...");

// 1. Generate config.js
const supabaseUrl = process.env.SUPABASE_URL || "https://nwrhhclyjuhrmcazigrr.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cmhoY2x5anVocm1jYXppZ3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTA1MTgsImV4cCI6MjA1NTkyNjUxOH0.1NUpJzT2eA47_cndvAStJjYt9p48i9x2KIn1dDqg80Q";

const configContent = `// Auto-generated runtime configuration
window.ENV = {
  SUPABASE_URL: "${supabaseUrl}",
  SUPABASE_ANON_KEY: "${supabaseKey}"
};
window.__SUPABASE_CONFIG__ = {
  url: "${supabaseUrl}",
  anonKey: "${supabaseKey}"
};
`;

const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const publicJsDir = path.join(publicDir, "js");
const publicCssDir = path.join(publicDir, "css");
const publicVendorDir = path.join(publicDir, "vendor");

[publicDir, publicJsDir, publicCssDir, publicVendorDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

fs.writeFileSync(path.join(rootDir, "config.js"), configContent);
fs.writeFileSync(path.join(publicDir, "config.js"), configContent);

// Helper function to safely copy files if they exist
function safeCopy(srcFile, destFile) {
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
    console.log(`✅ Synced: ${path.relative(rootDir, destFile)}`);
  }
}

// 2. Sync all root files to public directory
safeCopy(path.join(rootDir, "index.html"), path.join(publicDir, "index.html"));
safeCopy(path.join(rootDir, "app.js"), path.join(publicJsDir, "app.js"));
safeCopy(path.join(rootDir, "app.js"), path.join(publicDir, "app.js"));
safeCopy(path.join(rootDir, "api.js"), path.join(publicJsDir, "api.js"));
safeCopy(path.join(rootDir, "api.js"), path.join(publicDir, "api.js"));
safeCopy(path.join(rootDir, "style.css"), path.join(publicCssDir, "style.css"));
safeCopy(path.join(rootDir, "style.css"), path.join(publicDir, "style.css"));
safeCopy(path.join(rootDir, "sw.js"), path.join(publicDir, "sw.js"));
safeCopy(path.join(rootDir, "manifest.json"), path.join(publicDir, "manifest.json"));

// 3. Sync vendor directory if present
const rootVendor = path.join(rootDir, "vendor");
if (fs.existsSync(rootVendor)) {
  fs.readdirSync(rootVendor).forEach((file) => {
    safeCopy(path.join(rootVendor, file), path.join(publicVendorDir, file));
  });
}

console.log("🎉 Build sync completed successfully!");
