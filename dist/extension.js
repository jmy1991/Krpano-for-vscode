const vscode = require('vscode');

function activate(context) {
  let disposable = vscode.languages.registerDocumentFormattingEditProvider('krpano', {
    provideDocumentFormattingEdits(document, options) {
      let fullText = document.getText();
      let fullRange = new vscode.Range(document.positionAt(0), document.positionAt(fullText.length));
      let formattedText = formatKrpanoActions(fullText, options);
      return [vscode.TextEdit.replace(fullRange, formattedText)];
    }
  });
}

function formatKrpanoActions(text, options) {
  // 实现格式化逻辑
  const indentSize = options.insertSpaces ? options.tabSize : 4;
  const indentChar = options.insertSpaces ? ' ' : '\t';

  return text.replace(/(<action\s*[^>]*>)([\s\S]*?)(<\/action>)/g, (match, openingTag, content, closingTag) => {
    const lines = content.split('\n').map(line => line.trim());
    let formattedLines = [];
    let currentIndentLevel = 0;

    const increaseIndentPattern = /^\s*((begin|class|(private|protected)\s+def|def|else|elsif|ensure|for|if|module|rescue|unless|until|when|while|case)|([^#]*\sdo\b)|([^#]*=\s*(case|if|unless)))\b([^#{};]|("|'|\/).*\8)*(#.*)?$/;
    const decreaseIndentPattern = /^\s*(}\]?\s*(#|$)|\.[a-zA-Z_]\w*\b)|(end|rescue|ensure|else|elsif|when)\b$/;
    const indentNextLinePattern = /^(?!.*;\s*\/\/).*[^;\s{}]$/;

    lines.forEach((line, index) => {
      if (increaseIndentPattern.test(line)) {
        formattedLines.push(indentChar.repeat(currentIndentLevel * indentSize) + line);
        currentIndentLevel++;
      } else if (decreaseIndentPattern.test(line)) {
        currentIndentLevel = Math.max(0, currentIndentLevel - 1);
        formattedLines.push(indentChar.repeat(currentIndentLevel * indentSize) + line);
      } else {
        formattedLines.push(indentChar.repeat(currentIndentLevel * indentSize) + line);
      }

      // Check if the current line should increase indentation for the next line
      if (indentNextLinePattern.test(line)) {
        currentIndentLevel++;
      }
    });

    const formattedContent = formattedLines.join('\n');
    return `${openingTag}\n${formattedContent}\n${closingTag}`;
  });
}

exports.activate = activate;

function deactivate() {}

exports.deactivate = deactivate;