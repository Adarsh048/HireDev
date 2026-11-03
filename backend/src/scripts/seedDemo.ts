import mongoose from 'mongoose';
import argon2 from 'argon2';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db';
import { env } from '../config/env';
import { User } from '../models/user.model';
import { CandidateProfile } from '../models/candidateProfile.model';
import { JobPosting } from '../models/jobPosting.model';
import { Recommendation } from '../models/recommendation.model';
import { RecommendationBatch } from '../models/recommendationBatch.model';
import { SavedJob } from '../models/savedJob.model';
import { Application } from '../models/application.model';
import { RefreshSchedule } from '../models/refreshSchedule.model';
import { logger } from '../utils/logger';

export const seedDemoData = async () => {
  await connectDB(env.MONGODB_URI);
  logger.info('Starting Demo Data Seeding...');

  // 1. Create or update Test User
  const email = 'test@nexhire.in';
  const passwordHash = await argon2.hash('Password123!', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      passwordHash,
      name: 'Adarsh Sharma',
      role: 'candidate',
    });
  } else {
    user.passwordHash = passwordHash;
    user.name = 'Adarsh Sharma';
    await user.save();
  }

  const userId = user._id;

  // 2. Candidate Profile
  await CandidateProfile.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        user: userId,
        fullName: 'Adarsh Sharma',
        email: 'test@nexhire.in',
        phone: '+91 9876543210',
        education: [
          {
            degree: 'B.Tech in Computer Science and Engineering',
            institution: 'National Institute of Technology, Karnataka',
            graduationYear: 2024,
            cgpa: 8.8,
          },
        ],
        skills: [
          'react',
          'typescript',
          'javascript',
          'node.js',
          'express',
          'mongodb',
          'python',
          'tailwind css',
          'docker',
          'git',
          'rest api',
          'sql',
          'redis',
        ],
        languages: ['javascript', 'typescript', 'python', 'sql'],
        frameworks: ['react', 'node.js', 'express', 'tailwind css'],
        databases: ['mongodb', 'redis', 'postgresql'],
        projects: [
          {
            title: 'Distributed Real-Time Collaboration Canvas',
            description: 'Built a WebSocket-driven multi-user whiteboarding tool with Node.js and React.',
            technologies: ['react', 'node.js', 'websocket', 'redis'],
            link: 'https://github.com/example/canvas',
          },
          {
            title: 'High-Throughput Analytics Dashboard',
            description: 'Processed streaming telemetry events using Express and MongoDB aggregation pipelines.',
            technologies: ['typescript', 'mongodb', 'express'],
            link: 'https://github.com/example/analytics',
          },
        ],
        experience: [
          {
            company: 'TechNovation Labs India',
            role: 'Associate Software Engineer',
            startDate: new Date('2024-07-01'),
            description: 'Developed scalable microservices and React dashboards for enterprise fintech users in India.',
            isCurrentRole: true,
          },
        ],
        internships: [
          {
            company: 'PayFlow Solutions',
            role: 'Full Stack Engineering Intern',
            startDate: new Date('2024-01-10'),
            endDate: new Date('2024-06-25'),
            description: 'Engineered REST endpoints and integrated payment webhooks.',
          },
        ],
        certifications: [
          'AWS Certified Cloud Practitioner',
          'Meta Certified Front-End Developer',
        ],
        preferences: {
          jobCategories: ['Full Stack Developer', 'Backend Developer', 'Frontend Developer'],
          preferredLocations: ['Bengaluru', 'Hyderabad', 'Pune', 'Remote (India)'],
          workMode: ['remote', 'hybrid', 'on-site'],
          employmentTypes: ['full-time', 'internship'],
          minSalary: 800000,
          maxExperienceYears: 2,
        },
      },
    },
    { upsert: true, new: true },
  );

  // 3. Genuine India Job Postings
  const genuineIndiaJobs = [
    {
      source: 'linkedin',
      sourceJobId: 'li-phonepe-sde1-blr',
      title: 'Software Development Engineer I (Full Stack)',
      company: 'PhonePe',
      location: { city: 'Bengaluru', state: 'Karnataka', country: 'India', remote: false },
      workMode: 'hybrid',
      employmentType: 'Full-time',
      minExperienceMonths: 6,
      maxExperienceMonths: 24,
      eligibleBatches: [2023, 2024],
      requiredSkills: ['react', 'node.js', 'typescript', 'mongodb', 'rest api', 'distributed systems'],
      description: `PhonePe is hiring an SDE 1 for our Core Payments & Consumer Engineering group in Bengaluru.
Responsibilities:
- Build high-scale microservices powering over 500 million registered Indian users.
- Develop responsive web applications using React, TypeScript, and modern state architectures.
- Collaborate with product designers and infra teams to maintain high 99.99% availability.
Requirements:
- B.Tech/B.E in Computer Science or related engineering discipline (Batch 2023/2024).
- 0 to 2 years hands-on experience in Node.js, TypeScript, React, and MongoDB/SQL.
- Strong grounding in Data Structures and Algorithms.`,
      salary: '₹14,00,000 - ₹18,00,000 PA',
      postingDate: new Date(Date.now() - 1000 * 60 * 60 * 12),
      originalUrl: 'https://www.phonepe.com/careers/job-openings/',
      applicationUrl: 'https://www.phonepe.com/careers/job-openings/',
      firstDiscovered: new Date(),
      lastVerified: new Date(),
      isActive: true,
    },
    {
      source: 'naukri',
      sourceJobId: 'nk-zomato-be-delhi',
      title: 'Backend Engineer - Consumer Platforms',
      company: 'Zomato',
      location: { city: 'Gurugram', state: 'Haryana', country: 'India', remote: false },
      workMode: 'on-site',
      employmentType: 'Full-time',
      minExperienceMonths: 0,
      maxExperienceMonths: 24,
      eligibleBatches: [2023, 2024],
      requiredSkills: ['node.js', 'express', 'mongodb', 'redis', 'python', 'microservices'],
      description: `Join Zomato's engineering team in Gurugram shaping food delivery and quick-commerce in India.
Key Responsibilities:
- Design real-time order tracking and dispatch algorithms.
- Build reliable REST APIs with Express and Node.js capable of handling 50k+ requests/sec during peak hours.
- Optimize database schema and caching strategies with MongoDB and Redis.
Eligibility:
- Fresher to 2 years experience with Node.js or Python.
- Good knowledge of asynchronous I/O, relational databases, and NoSQL caches.`,
      salary: '₹12,00,000 - ₹16,00,000 PA',
      postingDate: new Date(Date.now() - 1000 * 60 * 60 * 20),
      originalUrl: 'https://www.zomato.com/careers',
      applicationUrl: 'https://www.zomato.com/careers',
      firstDiscovered: new Date(),
      lastVerified: new Date(),
      isActive: true,
    },
    {
      source: 'foundit',
      sourceJobId: 'fi-razorpay-fe-blr',
      title: 'Frontend Engineer (React / TypeScript)',
      company: 'Razorpay',
      location: { city: 'Bengaluru', state: 'Karnataka', country: 'India', remote: true },
      workMode: 'remote',
      employmentType: 'Full-time',
      minExperienceMonths: 0,
      maxExperienceMonths: 36,
      eligibleBatches: [2022, 2023, 2024],
      requiredSkills: ['react', 'typescript', 'tailwind css', 'javascript', 'git'],
      description: `Razorpay is seeking a Frontend Engineer to revolutionize business banking and checkout experiences.
What You Will Do:
- Build accessible, performant design systems and dashboard workflows used by 8M+ businesses across India.
- Optimize web bundle sizes, Core Web Vitals, and client-side caching.
Requirements:
- Proficiency with React, TypeScript, and modern CSS frameworks like Tailwind.
- Strong understanding of component architecture, state management, and browser internals.`,
      salary: '₹11,00,000 - ₹15,00,000 PA',
      postingDate: new Date(Date.now() - 1000 * 60 * 60 * 6),
      originalUrl: 'https://razorpay.com/jobs/',
      applicationUrl: 'https://razorpay.com/jobs/',
      firstDiscovered: new Date(),
      lastVerified: new Date(),
      isActive: true,
    },
    {
      source: 'indeed',
      sourceJobId: 'id-swiggy-sde-hyd',
      title: 'Associate Software Engineer (Java / Node.js)',
      company: 'Swiggy',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India', remote: false },
      workMode: 'hybrid',
      employmentType: 'Full-time',
      minExperienceMonths: 0,
      maxExperienceMonths: 18,
      eligibleBatches: [2024],
      requiredSkills: ['node.js', 'sql', 'rest api', 'docker', 'git'],
      description: `Swiggy is expanding the Instamart and Food Marketplace engineering pods in Hyderabad.
Roles & Responsibilities:
- Work with senior architects on delivery fleet automation, routing algorithms, and inventory pipelines.
- Write clean, maintainable unit-tested services.
Candidate Profile:
- 2024 engineering graduate in Computer Science, IT, or Electronics.
- Familiarity with cloud primitives (Docker) and REST architecture.`,
      salary: '₹10,00,000 - ₹13,00,000 PA',
      postingDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
      originalUrl: 'https://careers.swiggy.com/',
      applicationUrl: 'https://careers.swiggy.com/',
      firstDiscovered: new Date(),
      lastVerified: new Date(),
      isActive: true,
    },
    {
      source: 'internshala',
      sourceJobId: 'is-postman-intern-pune',
      title: 'Full Stack Engineering Trainee',
      company: 'Postman',
      location: { city: 'Bengaluru', state: 'Karnataka', country: 'India', remote: true },
      workMode: 'remote',
      employmentType: 'Full-time',
      minExperienceMonths: 0,
      maxExperienceMonths: 12,
      eligibleBatches: [2024, 2025],
      requiredSkills: ['javascript', 'typescript', 'react', 'node.js', 'git'],
      description: `Postman powers API development for over 30 million developers worldwide.
We are looking for exceptional fresh graduates and entry-level developers based anywhere in India to join our desktop and cloud web client pods.
Requirements:
- Strong understanding of JavaScript/TypeScript and Web APIs.
- Passion for developer tools and open source.`,
      salary: '₹8,00,000 - ₹12,00,000 PA',
      postingDate: new Date(Date.now() - 1000 * 60 * 60 * 8),
      originalUrl: 'https://www.postman.com/company/careers/',
      applicationUrl: 'https://www.postman.com/company/careers/',
      firstDiscovered: new Date(),
      lastVerified: new Date(),
      isActive: true,
    },
    {
      source: 'wellfound',
      sourceJobId: 'wf-cred-fs-blr',
      title: 'Full Stack Engineer - Member Experience',
      company: 'CRED',
      location: { city: 'Bengaluru', state: 'Karnataka', country: 'India', remote: false },
      workMode: 'on-site',
      employmentType: 'Full-time',
      minExperienceMonths: 12,
      maxExperienceMonths: 36,
      eligibleBatches: [2022, 2023, 2024],
      requiredSkills: ['react', 'node.js', 'mongodb', 'redis', 'microservices'],
      description: `CRED is hiring a Full Stack Engineer to build fluid and rewarding financial experiences.
You'll work directly with design and product leads to craft high-finish UI animations and reliable backend microservices handling high financial throughput.`,
      salary: '₹16,00,000 - ₹22,00,000 PA',
      postingDate: new Date(Date.now() - 1000 * 60 * 60 * 18),
      originalUrl: 'https://careers.cred.club/',
      applicationUrl: 'https://careers.cred.club/',
      firstDiscovered: new Date(),
      lastVerified: new Date(),
      isActive: true,
    },
  ];

  // Upsert all jobs
  const savedJobDocs = [];
  for (const jobData of genuineIndiaJobs) {
    const jobDoc = await JobPosting.findOneAndUpdate(
      { source: jobData.source, sourceJobId: jobData.sourceJobId },
      { $set: jobData },
      { upsert: true, new: true },
    );
    savedJobDocs.push(jobDoc);
  }

  // 4. Create RecommendationBatch for User
  await Recommendation.deleteMany({ user: userId });
  await RecommendationBatch.deleteMany({ user: userId });

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const platformBreakdown = new Map<string, number>();
  savedJobDocs.forEach((j) => {
    platformBreakdown.set(j.source, (platformBreakdown.get(j.source) || 0) + 1);
  });

  const batch = await RecommendationBatch.create({
    user: userId,
    generatedAt: new Date(),
    expiresAt,
    status: 'completed',
    jobCount: savedJobDocs.length,
    platformBreakdown,
  });

  // 5. Pre-computed Ranked Recommendations
  const matchRanks = [
    {
      job: savedJobDocs[0], // PhonePe
      matchScore: 94.2,
      matchedSkills: ['react', 'node.js', 'typescript', 'mongodb', 'rest api'],
      missingSkills: ['distributed systems'],
      eligibility: { passes: true, reasons: ['Meets 2024 graduation batch requirement', 'Experience within 0-2 years range'] },
      rankInPlatform: 1,
    },
    {
      job: savedJobDocs[1], // Zomato
      matchScore: 91.5,
      matchedSkills: ['node.js', 'express', 'mongodb', 'redis', 'python'],
      missingSkills: ['microservices'],
      eligibility: { passes: true, reasons: ['Meets 0-2 YOE requirement', 'Eligible 2024 batch confirmed'] },
      rankInPlatform: 1,
    },
    {
      job: savedJobDocs[2], // Razorpay
      matchScore: 89.0,
      matchedSkills: ['react', 'typescript', 'tailwind css', 'javascript', 'git'],
      missingSkills: [],
      eligibility: { passes: true, reasons: ['Full skill alignment for React/TypeScript', 'Remote India eligible'] },
      rankInPlatform: 1,
    },
    {
      job: savedJobDocs[4], // Postman
      matchScore: 86.8,
      matchedSkills: ['javascript', 'typescript', 'react', 'node.js', 'git'],
      missingSkills: [],
      eligibility: { passes: true, reasons: ['Trainee position targeting 2024 batch', 'Remote India confirmed'] },
      rankInPlatform: 1,
    },
    {
      job: savedJobDocs[3], // Swiggy
      matchScore: 82.4,
      matchedSkills: ['node.js', 'sql', 'rest api', 'docker', 'git'],
      missingSkills: ['java'],
      eligibility: { passes: true, reasons: ['2024 graduate engineer eligible'] },
      rankInPlatform: 1,
    },
    {
      job: savedJobDocs[5], // CRED
      matchScore: 78.6,
      matchedSkills: ['react', 'node.js', 'mongodb', 'redis'],
      missingSkills: ['microservices'],
      eligibility: { passes: true, reasons: ['Passes experience threshold'] },
      rankInPlatform: 1,
    },
  ];

  for (const item of matchRanks) {
    await Recommendation.create({
      user: userId,
      job: item.job._id,
      batch: batch._id,
      platform: item.job.source,
      matchScore: item.matchScore,
      matchedSkills: item.matchedSkills,
      missingSkills: item.missingSkills,
      eligibility: item.eligibility,
      rankInPlatform: item.rankInPlatform,
    });
  }

  // 6. Pre-seed Application Tracker
  await Application.deleteMany({ user: userId });
  await Application.create([
    {
      user: userId,
      job: savedJobDocs[0]._id, // PhonePe
      status: 'interview',
      appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      notes: 'Technical round scheduled on Friday at 3:00 PM IST',
      statusHistory: [
        { status: 'applied', changedAt: new Date(Date.now() - 1000 * 60 * 60 * 48) },
        { status: 'interview', changedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), notes: 'HR called for Round 1' },
      ],
    },
    {
      user: userId,
      job: savedJobDocs[2]._id, // Razorpay
      status: 'applied',
      appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      notes: 'Applied via direct careers portal',
      statusHistory: [
        { status: 'applied', changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      ],
    },
    {
      user: userId,
      job: savedJobDocs[1]._id, // Zomato
      status: 'saved',
      notes: 'Reviewing system design topics before applying',
      statusHistory: [{ status: 'saved', changedAt: new Date() }],
    },
  ]);

  // 7. Saved Jobs
  await SavedJob.deleteMany({ user: userId });
  await SavedJob.create({
    user: userId,
    job: savedJobDocs[1]._id,
    notes: 'Prioritize this backend role',
    savedAt: new Date(),
  });

  // 8. 24-Hour Refresh Schedule
  const nextRefreshAt = new Date();
  nextRefreshAt.setHours(nextRefreshAt.getHours() + 18); // 18 hours remaining
  nextRefreshAt.setMinutes(nextRefreshAt.getMinutes() + 42);

  await RefreshSchedule.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        user: userId,
        lastRefreshAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        nextRefreshAt,
        isActive: true,
        consecutiveFailures: 0,
      },
    },
    { upsert: true },
  );

  logger.info('Demo seed data populated successfully!');
};

if (require.main === module) {
  seedDemoData()
    .then(() => {
      console.log('Seed finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}

