/* eslint-disable import/no-anonymous-default-export */
export default {
  // TypeScript, JavaScript files
  '*.{ts,tsx,js,jsx}': (files) => [
    'bun clean >/dev/null 2>&1',
    'bun typecheck',
    `bun run format:write ${files.join(' ')}`,
    `bunx eslint --quiet --fix ${files.join(' ')}`,
  ],

  // Other files
  '*.{json,mdx}': (files) => [`bun run format:write ${files.join(' ')}`],

  // 明确忽略 tsbuildinfo 文件
  '!tsconfig.tsbuildinfo': [],
}
