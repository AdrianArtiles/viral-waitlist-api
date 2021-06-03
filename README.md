<!-- PROJECT LOGO -->
<p align="center">
  <h3 align="center">Viral Waitlist API Service</h3>

  <p align="center">
    A simple GraphQL express API service to build your own headless viral waitlist.
    <br />
    <a href="https://github.com/AdrianArtiles/viral-waitlist-api"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/AdrianArtiles/viral-waitlist-api/issues">Report Bug</a>
    ·
    <a href="https://github.com/AdrianArtiles/viral-waitlist-api/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

I wanted to build a viral waitlist (where people can move up the waitlist by referring other people) for recent project.

I wanted to control the UX and experience, so I needed it as a headless API. There are a number of "viral waitlist as a service" services out there, but only few of them offered APIs, and none of them were good.

So I built my own real quick and this is it.

Through this service's API users can be added to the waitlist (with optional referral ID), confirm email addresses, and get a users position. It also has some common sense stuff like validating email addresses, rate limiting, and disallowing disposable email providers. That's pretty much it.

### Built With

* [Express](https://www.npmjs.com/package/express)
* [Postgres](https://www.postgresql.org/)
* [Typescript](https://www.typescriptlang.org/)
* [TypeORM](https://www.npmjs.com/package/typeorm)
* [GraphQL](https://graphql.org/)
* [Apollo](https://www.npmjs.com/package/apollo-server-express)
* [Nodemailer](https://www.npmjs.com/package/nodemailer)



<!-- GETTING STARTED -->
## Getting Started

It's a single simple express server that uses Postgres for storing user data.

Ratelimiting is just done in memory, you'll want to add Redis if you have multiple servers running.

### Prerequisites

* npm (v6 or greater)
* node (v12 or greater)
* postgres (v12 or greater)

### Installation

1. Fork and clone this repo
2. Install NPM packages
   ```sh
   npm install
   ```
3. Copy `.env.example` to `.env` and update values
4. Create a postgres database (default name is `waitlist_development`)
5. Run npm build (does database migrations, etc.)
   ```sh
   npm run build
   ```
6. Update instances of "example" throughout the codebase with your URL / name (TODO: move this to env var)
7. Run locally
   ```sh
   npm run dev
   ```


<!-- USAGE EXAMPLES -->
## Usage

The service is almost entirely used via the GraphQL API (can add a REST API if there's enough demand). There is a single endpoint at `/confirmEmail` used as a link in welcome emails to confirm their email address.

The GraphQL endpoint is at `/graphql` by default. The mutation `signup` takes the arguments of `email` (and optional `referrerId` which is the ID of the referring user).
This returns the user which includes their position. This mutation is idempotent and can always be used to return a user's position (along with the `user` query).

When a user / email is signed up, they receive an email to confirm their email address. They confirm their email address by clicking on a link which takes them to `/confirmEmail`. Update the link they are emailed to your instance URL in `src/libraries/nodemailer.ts`.
(TODO: update this to an env var).

Every 5 minutes all the users positions are updated (by the number of points/referrals they have, then by sign up time).

There is no functionality to remove people from the list or "invite" them. I just did this manually with direct access to the database.

<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/AdrianArtiles/viral-waitlist-api/issues) for a list of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the GNU GPLv3 License. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

Adrian Artiles - [@AdrianArtiles](https://twitter.com/AdrianArtiles)

Project Link: [https://github.com/AdrianArtiles/viral-waitlist-api](https://github.com/AdrianArtiles/viral-waitlist-api)
