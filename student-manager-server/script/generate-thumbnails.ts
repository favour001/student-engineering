import * as fs from 'fs';
import * as path from 'path';

type Variant = {
  width: number;
  quality: number;
};

type ImageTask = {
  sourcePath: string;
  relativePath: string;
  variant: Variant;
};

const DEFAULT_STORAGE_DIRNAME = 'file_storage';
const THUMBNAIL_DIRNAME = 'thumbnails';
const DEFAULT_VARIANTS: Variant[] = [
  { width: 160, quality: 75 },
  { width: 320, quality: 76 },
  { width: 750, quality: 78 },
  { width: 1080, quality: 82 },
];
const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

loadDotEnv();

async function main() {
  const sharp = loadSharp();
  const storageRoot = getStorageRoot();
  const variants = getVariants();
  const concurrency = getConcurrency();

  if (!fs.existsSync(storageRoot) || !fs.statSync(storageRoot).isDirectory()) {
    throw new Error(`FILE_STORAGE_ROOT 不存在或不是目录: ${storageRoot}`);
  }

  const files = collectImageFiles(storageRoot);
  const tasks = files.flatMap((filePath) => {
    const relativePath = path.relative(storageRoot, filePath).replace(/\\/g, '/');
    return variants.map((variant) => ({
      sourcePath: filePath,
      relativePath,
      variant,
    }));
  });

  let completed = 0;
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  console.log(
    `thumbnail start root=${storageRoot} images=${files.length} tasks=${tasks.length} concurrency=${concurrency}`,
  );

  await runPool(tasks, concurrency, async (task) => {
    const result = await generateThumbnail(sharp, storageRoot, task);
    completed += 1;

    if (result === 'generated') generated += 1;
    if (result === 'skipped') skipped += 1;
    if (result === 'failed') failed += 1;

    if (completed % 100 === 0 || completed === tasks.length) {
      console.log(
        `thumbnail progress ${completed}/${tasks.length} generated=${generated} skipped=${skipped} failed=${failed}`,
      );
    }
  });

  console.log(
    `thumbnail done images=${files.length} generated=${generated} skipped=${skipped} failed=${failed}`,
  );
}

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const equalIndex = trimmed.indexOf('=');
    if (equalIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, equalIndex).trim();
    const rawValue = trimmed.slice(equalIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function loadSharp() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('sharp');
  } catch (error) {
    throw new Error(`sharp 加载失败，请先执行 yarn install: ${(error as Error).message}`);
  }
}

function getStorageRoot() {
  const configuredRoot = process.env.FILE_STORAGE_ROOT?.trim();
  return configuredRoot
    ? path.resolve(configuredRoot)
    : path.resolve(process.cwd(), DEFAULT_STORAGE_DIRNAME);
}

function getVariants() {
  const configured = process.env.IMAGE_THUMBNAIL_VARIANTS?.trim();
  if (!configured) {
    return DEFAULT_VARIANTS;
  }

  const variants = configured
    .split(',')
    .map((item) => {
      const [width, quality] = item.split(':').map((value) => Number(value.trim()));
      return { width, quality };
    })
    .filter((item) => Number.isFinite(item.width) && item.width > 0 && Number.isFinite(item.quality));

  return variants.length ? variants : DEFAULT_VARIANTS;
}

function getConcurrency() {
  const configured = Number(process.env.IMAGE_THUMBNAIL_CONCURRENCY);
  if (!Number.isFinite(configured) || configured <= 0) {
    return 3;
  }

  return Math.max(1, Math.min(6, Math.round(configured)));
}

function collectImageFiles(root: string) {
  const result: string[] = [];
  const stack = [root];

  while (stack.length) {
    const current = stack.pop()!;
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(current, entry.name);
      const relativePath = path.relative(root, absolutePath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        if (
          relativePath === THUMBNAIL_DIRNAME ||
          relativePath.startsWith(`${THUMBNAIL_DIRNAME}/`) ||
          relativePath === '.image-cache' ||
          relativePath.startsWith('.image-cache/')
        ) {
          continue;
        }

        stack.push(absolutePath);
        continue;
      }

      if (entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        result.push(absolutePath);
      }
    }
  }

  return result;
}

async function runPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
) {
  let index = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) {
      const item = items[index];
      index += 1;
      await worker(item);
    }
  });

  await Promise.all(runners);
}

async function generateThumbnail(
  sharp: any,
  storageRoot: string,
  task: ImageTask,
) {
  const extension = path.extname(task.sourcePath).toLowerCase();
  const targetPath = path.resolve(
    storageRoot,
    THUMBNAIL_DIRNAME,
    `w${task.variant.width}-q${task.variant.quality}`,
    sanitizeRelativePath(task.relativePath),
  );

  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
    return 'skipped';
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });

  try {
    let pipeline = sharp(task.sourcePath, { failOn: 'none' }).rotate().resize({
      width: task.variant.width,
      withoutEnlargement: true,
    });

    if (extension === '.png') {
      pipeline = pipeline.png({ quality: task.variant.quality, compressionLevel: 9 });
    } else if (extension === '.webp') {
      pipeline = pipeline.webp({ quality: task.variant.quality });
    } else {
      pipeline = pipeline.jpeg({ quality: task.variant.quality, mozjpeg: true });
    }

    await pipeline.toFile(targetPath);
    return 'generated';
  } catch (error) {
    console.error(`thumbnail failed ${task.relativePath}: ${(error as Error).message}`);
    return 'failed';
  }
}

function sanitizeRelativePath(relativePath: string) {
  return relativePath
    .replace(/\\/g, '/')
    .split('/')
    .map((segment) => segment.replace(/[^a-zA-Z0-9._-]/g, '-'))
    .join('/');
}

main().catch((error) => {
  console.error((error as Error).message);
  process.exitCode = 1;
});
