const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

// Helper to convert simple markdown to styled HTML
function markdownToHtml(title, mdContent, isResearch = false) {
  // Convert lines
  const lines = mdContent.split("\n");
  let htmlBody = "";
  let inTable = false;
  let tableHeaderDone = false;
  let inCode = false;
  let codeBuffer = "";

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Code blocks
    if (line.trim().startsWith("```")) {
      if (inCode) {
        htmlBody += `<pre><code>${escapeHtml(codeBuffer)}</code></pre>\n`;
        codeBuffer = "";
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuffer += line + "\n";
      continue;
    }

    // Tables
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      if (!inTable) {
        inTable = true;
        tableHeaderDone = false;
        htmlBody += "<table>\n";
      }
      if (line.includes("---")) {
        tableHeaderDone = true;
        continue;
      }
      const cells = line.split("|").slice(1, -1).map(c => c.trim());
      if (!tableHeaderDone) {
        htmlBody += "  <thead><tr>" + cells.map(c => `<th>${formatInline(c)}</th>`).join("") + "</tr></thead>\n  <tbody>\n";
      } else {
        htmlBody += "  <tr>" + cells.map(c => `<td>${formatInline(c)}</td>`).join("") + "</tr>\n";
      }
      continue;
    } else if (inTable) {
      inTable = false;
      htmlBody += "  </tbody>\n</table>\n";
    }

    // Headers
    if (line.startsWith("# ")) {
      htmlBody += `<h1>${formatInline(line.slice(2))}</h1>\n`;
    } else if (line.startsWith("## ")) {
      htmlBody += `<h2>${formatInline(line.slice(3))}</h2>\n`;
    } else if (line.startsWith("### ")) {
      htmlBody += `<h3>${formatInline(line.slice(4))}</h3>\n`;
    } else if (line.startsWith("#### ")) {
      htmlBody += `<h4>${formatInline(line.slice(5))}</h4>\n`;
    } else if (line.startsWith("---")) {
      htmlBody += `<hr/>\n`;
    } else if (line.startsWith("- ")) {
      htmlBody += `<ul><li>${formatInline(line.slice(2))}</li></ul>\n`;
    } else if (/^\d+\.\s/.test(line)) {
      const text = line.replace(/^\d+\.\s/, "");
      htmlBody += `<ol><li>${formatInline(text)}</li></ol>\n`;
    } else if (line.trim().length > 0) {
      htmlBody += `<p>${formatInline(line)}</p>\n`;
    }
  }
  if (inTable) {
    htmlBody += "  </tbody>\n</table>\n";
  }

  // Consolidate consecutive <ul> and <ol>
  htmlBody = htmlBody.replace(/<\/ul>\s*<ul>/g, "");
  htmlBody = htmlBody.replace(/<\/ol>\s*<ol>/g, "");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  @page {
    size: A4;
    margin: ${isResearch ? "14mm 16mm" : "16mm 18mm"};
  }
  * {
    box-sizing: border-box;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1a202c;
    background: #fff;
    line-height: ${isResearch ? "1.4" : "1.5"};
    font-size: ${isResearch ? "10pt" : "10.5pt"};
    margin: 0;
    padding: 0;
  }
  h1 {
    font-size: ${isResearch ? "16pt" : "18pt"};
    color: #0f172a;
    border-bottom: 2px solid #3b82f6;
    padding-bottom: 4px;
    margin-top: 0;
    margin-bottom: 8px;
  }
  h2 {
    font-size: ${isResearch ? "12pt" : "13pt"};
    color: #1e3a8a;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 3px;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }
  h3 {
    font-size: ${isResearch ? "10.5pt" : "11pt"};
    color: #2563eb;
    margin-top: 10px;
    margin-bottom: 4px;
    page-break-after: avoid;
  }
  p {
    margin-top: 0;
    margin-bottom: 6px;
  }
  ul, ol {
    margin-top: 0;
    margin-bottom: 6px;
    padding-left: 18px;
  }
  li {
    margin-bottom: 3px;
  }
  hr {
    border: none;
    border-top: 1px solid #cbd5e1;
    margin: 8px 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: ${isResearch ? "9pt" : "9.5pt"};
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 5px 8px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #f1f5f9;
    font-weight: 600;
    color: #0f172a;
  }
  tr:nth-child(even) {
    background: #f8fafc;
  }
  pre {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 8px;
    font-size: 8pt;
    font-family: Consolas, "Courier New", monospace;
    overflow-x: auto;
    margin: 8px 0;
    line-height: 1.3;
    page-break-inside: avoid;
  }
  code {
    background: #f1f5f9;
    padding: 1px 4px;
    border-radius: 3px;
    font-family: Consolas, "Courier New", monospace;
    font-size: 9pt;
  }
  pre code {
    background: transparent;
    padding: 0;
  }
  .badge {
    display: inline-block;
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 8.5pt;
    font-weight: 500;
  }
</style>
</head>
<body>
${htmlBody}
</body>
</html>`;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

// Ensure folders
const submissionDir = path.resolve("submission");
const desktopDir = path.join(process.env.USERPROFILE || "C:\\Users\\Lenovo", "Desktop", "LLD_Assignment_Submission");
if (!fs.existsSync(submissionDir)) fs.mkdirSync(submissionDir, { recursive: true });
if (!fs.existsSync(desktopDir)) fs.mkdirSync(desktopDir, { recursive: true });

// 1. Process Research Note
const researchMd = fs.readFileSync("RESEARCH.md", "utf-8");
const researchHtml = markdownToHtml("Research Note - Takshaka", researchMd, true);
fs.writeFileSync("submission/research.html", researchHtml, "utf-8");

const researchPdfSub = path.join(submissionDir, "Research_Note.pdf");
const researchPdfDesk = path.join(desktopDir, "Research_Note.pdf");
execSync(`"${edgePath}" --headless --disable-gpu --print-to-pdf="${researchPdfSub}" --no-pdf-header-footer "${path.join(submissionDir, "research.html")}"`);
fs.copyFileSync(researchPdfSub, researchPdfDesk);
console.log("Research_Note.pdf generated successfully!");

// 2. Process Design Note
const designMd = fs.readFileSync("DESIGN.md", "utf-8");
const designHtml = markdownToHtml("Design Note - Takshaka", designMd, false);
fs.writeFileSync("submission/design.html", designHtml, "utf-8");

const designPdfSub = path.join(submissionDir, "Design_Note.pdf");
const designPdfDesk = path.join(desktopDir, "Design_Note.pdf");
execSync(`"${edgePath}" --headless --disable-gpu --print-to-pdf="${designPdfSub}" --no-pdf-header-footer "${path.join(submissionDir, "design.html")}"`);
fs.copyFileSync(designPdfSub, designPdfDesk);
console.log("Design_Note.pdf generated successfully!");

// Copy README_AI_USAGE.md to desktop too
fs.copyFileSync("README_AI_USAGE.md", path.join(desktopDir, "README_AI_USAGE.md"));
console.log("All deliverables assembled in submission/ and Desktop/LLD_Assignment_Submission!");
