// Import required modules
const express = require('express');
const cors = require('cors');
const RestAssuredTemplate = require('./RestAssuredTemplate');

// Create an Express application
const app = express();

// Define the port number where server will run
const PORT = 8080;

// ============================================
// MIDDLEWARE SETUP
// ============================================

// 1. CORS: Allows frontend (running on different port) to call this API
app.use(cors());

// 2. Parse JSON: Converts incoming JSON data into JavaScript objects
app.use(express.json({ limit: '10mb' })); // limit: allows large schema files

// 3. Parse URL-encoded data (form data)
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES (API ENDPOINTS)
// ============================================

// Root endpoint - just to check if server is running
app.get('/', (req, res) => {
    res.json({
        message: 'RestAssured API Test Generator Backend is running!',
        status: 'active',
        endpoints: {
            generate: 'POST /api/generate-test'
        }
    });
});

// Main endpoint that receives form data from frontend
app.post('/api/generate-test', (req, res) => {
    try {
        // req.body contains all the JSON data sent from frontend
        const formData = req.body;

        console.log('=================================');
        console.log('Received request to generate test');
        console.log('=================================');
        console.log('Method:', formData.method);
        console.log('Endpoint:', formData.endpoint);
        console.log('Query Params:', formData.queryParams);
        console.log('Authorization:', formData.authorization);
        console.log('Headers:', formData.headers);
        console.log('Request Body:', formData.requestBody);
        console.log('Expected Status:', formData.expectedStatus);
        console.log('Response Time Threshold:', formData.responseTimeThreshold);
        console.log('=================================\n');

        // Validate required fields
        if (!formData.method) {
            return res.status(400).json({
                success: false,
                error: 'HTTP method is required'
            });
        }

        if (!formData.endpoint) {
            return res.status(400).json({
                success: false,
                error: 'Endpoint URL is required'
            });
        }

        if (!formData.expectedStatus) {
            return res.status(400).json({
                success: false,
                error: 'Expected status code is required'
            });
        }

        // Validate request body for POST/PUT/PATCH
        if (['POST', 'PUT', 'PATCH'].includes(formData.method)) {
            if (!formData.requestBody) {
                return res.status(400).json({
                    success: false,
                    error: `Request body is required for ${formData.method} method`
                });
            }

            // Try to parse the request body to ensure it's valid JSON
            try {
                JSON.parse(formData.requestBody);
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    error: 'Request body must be valid JSON'
                });
            }
        }

        // ============================================
        // GENERATE THE JAVA TEST CLASS
        // ============================================
        
        console.log('Generating Java test class...\n');
        
        // Use the RestAssuredTemplate to generate the Java code
        const javaTestCode = RestAssuredTemplate.generate(formData);
        
        console.log('Generated Java Test Class:');
        console.log('=================================');
        console.log(javaTestCode);
        console.log('=================================\n');

        // ============================================
        // SUCCESS RESPONSE
        // ============================================
        
        // Send success response with the generated Java code
        res.status(200).json({
            success: true,
            message: 'Test class generated successfully',
            data: {
                javaCode: javaTestCode,
                className: RestAssuredTemplate.generateClassName(formData.endpoint),
                fileName: `${RestAssuredTemplate.generateClassName(formData.endpoint)}.java`
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // Handle any unexpected errors
        console.error('Error processing request:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// ============================================
// CATCH-ALL ERROR HANDLER
// ============================================

// Handle 404 - Route not found
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        requestedPath: req.path
    });
});

// Handle all other errors
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!',
        details: err.message
    });
});

// ============================================
// START THE SERVER
// ============================================

app.listen(PORT, () => {
    console.log('\n=================================');
    console.log('🚀 Server is running!');
    console.log('=================================');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🔗 API Endpoint: http://localhost:${PORT}/api/generate-test`);
    console.log('=================================\n');
});