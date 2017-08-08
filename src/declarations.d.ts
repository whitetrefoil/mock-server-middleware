declare module 'require-uncached' {
  namespace requireNew {}
  function requireNew(name: string): any
  export = requireNew
}

declare module 'strip-json-comments' {
  namespace stripJsonComments {}

  interface StripJsonOptions {
    whitespace?: boolean
  }
  function stripJsonComments(input: string, opts?: StripJsonOptions): string
  export = stripJsonComments
}
