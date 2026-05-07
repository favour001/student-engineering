const fs = require('node:fs');
const path = require('node:path');

const target = path.resolve(__dirname, '..', process.argv[2] || 'dist');
const projectRoot = path.resolve(__dirname, '..');

function removeContents(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  for (const entry of fs.readdirSync(targetPath)) {
    const entryPath = path.join(targetPath, entry);

    fs.rmSync(entryPath, {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 500,
    });
  }
}

function removePath(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  fs.rmSync(targetPath, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 500,
  });
}

removeContents(target);
removePath(path.join(projectRoot, 'node_modules', '.cache', 'webpack', 'development-weapp'));
removePath(path.join(projectRoot, 'node_modules', '.cache', 'webpack', 'production-weapp'));
