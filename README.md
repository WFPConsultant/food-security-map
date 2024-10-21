# Project Setup and Testing Guide

## Run the Project

To get started with the project, follow these steps:

1. Clone the repository and run:
   ```bash
   git clone https://github.com/WFPConsultant/food-security-map.git

2. 
   ```bash
   bash npm install

3. ```bash
   npm start

# Cypress Setup for End-to-End (E2E) Testing

To set up Cypress for E2E testing, follow these steps:

1. Clone the project and navigate to the root directory (if not done already):

   ```bash
   cd food-security-map
2. Install cypress (although this is already done in this project. so not mandatoy)
   ```bash
   npm install cypress --save-dev
3. Now check if cypress is working perfectly.
   ```bash  
   npx cypress open

# Running Tests with Cypress
To run your test cases, follow these steps: 
Use the localhost URL (e.g., http://localhost:3000/) inside the cypress/e2e/spec.cy.js file to test your application. (it's done already)
1. Open a terminal in the root directory and start the project:   
   ```bash
   npm start
2. Open another terminal in the root directory and open Cypress:
   ```bash
   npx cypress open

Now, with the test cases written in cypress/e2e/spec.cy.js, we can perform end-to-end testing. When Cypress is launched in the selected browser, the status of the tests will be displayed. A few test cases have already been written in this project.



