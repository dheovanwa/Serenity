import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2f2b28] text-white py-16">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left Section: Website Name and Social Links */}
          <div>
            <h2 className="text-4xl font-bold mb-4">Serenity</h2>
            <div className="flex space-x-6">
              <a
                href="https://www.instagram.com/mentalhealthid"
                className="hover:opacity-75"
              >
                Instagram
              </a>
              <a href="tel:+6285232020581" className="hover:opacity-75">
                +62 852-3202-0581
              </a>
              <a
                href="mailto:mentalhealth@serenity.co.id"
                className="hover:opacity-75"
              >
                mentalhealth@serenity.co.id
              </a>
            </div>
          </div>

          {/* Middle Section: Consumer Complaints Service */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Consumer Complaints Service
            </h3>
            <p className="text-sm">
              PT Mental Health Corp <br />
              Jl. Raya Pantai No. 17, Kuningan, <br />
              Jakarta Selatan 12345, Indonesia.
            </p>
          </div>

          {/* Right Section: Site Map */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Site Map</h3>
            <ul className="space-y-2 text-sm">
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

        {/* Bottom Section: Copyright */}
        <div className="mt-16 text-center">
          <p className="text-sm">© 2024 - 2025 Mental Health J&D Sp. co.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
