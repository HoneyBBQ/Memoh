import type { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import * as debugCore from '../../core/debug'

export function debugCommands(program: Command) {
  program
    .command('ping')
    .description('Test API server connection')
    .action(async () => {
      const info = debugCore.getConnectionInfo()
      
      console.log(chalk.blue('Connection Info:'))
      console.log(chalk.dim(`  API URL: ${info.apiUrl}`))
      console.log(chalk.dim(`  Token: ${info.hasToken ? 'Set' : 'Not set'}`))
      console.log()

      const spinner = ora('Connecting...').start()
      
      const result = await debugCore.ping()
      
      if (result.success) {
        spinner.succeed(chalk.green('Connection successful!'))
        if (result.message) {
          console.log(chalk.dim('Response:'), result.message)
        }
      } else {
        spinner.fail(chalk.red('Connection failed'))
        if (result.error) {
          if (result.error.includes('timeout')) {
            console.error(chalk.yellow('Connection timeout (5 seconds)'))
            console.error(chalk.dim('Please check if the API server is running'))
          } else {
            console.error(chalk.red('Error:'), result.error)
          }
        }
      }
    })
}

