const { PrismaClient } = require('@prisma/client');
const ioClient = require('socket.io-client');

const BASE_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';

async function runTests() {
  console.log('--- Starting Chat & Socket Module Integration Tests ---');
  let exitCode = 0;
  let ownerToken = '';
  let tenantToken = '';
  let ownerId = '';
  let tenantId = '';
  let listingId = '';
  let requestId = '';
  let chatId = '';
  let ownerSocket = null;
  let tenantSocket = null;

  const cleanupUser = async (email) => {
    const prisma = new PrismaClient();
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.message.deleteMany({ where: { OR: [{ senderId: user.id }, { chat: { OR: [{ ownerId: user.id }, { tenantId: user.id }] } }] } });
        await prisma.chat.deleteMany({ where: { OR: [{ ownerId: user.id }, { tenantId: user.id }] } });
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
    } catch (e) {
      console.error(`Cleanup failed for ${email}:`, e.message);
    } finally {
      await prisma.$disconnect();
    }
  };

  try {
    // 0. Clean up old test data
    console.log('Cleaning up old test data...');
    await cleanupUser('test_chat_owner@test.com');
    await cleanupUser('test_chat_tenant@test.com');

    // 1. Setup Accounts
    console.log('\n1. Creating Owner and Tenant test accounts...');
    const regOwnerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Chat Owner', email: 'test_chat_owner@test.com', password: 'password123', role: 'OWNER', phone: '9876543210' })
    });
    if (!regOwnerRes.ok) throw new Error(`Owner register failed: ${await regOwnerRes.text()}`);

    const ownerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_chat_owner@test.com', password: 'password123' })
    });
    const ownerLoginData = await ownerLoginRes.json();
    ownerToken = ownerLoginData.accessToken;
    ownerId = ownerLoginData.user.id;

    const regTenantRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Chat Tenant', email: 'test_chat_tenant@test.com', password: 'password123', role: 'TENANT', phone: '9123456789' })
    });
    if (!regTenantRes.ok) throw new Error(`Tenant register failed: ${await regTenantRes.text()}`);

    const tenantLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_chat_tenant@test.com', password: 'password123' })
    });
    const tenantLoginData = await tenantLoginRes.json();
    tenantToken = tenantLoginData.accessToken;
    tenantId = tenantLoginData.user.id;
    console.log('✓ Accounts ready');

    // 2. Create Listing as Owner
    console.log('\n2. Creating test listing...');
    const createRes = await fetch(`${BASE_URL}/owner/listings`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Chat Apartment in Powai',
        description: 'Modern room overlooking lake.',
        location: 'Powai, Mumbai',
        rent: 40000,
        availableFrom: '2026-08-01',
        roomType: 'Private',
        furnishingStatus: 'Furnished'
      })
    });
    const createData = await createRes.json();
    if (!createRes.ok) throw new Error(`Create listing failed: ${JSON.stringify(createData)}`);
    listingId = createData.listing.id;
    console.log('✓ Listing created');

    // 3. Step A: Core Business Rule Guard Check (Attempting chat before accepted interest)
    console.log('\n3. Testing Core Business Rule Guard (No chat before accepted interest)...');
    const chatAttempt1 = await fetch(`${BASE_URL}/chats`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, tenantId, ownerId })
    });
    const attemptData1 = await chatAttempt1.json();
    if (chatAttempt1.status === 403) {
      console.log(`✓ Confirmed: Chat creation without accepted interest was blocked! (${attemptData1.error})`);
    } else {
      throw new Error(`Expected 403 Forbidden when creating chat without accepted interest, got status ${chatAttempt1.status}: ${JSON.stringify(attemptData1)}`);
    }

    // 4. Step B: Send and Accept Interest Request
    console.log('\n4. Sending and Accepting Interest Request...');
    const sendRes = await fetch(`${BASE_URL}/interests/${listingId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' }
    });
    const sendData = await sendRes.json();
    if (!sendRes.ok) throw new Error(`Send interest failed: ${JSON.stringify(sendData)}`);
    requestId = sendData.request.id;

    // Check guard again while status is PENDING
    const chatAttempt2 = await fetch(`${BASE_URL}/chats`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, tenantId, ownerId })
    });
    if (chatAttempt2.status !== 403) {
      throw new Error('Chat creation should still be blocked while interest is PENDING!');
    }

    // Owner accepts interest
    const acceptRes = await fetch(`${BASE_URL}/interests/${requestId}/accept`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    if (!acceptRes.ok) throw new Error(`Accept interest failed: ${await acceptRes.text()}`);
    console.log('✓ Interest request ACCEPTED');

    // 5. Step C: Create Chat after Accepted Interest
    console.log('\n5. Creating Chat after Accepted Interest...');
    const chatRes = await fetch(`${BASE_URL}/chats`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, tenantId, ownerId })
    });
    const chatData = await chatRes.json();
    if (chatRes.status === 201 && chatData.chat && chatData.chat.id) {
      chatId = chatData.chat.id;
      console.log(`✓ Chat created successfully! (Chat ID: ${chatId})`);
    } else {
      throw new Error(`Create chat failed: ${JSON.stringify(chatData)}`);
    }

    // 6. Step D: Connect Sockets and Test Real-Time Communication
    console.log('\n6. Testing Socket.IO Connection, Room Join, and Online Status...');
    ownerSocket = ioClient(SOCKET_URL, { auth: { token: ownerToken }, forceNew: true });
    tenantSocket = ioClient(SOCKET_URL, { auth: { token: tenantToken }, forceNew: true });

    await new Promise((resolve, reject) => {
      let count = 0;
      const check = () => { if (++count === 2) resolve(); };
      ownerSocket.on('connect', check);
      tenantSocket.on('connect', check);
      setTimeout(() => reject(new Error('Socket connection timed out')), 5000);
    });
    console.log('✓ Both Tenant and Owner sockets connected with JWT handshake');

    // Test joining room
    await new Promise((resolve, reject) => {
      let joinedCount = 0;
      const onJoin = (res) => {
        if (res.error) reject(new Error(`Join room error: ${res.error}`));
        if (++joinedCount === 2) resolve();
      };
      ownerSocket.emit('joinRoom', { chatId }, onJoin);
      tenantSocket.emit('joinRoom', { chatId }, onJoin);
      setTimeout(() => reject(new Error('Join room timed out')), 5000);
    });
    console.log('✓ Both sockets joined chat room:', `chat_${chatId}`);

    // 7. Step E: Message Send & Receive (With Persistence Verification)
    console.log('\n7. Testing Real-Time Message Broadcast & Persistence...');
    const msgText1 = 'Hello Owner, when can I visit the flat?';
    const msgText2 = 'Hi! How about tomorrow afternoon at 4 PM?';

    await new Promise((resolve, reject) => {
      ownerSocket.once('receiveMessage', (msg) => {
        try {
          if (msg.message !== msgText1 || msg.senderId !== tenantId) {
            reject(new Error(`Received incorrect message: ${JSON.stringify(msg)}`));
          } else {
            console.log(`✓ Owner received message via Socket: "${msg.message}"`);
            resolve();
          }
        } catch (e) { reject(e); }
      });
      tenantSocket.emit('sendMessage', { chatId, message: msgText1 });
      setTimeout(() => reject(new Error('Receive message 1 timed out')), 5000);
    });

    await new Promise((resolve, reject) => {
      tenantSocket.once('receiveMessage', (msg) => {
        try {
          if (msg.message !== msgText2 || msg.senderId !== ownerId) {
            reject(new Error(`Received incorrect message: ${JSON.stringify(msg)}`));
          } else {
            console.log(`✓ Tenant received reply via Socket: "${msg.message}"`);
            resolve();
          }
        } catch (e) { reject(e); }
      });
      ownerSocket.emit('sendMessage', { chatId, message: msgText2 });
      setTimeout(() => reject(new Error('Receive message 2 timed out')), 5000);
    });

    // 8. Step F: Typing Indicators & Read Receipts
    console.log('\n8. Testing Typing Indicators and Read Receipts...');
    await new Promise((resolve, reject) => {
      ownerSocket.once('userTyping', (data) => {
        if (data.userId === tenantId) {
          console.log('✓ Owner received typing indicator from Tenant');
          resolve();
        } else reject(new Error('Typing userId mismatch'));
      });
      tenantSocket.emit('typing', { chatId });
      setTimeout(() => reject(new Error('Typing indicator timed out')), 5000);
    });

    await new Promise((resolve, reject) => {
      tenantSocket.once('messagesRead', (data) => {
        if (data.readBy === ownerId) {
          console.log('✓ Tenant received read receipt from Owner');
          resolve();
        } else reject(new Error('Read receipt userId mismatch'));
      });
      ownerSocket.emit('markAsRead', { chatId });
      setTimeout(() => reject(new Error('Read receipt timed out')), 5000);
    });

    // 9. Step G: Verify Paginated REST History Endpoint
    console.log('\n9. Testing Paginated Chat History & Persistence Across Refresh...');
    const histRes = await fetch(`${BASE_URL}/chats/${chatId}/messages?limit=50&offset=0`, {
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    const histData = await histRes.json();
    if (histRes.status === 200 && histData.messages && histData.messages.length === 2) {
      console.log(`✓ Paginated chat history retrieved (${histData.messages.length} messages loaded)`);
      console.log(`  Message 1: "${histData.messages[0].message}" (by ${histData.messages[0].sender.fullName})`);
      console.log(`  Message 2: "${histData.messages[1].message}" (by ${histData.messages[1].sender.fullName})`);
      if (histData.messages[0].isRead !== true) {
        throw new Error('Message 1 should be marked as read by read receipt!');
      }
      console.log('✓ Verified: Messages persisted in Postgres and status updated by read receipts');
    } else {
      throw new Error(`Chat history verification failed: ${JSON.stringify(histData)}`);
    }

    // List user chats
    const listRes = await fetch(`${BASE_URL}/chats`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const listData = await listRes.json();
    if (listRes.status === 200 && listData.chats.length >= 1) {
      console.log(`✓ Owner chats list retrieved successfully (Latest message: "${listData.chats[0].messages[0].message}")`);
    } else {
      throw new Error(`List chats failed: ${JSON.stringify(listData)}`);
    }

  } catch (err) {
    console.error('\n✗ Test failed with error:', err.message);
    exitCode = 1;
  } finally {
    console.log('\nDisconnecting sockets and cleaning up test accounts...');
    if (ownerSocket) ownerSocket.disconnect();
    if (tenantSocket) tenantSocket.disconnect();
    await new Promise(r => setTimeout(r, 500)); // allow socket disconnect
    await cleanupUser('test_chat_owner@test.com');
    await cleanupUser('test_chat_tenant@test.com');
    console.log('--- Chat & Socket Module Integration Tests Finished ---\n');
    process.exit(exitCode);
  }
}

runTests();
