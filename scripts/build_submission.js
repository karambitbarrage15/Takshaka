const fs = require("fs");
const path = require("path");

const readme = fs.readFileSync("README.md", "utf-8");
const aiUsage = fs.readFileSync("AI_USAGE.md", "utf-8");

const combined = `# Takshaka — Low-Level Design (LLD) Practice Platform
# README + AI Usage Documentation

> **Live Working Prototype**: [https://takshaka-platform.vercel.app/](https://takshaka-platform.vercel.app/)  
> **GitHub Repository**: [https://github.com/karambitbarrage15/Takshaka.git](https://github.com/karambitbarrage15/Takshaka.git)  
> **Deliverable**: Combined README + AI_USAGE.md (Submission Field 4)

---

` + readme + `

---

` + aiUsage;

fs.writeFileSync("README_AI_USAGE.md", combined, "utf-8");
if (!fs.existsSync("submission")) {
  fs.mkdirSync("submission", { recursive: true });
}
fs.writeFileSync("submission/README_AI_USAGE.md", combined, "utf-8");

// Also create on Desktop if available
const desktopPath = path.join(process.env.USERPROFILE || "C:\\Users\\Lenovo", "Desktop", "LLD_Assignment_Submission");
if (!fs.existsSync(desktopPath)) {
  fs.mkdirSync(desktopPath, { recursive: true });
}
fs.writeFileSync(path.join(desktopPath, "README_AI_USAGE.md"), combined, "utf-8");

console.log("README_AI_USAGE.md created successfully. Total length:", combined.length);
