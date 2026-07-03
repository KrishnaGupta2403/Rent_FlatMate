const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('--- Starting Owner & Listing Module Integration Tests ---');
  let exitCode = 0;

  let ownerToken = '';
  let tenantToken = '';
  let listingId = '';
  let secondListingId = '';

  const cleanupUser = async (email) => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.listingImage.deleteMany({ where: { listing: { ownerId: user.id } } });
        await prisma.listingAmenity.deleteMany({ where: { listing: { ownerId: user.id } } });
        await prisma.listing.deleteMany({ where: { ownerId: user.id } });
        await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
        await prisma.tenantProfile.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
      }
    } catch (e) {
      console.error(`Cleanup failed for ${email}:`, e.message);
    } finally {
      await prisma.$disconnect();
    }
  };

  try {
    // 0. Clean up any leftover test data
    console.log('Cleaning up old test users and listings...');
    await cleanupUser('test_owner_module@test.com');
    await cleanupUser('test_tenant_module@test.com');

    // 1. Register & Login Owner
    console.log('\n1. Setting up Owner & Tenant test accounts...');
    await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Listing Owner',
        email: 'test_owner_module@test.com',
        password: 'password123',
        role: 'OWNER',
        phone: '9988776655'
      })
    });

    const loginOwnerRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_owner_module@test.com', password: 'password123' })
    });
    const ownerLoginData = await loginOwnerRes.json();
    ownerToken = ownerLoginData.accessToken;
    console.log('✓ Owner account created and logged in');

    // Register & Login Tenant
    await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Listing Tenant',
        email: 'test_tenant_module@test.com',
        password: 'password123',
        role: 'TENANT'
      })
    });
    const loginTenantRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_tenant_module@test.com', password: 'password123' })
    });
    const tenantLoginData = await loginTenantRes.json();
    if (!loginTenantRes.ok || !tenantLoginData.accessToken) {
      console.error('Tenant login failed:', tenantLoginData);
      throw new Error(`Tenant login failed: ${JSON.stringify(tenantLoginData)}`);
    }
    tenantToken = tenantLoginData.accessToken;
    console.log('✓ Tenant account created and logged in');

    // 2. Test Role Guard for Create Listing
    console.log('\n2. Testing Role Guard on Create Listing...');
    const forbiddenCreateRes = await fetch(`${BASE_URL}/owner/listings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tenantToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Tenant Attempt Listing',
        location: 'Mumbai',
        rent: 20000,
        availableFrom: '2026-08-01',
        roomType: 'Single',
        furnishingStatus: 'Furnished'
      })
    });
    if (forbiddenCreateRes.status === 403) {
      console.log('✓ Tenant blocked from creating listing with 403 Forbidden');
    } else {
      throw new Error(`Tenant should have been blocked with 403, got ${forbiddenCreateRes.status}`);
    }

    // 3. Create Listing as Owner
    console.log('\n3. Testing Create Listing as Owner...');
    const createRes = await fetch(`${BASE_URL}/owner/listings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ownerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Beautiful 2BHK in Bandra',
        description: 'Spacious apartment with sea breeze and modern kitchen.',
        location: 'Bandra West, Mumbai',
        rent: 45000,
        securityDeposit: 90000,
        availableFrom: '2026-08-01',
        roomType: 'Private',
        furnishingStatus: 'Furnished',
        occupancy: 2
      })
    });
    const createData = await createRes.json();
    if (createRes.status === 201 && createData.listing.id) {
      listingId = createData.listing.id;
      console.log(`✓ Listing created successfully (ID: ${listingId})`);
    } else {
      throw new Error(`Failed to create listing: ${JSON.stringify(createData)}`);
    }

    // 4. Test View My Listings (Owner Dashboard)
    console.log('\n4. Testing View My Listings (Owner Dashboard)...');
    const myListingRes = await fetch(`${BASE_URL}/owner/listings`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const myListingData = await myListingRes.json();
    if (myListingRes.status === 200 && myListingData.listings.some(l => l.id === listingId)) {
      console.log('✓ Created listing appears in Owner Dashboard');
    } else {
      throw new Error(`Listing not found in owner dashboard: ${JSON.stringify(myListingData)}`);
    }

    // 5. Test Photo Upload
    console.log('\n5. Testing Photo Upload...');
    // Create a dummy image buffer for upload testing
    const dummyImgPath = path.join(__dirname, 'dummy_test_photo.png');
    fs.writeFileSync(dummyImgPath, Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082', 'hex'));
    
    const imgBuffer = fs.readFileSync(dummyImgPath);
    const blob = new Blob([imgBuffer], { type: 'image/png' });
    const formData = new FormData();
    formData.append('photos', blob, 'test-photo.png');

    const uploadRes = await fetch(`${BASE_URL}/owner/listings/${listingId}/photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ownerToken}`
        // Note: Do NOT set Content-Type header when using FormData, fetch sets boundary automatically
      },
      body: formData
    });
    const uploadData = await uploadRes.json();
    if (fs.existsSync(dummyImgPath)) fs.unlinkSync(dummyImgPath); // cleanup local dummy

    if (uploadRes.status === 200 && uploadData.images && uploadData.images.length > 0) {
      console.log(`✓ Photo uploaded and linked to listing successfully (URL: ${uploadData.images[0].imageUrl})`);
    } else {
      throw new Error(`Photo upload failed: ${JSON.stringify(uploadData)}`);
    }

    // 6. Test Public Listing Fetch (Active State)
    console.log('\n6. Testing Public Listing Search (Active State)...');
    const publicSearchRes1 = await fetch(`${BASE_URL}/listings?location=Bandra`);
    const publicSearchData1 = await publicSearchRes1.json();
    if (publicSearchRes1.status === 200 && publicSearchData1.listings.some(l => l.id === listingId)) {
      console.log('✓ Active listing is visible in public search results');
    } else {
      throw new Error(`Listing not found in public search: ${JSON.stringify(publicSearchData1)}`);
    }

    // 7. Test Edit Listing
    console.log('\n7. Testing Edit Listing...');
    const editRes = await fetch(`${BASE_URL}/owner/listings/${listingId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${ownerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Luxury 2BHK in Bandra West',
        rent: 48000
      })
    });
    const editData = await editRes.json();
    if (editRes.status === 200 && editData.listing.rent === 48000 && editData.listing.title === 'Luxury 2BHK in Bandra West') {
      console.log('✓ Listing updated successfully (rent changed to 48000)');
    } else {
      throw new Error(`Failed to edit listing: ${JSON.stringify(editData)}`);
    }

    // 8. Test Mark as Filled
    console.log('\n8. Testing Mark as Filled Endpoint...');
    const fillRes = await fetch(`${BASE_URL}/owner/listings/${listingId}/fill`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const fillData = await fillRes.json();
    if (fillRes.status === 200 && fillData.listing.status === 'FILLED') {
      console.log('✓ Listing status marked as FILLED');
    } else {
      throw new Error(`Failed to mark listing as filled: ${JSON.stringify(fillData)}`);
    }

    // 9. Confirm listing disappears from Public Listing Fetch
    console.log('\n9. Confirming FILLED listing disappears from Public Listing Fetch...');
    const publicSearchRes2 = await fetch(`${BASE_URL}/listings`);
    const publicSearchData2 = await publicSearchRes2.json();
    if (!publicSearchData2.listings.some(l => l.id === listingId)) {
      console.log('✓ Confirmed: FILLED listing disappeared from public search results');
    } else {
      throw new Error('FILLED listing should NOT appear in public search results');
    }

    // 10. Test Soft Delete
    console.log('\n10. Testing Soft Delete Listing...');
    // Create second listing
    const createRes2 = await fetch(`${BASE_URL}/owner/listings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ownerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Temporary Room for Deletion Test',
        location: 'Colaba, Mumbai',
        rent: 30000,
        availableFrom: '2026-08-01',
        roomType: 'Private',
        furnishingStatus: 'Semi-Furnished'
      })
    });
    const createData2 = await createRes2.json();
    secondListingId = createData2.listing.id;

    // Delete it
    const deleteRes = await fetch(`${BASE_URL}/owner/listings/${secondListingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    if (deleteRes.status === 200) {
      console.log('✓ Soft delete request returned 200 OK');
    } else {
      throw new Error(`Soft delete failed with code ${deleteRes.status}`);
    }

    // Verify it disappeared from Owner Dashboard and Public Search
    const dashResAfterDel = await fetch(`${BASE_URL}/owner/listings`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const dashDataAfterDel = await dashResAfterDel.json();
    if (!dashDataAfterDel.listings.some(l => l.id === secondListingId)) {
      console.log('✓ Confirmed: Soft-deleted listing removed from active Owner Dashboard');
    } else {
      throw new Error('Soft-deleted listing should NOT appear in active dashboard');
    }

    const pubResAfterDel = await fetch(`${BASE_URL}/listings`);
    const pubDataAfterDel = await pubResAfterDel.json();
    if (!pubDataAfterDel.listings.some(l => l.id === secondListingId)) {
      console.log('✓ Confirmed: Soft-deleted listing removed from public search results');
    } else {
      throw new Error('Soft-deleted listing should NOT appear in public search');
    }

  } catch (err) {
    console.error('\n✗ Test failed with error:', err.message);
    exitCode = 1;
  } finally {
    console.log('\nCleaning up test accounts and listings...');
    await cleanupUser('test_owner_module@test.com');
    await cleanupUser('test_tenant_module@test.com');
    console.log('--- Owner & Listing Module Integration Tests Finished ---\n');
    process.exit(exitCode);
  }
}

runTests();
