<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="./src/assets/logo_full.png">
    <img src="./src/assets/logo_full.png" alt="Logo"  height="80">
  </a>

  <br/>
  <!-- <h3 align="center">Serenity</h3> -->

[![MiT License][license-shield]][license-url]

  <p align="center">
    Mental health web application that facilitates the user and psychologists
    <br />
    <a href="https://github.com/dheovanwa/Serenity"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/dheovanwa/Serenity/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/dheovanwa/Serenity/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
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
        <li><a href="#running-locally">Running Locally</a></li>
        <li><a href="#login-to-psychologist-account">Login to Psychologist Account</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

Many individuals, especially the younger generation, are increasingly vulnerable to mental disorders due to social and academic pressures and excessive use of social media, but often find it difficult to obtain easily accessible and affordable psychological support. With Serenity, we aim to simplify the process of making an appointment with psychologists by accomodating online meeting. We provide an affordable and easy to use features for the user to use. These are the names who built this:

1. [Dheovan Winata Alvian](https://www.linkedin.com/in/dheovan-wa/)
2. [Jefferson Darren Cendres](https://www.linkedin.com/in/jeff-darren-9bb5ba292/)
3. [Jonathan Hopi Pranata](https://www.linkedin.com/in/jonathan-hopi-pranata/)
4. [Yohanes Wenanta](https://www.linkedin.com/in/yohanes-wenanta-2965a01ba/)

Serenity provides a secure and intuitive online platform where users can connect with mental health professionals from the comfort of their own homes. Our comprehensive suite of features ensures a seamless and effective experience:

- Video Call: Engage in face-to-face consultations with psychologists through our high-quality, encrypted video call feature, fostering a personal and confidential therapeutic environment.
- Chat: For those who prefer written communication or need quick advice, our integrated chat system allows for real-time text-based interactions with their chosen psychologist.
- Forum Discussion: Connect with a supportive community of users in our moderated forum discussions. Share experiences, gain insights, and find encouragement in a safe and understanding space.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

Serenity is built upon a foundation of modern technologies to ensure optimal performance and a seamless user experience. For front-end development, we leverage React TS (React with TypeScript). This combines the power of React for building dynamic and interactive user interfaces with the type-safety provided by TypeScript, resulting in more robust and maintainable code. The application's visual appeal and responsive design are crafted using Tailwind CSS, a utility-first CSS framework that enables rapid and highly customizable styling directly within the HTML.

On the back-end, Serenity is powered by Node.js, an efficient and scalable JavaScript runtime. This allows us to build fast and responsive APIs to manage all business logic (mainly for payment gateway). For our database and various other back-end services, we rely on Firebase, Google's comprehensive application development platform. Firebase provides solutions for real-time databases (like Cloud Firestore or Realtime Database), authentication, hosting, and much more, accelerating development and ensuring a reliable infrastructure. The entire stack, encompassing both front-end and back-end, is developed with TypeScript to enhance code quality, reduce bugs, and facilitate seamless team collaboration.

- ![Typescript][typescript-shield]
- ![ReactTs][reactts-shield]
- ![Tailwind CSS][tailwindcss-shield]
- ![Firebase][firebase-shield]
- ![Node JS][nodejs-shield]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

You can access deployed version of Serenity on https://serenity-646e2.web.app or if you prefer to run it locally, you may use the following instructions.

### Running locally

You must have these software on your system to run the website locally:

- Node JS
- Typescript
- React
- Tailwind CSS
- Vite (optional but recommended)
- Visual Studio Code (optional but recommended)

```term
git clone https://github.com/dheovanwa/Serenity
cd Serenity/
npm run dev
```

### Login to Psychologist Account

If you want to test the features completely, then you need to login to a psychologist account. The email template is `[firstname].[lastname]@serenity.com` and the password is the same for all account which is `12345678`. The `firstname` and `lastname` need to correspond to the designated psychologist account you want to login. Example, if you want to login to Maya Wulandari account then her email is `maya.wulandari@serenity.com` and her password is `12345678`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Dheovan Winata Alvian - [@dheovan.w.a](https://www.instagram.com/dheovan.w.a/) - dheovanwa@gmail.com

Project Link: [https://github.com/dheovanwa/Serenity](https://github.com/dheovanwa/Serenity)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

[license-shield]: https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge
[license-url]: https://github.com/dheovanwa/Serenity/blob/main/LICENSE
[reactts-shield]: https://img.shields.io/badge/-React%20TS-61DAFB?logo=react&logoColor=white&style=for-the-badge
[tailwindcss-shield]: https://img.shields.io/badge/Tailwind_CSS-grey?style=for-the-badge&logo=tailwind-css&logoColor=38B2AC
[typescript-shield]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[firebase-shield]: https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black
[nodejs-shield]: https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white
