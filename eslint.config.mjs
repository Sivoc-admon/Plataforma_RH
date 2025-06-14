// eslint.config.mjs - ES modules version
import globals from 'globals';
import eslintJs from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import unicornPlugin from 'eslint-plugin-unicorn';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import securityPlugin from 'eslint-plugin-security';

export default [
    // 1) Ignorar carpetas que no queremos lintear
    { ignores: ['public/', 'tests', 'public/js/**.bundle.min.js'] },

    // 2) Configuración base general
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jquery,
            },
        },
        plugins: {
            import: importPlugin,
            unicorn: unicornPlugin,
            jsdoc: jsdocPlugin,
            security: securityPlugin,
        },
        rules: {
            // Reglas recomendadas
            ...eslintJs.configs.recommended.rules,

            // Estilo
            'semi': ['error', 'always'],
            'quotes': ['error', 'single'],
            'curly': ['error', 'all'],
            'no-var': 'error',
            'prefer-const': 'error',
            'no-unused-vars': ['error', { vars: 'all', args: 'none' }],
            'camelcase': ['error', { properties: 'always' }],
            'max-len': ['error', 
                { code: 90, ignoreUrls: true, 
                    ignoreStrings: true, 
                    ignoreTemplateLiterals: true }
            ],
            'indent': ['error', 4],
            'import/first': 'error',
            'no-duplicate-imports': 'error',
            'no-tabs': 'error',
            'no-mixed-spaces-and-tabs': 'error',
            'id-match': ['error',
                '^(?:NODE_CONFIG_DIR|NODE_ENV|_id|[A-Z][A-Z0-9_]*|\\$?[A-Za-z][A-Za-z0-9]*)$', 
                { properties: true }
            ],
            'id-length': ['error', { min: 3, max: 40, exceptions: ['as', 'fs', 'id'] }],
            'consistent-return': 'error',
            'max-params': ['error', 4],
            'max-depth': ['error', { max: 4 }],
            'max-lines': ['error', { max: 300, skipBlankLines: true }],

            // Console
            'no-console': ['warn', { allow: ['warn', 'error'] }],

            // Unicorn
            'unicorn/prevent-abbreviations': ['error', {
                allowList: {
                    args: true,
                    util: true,
                    func: true,
                    feathersParams: true,
                    Props: true
                }
            }],

            // JSDoc
            'jsdoc/check-alignment': 'error',
            'jsdoc/check-param-names': 'error',
            'jsdoc/check-tag-names': 'error',
            'jsdoc/check-types': 'error',
            'jsdoc/require-jsdoc': ['error', {
                require: {
                    FunctionDeclaration: true,
                    MethodDefinition: false,
                    ClassDeclaration: false,
                    ArrowFunctionExpression: true,
                    FunctionExpression: true
                }
            }],
            'jsdoc/require-param': ['error', { enableFixer: true }],
            'jsdoc/require-param-type': 'error',
            'jsdoc/require-param-description': 'error',
            'jsdoc/require-returns': 'error',
            'jsdoc/require-returns-type': 'error',
            'jsdoc/require-returns-description': 'error',
            'jsdoc/require-returns-check': 'error',
            'jsdoc/require-description': ['error', {
                contexts: [
                    'FunctionDeclaration',
                    'ArrowFunctionExpression',
                    'FunctionExpression'
                ]
            }],
            'jsdoc/valid-types': 'error',

            // Seguridad
            'security/detect-bidi-characters': 'error',
            'security/detect-no-csrf-before-method-override': 'error',
            'security/detect-possible-timing-attacks': 'error',
            'security/detect-non-literal-require': 'error',
            'security/detect-child-process': 'error',
            'security/detect-new-buffer': 'error',
            'security/detect-non-literal-regexp': 'error',
            'security/detect-eval-with-expression': 'error',
            'security/detect-buffer-noassert': 'error'
        }
    },

    // 3) Indentación de 4 espacios en .js
    {
        files: ['**/*.js'],
        rules: {
            'indent': ['error', 4]
        }
    },

    // 5) Excepciones para tests
    {
        files: ['**/*.test.js'],
        languageOptions: {
            globals: { ...globals.jest }
        },
        rules: {
            'camelcase': 'off',
            'max-len': 'off'
        }
    }
];