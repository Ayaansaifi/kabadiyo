const fs = require('fs');

try {
    const report = JSON.parse(fs.readFileSync('lint_report_3.json', 'utf8'));
    let errorCount = 0;
    let output = '';

    report.forEach(file => {
        let fileErrors = '';
        let hasErrors = false;

        file.messages.forEach(msg => {
            if (msg.severity === 2) { // 2 is error
                fileErrors += `  Line ${msg.line}: [${msg.ruleId}] ${msg.message}\n`;
                hasErrors = true;
                errorCount++;
            }
        });

        if (hasErrors) {
            output += `\nFile: ${file.filePath}\n${fileErrors}`;
        }
    });

    output += `\nTotal Errors: ${errorCount}\n`;
    fs.writeFileSync('lint_errors_3.txt', output, 'utf8');
    console.log('Written to lint_errors.txt');

} catch (e) {
    console.error("Error parsing JSON:", e);
}
