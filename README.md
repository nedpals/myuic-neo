<div align="center">
  <p><img src="./public/icons/icon-192x192.png" /></p>
  <h1>MyUIC Neo</h1>
  <p>A new student portal concept for UICians in the 21st century</p>
  <p><img src="https://pbs.twimg.com/media/FO8ZdXvUYAEpgGu?format=jpg&name=large" /></p>

[Demo](https://myuic.nedpals.xyz) |
[Twitter Thread](https://twitter.com/npned/status/1508455998234587140?s=20&t=_ApTg0r4DMKFbSM8QWeqnA) |
[Feedback Form](https://forms.gle/XnE2XuEGi9FdcYt5A)
</div>

## Description
MyUIC Neo is a Single-Page Application (SPA) and a Progressive Web App (PWA) version of MyUIC, a student portal website by the [University of the Immaculate Conception](https://uic.edu.ph). Not only it improves the user interface and user experience but it also provides additional features that fully utilizes different types of information only few can access prior to it.

Thanks to [CapacitorJS](https://capacitorjs.com), it is also an Android app providing another set of features that cannot be achieved with just the web app.

## Prerequisites
### Web
- Node 16 or later

### Android
> Android compilation is optional but is required if you want to compile it as an Android app.
- Android SDK (30 and above)

## Installation
To run the web app, try the following command:

### npm
```
npm 
npm run dev
```

### yarn
```
yarn
yarn dev
```
This will start the Vite webserver at http://localhost:3000. You may login by typing `123456789012` as the student ID and `myuicneo` as the password.

## Connecting to the real API
By default, the web server will load the mock server. The mock server is a fake "server" that emulates the real API for development and in order to avoid unnecessary load to the real server when trying out for the first time.

To use the real API, simply create an `.env` file and copy the following:
```
VITE_API_URL=https://pinkschool-api.herokuapp.com
```

Paste the contents to `.env` file and restart the web server.

## Contributing
1. Fork it (<https://github.com/nedpals/myuic-neo/fork>)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

## License
[AGPL v3](LICENSE)

## Contributors
- [Ned Palacios](https://github.com/nedpals) - creator and maintainer