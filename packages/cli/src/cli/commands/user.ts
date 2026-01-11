import type { Command } from 'commander'
import chalk from 'chalk'
import inquirer from 'inquirer'
import ora from 'ora'
import { table } from 'table'
import * as userCore from '../../core/user'
import { formatError } from '../../utils'

export function userCommands(program: Command) {
  program
    .command('list')
    .description('List all users (requires admin privileges)')
    .action(async () => {
      try {
        const spinner = ora('Fetching user list...').start()

        try {
          const users = await userCore.listUsers()
          spinner.succeed(chalk.green('User List'))

          if (users.length === 0) {
            console.log(chalk.yellow('No users'))
            return
          }

          const tableData = [
            ['ID', 'Username', 'Role', 'Created At'],
            ...users.map((user) => [
              user.id,
              user.username,
              user.role === 'admin' ? chalk.red('Admin') : chalk.blue('User'),
              new Date(user.createdAt).toLocaleString('en-US'),
            ]),
          ]

          console.log(table(tableData))
        } catch (error) {
          spinner.fail(chalk.red('Failed to fetch user list'))
          console.error(chalk.red(formatError(error)))
          process.exit(1)
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(chalk.red('Error:'), message)
        process.exit(1)
      }
    })

  program
    .command('create')
    .description('Create new user (requires admin privileges)')
    .option('-u, --username <username>', 'Username')
    .option('-p, --password <password>', 'Password')
    .option('-r, --role <role>', 'Role (user/admin)', 'user')
    .action(async (options) => {
      try {
        let username = options.username
        let password = options.password
        let role = options.role

        if (!username || !password) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'username',
              message: 'Username:',
              when: !username,
            },
            {
              type: 'password',
              name: 'password',
              message: 'Password:',
              when: !password,
              mask: '*',
            },
            {
              type: 'list',
              name: 'role',
              message: 'Role:',
              choices: ['user', 'admin'],
              default: 'user',
              when: !role,
            },
          ])
          username = username || answers.username
          password = password || answers.password
          role = role || answers.role
        }

        const spinner = ora('Creating user...').start()

        try {
          const user = await userCore.createUser({ username, password, role })
          spinner.succeed(chalk.green('User created successfully'))
          console.log(chalk.blue(`Username: ${user.username}`))
          console.log(chalk.blue(`Role: ${user.role}`))
          console.log(chalk.blue(`ID: ${user.id}`))
        } catch (error) {
          spinner.fail(chalk.red('Failed to create user'))
          console.error(chalk.red(formatError(error)))
          process.exit(1)
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(chalk.red('Error:'), message)
        process.exit(1)
      }
    })

  program
    .command('delete <id>')
    .description('Delete user (requires admin privileges)')
    .action(async (id) => {
      try {
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: chalk.yellow(`Are you sure you want to delete user ${id}?`),
            default: false,
          },
        ])

        if (!confirm) {
          console.log(chalk.yellow('Cancelled'))
          return
        }

        const spinner = ora('Deleting user...').start()

        try {
          await userCore.deleteUser(id)
          spinner.succeed(chalk.green('User deleted'))
        } catch (error) {
          spinner.fail(chalk.red('Failed to delete user'))
          console.error(chalk.red(formatError(error)))
          process.exit(1)
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(chalk.red('Error:'), message)
        process.exit(1)
      }
    })

  program
    .command('get <id>')
    .description('Get user details')
    .action(async (id) => {
      try {
        const spinner = ora('Fetching user information...').start()

        try {
          const user = await userCore.getUser(id)
          spinner.succeed(chalk.green('User Information'))
          console.log(chalk.blue(`ID: ${user.id}`))
          console.log(chalk.blue(`Username: ${user.username}`))
          console.log(chalk.blue(`Role: ${user.role}`))
          console.log(chalk.blue(`Created At: ${new Date(user.createdAt).toLocaleString('en-US')}`))
        } catch (error) {
          spinner.fail(chalk.red('Failed to fetch user information'))
          console.error(chalk.red(formatError(error)))
          process.exit(1)
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(chalk.red('Error:'), message)
        process.exit(1)
      }
    })

  program
    .command('update-password <id>')
    .description('Update user password (requires admin privileges)')
    .option('-p, --password <password>', 'New password')
    .action(async (id, options) => {
      try {
        let password = options.password

        if (!password) {
          const answers = await inquirer.prompt([
            {
              type: 'password',
              name: 'password',
              message: 'New password:',
              mask: '*',
            },
          ])
          password = answers.password
        }

        const spinner = ora('Updating password...').start()

        try {
          await userCore.updateUserPassword({ userId: id, password })
          spinner.succeed(chalk.green('Password updated'))
        } catch (error) {
          spinner.fail(chalk.red('Failed to update password'))
          console.error(chalk.red(formatError(error)))
          process.exit(1)
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(chalk.red('Error:'), message)
        process.exit(1)
      }
    })
}

