
const { spawn } = require("child_process");
const path = require("path");

function processNewsWithPython(news) {
  return new Promise((resolve, reject) => {
    const pythonFile = path.join(
      __dirname,
      "../python/news_processor.py"
    );

    const python = spawn("py", [pythonFile]);

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", data => {
      output += data.toString();
    });

    python.stderr.on("data", data => {
      errorOutput += data.toString();
    });

    python.on("error", error => {
      reject(error);
    });

    python.on("close", code => {
      if (code !== 0) {
        return reject(
          new Error(errorOutput || output || "Python processing failed")
        );
      }

      try {
        const result = JSON.parse(output);

        if (result.error) {
          return reject(new Error(result.error));
        }

        resolve(result);
      } catch (error) {
        reject(new Error("Invalid Python response: " + output));
      }
    });

    python.stdin.write(JSON.stringify(news));
    python.stdin.end();
  });
}

module.exports = { processNewsWithPython };
