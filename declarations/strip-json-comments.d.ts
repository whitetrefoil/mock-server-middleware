declare module 'strip-json-comments' {
  namespace stripJsonComments {}

  interface StripJsonOptions {
    whitespace?: boolean
  }
  function stripJsonComments(input: string, opts?: StripJsonOptions): string
  export = stripJsonComments
}
