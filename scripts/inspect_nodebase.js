const fs = require("fs");
async function run() {
  const res = await fetch("https://nodebase.raghavseth.in/");
  const html = await res.text();
  console.log(html.substring(8000, 10500));
}
run();
