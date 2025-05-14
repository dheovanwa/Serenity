import logo from "../assets/LogoIconWhite.png";
import Instagram from "../assets/instagram.png";
import Whatsapp from "../assets/whatsapp.png";
import email from "../assets/email.png";
import { CarouselDemo } from "../components/RecommendedPsychiatrist";
import backgroundImage from "../assets/Master Background11.png";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  return (
    <div
      className="min-h-screen w-full bg-cover flex flex-col overflow-auto"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <header className="bg-black/20 flex items-center justify-between px-4 py-2 shadow-md sticky">
        {/* Logo Kiri */}
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-8 w-8" />
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/signin">
            <button className="font-semibold text-white px-4 py-2 hover:text-gray-200 hover:cursor-pointer transition duration-105">
              Login
            </button>
          </Link>
          <Link to="/signup">
            <button className="font-semibold text-white px-4 py-2 hover:text-gray-200 hover:cursor-pointer transition duration-150">
              Register
            </button>
          </Link>
        </div>
      </header>

      <div className="flex justify-center items-center mt-40 font-krub">
        <h1 className="text-white text-8xl font-bold text-center leading-snug">
          Welcome to
          <br /> <span>Serenity</span>
        </h1>
      </div>

      <div className="mt-90 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-3xl">
          <h1
            className="text-white text-6xl font-bold text-center"
            style={{ textShadow: "0px 2px 2px rgba(0, 0, 0, 0.25)" }}
          >
            What is Serenity?
          </h1>
          <p
            className="text-white text-3xl font-semibold mt-6"
            style={{ textShadow: "0px 2px 2px rgba(0, 0, 0, 0.25)" }}
          >
            Serenity is a mental health platform that helps users assess stress
            levels, consult a psychologist, and get emergency help if needed.
            Key features include a stress survey, online consultation,
            psychologist search as per preference, as well as a panic button for
            emergencies.
          </p>
        </div>
      </div>

      <div className="py-10 px-6">
        <h2
          className="text-6xl text-center font-semibold text-white mb-8"
          style={{ textShadow: "2px 2px rgba(0, 0, 0, 0.25)" }}
        >
          Our Features
        </h2>

        <div className="grid grid-cols-3 gap-6 py-6 px-4">
          {/* Feature 1 */}
          <div className="bg-blue-300 p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">
              <img
                src="/path/to/your/icon1.png"
                alt="Personalized Statistics"
                className="w-12 h-12 mx-auto"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Personalized Statistics
            </h3>
            <ul className="text-left text-white list-disc ml-5 font-semibold">
              <li>
                Users can fill in a series of multiple choice questions to
                measure their stress levels.
              </li>
              <li>
                Answers will be processed to calculate and display a stress
                score.
              </li>
              <li>
                The survey results are saved to display statistical data on the
                Home Page.
              </li>
            </ul>
          </div>
          {/* Feature 2 */}
          <div className="bg-blue-300 p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">
              <img
                src="/path/to/your/icon2.png"
                alt="Find Psychologists"
                className="w-12 h-12 mx-auto"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Find Psychologists
            </h3>
            <p className="text-left text-white font-semibold">
              The search bar allows users to search for psychologists by rating
              and specialization, making it easier to find professionals that
              suit their needs, such as anxiety, depression, or relationship
              issues.
            </p>
          </div>
          {/* Feature 3 */}
          <div className="bg-blue-300 p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">
              <img
                src="/path/to/your/icon3.png"
                alt="Real Time Communication"
                className="w-12 h-12 mx-auto"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Real Time Communication
            </h3>
            <ul className="text-left text-white list-disc ml-5 font-semibold">
              <li>
                Users can chat via chat box and make video calls with
                psychologists.
              </li>
              <li>
                An emergency button is available to instantly connect with the
                psychologist once consulted.
              </li>
            </ul>
          </div>
          {/* Feature 4 */}
          <div className="bg-blue-300 p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">
              <img
                src="/path/to/your/icon4.png"
                alt="Panic Button"
                className="w-12 h-12 mx-auto"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Panic Button</h3>
            <p className="text-left text-white font-semibold">
              Allows users to send emergency messages instantly to their loved
              ones and selected psychologists, as a form of rapid response when
              in crisis or in need of immediate assistance.
            </p>
          </div>
          {/* Feature 5 */}
          <div className="bg-blue-300 p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">
              <img
                src="/path/to/your/icon4.png"
                alt="Customer Service & Support"
                className="w-12 h-12 mx-auto"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Customer Service & Support
            </h3>
            <ul className="text-left text-white list-disc ml-5 font-semibold">
              <li>
                Allows users to send emergency messages instantly to their loved
                ones and selected psychologists.
              </li>
              <li>
                A form of rapid response when in crisis or in need of immediate
                assistance.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recommended Psychiatrists */}
      <div className="mt-30 ml-6 sm:ml-15">
        <h1
          className="text-5xl text-white font-semibold mb-10"
          style={{ textShadow: "0px 2px 2px rgba(0, 0, 0, 0.25)" }}
        >
          Recommended Psychiatrists
        </h1>
        <div className="flex justify-center items-center mb-10">
          {/* Ensure the carousel container is responsive */}
          <div className="w-full" style={{ maxWidth: "1200px" }}>
            <CarouselDemo />
          </div>
        </div>
      </div>

      <footer className="bg-[#453A2F] text-white pt-5">
        <div className="mx-auto ml-20 mr-20 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Left Section: Website Name and Social Links */}
            <div className="text-left">
              <h2 className="text-5xl font-bold mb-6">Serenity</h2>
              <ul className="flex flex-col space-y-6">
                <li className="flex items-center space-x-4">
                  <img src={Instagram} alt="Instagram" className="w-10 h-10" />
                  <span>@mentalhealth.id</span>
                </li>
                <li className="flex items-center space-x-4">
                  <img src={Whatsapp} alt="Whatsapp" className="w-10 h-10" />
                  <span>+628529320581</span>
                </li>
                <li className="flex items-center space-x-4">
                  <img src={email} alt="email" className="w-10 h-10" />
                  <span>mentalhealth@serenity.co.id</span>
                </li>
              </ul>
            </div>

            {/* Middle Section: Consumer Complaints Service */}
            <div className="">
              <h3 className="text-3xl font-semibold mb-4">
                Consumer Complaints Service
              </h3>
              <p className="text-sm">
                PT Mental Health Corp <br />
                Jl. Raya Kb. Jeruk No.27, RT.1/RW.9, Kemanggisan, Kec. Palmerah,
                Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11530
              </p>
            </div>

            {/* Right Section: Site Map */}
            <div className="text-right">
              <h3 className="text-3xl font-semibold mb-4">Site Map</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2">
                <li>
                  <a href="#" className="hover:opacity-75">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Terms & Condition
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Media
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Partnership
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Promotions
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Bottom Section: Copyright */}
        <div className="mt-16 text-center bg-[#525252] py-2">
          <p className="text-sm font-bold">
            Â© 2024 - 2025 Mental Health J&D Sp. co.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
