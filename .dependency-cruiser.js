/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        /**
         * Базовая техническая гигиена
         */
        {
            name: 'no-circular',
            severity: 'error',
            comment: 'Циклические зависимости запрещены: они ломают читаемость слоёв и усложняют рефакторинг.',
            from: {
                path: '^src',
            },
            to: {
                circular: true,
            },
        },

        {
            name: 'not-to-unresolvable',
            severity: 'error',
            comment: 'Импорт должен резолвиться на реальный файл или npm-пакет.',
            from: {},
            to: {
                couldNotResolve: true,
            },
        },

        {
            name: 'no-non-package-json',
            severity: 'error',
            comment: 'Нельзя импортировать npm-пакеты, которых нет в package.json.',
            from: {},
            to: {
                dependencyTypes: [
                    'npm-no-pkg',
                    'npm-unknown',
                ],
            },
        },

        {
            name: 'not-to-test',
            severity: 'error',
            comment: 'Production-код не должен импортировать тесты.',
            from: {
                path: '^src',
            },
            to: {
                path: '^tests',
            },
        },

        {
            name: 'not-to-spec',
            severity: 'error',
            comment: 'Production-код не должен импортировать spec/test-файлы.',
            from: {
                path: '^src',
            },
            to: {
                path: '[.](spec|test)[.](js|mjs|cjs|jsx|ts|mts|cts|tsx)$',
            },
        },

        /**
         * Архитектурные правила проекта
         *
         * Разрешённое направление зависимостей:
         *
         * bootstrap/main
         *   → presentation
         *   → application
         *   → domain
         *
         * Domain — самый внутренний слой.
         */

        {
            name: 'domain-not-to-application',
            severity: 'error',
            comment: 'Domain не должен импортировать Application. Доменные правила должны быть чистыми и не знать про use cases, store, GameLoop.',
            from: {
                path: '^src/domain',
            },
            to: {
                path: '^src/application',
            },
        },

        {
            name: 'domain-not-to-presentation',
            severity: 'error',
            comment: 'Domain не должен импортировать Presentation. Phaser, Scene и View не должны попадать в доменную модель.',
            from: {
                path: '^src/domain',
            },
            to: {
                path: '^src/presentation',
            },
        },

        {
            name: 'domain-not-to-bootstrap',
            severity: 'error',
            comment: 'Domain не должен знать про composition root.',
            from: {
                path: '^src/domain',
            },
            to: {
                path: '^src/bootstrap',
            },
        },

        {
            name: 'domain-not-to-phaser',
            severity: 'error',
            comment: 'Domain не должен зависеть от Phaser.',
            from: {
                path: '^src/domain',
            },
            to: {
                path: 'node_modules/phaser',
            },
        },

        {
            name: 'application-not-to-presentation',
            severity: 'error',
            comment: 'Application не должен импортировать Presentation. Use cases не должны знать про Scene/View.',
            from: {
                path: '^src/application',
            },
            to: {
                path: '^src/presentation',
            },
        },

        {
            name: 'application-not-to-bootstrap',
            severity: 'error',
            comment: 'Application не должен знать про composition root.',
            from: {
                path: '^src/application',
            },
            to: {
                path: '^src/bootstrap',
            },
        },

        {
            name: 'application-not-to-phaser',
            severity: 'error',
            comment: 'Application не должен зависеть от Phaser. Phaser остаётся в presentation/bootstrap.',
            from: {
                path: '^src/application',
            },
            to: {
                path: 'node_modules/phaser',
            },
        },

        {
            name: 'presentation-not-to-domain-rules',
            severity: 'error',
            comment: 'Presentation не должна напрямую вызывать domain/rules. Для этого есть application use cases.',
            from: {
                path: '^src/presentation',
            },
            to: {
                path: '^src/domain/rules',
            },
        },

        {
            name: 'presentation-not-to-domain-systems',
            severity: 'error',
            comment: 'Presentation не должна напрямую вызывать domain/systems. Системы запускаются через GameLoop/Application.',
            from: {
                path: '^src/presentation',
            },
            to: {
                path: '^src/domain/systems',
            },
        },

        {
            name: 'presentation-not-to-bootstrap',
            severity: 'error',
            comment: 'Presentation не должна импортировать bootstrap. Bootstrap собирает приложение, но приложение не зависит от bootstrap.',
            from: {
                path: '^src/presentation',
            },
            to: {
                path: '^src/bootstrap',
            },
        },

        /**
         * Полезно при активном рефакторинге.
         * Можно оставить warn, чтобы не мешало разработке.
         */
        {
            name: 'no-orphans',
            severity: 'warn',
            comment: 'Файл не импортируется другими файлами. Возможно, это забытый файл после рефакторинга.',
            from: {
                orphan: true,
                pathNot: [
                    '(^|/)[.][^/]+[.](js|cjs|mjs|ts|cts|mts|json)$',
                    '[.]d[.]ts$',
                    '(^|/)vite-env[.]d[.]ts$',
                    '(^|/)main[.]ts$',
                    '(^|/)tsconfig[.]json$',
                    '(^|/)(vite|vitest|eslint|prettier)[.]config[.](js|cjs|mjs|ts|cts|mts|json)$',
                    '(^|/)tests?/',
                ],
            },
            to: {},
        },

        {
            name: 'not-to-dev-dep-from-src',
            severity: 'error',
            comment: 'Production-код из src не должен импортировать devDependencies, кроме type-only импортов.',
            from: {
                path: '^src',
                pathNot: [
                    '[.](spec|test)[.](js|mjs|cjs|jsx|ts|mts|cts|tsx)$',
                    '(^|/)vite-env[.]d[.]ts$',
                ],
            },
            to: {
                dependencyTypes: [
                    'npm-dev',
                ],
                dependencyTypesNot: [
                    'type-only',
                ],
                pathNot: [
                    'node_modules/@types/',
                ],
            },
        },
    ],

    options: {
        doNotFollow: {
            path: [
                'node_modules',
            ],
        },

        includeOnly: [
            '^src',
            '^tests',
        ],

        tsPreCompilationDeps: true,

        tsConfig: {
            fileName: 'tsconfig.json',
        },

        enhancedResolveOptions: {
            exportsFields: [
                'exports',
            ],

            conditionNames: [
                'import',
                'require',
                'node',
                'default',
                'types',
            ],

            extensions: [
                '.ts',
                '.tsx',
                '.js',
                '.jsx',
                '.json',
            ],

            mainFields: [
                'module',
                'main',
                'types',
                'typings',
            ],
        },

        reporterOptions: {
            dot: {
                collapsePattern: 'node_modules/(?:@[^/]+/[^/]+|[^/]+)',
            },

            archi: {
                collapsePattern: '^(?:src|tests)/[^/]+|node_modules/(?:@[^/]+/[^/]+|[^/]+)',
            },

            text: {
                highlightFocused: true,
            },
        },
    },
};