/**
 * Test Reporter
 *
 * This module provides utilities for reporting test progress and results.
 * It includes functions for logging test steps, assertions, and results.
 */

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogOptions {
  level?: LogLevel
  timestamp?: boolean
  prefix?: string
}

export class TestReporter {
  private testName: string
  private startTime: number
  private stepCount: number = 0
  private logLevel: LogLevel

  constructor(testName: string, logLevel: LogLevel = LogLevel.INFO) {
    this.testName = testName
    this.startTime = Date.now()
    this.logLevel = logLevel
    this.logBanner(`TEST: ${testName}`)
  }

  /**
   * Log a debug message
   *
   * @param message The message to log
   * @param options Logging options
   */
  public debug(message: string, options: LogOptions = {}): void {
    this.log(message, { ...options, level: LogLevel.DEBUG })
  }

  /**
   * Log an info message
   *
   * @param message The message to log
   * @param options Logging options
   */
  public info(message: string, options: LogOptions = {}): void {
    this.log(message, { ...options, level: LogLevel.INFO })
  }

  /**
   * Log a warning message
   *
   * @param message The message to log
   * @param options Logging options
   */
  public warn(message: string, options: LogOptions = {}): void {
    this.log(message, { ...options, level: LogLevel.WARN })
  }

  /**
   * Log an error message
   *
   * @param message The message to log
   * @param options Logging options
   */
  public error(message: string, options: LogOptions = {}): void {
    this.log(message, { ...options, level: LogLevel.ERROR })
  }

  /**
   * Log a test step
   *
   * @param description The step description
   */
  public step(description: string): void {
    this.stepCount++
    this.logSeparator()
    this.info(`STEP ${this.stepCount}: ${description}`, { prefix: '🔷' })
  }

  /**
   * Log a successful assertion
   *
   * @param message The assertion message
   */
  public assert(message: string): void {
    this.info(message, { prefix: '✅' })
  }

  /**
   * Log a failed assertion
   *
   * @param message The assertion message
   * @param error The error that caused the failure
   */
  public assertFail(message: string, error?: any): void {
    this.error(message, { prefix: '❌' })
    if (error) {
      if (error instanceof Error) {
        this.error(`  Error: ${error.message}`)
        if (error.stack) {
          this.debug(`  Stack: ${error.stack}`)
        }
      } else {
        this.error(`  Error: ${JSON.stringify(error)}`)
      }
    }
  }

  /**
   * Log the test result
   *
   * @param success Whether the test passed
   * @param message Optional result message
   */
  public result(success: boolean, message?: string): void {
    const duration = Date.now() - this.startTime
    const durationStr = this.formatDuration(duration)

    this.logSeparator()
    if (success) {
      this.info(`TEST PASSED: ${this.testName} (${durationStr})`, { prefix: '✅' })
      if (message) {
        this.info(`  ${message}`)
      }
    } else {
      this.error(`TEST FAILED: ${this.testName} (${durationStr})`, { prefix: '❌' })
      if (message) {
        this.error(`  ${message}`)
      }
    }
    this.logSeparator()
  }

  /**
   * Log a message
   *
   * @param message The message to log
   * @param options Logging options
   */
  private log(message: string, options: LogOptions = {}): void {
    const { level = LogLevel.INFO, timestamp = false, prefix = '' } = options

    // Skip if below log level
    if (level < this.logLevel) {
      return
    }

    let formattedMessage = message

    // Add timestamp if requested
    if (timestamp) {
      const now = new Date()
      formattedMessage = `[${now.toISOString()}] ${formattedMessage}`
    }

    // Add prefix if provided
    if (prefix) {
      formattedMessage = `${prefix} ${formattedMessage}`
    }

    // Log with appropriate color and level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`\x1b[90m${formattedMessage}\x1b[0m`)
        break
      case LogLevel.INFO:
        console.error(`\x1b[36m${formattedMessage}\x1b[0m`)
        break
      case LogLevel.WARN:
        console.warn(`\x1b[33m${formattedMessage}\x1b[0m`)
        break
      case LogLevel.ERROR:
        console.error(`\x1b[31m${formattedMessage}\x1b[0m`)
        break
    }
  }

  /**
   * Log a separator line
   */
  private logSeparator(): void {
    console.error('-'.repeat(80))
  }

  /**
   * Log a banner
   *
   * @param message The banner message
   */
  private logBanner(message: string): void {
    console.error(`\n${'='.repeat(80)}`)
    console.error(`\x1b[1m\x1b[36m  ${message}\x1b[0m`)
    console.error(`${'='.repeat(80)}\n`)
  }

  /**
   * Format a duration in milliseconds
   *
   * @param ms Duration in milliseconds
   * @returns Formatted duration string
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`
    } else {
      const minutes = Math.floor(ms / 60000)
      const seconds = ((ms % 60000) / 1000).toFixed(2)
      return `${minutes}m ${seconds}s`
    }
  }
}

// Export log levels
export { LogLevel }
