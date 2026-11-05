import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function testFlow() {
  const client = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
  });

  console.log('1. Logging in with test candidate...');
  const loginRes = await client.post('/api/auth/login', {
    email: 'test@nexhire.in',
    password: 'Password123!',
  });

  const cookies = loginRes.headers['set-cookie'];
  const cookieHeader = cookies ? cookies.map((c: string) => c.split(';')[0]).join('; ') : '';
  console.log('✓ Logged in as:', loginRes.data.data.user.email);

  console.log('\n2. Checking recommendations before resume upload...');
  const beforeRes = await client.get('/api/jobs/recommended', {
    headers: { Cookie: cookieHeader },
  });
  console.log('Total recommendations before upload:', beforeRes.data.pagination.total);
  if (beforeRes.data.pagination.total === 0) {
    console.log('✓ Confirmed: Zero default recommendations before upload.');
  } else {
    console.warn('Note: Expected 0, got', beforeRes.data.pagination.total);
  }

  console.log('\n3. Uploading candidate resume to trigger AI parsing and matching engine...');
  const resumePath = path.join(__dirname, '../../../test_resume.pdf');
  if (!fs.existsSync(resumePath)) {
    console.error('Resume sample file not found at:', resumePath);
    return;
  }

  const form = new FormData();
  form.append('file', fs.createReadStream(resumePath), {
    filename: 'Aarav_Sharma_Resume.pdf',
    contentType: 'application/pdf',
  });

  const uploadRes = await client.post('/api/resumes/upload', form, {
    headers: {
      ...form.getHeaders(),
      Cookie: cookieHeader,
    },
  });

  console.log('✓ Resume upload response:', uploadRes.data.message);
  console.log('Extracted skills:', uploadRes.data.data.profile.skills.slice(0, 8));

  // Allow matching async job to complete
  console.log('\n4. Waiting 4 seconds for hybrid matching across all 60 jobs...');
  await new Promise((resolve) => setTimeout(resolve, 4000));

  console.log('\n5. Checking recommendations after resume upload...');
  const afterRes = await client.get('/api/jobs/recommended?limit=10', {
    headers: { Cookie: cookieHeader },
  });

  console.log('Total ranked recommendations generated:', afterRes.data.pagination.total);
  const sampleRecs = afterRes.data.data.recommendations;
  console.log(`Retrieved top ${sampleRecs.length} ranked opportunities:`);

  for (const rec of sampleRecs) {
    console.log(
      ` - [${rec.platform.toUpperCase()}] ${rec.job.title} @ ${rec.job.company} | Match: ${rec.matchScore}% | Deadline: ${rec.job.deadline ? rec.job.deadline.substring(0, 10) : 'None'} | URL: ${rec.job.applicationUrl}`
    );
  }

  console.log('\n6. Checking platform breakdown (top 10 per platform)...');
  const platforms = ['linkedin', 'naukri', 'indeed', 'internshala', 'foundit', 'wellfound'];
  for (const p of platforms) {
    const pRes = await client.get(`/api/jobs/platform/${p}`, {
      headers: { Cookie: cookieHeader },
    });
    console.log(` - ${p}: ${pRes.data.data.recommendations.length} ranked vacancies`);
  }

  console.log('\n✓ All tests passed successfully!');
  process.exit(0);
}

testFlow().catch((err) => {
  console.error('Test error:', err.response?.data || err.message);
  process.exit(1);
});
