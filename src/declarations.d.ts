declare module 'require-uncached' {
  namespace requireNew {}
  function requireNew(name: string): any
  export = requireNew
}
