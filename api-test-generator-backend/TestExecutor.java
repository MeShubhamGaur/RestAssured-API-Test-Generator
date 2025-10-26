// import java.io.*;
// import java.nio.file.*;
// import javax.tools.*;
// import java.util.*;
// import java.net.URL;
// import java.net.URLClassLoader;
// import java.lang.reflect.Method;

// /**
//  * TestExecutor - Compiles and executes generated RestAssured test classes
//  * This class receives Java source code, compiles it, and runs the test method
//  */
// public class TestExecutor {
    
//     private static final String TEMP_DIR = "temp_tests";
//     private static final String OUTPUT_DIR = "temp_classes";
    
//     public static void main(String[] args) {
//         if (args.length < 2) {
//             System.err.println("Usage: java TestExecutor <className> <sourceCode>");
//             System.exit(1);
//         }
        
//         String className = args[0];
//         String sourceCode = args[1];
        
//         try {
//             // Execute the test and get results
//             TestResult result = executeTest(className, sourceCode);
            
//             // Output results as JSON for Node.js to parse
//             outputResultAsJson(result);
            
//         } catch (Exception e) {
//             outputErrorAsJson(e);
//         }
//     }
    
//     /**
//      * Main method to execute the test
//      */
//     public static TestResult executeTest(String className, String sourceCode) throws Exception {
//         TestResult result = new TestResult();
//         result.className = className;
        
//         // Step 1: Create temporary directories
//         createDirectories();
        
//         // Step 2: Write source code to file
//         String sourceFilePath = writeSourceFile(className, sourceCode);
//         result.sourceFile = sourceFilePath;
        
//         // Step 3: Compile the Java file
//         boolean compiled = compileJavaFile(sourceFilePath, result);
//         if (!compiled) {
//             result.status = "COMPILATION_FAILED";
//             return result;
//         }
        
//         // Step 4: Run the test method
//         runTest(className, result);
        
//         // Step 5: Cleanup
//         cleanup();
        
//         return result;
//     }
    
//     /**
//      * Create temporary directories for source and compiled files
//      */
//     private static void createDirectories() throws IOException {
//         Files.createDirectories(Paths.get(TEMP_DIR));
//         Files.createDirectories(Paths.get(OUTPUT_DIR));
//     }
    
//     /**
//      * Write source code to a .java file
//      */
//     private static String writeSourceFile(String className, String sourceCode) throws IOException {
//         String fileName = className + ".java";
//         Path filePath = Paths.get(TEMP_DIR, fileName);
//         Files.write(filePath, sourceCode.getBytes());
//         return filePath.toString();
//     }
    
//     /**
//      * Compile the Java source file
//      */
//     private static boolean compileJavaFile(String sourceFilePath, TestResult result) {
//         JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        
//         if (compiler == null) {
//             result.compilationErrors = "Java compiler not available. Make sure you're using JDK, not JRE.";
//             return false;
//         }
        
//         // Capture compilation errors
//         ByteArrayOutputStream errorStream = new ByteArrayOutputStream();
        
//         // Set up compilation options
//         List<String> optionList = new ArrayList<>();
//         optionList.add("-d");
//         optionList.add(OUTPUT_DIR);
//         optionList.add("-classpath");
//         optionList.add(getClasspath());
        
//         // Run compilation
//         int compilationResult = compiler.run(
//             null,
//             null,
//             errorStream,
//             sourceFilePath
//         );
        
//         if (compilationResult != 0) {
//             result.compilationErrors = errorStream.toString();
//             return false;
//         }
        
//         result.compilationStatus = "SUCCESS";
//         return true;
//     }
    
//     /**
//      * Get classpath including RestAssured and dependencies
//      */
//     private static String getClasspath() {
//         // Get current classpath
//         String currentClasspath = System.getProperty("java.class.path");
        
//         // Add output directory
//         return currentClasspath + File.pathSeparator + OUTPUT_DIR;
//     }
    
//     /**
//      * Run the compiled test
//      */
//     private static void runTest(String className, TestResult result) {
//         ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
//         ByteArrayOutputStream errorStream = new ByteArrayOutputStream();
//         PrintStream originalOut = System.out;
//         PrintStream originalErr = System.err;
        
//         try {
//             // Redirect System.out and System.err to capture test output
//             System.setOut(new PrintStream(outputStream));
//             System.setErr(new PrintStream(errorStream));
            
