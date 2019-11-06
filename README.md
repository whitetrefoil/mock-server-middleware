`@whitetrefoil/msm` (previously `mock-server-middleware`)
======================

**WARNING: THIS APPLICATION IS STILL DEVELOPING!!!**

A connect middleware of mock server to help develop web app.

Why This?
---------

As a web developer, during developing,
I need a mock server to simulate the web services.
  
Previously I use a few very simple code in a `gulp-connect` server
which will return static JSON file located in FS using the request path.
But when I want to write some e2e tests, its not flexible enough.

So I decided to write this one (for myself).  Besides return static JSON files,
it will also be able to load functions to do some dynamic jobs.  And even more,
it should have API to change the behavior during run time (e.g. in test specs).

How To Use (Simplest Example)
-----------------------------

Gulpfile.js:
```typescript
import gulp from 'gulp'
import { bodyParser, Koa, LogLevel, MSM } from '@whitetrefoil/msm'

gulp.task('backend', (done) => {
  const app = new Koa()

  console.log('Will use StubAPI mode.')

  const msm = new MSM({
    // If a request path starts like one of below,
    // it will be handled by the mock server,
    // otherwise it will call `next()` to pass the request to the next middleware.
    apiPrefixes: ['/user-service/', '/auth-service/', '/payment-service/'],
    // Where the API definition files locate.  Related to PWD.
    apiDir     : 'myMockFilesInThisDir',
    logLevel   : LogLevel.WARN,
  })

  app.use(bodyParser())
  app.use(msm.middleware())

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

tests/user-page/page-title-spec.js
```javascript
const { msm } = require('../setup/mock-server-setup')
const server = msm.server

describe('User Page ::', () => {
  beforeEach(() => server.record())
  afterEach(() => server.flush())
  describe('Page Title ::', () => {
    it('should say hello to the user', () => {
      server.once('GET', '/user-service/users/1', {
        code: 200,
        body: {
          _code   : 0,
          _message: 'OK',
          data    : { id: 1, name: 'Tester' },
        },
      })
      server.once('POST', '/audit-service/login?userId=1', {
        code: 201,
        body: {
          _code   : 0,
          _message: 'OK',
          data    : null,
        },
      })

      browser.url('http://localhost:8080/home/1')
        .element('#title')
        .getText().should.eventually.equal('Hello, Tester!')

      server.called('/user-service/users/1', 'GET').length.should.equal(1)
      const logRequest = server.called(/.*\/login\//)
      logRequest.length.should.equal(1)
      logRequest[0].query.userId.should.equal(1)
      (Date.now() - logRequest[0].body.timestamp).should.be.at.most(10000)
    })
  })
})
```

API Doc
-------

### `new MSM(options)`

Construct a MSM instance.

Available options:

* `apiPrefixes?: string[]` - If a request path starts like one of this,
  it will be handled by the mock server,
  otherwise it will call `next()` to pass the request to the next middleware.
* `apiDir?: string` - Where the API definition files locate.  Related to PWD.
* `logLevel?: LogLevel` - Log level. 'INFO' & 'LOG' is the same. Default is 'NONE'. Can be a `LogLevel` enum if using TypeScript, otherwise a string like `"INFO"` is acceptable.
* `lowerCase?: boolean` - Whether to unify all cases to lower case.
* `nonChar?: string` - Replace `/[^a-zA-Z0-9/]/g` to this when looking for API definition files.
* `overwriteMode?: boolean` - Whether to overwrite existing definition file. Only take effect when using "recorder" middleware.
* `saveHeaders?: string[]` - Specific some headers to save in "recorder" mode.
* `ping?: number` - Delay before response, in ms.

### `msm.middleware()`

This will return a Koa compatible middleware.

Use this with the preview server (webpack-serve, webpack-dev-server, etc.)
to simulate the backend server.

### `msm.server`

Here's some API which may help testing.
e.g. we can use them to manually override the behavior temporarily,
or record the requests from browser.

It has below methods:

#### `msm.server.once(method: string, url: string, definition: any)`

Override the behavior of the next one request of this method on this path.
`definition` can be a connect middleware function or a JSON-like definition.

**NOTE:** `url` is actually the request path.
e.g. for `http://www.example.com:8080/user/1` it should be `"/user/1"`.

#### `msm.server.on(method: string, url: string, definition: any)`

Override the behavior of all later requests of this method on this path.
`definition` can be a connect middleware function or a JSON-like definition.

**NOTE:** `url` is actually the request path.
e.g. for `http://www.example.com:8080/user/1` it should be `"/user/1"`.

#### `msm.server.off(method?: string, url?: string)`

Cancel the effect of previous `msm.server.on()`.

If both `method` & `url` given, will cancel only the specified override.
If neither given, all overrides will be canceled.
If only one given, it will throw an error to help writing tests.

#### `msm.server.record(isLogFlushCheckBypassed: boolean = false)`

Start recording requests.

If recording is already started or previous logs haven't been flushed
it will throw an Error to help prevent potential error in tests.

You can explicitly pass the log-flush check via the arguments,
but the already-started check is mandatory.

#### `msm.server.stopRecording()`

Stop recording requests but not to flush the logs.

#### `msm.server.flush()`

Stop recording & flush all logs of requests.

#### `msm.server.called(pathname?: string|RegExp, method?: string): ICallLog[]`

Return a list of previous requests.

You can filter the logs with pathname and/or method.  If leave blank it will mean "any".

**NOTICE**:  `pathname` here means the request pathname starts with it.
If you want to match the middle part, use RegExp.

#### `ICallLog`

```typescript
export interface ICallLog {
  method: string
  body?: object
  href?: string
  search?: string
  query?: object
  pathname?: string
}
```

**NOTICE**: `body` will only have value if you used [`body-parser`](https://github.com/expressjs/body-parser) before MSM.

### API Definitions

`@whitetrefoil/msm` has ability to handle 2 kind of API definitions:

* JS (connect middleware function)
* JSON

This is the spec of the API definition files in JSON.

* `code?: number` - HTTP response status code.
* `headers?: Object` - Custom HTTP response headers.
* `body: any` - Response body.  Any valid JSON format can be used.


Changelog
---------

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
