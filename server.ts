import { createServer } from 'http';
import { config } from 'dotenv';
import { exec } from 'child_process';

config();

const PORT = process.env.PORT || 6000;

const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start the Apibara indexer
  const indexer = exec('pnpm run start:liquidity');
  
  indexer.stdout?.on('data', (data) => {
    console.log(`Indexer: ${data}`);
  });
  
  indexer.stderr?.on('data', (data) => {
    console.error(`Indexer Error: ${data}`);
  });
  
  indexer.on('close', (code) => {
    console.log(`Indexer process exited with code ${code}`);
    process.exit(code || 0);
  });
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
