Week 2: ASK THE HUMAN

Overview
This project is a Pi extension that allows an AI agent to ask a human for guidance when an
important decision is unclear. Instead of making assumptions, the agent can ask a question,
provide context and opinions and wait for the user's response.

Implementation
We created an ask_user tool using TypeScript and Pi's extension API.
The tool:
-Shows the question and explains why decision is needed.
-Provides two or three options and an optional recommendation.
-Allows the user to select an option or enter a custom answer.
-Returns the selected answer to the agent.
-Handles cancelled questions or unavailable UI without making up an answer.
We also added instructions to help Pi understand when it should ask the human instead of
deciding independently.

Multi-Agent Workflow
We used Herdr to coordinate three Pi agents:
-Orchestrator: Helped coordinate the implementation and identify what needed to be done.
-Implementation worker: Updated the TypeScript code, fixed errors and added tests.
-Independent Reviewer: Checked the implementation, identified problems and suggested improvements.
The worker and reviewer had separate responsibilities, which helped me identify and fix issues without changing the original Homework 1 implementation.

Running the Extension
From the project directory, run:
npm install
pi --extension ./ask_the_human/index.ts
Then ask Pi to ask_user for an important decision.

Testing
I tested the extension using:
npm test
npm run typecheck

All 22 tests passed and the Github Actions workflow completed successfully.

We also tested the extension inside Pi. It displayed a question about choosing a project color, showed Blue and Green as options and returned Green after we selected it.

Result
The extension can ask for human input and use the response to continue. It also avoids treating a cancelled or unavailable interaction as an actual answer.
