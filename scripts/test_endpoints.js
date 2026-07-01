import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3000/api/ai';

async function testSummary() {
  const payload = {
    content: '<h1>Test Article</h1><p>This is a sample article about AI. It has several paragraphs and details about the technology.</p>',
  };
  const res = await fetch(`${baseUrl}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  console.log('--- Summary Response ---');
  console.log(JSON.stringify(data, null, 2));
}

async function testTranslate() {
  const payload = {
    title: 'Hello World',
    subTitle: 'A short subtitle',
    description: '<p>This description will be spoken.</p>',
    targetLanguage: 'es', // Spanish
  };
  const res = await fetch(`${baseUrl}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  console.log('--- Translate Response ---');
  console.log(JSON.stringify(data, null, 2));
}

(async () => {
  await testSummary();
  await testTranslate();
})();
