`@whitetrefoil/msm` (previously `mock-server-middleware`)
======================

**WARNING: THIS APPLICATION IS STILL DEVELOPING!!!**

A Koa middleware of mock server to help develop web app.

How To Use (the Simplest Example)
-----------------------------

Gulpfile.js:
```typescript
import gulp from 'gulp'
import { bodyParser, Koa, LogLevel, createMockServer } from '@whitetrefoil/msm'

gulp.task('backend', (done) => {
  const app = new Koa()

  console.log('Will use StubAPI mode.')

  app.use(bodyParser())
  app.use(createMockServer({
    // If a request path starts like one of below,
    // it will be handled by the mock server,
    // otherwise it will call `next()` to pass the request to the next middleware.
    apiPrefixes: ['/user-service/', '/auth-service/', '/payment-service/'],
    // Where the API definition files locate.  Related to PWD.
    apiDir     : 'myMockFilesInThisDir',
    logLevel   : LogLevel.WARN,
  }))

  app.listen(8889, () => {
    console.log(`Backend server listening at port 8889`)
    done()
  })
})
```

myMockFilesInThisDir/get/user-service/users.json
```json
{
  "code"   : 200,
  "headers": {
    "X-My-Custom-Header": "23333333"
  },
  "body"   : {
    "_code"   : 0,
    "_message": "OK",
    "data"    : [{
      "id"  : 1,
      "name": "Developer 1"
    }]
  }
}
```

myMockFilesInThisDir/post/user-service/user/1.js
```javascript
module.exports = async(ctx, next) => {
  await next()
  
  let body = ''

  ctx.set('Content-Type', 'text/json; charset=UTF-8')

  try {
    ctx.status = 200
    ctx.body = {
      _code   : 0,
      _message: 'OK',
      data    : {
        id  : 1,
        name: body.name,
      },
    }
  } catch (e) {
    ctx.status = 400
    ctx.body = {
      _code   : 255,
      _message: 'Bad JSON format.',
      data    : {},
    }
  }
}
```

API Doc
-------

### MockServerConfig

Options of MSM middleware

* `apiDir?: string` - Where the API definition files locate.  Related to PWD.
* `apiPrefixes?: string[]` - If a request path starts like one of this,
  it will be handled by the mock server,
  otherwise it will call `next()` to pass the request to the next middleware.
* `fallbackToNoQuery?: boolean` - If true (and "ignoreQueries" is not `true`),
  when failed to load definition from default location,
  MSM will do another attempt w/ `"ignoreQueries": true`.
  Default to `false`.
* `ignoreQueries?: string[]|boolean` - Ignore certain search queries when looking up for definitions & recording.
  Set to `false` to preserve every search queries.
  Set to `true` to ignore all.
  Default to `true`.
* `logLevel?: LogLevel` - Log level. 'INFO' & 'LOG' is the same. Default is 'NONE'. Can be a `LogLevel` enum if using TypeScript, otherwise a string like `"INFO"` is acceptable.
* `lowerCase?: boolean` - Whether to unify all cases to lower case.
* `nonChar?: string` - Replace `/[^a-zA-Z0-9/]/g` to this when looking for API definition files.
* `overwriteMode?: boolean` - Whether to overwrite existing definition file. Only take effect when using "recorder" middleware.
* `ping?: number` - Delay before response, in ms.
* `saveHeaders?: string[]` - Specific some headers to save in "recorder" mode.


### `createMockServer(config: MockServerConfig)`

Create a Koa compatible MSM middleware.

Use this with the preview server (webpack-serve, webpack-dev-server, etc.)
to simulate the backend server.


### `createRecorder(config: MockServerConfig)`

Create a Koa compatible MSM **RECORDER** middleware.

Prepend this middleware before normal http-proxy Koa middleware to record the proxied response as JSON definitions.


### API Definitions

`@whitetrefoil/msm` has ability to handle 2 kind of API definitions:

* JS/TS (Koa middleware function)
* JSON

This is the spec of the API definition files in JSON.

* `code?: number` - HTTP response status code.
* `headers?: Object` - Custom HTTP response headers.
* `body: any` - Response body.  Any valid JSON format can be used.


