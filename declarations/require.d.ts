type Require<T, K extends keyof T> = T&{ [R in K]-?: T[R] }