//             // Load the compiled class
//             URLClassLoader classLoader = new URLClassLoader(
//                 new URL[]{new File(OUTPUT_DIR).toURI().toURL()}
//             );
//             Class<?> testClass = classLoader.loadClass(className);
            
//             // Find the test method (annotated with @Test)
//             Method testMethod = findTestMethod(testClass);
            
//             if (testMethod == null) {
//                 result.status = "TEST_METHOD_NOT_FOUND";
//                 result.executionErrors = "No @Test annotated method found in class";
//                 return;
//             }
            
//             // Create instance and run test
//             Object testInstance = testClass.getDeclaredConstructor().newInstance();
            
//             long startTime = System.currentTimeMillis();
//             testMethod.invoke(testInstance);
//             long endTime = System.currentTimeMillis();
            
//             result.executionTime = endTime - startTime;
//             result.status = "PASSED";
//             result.output = outputStream.toString();
            
//         } catch (Exception e) {
//             result.status = "FAILED";
//             result.executionErrors = getStackTraceAsString(e);
//             result.output = outputStream.toString();
//         } finally {
//             // Restore original System.out and System.err
//             System.setOut(originalOut);
//             System.setErr(originalErr);
//         }
//     }
    
//     /**
//      * Find the method annotated with @Test
//      */
//     private static Method findTestMethod(Class<?> clazz) {
//         for (Method method : clazz.getDeclaredMethods()) {
//             if (method.isAnnotationPresent(org.testng.annotations.Test.class)) {
//                 return method;
//             }
//         }
//         return null;
//     }
    
//     /**
//      * Convert stack trace to string
//      */
//     private static String getStackTraceAsString(Exception e) {
//         StringWriter sw = new StringWriter();
//         PrintWriter pw = new PrintWriter(sw);
//         e.printStackTrace(pw);
//         return sw.toString();
//     }
    
//     /**
//      * Cleanup temporary files
//      */
//     private static void cleanup() {
//         try {
//             deleteDirectory(Paths.get(TEMP_DIR));
//             deleteDirectory(Paths.get(OUTPUT_DIR));
//         } catch (IOException e) {
//             System.err.println("Warning: Could not cleanup temporary files: " + e.getMessage());
//         }
//     }
    
//     /**
//      * Recursively delete directory
//      */
//     private static void deleteDirectory(Path path) throws IOException {
//         if (Files.exists(path)) {
//             Files.walk(path)
//                 .sorted(Comparator.reverseOrder())
//                 .forEach(p -> {
//                     try {
//                         Files.delete(p);
//                     } catch (IOException e) {
//                         // Ignore
//                     }
//                 });
//         }
//     }
    
//     /**
//      * Output result as JSON
//      */
//     private static void outputResultAsJson(TestResult result) {
//         System.out.println("{");
//         System.out.println("  \"success\": true,");
//         System.out.println("  \"className\": \"" + escapeJson(result.className) + "\",");
//         System.out.println("  \"status\": \"" + result.status + "\",");
//         System.out.println("  \"compilationStatus\": \"" + escapeJson(result.compilationStatus) + "\",");
//         System.out.println("  \"compilationErrors\": \"" + escapeJson(result.compilationErrors) + "\",");
//         System.out.println("  \"executionTime\": " + result.executionTime + ",");
//         System.out.println("  \"output\": \"" + escapeJson(result.output) + "\",");
//         System.out.println("  \"executionErrors\": \"" + escapeJson(result.executionErrors) + "\"");
//         System.out.println("}");
//     }
    
//     /**
//      * Output error as JSON
//      */
//     private static void outputErrorAsJson(Exception e) {
//         System.out.println("{");
//         System.out.println("  \"success\": false,");
//         System.out.println("  \"error\": \"" + escapeJson(e.getMessage()) + "\",");
//         System.out.println("  \"stackTrace\": \"" + escapeJson(getStackTraceAsString(e)) + "\"");
//         System.out.println("}");
//     }
    
//     /**
//      * Escape special characters for JSON
//      */
//     private static String escapeJson(String str) {
//         if (str == null) return "";
//         return str
//             .replace("\\", "\\\\")
//             .replace("\"", "\\\"")
//             .replace("\n", "\\n")
//             .replace("\r", "\\r")
//             .replace("\t", "\\t");
//     }
    
//     /**
//      * Inner class to hold test results
//      */
//     static class TestResult {
//         String className;
//         String sourceFile;
//         String status = "UNKNOWN";
//         String compilationStatus = "";
//         String compilationErrors = "";
//         String executionErrors = "";
//         String output = "";
//         long executionTime = 0;
//     }
// }