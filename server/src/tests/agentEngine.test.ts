import { agentStore, generateJobFingerprint } from '../config/store.js';
import { aiService } from '../services/aiService.js';
import { emailToApplicationMatcher } from '../services/emailToApplicationMatcher.js';

async function runTestSuite() {
  console.log('🧪 ========================================================');
  console.log('🧪 RUNNING COMPREHENSIVE AI AGENT VERIFICATION TEST SUITE');
  console.log('🧪 ========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Resume Parser (Structured JSON Profile Extraction)
  // -------------------------------------------------------------
  console.log('--- TEST 1: AI Resume Intelligence & JSON Parser ---');
  const sampleResume = `
  B Sannith Reddy
  Email: sravssunny15@gmail.com | Phone: +91 98765 43210 | Location: Hyderabad
  LinkedIn: linkedin.com/in/sannithreddy17 | GitHub: github.com/sannithreddy

  EDUCATION:
  B.Tech in Artificial Intelligence | St. Peter's Engineering College (2022 - 2026) | CGPA: 8.4

  TECHNICAL SKILLS:
  TypeScript, JavaScript, Python, React, Node.js, Next.js, PostgreSQL, Docker, AWS, Playwright

  EXPERIENCE:
  Full Stack Developer | Automation Projects (2023 - Present)
  - Built scalable REST APIs with Express and PostgreSQL.
  - Implemented end-to-end browser automation workflows with Playwright.
  `;

  const parsedResume = await aiService.parseResume(sampleResume);
  assert(Array.isArray(parsedResume.skills) && parsedResume.skills.length > 0, 'Extracts non-empty skills array');
  assert(parsedResume.skills.includes('TypeScript') || parsedResume.skills.includes('React'), 'Extracts core tech skills (TypeScript/React)');
  assert(parsedResume.education.length > 0 && parsedResume.education[0].graduationYear === 2026, 'Extracts correct graduation year (2026)');

  // -------------------------------------------------------------
  // TEST 2: SHA-256 Deduplication & Fingerprinting
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: SHA-256 Job Deduplication & Fingerprint ---');
  const fp1 = generateJobFingerprint('Razorpay', 'Software Engineer', 'Bengaluru', 'https://job1.com');
  const fp2 = generateJobFingerprint('Razorpay', 'Software Engineer', 'Bengaluru', 'https://job1.com');
  const fp3 = generateJobFingerprint('Swiggy', 'Backend Developer', 'Hyderabad', 'https://job2.com');

  assert(fp1 === fp2, 'Identical job postings produce identical SHA-256 fingerprints');
  assert(fp1 !== fp3, 'Different job postings produce distinct SHA-256 fingerprints');
  assert(fp1.length === 16, 'Fingerprint is standardized 16-char hex string');

  // -------------------------------------------------------------
  // TEST 3: Explainable AI Job Matching
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Explainable AI Job Matching ---');
  const profile = agentStore.getProfile();
  const targetJob = {
    title: 'Full Stack Developer',
    company: 'CRED',
    description: 'Looking for a Full Stack Engineer with React, Node.js, TypeScript, and PostgreSQL experience.',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
    location: 'Bengaluru / Remote'
  };

  const match = await aiService.matchJob(profile, targetJob);
  assert(typeof match.match_score === 'number' && match.match_score >= 0 && match.match_score <= 100, 'Calculates valid 0-100 match score');
  assert(Array.isArray(match.matched_skills) && match.matched_skills.length > 0, 'Identifies matched skills');
  assert(Array.isArray(match.strengths) && match.strengths.length > 0, 'Generates explainable strengths');
  assert(['HIGH_PRIORITY', 'MEDIUM_PRIORITY', 'LOW_PRIORITY', 'REJECT'].includes(match.recommendation), 'Provides standardized recommendation tier');

  // -------------------------------------------------------------
  // TEST 4: Real-Profile Tailored Cover Letters (No Hallucination)
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Tailored Cover Letter Synthesis ---');
  const coverLetter = await aiService.generateCoverLetter('Software Engineer', 'Razorpay', 'Backend API development in Node.js', profile);
  assert(coverLetter.includes('B Sannith Reddy'), 'Includes candidate real full name');
  assert(coverLetter.includes('Razorpay'), 'References target company name');
  assert(coverLetter.includes('TypeScript') || coverLetter.includes('React') || coverLetter.includes('Node.js'), 'Includes candidate real technical skills');

  // -------------------------------------------------------------
  // TEST 5: Email Classification & Deadline Extraction
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: 8-Category Email Classification ---');
  const testAssessmentEmail = {
    sender: 'recruiting@wexa.ai',
    subject: 'Wexa AI: Online Technical Assessment Link',
    body: 'Hi Sannith, please complete your coding assessment on HackerRank at https://hackerrank.com/test-123. The deadline is tomorrow at 6:00 PM.'
  };

  const classifiedEmail = await aiService.classifyEmail(
    testAssessmentEmail.sender,
    testAssessmentEmail.subject,
    testAssessmentEmail.body
  );
  assert(classifiedEmail.category === 'ASSESSMENT', 'Classifies coding test email as ASSESSMENT');
  assert(classifiedEmail.actionClassification === 'ACTION_REQUIRED', 'Classifies test email as ACTION_REQUIRED');
  assert(classifiedEmail.urgency === 'high', 'Flags urgent assessment as high priority');

  // -------------------------------------------------------------
  // TEST 6: Email ↔ Application Matching & Kanban State Transition
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: Email to Application Auto-Transition ---');
  // Create a test application
  const testJob = agentStore.addJob({
    jobTitle: 'AI Platform Engineer',
    company: 'Wexa AI',
    location: 'Remote',
    url: 'https://wexa.ai/careers',
    platform: 'Custom',
    status: 'APPLIED',
    applicationMode: 'ASSISTED_APPLY',
    matchScore: 95
  });

  const testAlert = agentStore.addEmailAlert({
    messageId: `test-msg-${Date.now()}`,
    sender: 'recruiting@wexa.ai',
    senderName: 'Wexa AI Talent Team',
    subject: 'Wexa AI: Technical Interview Scheduled',
    date: new Date().toISOString(),
    snippet: 'Your interview is scheduled on Zoom.',
    body: 'Hi Sannith, your interview is confirmed at https://zoom.us/j/987654321.',
    category: 'INTERVIEW',
    urgency: 'high',
    actionClassification: 'ACTION_REQUIRED',
    isGenuine: true,
    spamScore: 0,
    triageReason: 'Confirmed interview invitation',
    extractedInfo: {
      company: 'Wexa AI',
      meetingUrl: 'https://zoom.us/j/987654321',
      keyPoints: ['Technical round scheduled'],
      suggestedAction: 'Join Zoom meeting at scheduled time.'
    },
    isRead: false,
    isNotified: false
  });

  const matchResult = emailToApplicationMatcher.matchAndSync(testAlert);
  assert(matchResult.matched === true, 'Successfully matches inbound email to active Wexa AI application');
  assert(matchResult.application?.status === 'INTERVIEW', 'Auto-transitions application status from APPLIED -> INTERVIEW');
  assert(matchResult.application?.emailReferences?.includes(testAlert.id) === true, 'Links email ID into application references');

  // -------------------------------------------------------------
  // TEST 7: Natural Language AI Q&A Engine
  // -------------------------------------------------------------
  console.log('\n--- TEST 7: Natural Language AI Assistant Q&A ---');
  const answer = await aiService.answerUserQuery('Which companies have contacted me?', agentStore.data);
  assert(typeof answer === 'string' && answer.length > 20, 'Generates comprehensive answer to user query');

  console.log('\n========================================================');
  console.log(`🏁 TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite failed with error:', err);
  process.exit(1);
});
