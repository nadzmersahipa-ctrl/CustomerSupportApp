# Customer Support App

## Project Description

The Customer Support App allows users to submit support requests by entering their name, email address, issue category, and message. Users can also select and upload screenshots using Cloudinary. EmailJS is used to send customer support messages through email.

## Project Members

- Sahipa, Nadzmer D.
- Kish Damienne Faustino

## Technologies Used

- React Native
- Expo
- Cloudinary
- EmailJS
- TypeScript

## Installation Instructions

1. Clone the GitHub repository.
2. Open the project folder in VS Code.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the project root and configure the required environment variables.

## How to Run the Application

Start Expo:

```bash
npx expo start
```

For web testing:

```bash
npx expo start --web
```

## Required Environment Variables

Configure the following variables in your `.env` file:

```env
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
EXPO_PUBLIC_EMAILJS_SERVICE_ID=
EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=
EXPO_PUBLIC_EMAILJS_PUBLIC_KEY=
```

## Security Notice

Do not upload the actual `.env` file or expose credentials in the GitHub repository or demonstration video.

Make sure `.env` is included in `.gitignore`.

## GitHub Repository

[CustomerSupportApp](https://github.com/nadzmersahipa-ctrl/CustomerSupportApp)

## Partner Contribution

**Kish Damienne Faustino**

Contribution: Project documentation and application development.

**Sahipa, Nadzmer D.**

Contribution: Application development, system integration, Cloudinary and EmailJS configuration, testing, and video demonstration.