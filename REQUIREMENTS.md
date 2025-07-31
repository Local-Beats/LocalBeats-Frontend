# 🗳️ Capstone I: Project Requirements

## Learning Goals

This project is designed to reinforce fullstack web development concepts we've learned so far, including React, React-Router, Network Requests, Express, Sequelize / PostgreSQL, Deployment, Authentication / Authorization, and more.

You will also be working with a team over several weeks. This project is more ambitious than the CRUD app you built earlier, meaning you'll have to spend more time discussing the architecture of your application and how to prioritize and assign tasks. Collaboration is the _primary learning obective_ of this project.

## Overview

You'll be building a ranked choice poll app. Our market research tells us that users frequently want to poll their coworkers or friend groups to compare different options (e.g. where should we get catering from for our company retreat?). Simply asking people "what option do you like best?" doesn't actually capture their true preferences. Instead, we want users to be able to rank the available options, and a winner will be decided accordingly. Applications like Poll Everywhere, Typeform, and Google Forms are popular, but don't currently meet this need.

Users should be able to create a poll, listing several options. Once they're satisfied, they can "publish" the poll, generating a link. Once published, the poll can no longer be modified. They can share the link and respondents can rank their options from first to last, according to their preferences. When the poll is closed, the results are tallied and displayed in a nice-looking bar chart.

## Requirements

### Basic

- [x] User can log in & signup with an email and password
- [ ] User can log in & signup with an OAuth provider
- [ ] Users have first name, last name, email, and profile picture
- [ ] Users can view a list of polls they've created (draft, published, ended)
- [ ] The application is deployed

### Poll Creation

- [ ] User can create a new poll with a title and description
- [ ] User can toggle whether or not to allow unauthenticated users to vote
- [ ] User can add multiple poll options (minimum 2)
- [ ] User can edit poll details while in draft status
- [ ] User can delete poll options
- [ ] User can set poll end date/time
  - (Optional: if no end date present, the poll must be manually closed)
- [ ] User can publish a poll (changes status from draft to published)
- [ ] Published polls cannot be modified
- [ ] User can duplicate an existing poll to create a new one
- [ ] User can delete a draft poll
- [ ] Optionally, the poll is only accessible to a predetermined list of users

### Voting

- [ ] Anyone with the poll link can access a published poll
- [ ] Voters can see poll title, description, and all options
- [ ] Voters can rank all options from 1st choice to last choice
- [ ] Voters cannot submit duplicate rankings
- [ ] Voters receive a warning message if they try to submit without ranking all choices, but they may submit regardless
- [ ] Authenticated voters can save their ballot for later submission
- [ ] Voters receive confirmation after successful submission
- [ ] Voters cannot vote multiple times on the same poll
  - Unless the poll is open to unauthenticated users, in which case there's no way to prevent it
- [ ] Voters can see how many people have voted so far
- [ ] Voters can see the poll end date/time

### Results

- [ ] Once closed, the poll no longer accepts new ballot submissions.
- [ ] Results are only shown after poll end date/time
- [ ] Results show final rankings using ranked choice voting algorithm
  - See this [Wikipedia article about Instant-Runoff Voting](https://en.wikipedia.org/wiki/Instant-runoff_voting)
- [ ] Results display in a bar chart format
- [ ] Results show vote distribution for each round of elimination
- [ ] Results show the winning option clearly highlighted
- [ ] Results show total number of votes cast
- [ ] Results show percentage breakdown of final votes
- [ ] Results are accessible to anyone with the poll link
- [ ] Results page shows poll title and description
- [ ] Users can view polls they've voted in previously
- [ ] Users who voted receive an email update with a link to the results

### Admin Users

- [ ] Admins can view a paginated list of users with a search bar to filter results
- [ ] Admins can disable a poll, preventing further edits or ballot submissinos
- [ ] Admins can disable a user account

### Miscellaneous

- [ ] The UI should be mobile-friendly
- [ ] User-friendly error messages
- [ ] Success notifications for key actions
- [ ] Forms display validation errors before submission
- [ ] Poll links are shareable via social media
- [ ] Poll links can be copied to clipboard
- [ ] Polls have various "share on social media" buttons
- [ ] Search and filter functionality for user's poll list
