import type { Command } from 'commander'
import chalk from 'chalk'
import inquirer from 'inquirer'
import ora from 'ora'
import { table } from 'table'
import * as scheduleCore from '../../core/schedule'
import { formatError } from '../../utils'

export function scheduleCommands(program: Command) {
  program
    .command('list')
    .description('List all scheduled tasks')
    .action(async () => {
      try {
        const spinner = ora('Fetching scheduled tasks list...').start()

        try {
          const schedules = await scheduleCore.listSchedules()
          spinner.succeed(chalk.green('Scheduled Tasks List'))

          if (schedules.length === 0) {
            console.log(chalk.yellow('No scheduled tasks'))
            return
          }

          const tableData = [
            ['ID', 'Title', 'Cron', 'Enabled', 'Created At'],
            ...schedules.map((schedule) => [
              schedule.id.substring(0, 8) + '...',
              schedule.title,
              schedule.cronExpression,
              schedule.enabled ? chalk.green('Yes') : chalk.red('No'),
              new Date(schedule.createdAt).toLocaleString('en-US'),
            ]),
          ]

          console.log(table(tableData))
        } catch (error) {
          spinner.fail(chalk.red('Failed to fetch scheduled tasks list'))
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
    .description('Create scheduled task')
    .option('-t, --title <title>', 'Task title')
    .option('-d, --description <description>', 'Task description')
    .option('-c, --cron <expression>', 'Cron expression')
    .option('-e, --enabled', 'Enable task', false)
    .action(async (options) => {
      try {
        let { title, description, cron, enabled } = options

        if (!title || !cron) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'title',
              message: 'Task title:',
              when: !title,
            },
            {
              type: 'input',
              name: 'description',
              message: 'Task description (optional):',
              when: !description,
            },
            {
              type: 'input',
              name: 'cron',
              message: 'Cron expression (e.g., 0 9 * * *):',
              when: !cron,
            },
            {
              type: 'confirm',
              name: 'enabled',
              message: 'Enable task?',
              default: false,
              when: enabled === undefined,
            },
          ])

          title = title || answers.title
          description = description || answers.description
          cron = cron || answers.cron
          enabled = enabled !== undefined ? enabled : answers.enabled
        }

        const spinner = ora('Creating scheduled task...').start()

        try {
          const schedule = await scheduleCore.createSchedule({
            title,
            description,
            cronExpression: cron,
            enabled,
          })

          spinner.succeed(chalk.green('Scheduled task created successfully'))
          console.log(chalk.blue(`Title: ${schedule.title}`))
          console.log(chalk.blue(`Cron: ${schedule.cronExpression}`))
          console.log(chalk.blue(`ID: ${schedule.id}`))
        } catch (error) {
          spinner.fail(chalk.red('Failed to create scheduled task'))
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
    .description('Get scheduled task details')
    .action(async (id) => {
      try {
        const spinner = ora('Fetching scheduled task details...').start()

        try {
          const schedule = await scheduleCore.getSchedule(id)
          spinner.succeed(chalk.green('Scheduled Task Details'))
          console.log(chalk.blue(`ID: ${schedule.id}`))
          console.log(chalk.blue(`Title: ${schedule.title}`))
          if (schedule.description) {
            console.log(chalk.blue(`Description: ${schedule.description}`))
          }
          console.log(chalk.blue(`Cron: ${schedule.cronExpression}`))
          console.log(
            chalk.blue(`Enabled: ${schedule.enabled ? chalk.green('Yes') : chalk.red('No')}`)
          )
          console.log(
            chalk.blue(`Created At: ${new Date(schedule.createdAt).toLocaleString('en-US')}`)
          )
          console.log(
            chalk.blue(`Updated At: ${new Date(schedule.updatedAt).toLocaleString('en-US')}`)
          )
        } catch (error) {
          spinner.fail(chalk.red('Failed to fetch scheduled task'))
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
    .command('update <id>')
    .description('Update scheduled task')
    .option('-t, --title <title>', 'Task title')
    .option('-d, --description <description>', 'Task description')
    .option('-c, --cron <expression>', 'Cron expression')
    .option('-e, --enabled <boolean>', 'Enable task (true/false)')
    .action(async (id, options) => {
      try {
        const updates: {
          title?: string
          description?: string
          cronExpression?: string
          enabled?: boolean
        } = {}

        if (options.title) updates.title = options.title
        if (options.description) updates.description = options.description
        if (options.cron) updates.cronExpression = options.cron
        if (options.enabled !== undefined) {
          updates.enabled = options.enabled === 'true' || options.enabled === true
        }

        if (Object.keys(updates).length === 0) {
          console.log(chalk.yellow('No update parameters provided'))
          return
        }

        const spinner = ora('Updating scheduled task...').start()

        try {
          await scheduleCore.updateSchedule(id, updates)
          spinner.succeed(chalk.green('Scheduled task updated'))
        } catch (error) {
          spinner.fail(chalk.red('Failed to update scheduled task'))
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
    .description('Delete scheduled task')
    .action(async (id) => {
      try {
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: chalk.yellow(`Are you sure you want to delete scheduled task ${id}?`),
            default: false,
          },
        ])

        if (!confirm) {
          console.log(chalk.yellow('Cancelled'))
          return
        }

        const spinner = ora('Deleting scheduled task...').start()

        try {
          await scheduleCore.deleteSchedule(id)
          spinner.succeed(chalk.green('Scheduled task deleted'))
        } catch (error) {
          spinner.fail(chalk.red('Failed to delete scheduled task'))
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
    .command('toggle <id>')
    .description('Toggle scheduled task enabled status')
    .action(async (id) => {
      try {
        const spinner = ora('Toggling task status...').start()

        try {
          const newStatus = await scheduleCore.toggleSchedule(id)
          spinner.succeed(
            chalk.green(`Task ${newStatus ? 'enabled' : 'disabled'}`)
          )
        } catch (error) {
          spinner.fail(chalk.red('Failed to toggle task'))
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

