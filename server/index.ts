import { spawn } from "child_process";

// Spawn the Python Flask application
// This wrapper allows us to use the existing 'npm run dev' workflow
// while running the user-requested Python backend.

console.log("Starting Python Flask Server...");

const pythonProcess = spawn("python", ["app.py"], { 
  stdio: "inherit",
  shell: true 
});

pythonProcess.on("error", (err) => {
  console.error("Failed to start Python process:", err);
});

pythonProcess.on("close", (code) => {
  console.log(`Python process exited with code ${code}`);
  process.exit(code || 0);
});

// Handle termination signals to kill the python process
process.on('SIGTERM', () => {
  pythonProcess.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGINT', () => {
  pythonProcess.kill('SIGINT');
  process.exit(0);
});
