import { useState, useEffect } from "react";
import AuthLayout from "./AuthLayout";
import { motion } from "framer-motion";
import mailClosed from "../assets/mailClosed.png";
import mailOpen from "../assets/mailOpen.png";

const VerifyEmail = () => {
  const [isMailOpened, setIsMailOpened] = useState(true);
  const [startBounce, setStartBounce] = useState(false);

  useEffect(() => {
    const rotationTimer = setTimeout(() => {
      setStartBounce(true);
    }, 1600); // Start bouncing after rotation ends

    const finalTimer = setTimeout(() => {
      setIsMailOpened(false);
    }, 2600); // Change to mailClosed after full animation

    return () => {
      clearTimeout(rotationTimer);
      clearTimeout(finalTimer);
    };
  }, []);

  return (
    <AuthLayout>
      <div className="absolute bottom-50 flex flex-col items-center justify-center h-screen text-white px-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-center">
          Email Verification Sent
        </h2>

        <motion.div
          className="bg-white"
          style={{ height: "4px" }}
          initial={{ width: 0 }}
          animate={{ width: "20rem" }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        <motion.img
          src={isMailOpened ? mailOpen : mailClosed}
          alt="Email Icon"
          className="mt-8"
          initial={{ rotate: 0, y: 0 }}
          animate={
            startBounce
              ? { y: [0, 10, -20, 0] } // Single bounce (down 10px, up 20px)
              : { rotate: [0, -45, 45, 0] } // Rotation first
          }
          transition={{
            duration: startBounce ? 1.2 : 1.6, // Adjusted bounce timing
            ease: "easeInOut",
            times: [0, 0.3, 0.6, 1], // Controlled smooth bounce
          }}
          style={{ width: "5rem", height: "5rem" }}
        />

        <p className="font-bold text-center max-w-md text-sm sm:text-base mt-4">
          We have sent a verification email to [user's email address].
        </p>
        <p className="font-bold text-center text-sm sm:text-base">
          Please check your inbox and follow the instructions to verify your
          account.
        </p>

        <motion.div
          className="bg-white mt-4"
          style={{ height: "4px" }}
          initial={{ width: 0 }}
          animate={{ width: "35rem" }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <button className="mb-20 font-bold text-white underline text-[16px]">
        Go to Home!
      </button>
    </AuthLayout>
  );
};

export default VerifyEmail;
