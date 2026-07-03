const { PrismaClient } = require('@prisma/client');
const emailService = require('../src/notifications/email.service');
const emailQueue = require('../src/jobs/emailQueue');
const chatService = require('../src/chat/chat.service');

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('--- Starting Notification & Email Module Integration Tests ---');
  let exitCode = 0;
  let ownerToken = '';
  let tenantToken = '';
  let ownerId = '';
  let tenantId = '';
  let listingId = '';
  let requestId = '';
  let chatId = '';

  const cleanupUser = async (email) => {
    const prisma = new PrismaClient();
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.message.deleteMany({ where: { OR: [{ senderId: user.id }, { chat: { OR: [{ ownerId: user.id }, { tenantId: user.id }] } }] } });
        await prisma.chat.deleteMany({ where: { OR: [{ ownerId: user.id }, { tenantId: user.id }] } });
        await prisma.notification.deleteMany({ where: { userId: user.id } });
        await prisma.interestRequest.deleteMany({ where: { OR: [{ tenantId: user.id }, { ownerId: user.id }] } });
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
      await prisma.emailLog.deleteMany({ where: { recipientEmail: email } });
    } catch (e) {
      console.error(`Cleanup failed for ${email}:`, e.message);
    } finally {
      await prisma.$disconnect();
    }
  };

  try {
    const prisma = new PrismaClient();
    console.log('0. Cleaning up old test data...');
    await cleanupUser('test_notif_owner@test.com');
    await cleanupUser('test_notif_tenant@test.com');
    await prisma.emailLog.deleteMany({ where: { recipientEmail: 'fail_retry@test.com' } });

    // 1. Setup Accounts
    console.log('\n1. Creating Owner and Tenant test accounts...');
    const regOwnerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Notif Owner', email: 'test_notif_owner@test.com', password: 'password123', role: 'OWNER', phone: '9876543210' })
    });
    if (!regOwnerRes.ok) throw new Error(`Owner register failed: ${await regOwnerRes.text()}`);

    const ownerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_notif_owner@test.com', password: 'password123' })
    });
    const ownerLoginData = await ownerLoginRes.json();
    ownerToken = ownerLoginData.accessToken;
    ownerId = ownerLoginData.user.id;

    const regTenantRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Notif Tenant', email: 'test_notif_tenant@test.com', password: 'password123', role: 'TENANT', phone: '9123456789' })
    });
    if (!regTenantRes.ok) throw new Error(`Tenant register failed: ${await regTenantRes.text()}`);

    const tenantLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_notif_tenant@test.com', password: 'password123' })
    });
    const tenantLoginData = await tenantLoginRes.json();
    tenantToken = tenantLoginData.accessToken;
    tenantId = tenantLoginData.user.id;
    console.log('✓ Accounts ready');

    // Setup tenant profile to ensure AI compatibility score > 80
    await fetch(`${BASE_URL}/tenant/preferences`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ minBudget: 20000, maxBudget: 50000, preferredLocation: 'Bandra, Mumbai', moveInDate: '2026-08-01' })
    });

    // 2. Create Listing as Owner
    console.log('\n2. Creating test listing...');
    const createRes = await fetch(`${BASE_URL}/owner/listings`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Notif Apartment in Bandra',
        description: 'Modern room overlooking sea.',
        location: 'Bandra, Mumbai',
        rent: 35000,
        availableFrom: '2026-08-01',
        roomType: 'Private',
        furnishingStatus: 'Furnished'
      })
    });
    const createData = await createRes.json();
    if (!createRes.ok) throw new Error(`Create listing failed: ${JSON.stringify(createData)}`);
    listingId = createData.listing.id;
    console.log('✓ Listing created');

    // 3. Trigger 1: New Interest Received Notification
    console.log('\n3. Testing Trigger 1: New Interest Received Notification...');
    const sendRes = await fetch(`${BASE_URL}/interests/${listingId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' }
    });
    const sendData = await sendRes.json();
    if (!sendRes.ok) throw new Error(`Send interest failed: ${JSON.stringify(sendData)}`);
    requestId = sendData.request.id;

    const ownerNotifRes1 = await fetch(`${BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const ownerNotifData1 = await ownerNotifRes1.json();
    if (ownerNotifRes1.status === 200 && ownerNotifData1.notifications.length >= 1) {
      const n = ownerNotifData1.notifications[0];
      if (n.type !== 'INTEREST' || n.isRead !== false) {
        throw new Error(`Unexpected notification properties: ${JSON.stringify(n)}`);
      }
      console.log(`✓ Owner received in-app notification: "${n.title}" (${n.message})`);
    } else {
      throw new Error(`Owner notification check failed: ${JSON.stringify(ownerNotifData1)}`);
    }

    // 4. Trigger 2: Request Accepted Notification & Tenant Email Trigger
    console.log('\n4. Testing Trigger 2: Request Accepted Notification & Tenant Email Trigger...');
    const acceptRes = await fetch(`${BASE_URL}/interests/${requestId}/accept`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    if (!acceptRes.ok) throw new Error(`Accept interest failed: ${await acceptRes.text()}`);

    const tenantNotifRes1 = await fetch(`${BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    const tenantNotifData1 = await tenantNotifRes1.json();
    if (tenantNotifRes1.status === 200 && tenantNotifData1.notifications.length >= 1) {
      const n = tenantNotifData1.notifications[0];
      if (n.type !== 'ACCEPTED') {
        throw new Error(`Expected type ACCEPTED, got: ${n.type}`);
      }
      console.log(`✓ Tenant received in-app notification: "${n.title}"`);
    } else {
      throw new Error(`Tenant notification check failed: ${JSON.stringify(tenantNotifData1)}`);
    }

    // Check email log for tenant
    const tenantEmailLog = await prisma.emailLog.findFirst({
      where: { recipientEmail: 'test_notif_tenant@test.com', subject: 'Interest Request ACCEPTED' }
    });
    if (tenantEmailLog && tenantEmailLog.status === 'SENT') {
      console.log('✓ Verified: Email triggered and logged in EmailLog table for Tenant acceptance');
    } else {
      throw new Error('EmailLog entry not found or not SENT for tenant acceptance');
    }

    // 5. Trigger 3: High compatibility (>80) Owner Email Trigger
    console.log('\n5. Testing Trigger 3: High Compatibility (>80) Owner Email Trigger...');
    const aiRes = await fetch(`${BASE_URL}/ai/compatibility/${listingId}`, {
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    const aiData = await aiRes.json();
    console.log(`  Generated AI Score: ${aiData.compatibility?.score || aiData.score}%`);

    const ownerEmailLog = await prisma.emailLog.findFirst({
      where: { recipientEmail: 'test_notif_owner@test.com', subject: 'High Compatibility Match Found!' }
    });
    if (ownerEmailLog && ownerEmailLog.status === 'SENT') {
      console.log('✓ Verified: Email triggered and logged in EmailLog table for Owner on High Compatibility (>80)');
    } else {
      throw new Error('EmailLog entry not found for high compatibility match');
    }

    // 6. Trigger 4: New Chat Message Notification
    console.log('\n6. Testing Trigger 4: New Chat Message Notification...');
    const chatRes = await fetch(`${BASE_URL}/chats`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, tenantId, ownerId })
    });
    const chatData = await chatRes.json();
    chatId = chatData.chat.id;

    await chatService.saveMessage(tenantId, { chatId, message: 'Hello Owner! Let us discuss the lease.' });
    const ownerNotifRes2 = await fetch(`${BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const ownerNotifData2 = await ownerNotifRes2.json();
    const chatNotif = ownerNotifData2.notifications.find(n => n.type === 'CHAT');
    if (chatNotif) {
      console.log(`✓ Owner received in-app CHAT notification: "${chatNotif.message}"`);
    } else {
      throw new Error('Chat notification not found for owner');
    }

    // 7. Trigger 5: Listing Filled Notification
    console.log('\n7. Testing Trigger 5: Listing Filled Notification...');
    const fillRes = await fetch(`${BASE_URL}/owner/listings/${listingId}/fill`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    if (!fillRes.ok) throw new Error(`Mark filled failed: ${await fillRes.text()}`);

    const tenantNotifRes2 = await fetch(`${BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    const tenantNotifData2 = await tenantNotifRes2.json();
    const fillNotif = tenantNotifData2.notifications.find(n => n.type === 'LISTING' && n.title === 'Listing Filled');
    if (fillNotif) {
      console.log(`✓ Tenant received in-app LISTING FILLED notification: "${fillNotif.message}"`);
    } else {
      throw new Error('Listing filled notification not found for tenant');
    }

    // 8. Test Notification Feed & Mark-as-Read REST Endpoints
    console.log('\n8. Testing Notification Feed & Mark-as-Read REST Endpoints...');
    const targetNotifId = tenantNotifData2.notifications[0].id;
    const readSingleRes = await fetch(`${BASE_URL}/notifications/${targetNotifId}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    if (!readSingleRes.ok) throw new Error(`Mark single read failed: ${await readSingleRes.text()}`);
    console.log('✓ Marked single notification as read');

    const readAllRes = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    if (!readAllRes.ok) throw new Error(`Mark all read failed: ${await readAllRes.text()}`);

    const verifyReadRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    const verifyReadData = await verifyReadRes.json();
    const unreadCount = verifyReadData.notifications.filter(n => n.isRead === false).length;
    if (unreadCount === 0) {
      console.log('✓ Verified: All notifications marked as read (unreadCount: 0)');
    } else {
      throw new Error(`Expected 0 unread notifications, got ${unreadCount}`);
    }

    // 9. Test Email Retry Mechanism (jobs/)
    console.log('\n9. Testing Email Retry Mechanism (jobs/emailQueue.js)...');
    const failSendRes = await emailService.sendEmail({
      to: 'fail_retry@test.com',
      subject: 'Retry Test Subject',
      html: '<p>Retry test content</p>',
      forceFail: true
    });
    if (failSendRes.success === false && failSendRes.status === 'FAILED') {
      console.log(`✓ Simulated email failure logged to EmailLog (Log ID: ${failSendRes.logId})`);
    } else {
      throw new Error(`Expected simulated email failure, got: ${JSON.stringify(failSendRes)}`);
    }

    const qLenBefore = emailQueue.getQueue().length;
    if (qLenBefore >= 1) {
      console.log(`✓ Job added to emailQueue (Queue length: ${qLenBefore})`);
    } else {
      throw new Error('Failed email was not added to emailQueue');
    }

    console.log('  Executing emailQueue.processQueue() to simulate cron execution...');
    await emailQueue.processQueue();

    const retriedLog = await prisma.emailLog.findUnique({ where: { id: failSendRes.logId } });
    const qLenAfter = emailQueue.getQueue().length;
    if (retriedLog.status === 'SENT' && qLenAfter === 0) {
      console.log('✓ Verified: Email retry worker successfully sent failed email and removed job from queue!');
    } else {
      throw new Error(`Retry verification failed. Status: ${retriedLog.status}, Queue length: ${qLenAfter}`);
    }

    await prisma.$disconnect();
  } catch (err) {
    console.error('\n✗ Test failed with error:', err.message);
    exitCode = 1;
  } finally {
    console.log('\nCleaning up test accounts...');
    await cleanupUser('test_notif_owner@test.com');
    await cleanupUser('test_notif_tenant@test.com');
    const prisma = new PrismaClient();
    await prisma.emailLog.deleteMany({ where: { recipientEmail: 'fail_retry@test.com' } });
    await prisma.$disconnect();
    console.log('--- Notification & Email Module Integration Tests Finished ---\n');
    process.exit(exitCode);
  }
}

runTests();
