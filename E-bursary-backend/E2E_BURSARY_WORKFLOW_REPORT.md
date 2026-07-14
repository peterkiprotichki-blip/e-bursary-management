# E2E Bursary Workflow Test Report

- Date: 2026-06-24T21:19:42.356Z
- Backend Base URL: http://localhost:3400/api

## Accounts Used
- Main Portal Admin: superadmin@e-bursary.co.ke
- Applicant Portal User: kiprotichkirui301@gmail.com

## Step 1: Applicant Portal Login and Submit Application
- Applicant login: PASS
- Application draft saved: PASS
- Application submit API: PASS
- Submitted stage: submitted

## Step 2: Main Portal Login and Fetch Applications
- Admin login: PASS
- Applications fetched: PASS (1 records)
- Target application ID: 6a3c3ca16e9d08443a39d23f
- Target initial stage: submitted

## Step 3: Stage Transition Verification and Applicant Sync
- Main stage -> in_review: PASS
- Applicant stage reflects in_review: PASS
- Main stage -> awarded: PASS
- Applicant stage reflects awarded: PASS
- Main stage -> rejected: PASS
- Applicant stage reflects rejected: PASS
- Main stage -> submitted: PASS
- Applicant stage reflects submitted: PASS

## Step 4: Dashboard and Summary Evidence
- Dashboard applicants total: 1
- Dashboard submitted count: 1
- Dashboard inReview count: 0
- Dashboard awarded count: 0
- Dashboard rejected count: 0

## Result
- Overall: PASS
- Notes: Stage updates from main bursary endpoints synchronized to applicant portal application/status data in each tested transition.