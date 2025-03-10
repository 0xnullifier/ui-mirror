'use client';
import { useState } from "react";
import { Button } from "@/components/button";
import { Footer } from "@/components/footer";
import { Input } from "@/components/input";
import { Label } from "@radix-ui/react-label";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { SEND_OTP_URL, VERIFY_OTP_URL } from "@/lib/endpoint";

const LoadingScreen = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center h-screen w-1/2 bg-white"
  >
    <p className="text-2xl font-bold text-orange-mina">Verifying credentials...</p>
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        repeat: Infinity,
        repeatType: "reverse",
        duration: 1,
      }}
      className="w-10 h-10 mt-4 bg-orange-mina rounded-full"
    />
  </motion.div>
);

const custodians = [
  { name: "Custodian A", logo: "/assets/mexc.svg" },
  { name: "Custodian B", logo: "/assets/binance.svg" },
];

export default function Login() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [selectedCustodians, setSelectedCustodians] = useState<string[]>([]);

  const sendOtp = async () => {
    console.log("Sending OTP to:", email);
    if (!otpSent) {
      try {
        console.log(SEND_OTP_URL)
        const response = await axios.post(SEND_OTP_URL, {
          email
        })
        if (response.data.success) {
          setOtpSent(true);
          alert("OTP sent to your email");
        }
      } catch (error) {
        console.error("Error sending OTP:", error);
      }
    } else {
      //verify OTP
      try {
        const response = await axios.post(VERIFY_OTP_URL, {
          email,
          otp
        });
        console.log(response.data)
        if (response.data.success) {
          setStep(2);
        } else {
          alert("Invalid OTP");
        }
      } catch (error) {
        console.error("Error verifying OTP:", error);
      }
    }
  }

  const handleCustodianSelect = (name: string) => {
    setSelectedCustodians((prev) =>
      prev.includes(name)
        ? prev.filter((custodian) => custodian !== name)
        : [...prev, name]
    );
  };

  const handleProceed = () => {

  };

  return (
    <div className="flex w-full h-screen">
      <AnimatePresence>
        {loading && <LoadingScreen />}
      </AnimatePresence>

      {!loading && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-between items-center h-full w-1/2"
        >
          <div className="flex flex-col justify-center items-center flex-grow">
            {step === 1 && (
              <div className="flex flex-col items-center justify-center gap-5 w-fit">
                <div className="flex flex-col justify-start items-start">
                  <p className="text-5xl text-orange-mina">Login</p>
                </div>
                <div className="flex flex-col w-full gap-5 px-2 py-4">
                  <div className="w-full">
                    <Label htmlFor="email">Email</Label>
                    <Input placeholder="Your Email Address" id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="w-full flex items-center gap-2">
                    <Label htmlFor="otp">OTP</Label>
                    <Input placeholder="Enter OTP" id="otp" name="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />
                    <Button
                      className="bg-orange-mina font-semi-bold rounded-2xl"
                      variant="secondary"
                      disabled={!email}
                      onClick={sendOtp}
                    >
                      {!otpSent ? "Send OTP" : "Verify OTP"}
                    </Button>
                  </div>
                </div>
                <Button className="bg-orange-mina w-[98%] font-semi-bold rounded-2xl" variant="secondary">
                  Sign In
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col items-center justify-center gap-5 w-fit">
                <div className="flex flex-col justify-start items-start">
                  <p className="text-5xl text-orange-mina">Select Custodians</p>
                  <p className="font-bold text-[#A0AEC0] px-2">Choose custodians to proceed</p>
                </div>

                <div className="flex flex-wrap gap-4">
                  {custodians.map((custodian) => (
                    <div
                      key={custodian.name}
                      className={`p-4 border rounded-lg cursor-pointer ${selectedCustodians.includes(custodian.name)
                        ? "border-orange-mina"
                        : "border-gray-300"
                        }`}
                      onClick={() => handleCustodianSelect(custodian.name)}
                    >
                      <img
                        src={custodian.logo}
                        alt={custodian.name}
                        className="w-16 h-16 object-contain"
                      />
                      <p className="mt-2 text-center">{custodian.name}</p>
                    </div>
                  ))}
                </div>
                <Button
                  className="bg-orange-mina w-[98%] font-semi-bold rounded-2xl mt-4"
                  variant="secondary"
                  onClick={handleProceed}
                >
                  Proceed
                </Button>
              </div>
            )}
          </div>
          <Footer />
        </motion.div>
      )}

      <div className="w-1/2">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: "url('/assets/side-bg.svg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />
      </div>
    </div>
  );
}
