/**
 * JavaExecutor - Node.js wrapper to execute Java test files
 * This module compiles and runs the TestExecutor.java which in turn runs generated tests
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class JavaExecutor {
    
    constructor() {
        this.javaExecutorFile = 'TestExecutor.java';
        this.javaExecutorClass = 'TestExecutor';
    }
    
    /**
     * Main method to execute a generated test
     * @param {String} className - Name of the test class
     * @param {String} sourceCode - Complete Java source code
     * @returns {Promise<Object>} - Test execution results
     */
    async executeTest(className, sourceCode) {
        try {
            console.log(`\n=== Starting Test Execution for ${className} ===\n`);
            
            // Step 1: Ensure TestExecutor is compiled
            await this.ensureTestExecutorCompiled();
            
            // Step 2: Execute the test using TestExecutor
            const result = await this.runTestExecutor(className, sourceCode);
            
            console.log(`\n=== Test Execution Complete ===\n`);
            
            return result;
            
        } catch (error) {
            console.error('Error executing test:', error);
            return {
                success: false,
                error: error.message,
                details: error.stack
            };
        }
    }
    
    /**
     * Ensure TestExecutor.java is compiled
     */
    async ensureTestExecutorCompiled() {
        try {
            // Check if TestExecutor.class exists
            const classFile = this.javaExecutorClass + '.class';
            
            try {
                await fs.access(classFile);
                console.log('TestExecutor already compiled');
                return;
            } catch (err) {
                // Class file doesn't exist, need to compile
            }
            
            // Compile TestExecutor.java
            console.log('Compiling TestExecutor.java...');
            await this.compileJavaFile(this.javaExecutorFile);
            console.log('TestExecutor compiled successfully');
            
        } catch (error) {
            throw new Error(`Failed to compile TestExecutor: ${error.message}`);
        }
    }
    
    /**
     * Compile a Java file
     */
    compileJavaFile(javaFile) {
        return new Promise((resolve, reject) => {
            const command = `javac "${javaFile}"`;
            
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Compilation failed: ${stderr || error.message}`));
                    return;
                }
                resolve(stdout);
            });
        });
    }
    
    /**
     * Run TestExecutor with the generated test code
     */
    runTestExecutor(className, sourceCode) {
        return new Promise((resolve, reject) => {
            // Escape source code for command line
            const escapedCode = sourceCode
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\$/g, '\\$')
                .replace(/`/g, '\\`');
            
            // Build the command
            // Note: We're passing className and sourceCode as arguments
            const command = `java ${this.javaExecutorClass} "${className}" "${escapedCode}"`;
            
            console.log('Executing test...');
            
            // Execute with increased buffer size for large outputs
            exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
                
                // Try to parse the JSON output from Java
                try {
                    // Java outputs JSON to stdout
                    const result = JSON.parse(stdout);
                    
                    // Add stderr if there's any warning
                    if (stderr) {
                        result.warnings = stderr;
                    }
                    
                    resolve(result);
                    
                } catch (parseError) {
                    // If JSON parsing fails, return raw output
                    resolve({
                        success: false,
                        error: 'Failed to parse test results',
                        rawOutput: stdout,
                        rawError: stderr,
                        parseError: parseError.message
                    });
                }
            });
        });
    }
    
    /**
     * Check if Java is installed and available
     */
    async checkJavaAvailability() {
        return new Promise((resolve) => {
            exec('java -version', (error, stdout, stderr) => {
                if (error) {
                    resolve({
                        available: false,
                        error: 'Java not found. Please install JDK.'
                    });
                    return;
                }
                
                // Java version info goes to stderr
                const version = stderr || stdout;
                resolve({
                    available: true,
                    version: version.split('\n')[0]
                });
            });
        });
    }
}

module.exports = JavaExecutor;