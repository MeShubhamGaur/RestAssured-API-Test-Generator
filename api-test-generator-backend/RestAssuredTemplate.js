/**
 * RestAssured Test Generator
 * Generates Java test classes with RestAssured API tests
 */

class RestAssuredTemplate {
    
    /**
     * Main method to generate the complete test class
     * @param {Object} data - The form data from frontend
     * @returns {String} - Complete Java class code
     */
    static generate(data) {
        const className = this.generateClassName(data.endpoint);
        const imports = this.generateImports(data);
        const classBody = this.generateClassBody(data, className);
        
        return `${imports}\n\n${classBody}`;
    }

    /**
     * Generate a valid Java class name from the endpoint
     * Example: "https://api.example.com/users" -> "UsersApiTest"
     */
    static generateClassName(endpoint) {
        try {
            // Extract the last part of the URL path
            const url = new URL(endpoint);
            const pathParts = url.pathname.split('/').filter(part => part.length > 0);
            
            if (pathParts.length === 0) {
                return 'ApiTest';
            }
            
            // Get the last meaningful part and capitalize it
            const lastPart = pathParts[pathParts.length - 1];
            const sanitized = lastPart.replace(/[^a-zA-Z0-9]/g, '');
            const capitalized = sanitized.charAt(0).toUpperCase() + sanitized.slice(1);
            
            return `${capitalized}ApiTest`;
        } catch (error) {
            return 'ApiTest';
        }
    }

    /**
     * Generate import statements based on what features are used
     */
    static generateImports(data) {
        const imports = [
            'import io.restassured.RestAssured;',
            'import io.restassured.response.Response;',
            'import org.testng.annotations.Test;',
            'import static io.restassured.RestAssured.given;',
            'import static org.hamcrest.Matchers.*;'
        ];

        // Add schema validation import if needed
        if (data.validateSchema) {
            imports.push('import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchema;');
        }

        return imports.join('\n');
    }

    /**
     * Generate the complete class body with test method
     */
    static generateClassBody(data, className) {
        const testMethodName = this.generateTestMethodName(data.method);
        const testMethod = this.generateTestMethod(data, testMethodName);
        
        return `public class ${className} {

${testMethod}
}`;
    }

    /**
     * Generate test method name
     * Example: "GET" -> "testGetRequest"
     */
    static generateTestMethodName(method) {
        const methodLower = method.toLowerCase();
        const methodCap = method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
        return `test${methodCap}Request`;
    }

    /**
     * Generate the complete test method with RestAssured code
     */
    static generateTestMethod(data, methodName) {
        let method = '';
        
        // Add method signature and annotation
        method += `    @Test\n`;
        method += `    public void ${methodName}() {\n`;
        
        // Build the RestAssured request
        method += this.buildRestAssuredRequest(data);
        
        method += `    }\n`;
        
        return method;
    }

    /**
     * Build the complete RestAssured request chain
     */
    static buildRestAssuredRequest(data) {
        let request = '';
        const indent = '        '; // 8 spaces for proper indentation
        
        // Start the request
        request += `${indent}Response response = given()\n`;
        
        // Add base configuration
        request += `${indent}    .contentType("application/json")\n`;
        
        // Add authorization
        if (data.authorization && data.authorization.type !== 'none') {
            request += this.buildAuthorization(data.authorization, indent);
        }
        
        // Add headers
        if (data.headers && Object.keys(data.headers).length > 0) {
            request += this.buildHeaders(data.headers, indent);
        }
        
        // Add query parameters
        if (data.queryParams && Object.keys(data.queryParams).length > 0) {
            request += this.buildQueryParams(data.queryParams, indent);
        }
        
        // Add request body (for POST, PUT, PATCH)
        if (data.requestBody) {
            request += this.buildRequestBody(data.requestBody, indent);
        }
        
        // Add the HTTP method and endpoint
        request += `${indent}.when()\n`;
        request += `${indent}    .${data.method.toLowerCase()}("${data.endpoint}")\n`;
        
        // Add assertions
        request += `${indent}.then()\n`;
        request += `${indent}    .statusCode(${data.expectedStatus})\n`;
        
        // Add response time assertion if provided
        if (data.responseTimeThreshold) {
            request += `${indent}    .time(lessThan(${data.responseTimeThreshold}L))\n`;
        }
        
        // Add schema validation if enabled
        if (data.validateSchema && data.schemaFile) {
            const schemaJson = JSON.stringify(data.schemaFile);
            const escapedSchema = schemaJson.replace(/"/g, '\\"');
            request += `${indent}    .body(matchesJsonSchema("${escapedSchema}"))\n`;
        }
        
        // Extract and log response
        request += `${indent}    .extract().response();\n\n`;
        
        // Add response logging
        request += `${indent}System.out.println("Response Status: " + response.getStatusCode());\n`;
        request += `${indent}System.out.println("Response Body: " + response.getBody().asString());\n`;
        
        return request;
    }

    /**
     * Build authorization configuration
     */
    static buildAuthorization(auth, indent) {
        let authCode = '';
        
        if (auth.type === 'basic') {
            authCode += `${indent}    .auth().basic("${auth.username}", "${auth.password}")\n`;
        } else if (auth.type === 'bearer') {
            authCode += `${indent}    .header("Authorization", "Bearer ${auth.token}")\n`;
        } else if (auth.type === 'apikey') {
            authCode += `${indent}    .header("${auth.keyName}", "${auth.keyValue}")\n`;
        }
        
        return authCode;
    }

    /**
     * Build headers configuration
     */
    static buildHeaders(headers, indent) {
        let headerCode = '';
        
        for (const [key, value] of Object.entries(headers)) {
            headerCode += `${indent}    .header("${key}", "${value}")\n`;
        }
        
        return headerCode;
    }

    /**
     * Build query parameters configuration
     */
    static buildQueryParams(params, indent) {
        let paramCode = '';
        
        for (const [key, value] of Object.entries(params)) {
            paramCode += `${indent}    .queryParam("${key}", "${value}")\n`;
        }
        
        return paramCode;
    }

    /**
     * Build request body configuration
     */
    static buildRequestBody(body, indent) {
        // Format the JSON body for better readability
        try {
            const parsedBody = JSON.parse(body);
            const formattedBody = JSON.stringify(parsedBody, null, 4);
            
            // Escape quotes and format for Java string
            const escapedBody = formattedBody
                .split('\n')
                .map((line, index, arr) => {
                    if (index === 0) {
                        return `${indent}    .body("${line.replace(/"/g, '\\"')}\\n" +`;
                    } else if (index === arr.length - 1) {
                        return `${indent}           "${line.replace(/"/g, '\\"')}")`;
                    } else {
                        return `${indent}           "${line.replace(/"/g, '\\"')}\\n" +`;
                    }
                })
                .join('\n');
            
            return escapedBody + '\n';
        } catch (error) {
            // If JSON parsing fails, use the body as-is
            const escapedBody = body.replace(/"/g, '\\"').replace(/\n/g, '\\n');
            return `${indent}    .body("${escapedBody}")\n`;
        }
    }
}

// Export the class for use in other files
module.exports = RestAssuredTemplate;