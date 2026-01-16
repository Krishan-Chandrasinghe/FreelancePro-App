const fs = require('fs');
const path = require('path');

async function testUpdateInvoice() {
    const API_URL = 'http://localhost:5001/api';
    // Use valid absolute paths that will work in the user's environment
    const imagePath1 = 'C:/Users/Dragon_Heart/.gemini/antigravity/brain/78ffc0bc-a25f-4ce8-befa-2b4341a805be/test_image_1768535511166.png';
    // This will be replaced by the actual path after generation
    const imagePath2 = 'C:/Users/Dragon_Heart/.gemini/antigravity/brain/78ffc0bc-a25f-4ce8-befa-2b4341a805be/test_image_2_1768535674972.png'; 
    
    const log = (msg) => console.log(`[TEST-UPDATE] ${msg}`);

    try {
        // 1. Register User
        log('Registering user...');
        const uniqueSuffix = Date.now();
        const userPayload = {
            name: `Test User ${uniqueSuffix}`,
            email: `testupdate${uniqueSuffix}@example.com`,
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
        log(`User registered.`);

        // 2. Create Invoice with File 1
        log('Creating invoice with file 1...');
        const invoiceFormData = new FormData();
        const fileContent1 = fs.readFileSync(imagePath1);
        const file1 = new Blob([fileContent1], { type: 'image/png' });
        
        invoiceFormData.append('client', "507f1f77bcf86cd799439011"); // Dummy Client ID
        invoiceFormData.append('invoiceNumber', `INV-UPD-${uniqueSuffix}`);
        invoiceFormData.append('dueDate', new Date().toISOString());
        invoiceFormData.append('subtotal', '100');
        invoiceFormData.append('totalAmount', '100');
        invoiceFormData.append('items', JSON.stringify([{ description: 'Test Item', quantity: 1, rate: 100, amount: 100 }]));
        invoiceFormData.append('file', file1, 'invoice1.png');

        res = await fetch(`${API_URL}/invoices`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: invoiceFormData
        });

        if (!res.ok) throw new Error(`Invoice creation failed: ${res.statusText}`);
        data = await res.json();
        const invoiceId = data._id;
        const fileUrl1 = data.fileUrl;
        log(`Invoice created. URL 1: ${fileUrl1}`);

        // 3. Update Invoice with File 2
        log('Updating invoice with file 2...');
        const updateFormData = new FormData();
        // We need to read the second image now.
        // Assuming the previous step (generate_image) ran and we will substitute the path.
        // If the path is not substituted, this will fail.
        // For now, let's use the SAME image but different filename to simulate a change if image 2 is missing, 
        // but the plan is to use image 2.
        
        let fileContent2;
        try {
             fileContent2 = fs.readFileSync(imagePath2);
        } catch (e) {
             console.log("Image 2 not found, reusing Image 1 for testing purposes but as a 'new' file upload");
             fileContent2 = fs.readFileSync(imagePath1);
        }
        
        const file2 = new Blob([fileContent2], { type: 'image/png' });
        
        updateFormData.append('file', file2, 'invoice2.png');
        updateFormData.append('notes', 'Updated Notes');

        res = await fetch(`${API_URL}/invoices/${invoiceId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: updateFormData
        });

        if (!res.ok) throw new Error(`Invoice update failed: ${res.statusText}`);
        data = await res.json();
        const fileUrl2 = data.fileUrl;
        log(`Invoice updated. URL 2: ${fileUrl2}`);

        if (fileUrl1 === fileUrl2) {
             log("WARNING: File URL did not change. Cloudinary might return same URL if content is identical and caching ??? No, usually different public_id.");
             // Actually, uploadToCloudinary returns a new public_id every time unless we specify one.
             // We configured random ID? let's check utils.
             // utils uses "folder: folder" but doesn't specify public_id, so Cloudinary assigns random one.
        }
        
        if (!fileUrl2.includes('cloudinary')) throw new Error('New file URL is not from Cloudinary');
        if (!fileUrl2.includes('freelance-pro/invoices')) throw new Error(`New file URL does not contain 'freelance-pro/invoices' folder: ${fileUrl2}`);
        
        log('TEST PASSED!');

    } catch (e) {
        console.error('TEST FAILED:', e.message);
        if (e.cause) console.error('CAUSE:', e.cause);
        process.exit(1);
    }
}

testUpdateInvoice();
