const { spawn } = require('child_process');

const ls = spawn('cmd.exe', ['/c', 'echo Hello World']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

ls.on('error', (err) => {
  console.error('Failed to start subprocess.', err);
}); 