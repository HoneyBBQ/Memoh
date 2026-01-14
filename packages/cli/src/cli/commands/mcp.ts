import type { Command } from 'commander'
import chalk from 'chalk'
import inquirer from 'inquirer'
import ora from 'ora'
import { table } from 'table'
import * as mcpCore from '../../core/mcp'
import { formatError } from '../../utils'
import type { MCPConnectionConfig } from '../../types'

export function mcpCommands(program: Command) {
  program
    .command('list')
    .description('List all MCP connections')
    .action(async () => {
      try {
        const spinner = ora('Fetching MCP connections list...').start()

        try {
          const connections = await mcpCore.listMCPConnections()
          spinner.succeed(chalk.green('MCP Connections List'))

          if (connections.length === 0) {
            console.log(chalk.yellow('No MCP connections'))
            return
          }

          const tableData = [
            ['ID', 'Name', 'Type', 'Active'],
            ...connections.map((conn) => [
              conn.id.substring(0, 8) + '...',
              conn.name,
              conn.type,
              conn.active ? chalk.green('Yes') : chalk.red('No'),
            ]),
          ]

          console.log(table(tableData))
        } catch (error) {
          spinner.fail(chalk.red('Failed to fetch MCP connections list'))
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
    .description('Create MCP connection')
    .option('-n, --name <name>', 'Connection name')
    .option('-t, --type <type>', 'Connection type (stdio/http/sse)')
    .action(async (options) => {
      try {
        let { name, type } = options

        // Get basic info
        if (!name || !type) {
          const basicAnswers = await inquirer.prompt([
            {
              type: 'input',
              name: 'name',
              message: 'Connection name:',
              when: !name,
            },
            {
              type: 'list',
              name: 'type',
              message: 'Connection type:',
              choices: ['stdio', 'http', 'sse'],
              when: !type,
            },
          ])

          name = name || basicAnswers.name
          type = type || basicAnswers.type
        }

        let config: MCPConnectionConfig

        // Get type-specific config
        if (type === 'stdio') {
          const stdioAnswers = await inquirer.prompt([
            {
              type: 'input',
              name: 'command',
              message: 'Command:',
            },
            {
              type: 'input',
              name: 'args',
              message: 'Arguments (comma-separated, optional):',
              default: '',
            },
            {
              type: 'input',
              name: 'cwd',
              message: 'Working directory:',
              default: process.cwd(),
            },
            {
              type: 'input',
              name: 'env',
              message: 'Environment variables (key=value, comma-separated, optional):',
              default: '',
            },
          ])

          const args = stdioAnswers.args ? stdioAnswers.args.split(',').map((s: string) => s.trim()) : []
          const env: Record<string, string> = {}
          if (stdioAnswers.env) {
            stdioAnswers.env.split(',').forEach((pair: string) => {
              const [key, value] = pair.split('=').map((s: string) => s.trim())
              if (key && value) {
                env[key] = value
              }
            })
          }

          config = {
            type: 'stdio',
            command: stdioAnswers.command,
            args,
            env,
            cwd: stdioAnswers.cwd,
          }
        } else if (type === 'http' || type === 'sse') {
          const httpAnswers = await inquirer.prompt([
            {
              type: 'input',
              name: 'url',
              message: 'URL:',
            },
            {
              type: 'input',
              name: 'headers',
              message: 'Headers (key=value, comma-separated, optional):',
              default: '',
            },
          ])

          const headers: Record<string, string> = {}
          if (httpAnswers.headers) {
            httpAnswers.headers.split(',').forEach((pair: string) => {
              const [key, value] = pair.split('=').map((s: string) => s.trim())
              if (key && value) {
                headers[key] = value
              }
            })
          }

          config = {
            type: type as 'http' | 'sse',
            url: httpAnswers.url,
            headers,
          }
        } else {
          console.error(chalk.red('Invalid connection type'))
          process.exit(1)
        }

        const { active } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'active',
            message: 'Activate connection?',
            default: true,
          },
        ])

        const spinner = ora('Creating MCP connection...').start()

        try {
          const connection = await mcpCore.createMCPConnection({
            name,
            config,
            active,
          })

          spinner.succeed(chalk.green('MCP connection created successfully'))
          console.log(chalk.blue(`Name: ${connection.name}`))
          console.log(chalk.blue(`Type: ${connection.type}`))
          console.log(chalk.blue(`ID: ${connection.id}`))
        } catch (error) {
          spinner.fail(chalk.red('Failed to create MCP connection'))
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
    .description('Get MCP connection details')
    .action(async (id) => {
      try {
        const spinner = ora('Fetching MCP connection details...').start()

        try {
          const connection = await mcpCore.getMCPConnection(id)
          spinner.succeed(chalk.green('MCP Connection Details'))
          console.log(chalk.blue(`ID: ${connection.id}`))
          console.log(chalk.blue(`Name: ${connection.name}`))
          console.log(chalk.blue(`Type: ${connection.type}`))
          console.log(
            chalk.blue(`Active: ${connection.active ? chalk.green('Yes') : chalk.red('No')}`)
          )
          console.log(chalk.blue(`Config:`))
          console.log(JSON.stringify(connection.config, null, 2))
        } catch (error) {
          spinner.fail(chalk.red('Failed to fetch MCP connection'))
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
    .description('Update MCP connection')
    .option('-n, --name <name>', 'Connection name')
    .option('-a, --active <boolean>', 'Active status (true/false)')
    .action(async (id, options) => {
      try {
        const updates: {
          name?: string
          active?: boolean
        } = {}

        if (options.name) updates.name = options.name
        if (options.active !== undefined) {
          updates.active = options.active === 'true' || options.active === true
        }

        if (Object.keys(updates).length === 0) {
          console.log(chalk.yellow('No update parameters provided'))
          console.log(chalk.yellow('Note: Config updates are not yet supported via CLI'))
          return
        }

        const spinner = ora('Updating MCP connection...').start()

        try {
          await mcpCore.updateMCPConnection(id, updates)
          spinner.succeed(chalk.green('MCP connection updated'))
        } catch (error) {
          spinner.fail(chalk.red('Failed to update MCP connection'))
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
    .description('Delete MCP connection')
    .action(async (id) => {
      try {
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: chalk.yellow(`Are you sure you want to delete MCP connection ${id}?`),
            default: false,
          },
        ])

        if (!confirm) {
          console.log(chalk.yellow('Cancelled'))
          return
        }

        const spinner = ora('Deleting MCP connection...').start()

        try {
          await mcpCore.deleteMCPConnection(id)
          spinner.succeed(chalk.green('MCP connection deleted'))
        } catch (error) {
          spinner.fail(chalk.red('Failed to delete MCP connection'))
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
    .description('Toggle MCP connection active status')
    .action(async (id) => {
      try {
        const spinner = ora('Toggling connection status...').start()

        try {
          const newStatus = await mcpCore.toggleMCPConnection(id)
          spinner.succeed(
            chalk.green(`Connection ${newStatus ? 'activated' : 'deactivated'}`)
          )
        } catch (error) {
          spinner.fail(chalk.red('Failed to toggle connection'))
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

