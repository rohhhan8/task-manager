// Test MongoDB Atlas connection
require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB Atlas connection...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Connection string (masked):', process.env.MONGO_URI.replace(/\/\/.*:.*@/, "//***:***@"));
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });
    
    console.log('✅ MongoDB Atlas connection successful!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    console.log('Ready state:', conn.connection.readyState);
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    
    console.log('\n🔄 Testing database write operation...');
    const testDoc = new TestModel({ name: 'Connection Test' });
    await testDoc.save();
    console.log('✅ Write operation successful!');
    
    console.log('\n🔄 Testing database read operation...');
    const docs = await TestModel.find();
    console.log('✅ Read operation successful! Found', docs.length, 'documents');
    
    // Clean up test document
    await TestModel.deleteMany({ name: 'Connection Test' });
    console.log('✅ Cleanup completed');
    
    await mongoose.connection.close();
    console.log('\n🎉 All tests passed! MongoDB Atlas is working correctly.');
    
  } catch (error) {
    console.error('\n❌ MongoDB Atlas connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('\n🔐 Authentication Issues:');
      console.error('1. Check if username and password are correct');
      console.error('2. Verify the user has readWrite permissions on the database');
      console.error('3. Make sure the user is created for the correct database');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.error('\n🌐 Network Issues:');
      console.error('1. Check your internet connection');
      console.error('2. Verify the cluster URL is correct');
      console.error('3. Check if your IP is whitelisted (0.0.0.0/0 for all IPs)');
    }
    
    if (error.message.includes('bad auth')) {
      console.error('\n🔑 Possible Solutions:');
      console.error('1. Go to MongoDB Atlas Dashboard');
      console.error('2. Navigate to Database Access');
      console.error('3. Check if user "rohan_mongo18" exists and has correct permissions');
      console.error('4. Try resetting the password');
      console.error('5. Ensure the user has access to the "taskmanager" database');
    }
    
    process.exit(1);
  }
}

testConnection();
