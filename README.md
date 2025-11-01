🚀 RestAssured API Test Generator

A simple yet powerful web application that generates production-ready RestAssured test classes from a user-friendly form interface. Perfect for beginners learning API testing and developers who want to quickly scaffold RestAssured tests!

📖 Table of Contents

    Overview
    Tech Stack
    Demo
    Prerequisites
    Installation & Setup
    How to Use
    Generated Code Example
    Future Enhancements
    License
    Contact
    
🎯 Overview

Learning RestAssured can be challenging for beginners due to its syntax and configuration. This tool eliminates the initial learning curve by generating complete, properly structured RestAssured test classes based on simple form inputs.

Simply fill in your API details (endpoint, method, headers, authentication, etc.) and get a ready-to-use Java test class with proper imports, assertions, and logging!

🛠️ Tech Stack

Frontend:

    HTML5
    CSS3
    Vanilla JavaScript

Backend:

    Node.js 
    Express.js

Generated Code:

    Java   
    RestAssured Framework    
    TestNG
    
🎥 Demo

![GIF_20251030_225519](https://github.com/user-attachments/assets/eced3216-ea64-4885-8912-75cb1b993c72)


📋 Prerequisites

Before you begin, ensure you have the following installed:

    Node.js (v14.0.0 or higher)
    npm (comes with Node.js)
    A web browser (Chrome, Firefox, Safari, Edge)
    
To check if you have Node.js and npm installed:

    node --version
    npm --version

If not installed, download from nodejs.org

🚀 Installation & Setup

    Step 1: Clone the Repository
    Open your terminal/command prompt and run:
    git clone https://github.com/MeShubhamGaur/RestAssured-API-Test-Generator
    
    Step 2: Navigate to Project Directory
    cd restassured-test-generator
    
    Step 3: Install Dependencies
    npm install

This will install the required packages:
    express - Web framework for Node.js
    cors - Enable Cross-Origin Resource Sharing
    
    Step 4: Start the Backend Server
    node server.js


You should see:

🚀 Server is running!

📍 URL: http://localhost:8080

🔗 API Endpoint: http://localhost:8080/api/generate-test

    Step 5: Open the Frontend
    Open index.html in your web browser:
    Option 1: Direct Open
    Navigate to the project folder
    Double-click index.html
    Option 2: Using Command Line
    Mac:
    open index.html
    
    Windows:
    start index.html
    
    Linux:
    xdg-open index.html
    
    Option 3: Using VS Code Live Server
    Install "Live Server" extension in VS Code
    Right-click index.html → "Open with Live Server"
    
📖 How to Use

1. Fill in the Form
   
        Required Fields:
        HTTP Method - Select GET, POST, PUT, PATCH, or DELETE
        Endpoint URL - Enter your API endpoint (e.g., https://api.example.com/users)
        Expected Status - Choose expected HTTP status code (200, 201, 400, etc.)
        Optional Fields:
        Query Parameters - Add key-value pairs for URL parameters
        Authorization - Select auth type and enter credentials
        Headers - Add custom HTTP headers
        Request Body - JSON body for POST/PUT/PATCH requests
        Response Time Threshold - Set max acceptable response time in milliseconds
   
2. Generate Code
   
        Click the "Generate" button. The app will:
        Validate your input
        Send data to the backend
        Generate the RestAssured test class
        Redirect to the results page4
   
3. Download or Copy
   
        On the results page, you can:
        📥 Download - Save as a .java file
        📋 Copy - Copy code to clipboard
        ← Back - Return to form to generate another test
   
4. Use the Generated Code
   
        Copy/download the generated Java file
        Add it to your Java project's test directory
        Ensure you have RestAssured and TestNG dependencies in your pom.xml or build.gradle
        Run the test!

💻 Generated Code Example

Input:

    Method: GET
    Endpoint: https://jsonplaceholder.typicode.com/users/1
    Expected Status: 200
    Response Time: 1000ms
    
Generated Output:

    import io.restassured.RestAssured;
    import io.restassured.response.Response;
    import org.testng.annotations.Test;
    import static io.restassured.RestAssured.given;
    import static org.hamcrest.Matchers.*;
    
    public class UsersApiTest {
    
        @Test
        public void testGetRequest() {
            Response response = given()
                .contentType("application/json")
            .when()
                .get("https://jsonplaceholder.typicode.com/users/1")
            .then()
                .statusCode(200)
                .time(lessThan(1000L))
                .extract().response();
    
            System.out.println("Response Status: " + response.getStatusCode());
            System.out.println("Response Body: " + response.getBody().asString());
        }
    }

🔮 Future Enhancements

The following features are planned for future releases:

    1. Test Execution - Run generated tests directly in the browser and display results
    
    2. Schema Validation - JSON schema validation support
    
    3. Response Assertions - Add custom response body assertions
    
    4. AI-Powered Test Generation using prompt engineering to create intelligent, context-aware test cases

👤 Contact

    GitHub: @MeShubhamGaur
    LinkedIn: https://www.linkedin.com/in/shubham-gaur-25078123a
    Email: shubhamgaur22091999@gmail.com
    
⭐ Support

If you find this project helpful, please consider giving it a star ⭐ on GitHub!

Made with ❤️ by Shubham Gaur

Happy Testing! 🚀
