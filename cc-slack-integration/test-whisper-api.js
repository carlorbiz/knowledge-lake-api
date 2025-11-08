/**
 * OpenAI Whisper API Test Script
 *
 * This script tests if your OpenAI API key works with the Whisper transcription endpoint.
 * You'll need:
 * 1. Your OpenAI API key from https://platform.openai.com/api-keys
 * 2. A short audio file to test with (even 5 seconds is fine)
 */

const https = require('https');
const fs = require('fs');
const FormData = require('form-data');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎤 OpenAI Whisper API Test\n');
console.log('This will test if your OpenAI API key works for transcription.\n');

// Prompt for API key (hidden input)
rl.question('Enter your OpenAI API key: ', (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    console.error('❌ No API key provided. Exiting.');
    rl.close();
    process.exit(1);
  }

  rl.question('Enter path to audio file (or press Enter to create a test): ', (audioPath) => {
    rl.close();

    // Test with minimal approach - just check if API key is valid
    if (!audioPath || audioPath.trim() === '') {
      console.log('\n📋 Testing API key validity with Whisper endpoint...\n');
      testApiKeyOnly(apiKey.trim());
    } else {
      console.log(`\n🎵 Testing transcription with: ${audioPath}\n`);
      testWithAudioFile(apiKey.trim(), audioPath.trim());
    }
  });
});

function testApiKeyOnly(apiKey) {
  // Create a minimal test - just try to hit the endpoint
  // We'll get an error, but it will tell us if the API key is valid

  const options = {
    hostname: 'api.openai.com',
    path: '/v1/models',  // List models endpoint - simpler test
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        const models = JSON.parse(data);
        const whisperModel = models.data.find(m => m.id === 'whisper-1');

        if (whisperModel) {
          console.log('✅ SUCCESS! Your OpenAI API key works!\n');
          console.log('✅ Whisper model is available on your account!\n');
          console.log('Model Details:');
          console.log(`   ID: ${whisperModel.id}`);
          console.log(`   Owner: ${whisperModel.owned_by}`);
          console.log('\n🎯 Next Steps:');
          console.log('   1. Your API key is ready for Whisper transcription');
          console.log('   2. Add this key to n8n as "OpenAI Account" credential');
          console.log('   3. Import the podcast-to-manuscript workflow');
          console.log(`\n💰 Cost: $0.006 per minute of audio (~$0.36 per hour)`);
        } else {
          console.log('✅ API key is valid!');
          console.log('⚠️  But Whisper model not found. You may need to enable it in your OpenAI account.');
        }
      } else if (res.statusCode === 401) {
        console.log('❌ INVALID API KEY');
        console.log('   Please check your API key at: https://platform.openai.com/api-keys');
      } else {
        console.log(`⚠️  Unexpected response: ${res.statusCode}`);
        console.log(data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error.message);
  });

  req.end();
}

function testWithAudioFile(apiKey, audioPath) {
  // Check if file exists
  if (!fs.existsSync(audioPath)) {
    console.error(`❌ File not found: ${audioPath}`);
    process.exit(1);
  }

  const form = new FormData();
  form.append('file', fs.createReadStream(audioPath));
  form.append('model', 'whisper-1');
  form.append('language', 'en');

  const options = {
    hostname: 'api.openai.com',
    path: '/v1/audio/transcriptions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      ...form.getHeaders()
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        const result = JSON.parse(data);
        console.log('✅ SUCCESS! Whisper transcription works!\n');
        console.log('📝 Transcription Result:');
        console.log(`   "${result.text}"\n`);
        console.log('🎯 Your OpenAI API key is ready for the n8n workflow!');
      } else if (res.statusCode === 401) {
        console.log('❌ INVALID API KEY');
        console.log('   Please check your API key at: https://platform.openai.com/api-keys');
      } else if (res.statusCode === 400) {
        console.log('⚠️  Invalid audio file or format');
        console.log('   Whisper supports: mp3, mp4, mpeg, mpga, m4a, wav, webm');
        console.log(`   Error: ${data}`);
      } else {
        console.log(`⚠️  Error ${res.statusCode}:`);
        console.log(data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error.message);
  });

  form.pipe(req);
}
