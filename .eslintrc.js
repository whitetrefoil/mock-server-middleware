// The original ESLint part has been updated to ESLint v6.8.0

module.exports = {

  root: true,

  parserOptions: {
    sourceType  : 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },

  env: {
    es6 : true,
    node: true,
  },

  extends: [
    'eslint:recommended',
  ],

  rules: {
    // Possible Errors
    // ---------------
    'no-await-in-loop'           : [2],
    'no-console'                 : [2],
    'no-dupe-else-if'            : [2],
    'no-extra-parens'            : [
      1,
      'all',
      {
        nestedBinaryExpressions         : false,
        ignoreJSX                       : 'multi-line',
        enforceForNewInMemberExpressions: true,
        enforceForArrowConditionals     : false,
      },
    ],
    'no-import-assign'           : [2],
    'no-setter-return'           : [2],
    'no-template-curly-in-string': [2],
    'require-atomic-updates'     : [2],

    // Best Practices
    // --------------
    'accessor-pairs'              : [1],
    'array-callback-return'       : [1],
    'block-scoped-var'            : [0],
    'class-methods-use-this'      : [0],
    'complexity'                  : [0],
    'consistent-return'           : [1],
    'curly'                       : [2],
    'default-case'                : [2],
    'default-param-last'          : [2],
    'dot-location'                : [2, 'property'],
    // Considering the consistency when acquiring object from API.
    'dot-notation'                : [1, { allowKeywords: true, allowPattern: '[_-]' }],
    'eqeqeq'                      : [2, 'always', { null: 'ignore' }],
    'grouped-accessor-pairs'      : [1, 'getBeforeSet'],
    'guard-for-in'                : [2],
    'no-alert'                    : [2],
    'no-caller'                   : [2],
    'no-constructor-return'       : [2],
    'no-div-regex'                : [1],
    'no-else-return'              : [1],
    'no-empty-function'           : [2],
    // Previously we turned this off due to "performance reason".
    // We cannot sure if this reason still valid.
    // Turn it on (as default) & see what will happen.
    'no-empty-pattern'            : [2],
    'no-eq-null'                  : [0],
    'no-eval'                     : [2],
    'no-extend-native'            : [2],
    'no-extra-bind'               : [2],
    'no-extra-label'              : [2],
    'no-floating-decimal'         : [2],
    'no-implicit-coercion'        : [1],
    'no-implicit-globals'         : [2],
    'no-implied-eval'             : [2],
    // Disable this because of AngularJS's `controllerAs`.
    'no-invalid-this'             : [0],
    'no-iterator'                 : [2],
    'no-labels'                   : [2],
    'no-lone-blocks'              : [2],
    'no-loop-func'                : [2],
    'no-magic-numbers'            : [
      1,
      {
        ignore            : [-1, 0, 1, 60],
        ignoreArrayIndexes: true,
        detectObjects     : true,
      },
    ],
    'no-multi-spaces'             : [0],
    'no-multi-str'                : [2],
    'no-new'                      : [1],
    'no-new-func'                 : [2],
    'no-new-wrappers'             : [2],
    'no-octal-escape'             : [2],
    'no-param-reassign'           : [1, { props: false }],
    'no-proto'                    : [2],
    'no-restricted-properties'    : [0],
    'no-return-assign'            : [2, 'always'],
    'no-script-url'               : [1],
    'no-self-compare'             : [2],
    'no-sequences'                : [2],
    'no-throw-literal'            : [1],
    'no-unused-expressions'       : [2],
    'no-useless-call'             : [2],
    'no-useless-concat'           : [2],
    'no-useless-return'           : [1],
    'no-void'                     : [0],
    'no-warning-comments'         : [1, { location: 'anywhere' }],
    'prefer-named-capture-group'  : [2],
    'prefer-promise-reject-errors': [2, { allowEmptyReject: true }],
    'prefer-regex-literals'       : [2],
    'radix'                       : [2],
    'vars-on-top'                 : [0],
    'wrap-iife'                   : [2],
    'yoda'                        : [2, 'never', { exceptRange: true }],


    // Strict Mode
    // -----------
    'strict': [2, 'global'],

    // Variables
    // ---------
    'init-declarations'    : [0],
    'no-label-var'         : [2],
    'no-restricted-globals': [0],
    'no-shadow'            : [1],
    'no-undef-init'        : [2],
    'no-undefined'         : [0],
    // Change `args` to `"all"` locally to help cleaning dependency injection.
    'no-unused-vars'       : [2, { vars: 'all', args: 'none' }],
    'no-use-before-define' : [2],

    // Node.js and CommonJS
    // --------------------
    'global-require'       : [1],
    'handle-callback-err'  : [1],
    'no-buffer-constructor': [2],
    'no-mixed-requires'    : [2],
    'no-new-require'       : [2],
    'no-path-concat'       : [0],
    'no-process-env'       : [0],
    'no-process-exit'      : [1],
    'no-restricted-modules': [1],
    'no-sync'              : [0],

    // Stylistic Issues
    // ----------------

    // Relax below array related rules to allow AngularJS style
    'array-bracket-newline'           : [0],
    'array-bracket-spacing'           : [1, 'never'],
    'array-element-newline'           : [0],
    'block-spacing'                   : [2],
    'brace-style'                     : [2, '1tbs', { allowSingleLine: true }],
    'camelcase'                       : [2, { properties: 'always' }],
    'capitalized-comments'            : [0],
    'comma-dangle'                    : [2, 'always-multiline'],
    'comma-spacing'                   : [2],
    // No need for comma-first style due to allow of extra tailing comma.
    'comma-style'                     : [1, 'last'],
    'computed-property-spacing'       : [2],
    // Just for now, should be change later.
    'consistent-this'                 : [1, '_this'],
    // Not this time.
    'eol-last'                        : [1, 'always'],
    'func-call-spacing'               : [2, 'never'],
    'func-name-matching'              : [1, 'always'],
    // Not this time.
    'func-names'                      : [0],
    'func-style'                      : [0],
    'function-call-argument-newline'  : [1, 'consistent'],
    'function-paren-newline'          : [0, 'multiline-arguments'],
    'id-blacklist'                    : [0],
    // Not this time.
    'id-length'                       : [0],
    'id-match'                        : [0],
    'implicit-arrow-linebreak'        : [0],
    // Leave this to IDEA
    'indent'                          : [0, 2, { SwitchCase: 1, ignoreComments: true }],
    'jsx-quotes'                      : [0],
    'key-spacing'                     : [0],
    'keyword-spacing'                 : [2, { before: true, after: true, overrides: {} }],
    'line-comment-position'           : [0],
    // Leave this to Git.
    'linebreak-style'                 : [0],
    'lines-around-comment'            : [0],
    'lines-between-class-members'     : [0],
    'max-depth'                       : [0],
    'max-len'                         : [0],
    'max-lines'                       : [0],
    'max-lines-per-function'          : [0],
    'max-nested-callbacks'            : [0],
    'max-params'                      : [0],
    'max-statements'                  : [0],
    'max-statements-per-line'         : [1, { max: 1 }],
    'multiline-comment-style'         : [0],
    'multiline-ternary'               : [0],
    'new-cap'                         : [2, { capIsNew: false, newIsCap: true }],
    'new-parens'                      : [2],
    'newline-per-chained-call'        : [1],
    'no-array-constructor'            : [2],
    'no-bitwise'                      : [1],
    'no-continue'                     : [0],
    'no-inline-comments'              : [0],
    'no-lonely-if'                    : [2],
    'no-mixed-spaces-and-tabs'        : [2],
    'no-multi-assign'                 : [2],
    // Use more than 3 empty lines to mark debug codes.
    'no-multiple-empty-lines'         : [2, { max: 3, maxEOF: 1 }],
    'no-negated-condition'            : [0],
    'no-nested-ternary'               : [0],
    'no-new-object'                   : [2],
    'no-restricted-syntax'            : [0],
    'no-tabs'                         : [2],
    'no-ternary'                      : [0],
    'no-trailing-spaces'              : [2],
    'no-underscore-dangle'            : [0],
    'no-unneeded-ternary'             : [2],
    'no-whitespace-before-property'   : [2],
    'nonblock-statement-body-position': [0],
    'object-curly-newline'            : [2, { consistent: true }],
    'object-curly-spacing'            : [2, 'always'],
    'object-property-newline'         : [0],
    'one-var'                         : [2, 'never'],
    'one-var-declaration-per-line'    : [0],
    'operator-assignment'             : [0],
    // Not this time.
    'operator-linebreak'              : [0],
    'padded-blocks'                   : [0],
    'padding-line-between-statements' : [0],
    'prefer-exponentiation-operator'  : [1],
    'prefer-object-spread'            : [1],
    'quote-props'                     : [2, 'consistent'],
    'quotes'                          : [2, 'single', 'avoid-escape'],
    'semi'                            : [2, 'always'],
    'semi-spacing'                    : [2, { before: false, after: true }],
    'semi-style'                      : [0, 'last'],
    'sort-keys'                       : [0],
    'sort-vars'                       : [0],
    'space-before-blocks'             : [2, 'always'],
    'space-before-function-paren'     : [2, 'never'],
    'space-in-parens'                 : [2, 'never'],
    'space-infix-ops'                 : [2, { int32Hint: true }],
    'space-unary-ops'                 : [2, { words: true, nonwords: false }],
    'spaced-comment'                  : [0],
    'switch-colon-spacing'            : [1],
    'template-curly-spacing'          : [1],
    'unicode-bom'                     : [2],
    'wrap-regex'                      : [0],

    // ECMAScript 6
    // ------------
    'arrow-body-style'       : [2, 'as-needed'],
    'arrow-parens'           : [2, 'as-needed'],
    'arrow-spacing'          : [2],
    'generator-star-spacing' : [2, 'before'],
    'no-confusing-arrow'     : [0],
    'no-duplicate-imports'   : [2],
    'no-restricted-imports'  : [0],
    'no-useless-computed-key': [2],
    'no-useless-constructor' : [1],
    'no-useless-rename'      : [1],
    'no-var'                 : [0],
    'object-shorthand'       : [1, 'always'],
    'prefer-arrow-callback'  : [0],
    'prefer-const'           : [1],
    'prefer-destructuring'   : [1],
    'prefer-numeric-literals': [2],
    'prefer-rest-params'     : [1],
    'prefer-spread'          : [1],
    'prefer-template'        : [0],
    'require-yield'          : [2],
    'rest-spread-spacing'    : [2],
    'sort-imports'           : [0],
    'symbol-description'     : [2],
    'template-tag-spacing'   : [2],
    'yield-star-spacing'     : [2, 'before'],
  },

  overrides: [
    // {
    //   files: ['**/*.js', '**/*.es6'],
    //
    //   parser: 'babel-eslint',
    //
    //   plugins: ['babel'],
    //
    //   // eslint-plugin-babel v5.3.0
    //   // @see https://github.com/babel/eslint-plugin-babel
    //   rules: {
    //     'new-cap'                    : [0],
    //     'babel/new-cap'              : [2, { capIsNew: false, newIsCap: true }],
    //     'camelcase'                  : [0],
    //     'babel/camelcase'            : [2, { properties: 'always' }],
    //     'no-invalid-this'            : [0],
    //     // Disable this because of AngularJS's `controllerAs`.
    //     'babel/no-invalid-this'      : [0],
    //     'object-curly-spacing'       : [0],
    //     'babel/object-curly-spacing' : [2, 'always'],
    //     'quotes'                     : [0],
    //     'babel/quotes'               : [2, 'single', 'avoid-escape'],
    //     'semi'                       : [0],
    //     'babel/semi'                 : [2, 'always'],
    //     'no-unused-expressions'      : [0],
    //     'babel/no-unused-expressions': [2],
    //     'valid-typeof'               : [0],
    //     'babel/valid-typeof'         : [2],
    //   },
    // },

    {
      files: ['**/*.ts', '**/*.tsx'],

      parser: '@typescript-eslint/parser',

      plugins: ['@typescript-eslint'],

      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],

      rules: {
        '@typescript-eslint/adjacent-overload-signatures'          : [1],
        '@typescript-eslint/array-type'                            : [1, { default: 'array-simple' }],
        // Needs type info!
        '@typescript-eslint/await-thenable'                        : [0],
        '@typescript-eslint/ban-ts-comment'                        : [1],
        '@typescript-eslint/ban-types'                             : [2],
        '@typescript-eslint/consistent-type-assertions'            : [
          1,
          {
            assertionStyle             : 'as',
            objectLiteralTypeAssertions: 'allow-as-parameter',
          },
        ],
        '@typescript-eslint/consistent-type-definitions'           : [1, 'interface'],
        '@typescript-eslint/explicit-function-return-type'         : [
          0,
          {
            allowExpressions             : true,
            allowTypedFunctionExpressions: true,
            allowHigherOrderFunctions    : true,
          },
        ],
        '@typescript-eslint/explicit-member-accessibility'         : [
          2,
          {
            accessibility: 'no-public',
            overrides    : {
              parameterProperties: 'off',
            },
          },
        ],
        '@typescript-eslint/explicit-module-boundary-types'        : [0],
        '@typescript-eslint/member-delimiter-style'                : [
          2,
          {
            multiline : { delimiter: 'semi', requireLast: true },
            singleline: { delimiter: 'comma', requireLast: false },
          },
        ],
        '@typescript-eslint/member-ordering'                       : [0],
        // Needs type info!
        '@typescript-eslint/naming-convention'                     : [0],
        '@typescript-eslint/no-dynamic-delete'                     : [2],
        '@typescript-eslint/no-empty-interface'                    : [1],
        '@typescript-eslint/no-explicit-any'                       : [
          1,
          {
            fixToUnknown  : false,
            ignoreRestArgs: true,
          },
        ],
        '@typescript-eslint/no-extra-non-null-assertion'           : [1],
        '@typescript-eslint/no-extraneous-class'                   : [
          1,
          {
            allowConstructorOnly: false,
            allowEmpty          : false,
            allowStaticOnly     : false,
            allowWithDecorator  : false,
          },
        ],
        // Needs type info!
        '@typescript-eslint/no-floating-promises'                  : [0],
        // Needs type info!
        '@typescript-eslint/no-for-in-array'                       : [0],
        // Needs type info!
        '@typescript-eslint/no-implied-eval'                       : [0],
        '@typescript-eslint/no-inferrable-types'                   : [0],
        '@typescript-eslint/no-misused-new'                        : [2],
        // Needs type info!
        '@typescript-eslint/no-misused-promises'                   : [0],
        '@typescript-eslint/no-namespace'                          : [1],
        '@typescript-eslint/no-non-null-asserted-optional-chain'   : [1],
        '@typescript-eslint/no-non-null-assertion'                 : [1],
        '@typescript-eslint/no-parameter-properties'               : [0],
        '@typescript-eslint/no-require-imports'                    : [1],
        '@typescript-eslint/no-this-alias'                         : [1],
        // Needs type info!
        '@typescript-eslint/no-throw-literal'                      : [0],
        '@typescript-eslint/no-type-alias'                         : [0],
        // Needs type info!
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': [0],
        // Needs type info!
        '@typescript-eslint/no-unnecessary-condition'              : [0],
        // Needs type info!
        '@typescript-eslint/no-unnecessary-qualifier'              : [0],
        // Needs type info!
        '@typescript-eslint/no-unnecessary-type-arguments'         : [0],
        // Needs type info!
        '@typescript-eslint/no-unnecessary-type-assertion'         : [0],
        // Needs type info!
        '@typescript-eslint/no-unused-vars-experimental'           : [0],
        '@typescript-eslint/no-var-requires'                       : [2],
        '@typescript-eslint/prefer-as-const'                       : [1],
        '@typescript-eslint/prefer-for-of'                         : [1],
        '@typescript-eslint/prefer-function-type'                  : [1],
        // Needs type info!
        '@typescript-eslint/prefer-includes'                       : [0],
        '@typescript-eslint/prefer-namespace-keyword'              : [1],
        // Needs type info!
        '@typescript-eslint/prefer-nullish-coalescing'             : [0],
        '@typescript-eslint/prefer-optional-chain'                 : [1],
        // Needs type info!
        '@typescript-eslint/prefer-readonly'                       : [0],
        // Needs type info!
        '@typescript-eslint/prefer-regexp-exec'                    : [0],
        // Needs type info!
        '@typescript-eslint/prefer-string-starts-ends-with'        : [0],
        // Needs type info!
        '@typescript-eslint/promise-function-async'                : [0],
        // Needs type info!
        '@typescript-eslint/require-array-sort-compare'            : [0],
        // Needs type info!
        '@typescript-eslint/restrict-plus-operands'                : [0],
        // Needs type info!
        '@typescript-eslint/restrict-template-expressions'         : [0],
        // Needs type info!
        '@typescript-eslint/strict-boolean-expressions'            : [0],
        // Needs type info!
        '@typescript-eslint/switch-exhaustiveness-check'           : [0],
        '@typescript-eslint/triple-slash-reference'                : [
          1,
          { path: 'never', types: 'prefer-import', lib: 'never' },
        ],
        '@typescript-eslint/type-annotation-spacing'               : [2],
        // @see Note in https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/typedef.md
        '@typescript-eslint/typedef'                               : [0],
        // Needs type info!
        '@typescript-eslint/unbound-method'                        : [0],
        '@typescript-eslint/unified-signatures'                    : [1],

        // Overrides ESLint rules
        // ----------------------
        'brace-style'                                   : [0],
        '@typescript-eslint/brace-style'                : [2, '1tbs', { allowSingleLine: true }],
        'comma-spacing'                                 : [0],
        '@typescript-eslint/comma-spacing'              : [2],
        'default-param-last'                            : [0],
        '@typescript-eslint/default-param-last'         : [2],
        'func-call-spacing'                             : [0],
        '@typescript-eslint/func-call-spacing'          : [2, 'never'],
        'indent'                                        : [0],
        // Leave this to IDEA
        '@typescript-eslint/indent'                     : [
          0,
          2,
          { SwitchCase: 1, ignoreComments: true },
        ],
        'no-array-constructor'                          : [0],
        '@typescript-eslint/no-array-constructor'       : [2],
        'no-dupe-class-members'                         : [0],
        '@typescript-eslint/no-dupe-class-members'      : [0],
        'no-empty-function'                             : [0],
        '@typescript-eslint/no-empty-function'          : [2],
        'no-extra-parens'                               : [0],
        '@typescript-eslint/no-extra-parens'            : [
          1,
          'all',
          {
            nestedBinaryExpressions         : false,
            ignoreJSX                       : 'multi-line',
            enforceForNewInMemberExpressions: true,
            enforceForArrowConditionals     : false,
          },
        ],
        'no-extra-semi'                                 : [0],
        '@typescript-eslint/no-extra-semi'              : [0],
        'no-magic-numbers'                              : [0],
        '@typescript-eslint/no-magic-numbers'           : [
          1,
          {
            ignore            : [-1, 0, 1, 60],
            ignoreArrayIndexes: true,
            detectObjects     : true,
          },
        ],
        'no-unused-expressions'                         : [0],
        '@typescript-eslint/no-unused-expressions'      : [2],
        'no-unused-vars'                                : [0],
        '@typescript-eslint/no-unused-vars'             : [2, { vars: 'all', args: 'none' }],
        'no-use-before-define'                          : [0],
        '@typescript-eslint/no-use-before-define'       : [0],
        'no-useless-constructor'                        : [0],
        '@typescript-eslint/no-useless-constructor'     : [0],
        'quotes'                                        : [0],
        '@typescript-eslint/quotes'                     : [2, 'single', 'avoid-escape'],
        'require-await'                                 : [0],
        '@typescript-eslint/require-await'              : [0],
        'return-await'                                  : [0],
        '@typescript-eslint/return-await'               : [0],
        'semi'                                          : [0],
        '@typescript-eslint/semi'                       : [2, 'always'],
        'space-before-function-paren'                   : [0],
        '@typescript-eslint/space-before-function-paren': [0],

        // Deprecated
        '@typescript-eslint/interface-name-prefix': [0],
      },
    },

    // {
    //   files: ['**/*.tsx'],
    //
    //   parserOptions: {
    //     jsx: true,
    //   },
    //
    //   plugins: [
    //     'react',
    //     'react-hooks',
    //   ],
    //
    //   extends: [
    //     'plugin:react/recommended',
    //   ],
    //
    //   rules: {
    //     'react/prop-types'           : [0],
    //     'react-hooks/rules-of-hooks' : [2],
    //     'react-hooks/exhaustive-deps': [1],
    //   },
    // },
  ],
};
