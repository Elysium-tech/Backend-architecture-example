import fs from 'node:fs';
import path from 'node:path';

const useCasesDirectory = path.resolve(__dirname, '../app/use-cases');

function printUsage(): void {
  console.error('Uso: npm run generate:use-case -- <recurso> <acao>');
  console.error('Exemplo: npm run generate:use-case -- users create');
}

function toKebabCase(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function toPascalCase(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function createUseCase(resourceArgument: string, actionArgument: string): void {
  const resource = toKebabCase(resourceArgument);
  const action = toKebabCase(actionArgument);

  if (!resource || !action) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const fileName = `${action}-${resource}.use-case.ts`;
  const targetDirectory = path.join(useCasesDirectory, resource);
  const targetFile = path.join(targetDirectory, fileName);
  const className = `${toPascalCase(action)}${toPascalCase(resource)}UseCase`;

  if (fs.existsSync(targetFile)) {
    console.error(`O use-case ja existe: ${path.relative(process.cwd(), targetFile)}`);
    process.exitCode = 1;
    return;
  }

  const content = [
    `export class ${className} {`,
    '  async execute(): Promise<void> {',
    "    throw new Error('Not implemented');",
    '  }',
    '}',
    '',
  ].join('\n');

  fs.mkdirSync(targetDirectory, { recursive: true });
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log(`Use-case criado: ${path.relative(process.cwd(), targetFile)}`);
}

const [resource, action] = process.argv.slice(2);

if (!resource || !action) {
  printUsage();
  process.exitCode = 1;
} else {
  createUseCase(resource, action);
}