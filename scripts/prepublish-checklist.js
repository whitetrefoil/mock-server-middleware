const readline = require('readline')

console.log(`Preparing to publish version: ${process.env.npm_package_version}`)

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function pleaseFix() {
  console.warn('Please fix the checklist first then come back again ;)')
  process.exit(1)
}

const questions = [
  'Have you **committed** all files into Git?',
  'Have you **tagged** the version in Git?',
  'Have you **pushed** all commits to GitHub?',
  'Have you update the version number in **package.json**?',
  'Have you logged all changes in **README.md**?',
]

let finishedQuestions = 0

function askQuestionsResc() {
  if (questions[finishedQuestions] == null) {
    rl.close()
    console.log('Checklist is finished! Let\'s roll!')
    process.exit(0)
    return
    // Next will invoke `npm run build` in `package.json`
  }

  rl.question(`${questions[finishedQuestions]} (y/N)? `, (ans) => {
    if (ans.toLowerCase() !== 'y') { return pleaseFix() }
    finishedQuestions += 1
    askQuestionsResc()
  })
}

askQuestionsResc()
