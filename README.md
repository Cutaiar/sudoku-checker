# Visual Sudoku Checker

[![Netlify Status](https://api.netlify.com/api/v1/badges/c904e4ae-c208-49b5-97f5-7269131f14a7/deploy-status)](https://app.netlify.com/sites/illustrious-bunny-4d884f/deploys)

Check a sudoku for validity and visualize the process. Live at [sudoku.cutaiar.io](https://sudoku.cutaiar.io).

Written with `React` + `TypeScript` + `Vite`

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
