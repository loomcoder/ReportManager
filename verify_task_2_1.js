const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:3025';
let token = '';

async function login() {
    console.log('Logging in...');
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email: 'admin@example.com',
            password: 'P@ssw0rd'
        });
        token = response.data.token;
        console.log('Login successful');
    } catch (error) {
        console.error('Login failed:', error.message);
        process.exit(1);
    }
}

async function testDataSourceSchemaGeneration() {
    console.log('Testing Data Source Schema Generation...');
    
    const dataSourceName = `TestDS_${Date.now()}`;
    const form = new FormData();
    form.append('name', dataSourceName);
    form.append('type', 'csv');
    form.append('connectionType', 'upload');
    
    // Create a dummy CSV file
    const csvPath = path.join(__dirname, 'test.csv');
    fs.writeFileSync(csvPath, 'id,name,value\n1,test,100');
    form.append('file', fs.createReadStream(csvPath));

    try {
        const response = await axios.post(`${API_URL}/data-sources`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        
        const dsId = response.data.id;
        console.log(`Data source created with ID: ${dsId}`);

        // Check if schema file exists
        const schemaFilePath = path.resolve(__dirname, 'backend/schema/cubes', `${dataSourceName}.js`);
        if (fs.existsSync(schemaFilePath)) {
            console.log(`✅ Success: Schema file generated at ${schemaFilePath}`);
            const content = fs.readFileSync(schemaFilePath, 'utf8');
            console.log('Schema Content Preview:');
            console.log(content);
        } else {
            console.log(`❌ Failure: Schema file NOT generated at ${schemaFilePath}`);
        }

        // Cleanup
        console.log('Cleaning up...');
        await axios.delete(`${API_URL}/data-sources/${dsId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!fs.existsSync(schemaFilePath)) {
            console.log('✅ Success: Schema file deleted');
        } else {
            console.log('❌ Failure: Schema file still exists after deletion');
        }
        
        fs.unlinkSync(csvPath);
        
    } catch (error) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
    }
}

async function runTests() {
    await login();
    await testDataSourceSchemaGeneration();
}

runTests();
