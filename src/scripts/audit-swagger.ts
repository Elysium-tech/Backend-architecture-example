import fs from 'node:fs';
import path from 'node:path';

type Endpoint = {
  method: string;
  path: string;
  source: string;
};

const projectRoot = path.resolve(__dirname, '../..');
const routesDirectory = path.join(projectRoot, 'src/app/routes');
const swaggerDirectory = path.join(projectRoot, 'src/swagger');
const httpMethods = 'get|post|put|patch|delete|options|head';
const endpointPattern = new RegExp(
  `\\.(${httpMethods})\\s*\\(\\s*['"]([^'"]+)['"]`,
  'gi',
);
const openApiPathPattern = /['"](\/[^'"]*)['"]\s*:/g;

function getTypeScriptFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? getTypeScriptFiles(entryPath)
      : entry.name.endsWith('.ts')
        ? [entryPath]
        : [];
  });
}

function normalizePath(value: string): string {
  return value
    .replace(/:([A-Za-z0-9_]+)/g, '{$1}')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '') || '/';
}

function getRoutePrefix(filePath: string): string {
  const base = path.basename(filePath).replace(/\.routes\.ts$/, '');
  return base === 'index' || base === 'routes' ? '' : `/${base}`;
}

function collectEndpoints(): Endpoint[] {
  return getTypeScriptFiles(routesDirectory).flatMap((filePath) => {
    const source = fs.readFileSync(filePath, 'utf8');
    const prefix = getRoutePrefix(filePath);
    return [...source.matchAll(endpointPattern)].map((match) => ({
      method: match[1].toUpperCase(),
      path: normalizePath(`${prefix}${match[2]}`),
      source: path.relative(projectRoot, filePath),
    }));
  });
}

function collectDocumentedPaths(): Set<string> {
  const paths = new Set<string>();

  for (const filePath of getTypeScriptFiles(swaggerDirectory)) {
    const source = fs.readFileSync(filePath, 'utf8');
    for (const match of source.matchAll(openApiPathPattern)) {
      paths.add(normalizePath(match[1]));
    }
  }

  return paths;
}

function endpointKey(endpoint: Pick<Endpoint, 'method' | 'path'>): string {
  return `${endpoint.method} ${endpoint.path}`;
}

function audit(): number {
  const endpoints = collectEndpoints();
  const documentedPaths = collectDocumentedPaths();
  const documentedEndpoints = new Set<string>();
  const missingDocumentation = endpoints.filter(
    (endpoint) => !documentedPaths.has(endpoint.path),
  );

  for (const filePath of getTypeScriptFiles(swaggerDirectory)) {
    const source = fs.readFileSync(filePath, 'utf8');
    for (const match of source.matchAll(openApiPathPattern)) {
      const block = source.slice(match.index ?? 0, (match.index ?? 0) + 400);
      for (const method of block.matchAll(new RegExp(`\\b(${httpMethods})\\s*:`, 'gi'))) {
        documentedEndpoints.add(`${method[1].toUpperCase()} ${normalizePath(match[1])}`);
      }
    }
  }

  const undocumentedMethods = endpoints.filter(
    (endpoint) =>
      documentedPaths.has(endpoint.path) &&
      documentedEndpoints.size > 0 &&
      !documentedEndpoints.has(endpointKey(endpoint)),
  );

  console.log(`Endpoints encontrados: ${endpoints.length}`);
  console.log(`Paths OpenAPI encontrados: ${documentedPaths.size}`);

  if (missingDocumentation.length > 0) {
    console.error('\nEndpoints sem documentacao:');
    for (const endpoint of missingDocumentation) {
      console.error(`- ${endpointKey(endpoint)} (${endpoint.source})`);
    }
  }

  if (undocumentedMethods.length > 0) {
    console.error('\nMetodos sem documentacao no path:');
    for (const endpoint of undocumentedMethods) {
      console.error(`- ${endpointKey(endpoint)} (${endpoint.source})`);
    }
  }

  if (missingDocumentation.length === 0 && undocumentedMethods.length === 0) {
    console.log('\nSwagger/OpenAPI esta sincronizado com as rotas encontradas.');
    return 0;
  }

  return 1;
}

process.exitCode = audit();