const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
  console.log("[dns-preload] Google DNS configured for process:", dns.getServers());
} catch (e) {
  console.error("[dns-preload] Failed to set DNS:", e);
}
