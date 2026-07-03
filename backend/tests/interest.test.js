const { PrismaClient } = require('@prisma/client');

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('--- Starting Interest Request Module Integration Tests ---');
  let exitCode = 0;
  let ownerToken = '';
  let tenantToken = '';
  let listing1Id = '';
  let listing2Id = '';
  let request1Id = '';

  const cleanupUser = async (email) => {
    const prisma = new PrismaClient();
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.interestRequest.deleteMany({ where: { tenantId: user.id } });
        await prisma.interestRequest.deleteMany({ where: { ownerId: user.id } });
        await prisma.compatibilityScore.deleteMany({ where: { tenantId: user.id } });
        await prisma.compatibilityScore.deleteMany({ where: { listing: { ownerId: user.id } } });
        await prisma.savedListing.deleteMany({ where: { userId: user.id } });
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
    // 0. Clean up old test data
    console.log('Cleaning up old test data...');
    await cleanupUser('test_interest_owner@test.com');
    await cleanupUser('test_interest_tenant@test.com');

    // 1. Setup Accounts
    console.log('\n1. Creating Owner and Tenant test accounts...');
    const regOwnerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Interest Owner', email: 'test_interest_owner@test.com', password: 'password123', role: 'OWNER', phone: '9876543210' })
    });
    if (!regOwnerRes.ok) throw new Error(`Owner register failed: ${await regOwnerRes.text()}`);

    const ownerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_interest_owner@test.com', password: 'password123' })
    });
    const ownerLoginData = await ownerLoginRes.json();
    ownerToken = ownerLoginData.accessToken;

    const regTenantRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Interest Tenant', email: 'test_interest_tenant@test.com', password: 'password123', role: 'TENANT', phone: '9123456789' })
    });
    if (!regTenantRes.ok) throw new Error(`Tenant register failed: ${await regTenantRes.text()}`);

    const tenantLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_interest_tenant@test.com', password: 'password123' })
    });
    const tenantLoginData = await tenantLoginRes.json();
    tenantToken = tenantLoginData.accessToken;
    console.log('✓ Accounts ready');

    // 2. Create Two Listings as Owner
    console.log('\n2. Creating test listings...');
    const createRes1 = await fetch(`${BASE_URL}/owner/listings`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Penthouse in Bandra',
        description: 'Luxury penthouse with private balcony.',
        location: 'Bandra West, Mumbai',
        rent: 50000,
        availableFrom: '2026-08-01',
        roomType: 'Private',
        furnishingStatus: 'Furnished'
      })
    });
    const createData1 = await createRes1.json();
    if (!createRes1.ok) throw new Error(`Create listing 1 failed: ${JSON.stringify(createData1)}`);
    listing1Id = createData1.listing.id;

    const createRes2 = await fetch(`${BASE_URL}/owner/listings`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Cozy Room in Koramangala',
        description: 'Nice room near tech park.',
        location: 'Koramangala, Bangalore',
        rent: 20000,
        availableFrom: '2026-08-15',
        roomType: 'Private',
        furnishingStatus: 'Semi-Furnished'
      })
    });
    const createData2 = await createRes2.json();
    if (!createRes2.ok) throw new Error(`Create listing 2 failed: ${JSON.stringify(createData2)}`);
    listing2Id = createData2.listing.id;
    console.log('✓ Listings created');

    // 3. Step A: Tenant sends interest on Listing 1
    console.log('\n3. Testing Tenant Send Interest...');
    const sendRes1 = await fetch(`${BASE_URL}/interests/${listing1Id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' }
    });
    const sendData1 = await sendRes1.json();
    if (sendRes1.status === 201 && sendData1.request && sendData1.request.status === 'PENDING') {
      request1Id = sendData1.request.id;
      console.log(`✓ Interest request sent successfully! (ID: ${request1Id}, Status: PENDING)`);
    } else {
      throw new Error(`Send interest failed: ${JSON.stringify(sendData1)}`);
    }

    // 4. Step B: Duplicate PENDING guard check
    console.log('\n4. Testing Duplicate PENDING Guard...');
    const dupRes1 = await fetch(`${BASE_URL}/interests/${listing1Id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' }
    });
    const dupData1 = await dupRes1.json();
    if (dupRes1.status === 409 || dupRes1.status === 400) {
      console.log(`✓ Confirmed: Second interest attempt while PENDING was blocked! (${dupData1.error})`);
    } else {
      throw new Error(`Expected duplicate PENDING attempt to be blocked with 409/400, got status ${dupRes1.status}: ${JSON.stringify(dupData1)}`);
    }

    // 5. Step C: Owner views pending requests
    console.log('\n5. Testing Owner View Requests...');
    const ownerViewRes = await fetch(`${BASE_URL}/interests/owner?status=PENDING`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const ownerViewData = await ownerViewRes.json();
    if (ownerViewRes.status === 200 && ownerViewData.requests && ownerViewData.requests.length >= 1) {
      const found = ownerViewData.requests.find(r => r.id === request1Id);
      if (!found) throw new Error('Created request not found in owner requests list');
      console.log(`✓ Owner successfully retrieved pending requests (Found: "${found.listing.title}" from tenant "${found.tenant.fullName}")`);
    } else {
      throw new Error(`Owner view requests failed: ${JSON.stringify(ownerViewData)}`);
    }

    // 6. Step D: Owner accepts request
    console.log('\n6. Testing Owner Accept Request...');
    const acceptRes = await fetch(`${BASE_URL}/interests/${request1Id}/accept`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const acceptData = await acceptRes.json();
    if (acceptRes.status === 200 && acceptData.request && acceptData.request.status === 'ACCEPTED') {
      console.log(`✓ Interest request accepted successfully! (New Status: ACCEPTED)`);
    } else {
      throw new Error(`Accept request failed: ${JSON.stringify(acceptData)}`);
    }

    // 7. Step E: Duplicate ACCEPTED guard check
    console.log('\n7. Testing Duplicate ACCEPTED Guard...');
    const dupRes2 = await fetch(`${BASE_URL}/interests/${listing1Id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' }
    });
    const dupData2 = await dupRes2.json();
    if (dupRes2.status === 409 || dupRes2.status === 400) {
      console.log(`✓ Confirmed: Interest attempt on already ACCEPTED listing was blocked! (${dupData2.error})`);
    } else {
      throw new Error(`Expected duplicate ACCEPTED attempt to be blocked with 409/400, got status ${dupRes2.status}: ${JSON.stringify(dupData2)}`);
    }

    // 8. Step F: Test Tenant View Requests, Cancel Request, and Owner Reject Request on Listing 2
    console.log('\n8. Testing Tenant View Requests, Cancel, and Reject Lifecycle on Listing 2...');
    const sendRes2 = await fetch(`${BASE_URL}/interests/${listing2Id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' }
    });
    const sendData2 = await sendRes2.json();
    if (!sendRes2.ok) throw new Error(`Send interest 2 failed: ${JSON.stringify(sendData2)}`);
    const request2Id = sendData2.request.id;

    // Tenant views their sent requests
    const tenantViewRes = await fetch(`${BASE_URL}/interests/tenant`, {
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    const tenantViewData = await tenantViewRes.json();
    if (tenantViewRes.status === 200 && tenantViewData.requests.length >= 2) {
      console.log(`✓ Tenant successfully retrieved their sent requests (${tenantViewData.requests.length} total requests)`);
    } else {
      throw new Error(`Tenant view requests failed: ${JSON.stringify(tenantViewData)}`);
    }

    // Tenant cancels request 2
    const cancelRes = await fetch(`${BASE_URL}/interests/${request2Id}/cancel`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    const cancelData = await cancelRes.json();
    if (cancelRes.status === 200 && cancelData.request.status === 'CANCELLED') {
      console.log(`✓ Tenant cancelled interest request successfully! (Status: CANCELLED)`);
    } else {
      throw new Error(`Cancel request failed: ${JSON.stringify(cancelData)}`);
    }

    // Tenant can send interest again since previous was CANCELLED
    const sendRes3 = await fetch(`${BASE_URL}/interests/${listing2Id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' }
    });
    const sendData3 = await sendRes3.json();
    if (!sendRes3.ok) throw new Error(`Re-sending interest after cancel failed: ${JSON.stringify(sendData3)}`);
    const request3Id = sendData3.request.id;
    console.log(`✓ Re-sent interest request after previous cancellation`);

    // Owner rejects request 3
    const rejectRes = await fetch(`${BASE_URL}/interests/${request3Id}/reject`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const rejectData = await rejectRes.json();
    if (rejectRes.status === 200 && rejectData.request.status === 'REJECTED') {
      console.log(`✓ Owner rejected interest request successfully! (Status: REJECTED)`);
    } else {
      throw new Error(`Reject request failed: ${JSON.stringify(rejectData)}`);
    }

  } catch (err) {
    console.error('\n✗ Test failed with error:', err.message);
    exitCode = 1;
  } finally {
    console.log('\nCleaning up test accounts...');
    await cleanupUser('test_interest_owner@test.com');
    await cleanupUser('test_interest_tenant@test.com');
    console.log('--- Interest Request Module Integration Tests Finished ---\n');
    process.exit(exitCode);
  }
}

runTests();
