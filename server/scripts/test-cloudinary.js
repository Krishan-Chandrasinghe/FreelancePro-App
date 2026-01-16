const fs = require('fs');
const path = require('path');

async function testCloudinary() {
    const API_URL = 'http://localhost:5001/api';
    const imagePath = 'C:/Users/Dragon_Heart/.gemini/antigravity/brain/78ffc0bc-a25f-4ce8-befa-2b4341a805be/test_image_1768535511166.png'; // Updated path
    
    // Helper to log steps
    const log = (msg) => console.log(`[TEST] ${msg}`);

    try {
        // 1. Register User
        log('Registering user...');
        const uniqueSuffix = Date.now();
        const userPayload = {
            name: `Test User ${uniqueSuffix}`,
            email: `test${uniqueSuffix}@example.com`,
            password: 'password123'
        };

        let res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userPayload)
        });

        if (!res.ok) throw new Error(`Registration failed: ${res.statusText}`);
        let data = await res.json();
        const token = data.token;
        log(`User registered. Token: ${token.substring(0, 10)}...`);

        // 2. Upload Profile Picture
        log('Uploading profile picture...');
        const fileContent = fs.readFileSync(imagePath);
        const file = new Blob([fileContent], { type: 'image/png' });
        
        const formData = new FormData();
        formData.append('profilePicture', file, 'test_profile.png');
        formData.append('name', 'Updated Name'); // Required by logic? No, but harmless.

        res = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (!res.ok) throw new Error(`Profile upload failed: ${res.statusText}`);
        data = await res.json();
        
        log(`Profile updated. Picture URL: ${data.profilePicture}`);
        if (!data.profilePicture.includes('cloudinary')) throw new Error('Profile picture URL is not from Cloudinary');

        // 3. Create Invoice with File
        log('Creating invoice with file...');
        const invoiceFormData = new FormData();
        // invoiceFormData.append('client', data._id); // REMOVED duplicate
        // Actually, client field expects an ObjectId. Reference to Client model.
        // I might need to create a client first or just use user ID if validation is loose (it's ObjectId ref).
        // Let's try to create a client first if needed, but 'client' usually refers to Client model.
        // Wait, User model doesn't match Client.
        // I will try to fetch a client first or create one if there is an endpoint.
        // Checking routes... I usually don't have time to implement client creation test logic if not easy.
        // Let's assume there's a client or I can create one.
        // clientController exists? Yes.
        // Let's create a client.
        
        const clientPayload = {
            name: "Test Client",
            email: `client${uniqueSuffix}@test.com`,
            phone: "1234567890",
            companyName: "Test Company",
            role: "Client" // guessing fields
        };

        // But wait, create client route? 
        // I'll check if I can just pass a dummy ObjectId if validation is not strict (mongoose check ref strictly?)
        // Mongoose checks if it's a valid ObjectId string. It doesn't check existence unless populate is called or there is a specific validator.
        // "required: true" and ref. It will check type.
        const dummyObjectId = "507f1f77bcf86cd799439011";
        
        invoiceFormData.append('client', dummyObjectId);
        invoiceFormData.append('invoiceNumber', `INV-${uniqueSuffix}`);
        invoiceFormData.append('dueDate', new Date().toISOString());
        invoiceFormData.append('subtotal', '100');
        invoiceFormData.append('totalAmount', '100');
        invoiceFormData.append('items', JSON.stringify([{ description: 'Test Item', quantity: 1, rate: 100, amount: 100 }]));
        if (data._id) {
             // Adding file
            invoiceFormData.append('file', file, 'invoice.png');
        }
        
        res = await fetch(`${API_URL}/invoices`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: invoiceFormData
        });

        if (!res.ok) {
             const err = await res.text();
             throw new Error(`Invoice creation failed: ${res.status} ${err}`);
        }
        data = await res.json();
        log(`Invoice created. File URL: ${data.fileUrl}`);
        if (!data.fileUrl.includes('cloudinary')) throw new Error('Invoice file URL is not from Cloudinary');
        
        const invoiceId = data._id;

        // 4. Delete Invoice
        log('Deleting invoice...');
        res = await fetch(`${API_URL}/invoices/${invoiceId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error(`Invoice deletion failed: ${res.statusText}`);
        log('Invoice deleted successfully.');

        log('TEST PASSED!');

    } catch (e) {
        console.error('TEST FAILED:', e.message);
        if (e.cause) console.error('CAUSE:', e.cause);
        console.error(e.stack);
        process.exit(1);
    }
}

testCloudinary();