### Koa

This module re-exports its `koa` & `koa-bodyparser` as name `Koa` & `koaBodyparser`.


### TypeScript

This module exports some helper interfaces:

#### `interface JsonApiDefinition`

This is the type definition of JSON definition.

#### `interface MsmMiddleware`

Can be used as the type of JS definition, e.g.

```typescript
import { MsmMiddleware } from '@whitetrefoil/msm'

const middleware: MsmMiddleware = async(ctx, next) => {
  // ...
}
```

#### `interface MsmParameterizedContext`

The type of `ctx` in above `MsmMiddleware`.



Changelog
---------

### v1.0.0-alpha.4

* Fix minor TS type issue.

### v1.0.0-alpha.3

* Fix RegExp error on Windows.
* Upgrade dependencies.

### v1.0.0-alpha.2

* Export `.d.ts` files.

### v1.0.0-alpha.1

* A totally rewritten API.
* Support for tests has been removed,
  use [`msw`](https://mswjs.io/)
  or [`nork`](https://github.com/nock/nock) instead.

### v0.11.3

* Fix wrong version number in README.

### v0.11.2

* Optimize logs.

### v0.11.1

* Fix stuff cause json5 def files failed to load.

### v0.11.0

* Accept JSON5 as def file.

### v0.10.0

* Clear the whole `process.cwd()` instead of the exact file when requiring JS def file.

### v0.9.0

* Move "koa" from "devDep" to "dep".
* Upgrade dependencies.

### v0.8.2

* Fix cannot import js/ts def w/ default export.

### v0.8.1

* Update README.

### v0.8.0

* Now gzipped/deflated responses can be recorded correctly.
* Fix `ENOENT` error in recorder mode.
* Upgrade many dependencies.

### v0.6.0

* Put "koa-bodyparser" in "dependencies" instead of "devDependencies".

### v0.6.0-alpha.3

* Fix the bug cause recorder save definition when the "non-query" version has already existed.

### v0.6.0-alpha.2

* **!!!BREAKING!!!** Now in normal mode it will first try to read from path with query preserved.
  If failed, then try the one without query.
* **!!!BREAKING!!!** `preserveQuery` option in config is removed due to above.

### v0.6.0-alpha.1

* Added recorder function.
* **!!!BREAKING!!!** Migrate the middleware to Koa.

### v0.5.0-alpha.3

* Export LogLevel enum.

### v0.5.0-alpha.2

* Fix wrong entry filename.

### v0.5.0-alpha.1

* Changes many stuff in project infrastructure.

### v0.4.0-alpha.4

* Fix broken requirements. (Previously put `clear-require` into devDep. but it's actually is a prodReq.)

### v0.4.0-alpha.3

* Now msm will load latest .js/.ts def file change without need of restarting.

### v0.4.0-alpha.2

* Small type definition optimize.
* Allow loading `*.ts` definition files when running in `ts-node` environment.

### v0.4.0-alpha.1

* Support JSON definition file with comments.
* Re-write logic of definition loader.

### v0.3.0-alpha.2

* More UT.
* Fix document according to UT finding.

### v0.3.0-alpha.1

* **!!!BREAKING!!!** Now the module exports a Class instead of a global object.
* **!!!BREAKING!!!** Many API changed because of new code design.
* When using simple JSON, include `Content-Type: application/json` by default.
* Better TS declarations.
* Be compatible with ES6 export (`export default`).

### v0.2.0-alpha.3

* Very simple support of log level.

### v0.2.0-alpha.2

* Fix typo in "README.md".

### v0.2.0-alpha.1

* Add some new API to help verify http requests during tests.
* Upgraded some dependencies.

### v0.1.0-alpha.4

* Use `stdout` instead of `stderr` for `Logger.warn` & `Logger.error`.
* Specify the location of `index.d.ts` file in `package.json`.

### v0.1.0-alpha.3

* Added a logger helper.
* Upgraded some dependencies.

### v0.1.0-alpha.2

* Fix some problem related to dependencies.

### v0.1.0-alpha.1

* Initial release.
