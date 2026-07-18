/**
 * POSTING MAP
 * Phase 32: OAuth Reachability & Authorization Checker
 */

class OAuthChecker {
  static async check(webAppUrl, apiKey) {
    console.log(`Checking OAuth Status...`);
    const testUrl = `${webAppUrl}?apiKey=${apiKey}&_t=${Date.now()}`;
    
    try {
      const res = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "verifyDeployment" }),
        redirect: 'follow'
      });

      const text = await res.text();
      
      // Google Drive error pages typically contain Drive icons or specific warning strings
      const isDriveError = text.includes("現在、ファイルを開くことができません。") || 
                           text.includes("docs.google.com") || 
                           text.includes("drive-logo") ||
                           res.status === 405;

      if (isDriveError) {
        return {
          authorized: false,
          reason: "Google Drive OAuth lock detected. Web App execution is blocked by the gateway."
        };
      }

      // Check if it returned a valid JSON format (even if authentication fails internally)
      try {
        const json = JSON.parse(text);
        // If it parsed as JSON, the engine successfully reached doPost()!
        return {
          authorized: true,
          json: json
        };
      } catch (err) {
        return {
          authorized: false,
          reason: `Invalid JSON returned: ${text.substring(0, 100)}`
        };
      }
    } catch (e) {
      return {
        authorized: false,
        reason: `Network/Fetch error: ${e.toString()}`
      };
    }
  }
}

module.exports = OAuthChecker;
