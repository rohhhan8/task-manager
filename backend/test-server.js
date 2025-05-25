// Simple test script to check if the server is working
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testServer() {
  try {
    console.log('Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    console.log('\nTesting user registration...');
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
      console.log('✅ Registration successful:', registerResponse.data);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already')) {
        console.log('ℹ️ User already exists, that\'s okay');
      } else {
        throw error;
      }
    }

    console.log('\nTesting user login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      loginInput: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data);

    console.log('\n🎉 All tests passed! Server is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Make sure your server is running on port 5000 and MongoDB is connected.');
  }
}

testServer();
