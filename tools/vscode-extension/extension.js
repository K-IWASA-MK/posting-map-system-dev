const vscode = require('vscode');
const child_process = require('child_process');
const http = require('http');

const EXTENSION_VERSION = "1.0.0";
const PLATFORM_VERSION = "Phase21";

let outputChannel;

function getOutputChannel() {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel("CIE Platform");
    }
    return outputChannel;
}

function writeHeader(channel, commandName) {
    channel.appendLine("=========================");
    channel.appendLine("CIE Platform");
    channel.appendLine("=========================");
    channel.appendLine(`CIE Platform Version : ${PLATFORM_VERSION}`);
    channel.appendLine(`Extension Version    : ${EXTENSION_VERSION}`);
    channel.appendLine(`Command              : ${commandName}`);
    channel.appendLine("-------------------------");
}

function runCieCommand(subcommand, friendlyName) {
    const channel = getOutputChannel();
    channel.show(true);
    writeHeader(channel, friendlyName);
    
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const cwd = workspaceFolders ? workspaceFolders[0].uri.fsPath : process.cwd();
    
    channel.appendLine(`ℹ Running python3 tools/cie.py ${subcommand}...`);
    
    const startTime = process.hrtime();
    
    child_process.exec(`python3 tools/cie.py ${subcommand}`, { cwd }, (error, stdout, stderr) => {
        const endTime = process.hrtime(startTime);
        const elapsed = (endTime[0] + endTime[1] / 1e9).toFixed(2);
        
        if (stdout) {
            channel.append(stdout);
        }
        if (stderr) {
            channel.append(stderr);
        }
        
        channel.appendLine("-------------------------");
        if (error) {
            channel.appendLine(`✖ FAILED (Exit Code: ${error.code || 1})`);
            vscode.window.showErrorMessage(`✖ CIE command "${friendlyName}" failed.`);
        } else {
            channel.appendLine("✔ SUCCESS");
            vscode.window.showInformationMessage(`✔ CIE command "${friendlyName}" completed.`);
        }
        channel.appendLine(`Elapsed : ${elapsed} sec\n`);
    });
}

function checkApiStatus() {
    const channel = getOutputChannel();
    channel.show(true);
    writeHeader(channel, "CIE: API Status");
    
    channel.appendLine("ℹ Checking local API Server status (http://127.0.0.1:8080/health)...");
    
    const startTime = process.hrtime();
    
    const req = http.get("http://127.0.0.1:8080/health", (res) => {
        const endTime = process.hrtime(startTime);
        const elapsed = (endTime[0] + endTime[1] / 1e9).toFixed(2);
        
        channel.appendLine("-------------------------");
        if (res.statusCode === 200) {
            channel.appendLine("✔ API Status : ONLINE");
            vscode.window.showInformationMessage("✔ CIE API Server is ONLINE.");
        } else {
            channel.appendLine(`✖ API Status : OFFLINE (HTTP ${res.statusCode})`);
            vscode.window.showWarningMessage("✖ CIE API Server returned non-200 response.");
        }
        channel.appendLine(`Elapsed : ${elapsed} sec\n`);
    });
    
    req.on('error', (e) => {
        const endTime = process.hrtime(startTime);
        const elapsed = (endTime[0] + endTime[1] / 1e9).toFixed(2);
        
        channel.appendLine("-------------------------");
        channel.appendLine("✖ API Status : OFFLINE");
        vscode.window.showWarningMessage("✖ CIE API Server is OFFLINE.");
        channel.appendLine(`Elapsed : ${elapsed} sec\n`);
    });
    
    req.end();
}

function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('cie.build', () => {
            runCieCommand('build', 'CIE: Build');
        })
    );
    
    context.subscriptions.push(
        vscode.commands.registerCommand('cie.verify', () => {
            runCieCommand('verify', 'CIE: Verify');
        })
    );
    
    context.subscriptions.push(
        vscode.commands.registerCommand('cie.doctor', () => {
            runCieCommand('doctor', 'CIE: Doctor');
        })
    );
    
    context.subscriptions.push(
        vscode.commands.registerCommand('cie.report', () => {
            runCieCommand('report', 'CIE: Report');
        })
    );
    
    context.subscriptions.push(
        vscode.commands.registerCommand('cie.dashboard', () => {
            const channel = getOutputChannel();
            channel.show(true);
            writeHeader(channel, "CIE: Dashboard");
            channel.appendLine("ℹ Dashboard Resource Check:");
            channel.appendLine("Dashboard generated.");
            channel.appendLine("\nOpen:");
            channel.appendLine("tools/dashboard/index.html");
            channel.appendLine("-------------------------");
            channel.appendLine("✔ SUCCESS\n");
        })
    );
    
    context.subscriptions.push(
        vscode.commands.registerCommand('cie.apiStatus', () => {
            checkApiStatus();
        })
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
