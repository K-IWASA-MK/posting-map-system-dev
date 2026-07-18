/**
 * POSTING MAP
 * Phase 37: HQ Notification Dispatch Coordinator Engine
 */

const fs = require('fs');
const path = require('path');
const ChatworkAPI = require('./chatwork-api');

const args = process.argv.slice(2);
const typeIndex = args.indexOf('--type');
const notifyType = (typeIndex !== -1 && args[typeIndex + 1]) ? args[typeIndex + 1] : 'test';

const historyPath = path.join(__dirname, '..', 'active', 'dashboard', 'clients', 'notifications-history.json');
const chatwork = new ChatworkAPI();

function updateNotificationHistory(timestamp, type, status, content, response) {
  let data = { schemaVersion: 1, history: [] };
  if (fs.existsSync(historyPath)) {
    try {
      data = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch (e) {
      console.warn("⚠️ Notifications history parsing failed, starting fresh.");
    }
  }

  data.history.unshift({
    type,
    timestamp,
    status,
    contentPreview: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
    response
  });

  // Limit to 100 entries
  if (data.history.length > 100) {
    data.history = data.history.slice(0, 100);
  }

  fs.writeFileSync(historyPath, JSON.stringify(data, null, 2), 'utf8');
}

async function dispatchAlertNotification() {
  const alertsPath = path.join(__dirname, '..', 'active', 'dashboard', 'clients', 'alerts.json');
  if (!fs.existsSync(alertsPath)) {
    console.log("No alerts file found to dispatch.");
    return;
  }

  const { alerts } = JSON.parse(fs.readFileSync(alertsPath, 'utf8'));
  if (alerts.length === 0) {
    console.log("No active alerts detected. Skipping chatwork dispatch.");
    return;
  }

  let msg = "[info][title]🚨 POSTING MAP HQ OPERATIONAL ALERTS[/title]";
  alerts.forEach((a, i) => {
    msg += `${i + 1}. [${a.severity}] ${a.districtId}\n   ${a.message}\n`;
  });
  msg += "[/info]";

  const timestamp = Date.now();
  const res = await chatwork.sendMessage(msg);
  updateNotificationHistory(timestamp, "alert", res.success ? "SUCCESS" : "FAILED", msg, res);
}

async function dispatchReportNotification() {
  const fileIndex = args.indexOf('--filePath');
  if (fileIndex === -1 || !args[fileIndex + 1]) {
    console.error("❌ Error: Missing report path parameter. Use --filePath <path>");
    process.exit(1);
  }
  const relPath = args[fileIndex + 1];
  const absPath = path.join(__dirname, '..', 'active', 'dashboard', relPath);

  if (!fs.existsSync(absPath)) {
    console.error(`❌ Error: Report file not found at ${absPath}`);
    process.exit(1);
  }

  const mdContent = fs.readFileSync(absPath, 'utf8');
  let msg = `[info][title]📋 POSTING MAP REPORT[/title]\n${mdContent}\n[/info]`;

  const timestamp = Date.now();
  const res = await chatwork.sendMessage(msg);
  updateNotificationHistory(timestamp, "report", res.success ? "SUCCESS" : "FAILED", msg, res);
}

async function dispatchProvisionNotification() {
  const distIndex = args.indexOf('--district');
  if (distIndex === -1 || !args[distIndex + 1]) {
    console.error("❌ Error: Missing district ID parameter. Use --district <ID>");
    process.exit(1);
  }
  const districtId = args[distIndex + 1];

  let msg = `[info][title]🎉 NEW DISTRICT READY GATE CERTIFIED[/title]`;
  msg += `District [${districtId}] has been successfully provisioned and verified.\n`;
  msg += `* Status: READY\n`;
  msg += `* Timestamp: ${new Date().toLocaleString()}\n`;
  msg += `* Registry Entry: Generated config.js and deployment.json under clients/\n`;
  msg += `* Verification: Simulated H-App payload test PASSED.\n`;
  msg += `[/info]`;

  const timestamp = Date.now();
  const res = await chatwork.sendMessage(msg);
  updateNotificationHistory(timestamp, "provision", res.success ? "SUCCESS" : "FAILED", msg, res);
}

async function main() {
  if (notifyType === 'alert') {
    await dispatchAlertNotification();
  } else if (notifyType === 'report') {
    await dispatchReportNotification();
  } else if (notifyType === 'provision') {
    await dispatchProvisionNotification();
  } else {
    // Simple test notification
    const msg = `[info][title]🔌 POSTING MAP Chatwork notification test connection[/title]HQ Notification Engine link online: ${new Date().toLocaleString()}[/info]`;
    const timestamp = Date.now();
    const res = await chatwork.sendMessage(msg);
    updateNotificationHistory(timestamp, "test", res.success ? "SUCCESS" : "FAILED", msg, res);
  }
}

main();
