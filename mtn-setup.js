import https from 'https';

const PRIMARY_KEY = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
const USER_ID = process.env.MTN_MOMO_USER_ID;
const BASE_URL = "sandbox.momodeveloper.mtn.com";

if (!PRIMARY_KEY || !USER_ID) {
  console.error("❌ Error: Required environment variables are missing.");
  console.error("Please set MTN_MOMO_SUBSCRIPTION_KEY and MTN_MOMO_USER_ID");
  process.exit(1);
}

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        resolve({ status: res.statusCode, body: body });
      });
    });
    
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function setup() {
  console.log("🚀 MTN MoMo Sandbox Setup\n");
  console.log("=".repeat(50));
  
  // Step 1: Create API User
  console.log("\n📝 Step 1: Creating API User...");
  const createUserOptions = {
    hostname: BASE_URL,
    path: '/v1_0/apiuser',
    method: 'POST',
    headers: {
      'X-Reference-Id': USER_ID,
      'Ocp-Apim-Subscription-Key': PRIMARY_KEY,
      'Content-Type': 'application/json'
    }
  };
  
  const userData = JSON.stringify({ providerCallbackHost: "webhook.site" });
  const userResult = await makeRequest(createUserOptions, userData);
  
  if (userResult.status === 201) {
    console.log("✅ API User created successfully!");
  } else {
    console.log(`❌ Failed to create user: ${userResult.body}`);
    process.exit(1);
  }
  
  // Step 2: Generate API Key
  console.log("\n🔑 Step 2: Generating API Key...");
  const createKeyOptions = {
    hostname: BASE_URL,
    path: `/v1_0/apiuser/${USER_ID}/apikey`,
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': PRIMARY_KEY
    }
  };
  
  const keyResult = await makeRequest(createKeyOptions);
  
  if (keyResult.status === 201) {
    const apiKey = JSON.parse(keyResult.body).apiKey;
    console.log("✅ API Key generated successfully!");
    console.log("\n" + "=".repeat(50));
    console.log("🎉 YOUR MTN MOMO SANDBOX CREDENTIALS:");
    console.log("=".repeat(50));
    console.log(`\nMTN_MOMO_SUBSCRIPTION_KEY: ${PRIMARY_KEY}`);
    console.log(`MTN_MOMO_USER_ID: ${USER_ID}`);
    console.log(`MTN_MOMO_API_KEY: ${apiKey}`);
    console.log("\n" + "=".repeat(50));
    console.log("\n✅ Setup complete! Copy the credentials above.\n");
  } else {
    console.log(`❌ Failed to generate API key: ${keyResult.body}`);
    process.exit(1);
  }
}

setup().catch(console.error);
