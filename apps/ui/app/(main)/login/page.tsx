'use client';
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { Footer } from "@/components/footer";
import { Input } from "@/components/input";
import { Label } from "@radix-ui/react-label";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { CUSTODIAN_USER_VERIFICATION_URL, GET_CUSTODIANS_URL, SEND_OTP_URL, VERIFY_OTP_URL } from "@/lib/endpoint";
import useStore from "@/lib/store";
import { useToast } from "@/lib/hooks/useToast";
import { useRouter } from "next/navigation";

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


interface Custodian {
  name: string;
  logo: string;
  backendurl: string;
}

export default function Login() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [selectedCustodians, setSelectedCustodians] = useState<Custodian[]>([]);
  const { custodians, setCustodians } = useStore()

  const { toast } = useToast()
  const router = useRouter()

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
          toast({
            title: "OTP Sent",
            description: "An OTP has been sent to your email address.",
            variant: "success"
          });
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
        }, {
          withCredentials: true
        });
        console.log(response.data)
        if (response.data.success) {
          setStep(2);
        } else {
          toast({
            title: "Invalid OTP",
            description: "The OTP you entered is invalid. Please try again.",
            variant: "error"
          });
        }
      } catch (error) {
        console.error("Error verifying OTP:", error);
      }
    }
  }

  const handleCustodianSelect = (index: number) => {
    setSelectedCustodians((prev) =>
      prev.includes(custodians[index])
        ? prev.filter((custodian) => custodian !== custodians[index])
        : [...prev, custodians[index]]
    );
  };

  const handleProceed = () => {
    console.log("hello")
    // setLoading(true)
    // selectedCustodians.forEach(async (custodian) => {
    //   const response = await axios.get(CUSTODIAN_USER_VERIFICATION_URL(custodian.backendurl, email))
    //   console.log(response.data)
    //   if (response.data.found) {
    //     // set the custodian verification status in local storage
    //     // we do not send user details anywhere else
    //     localStorage.setItem(custodian.name, JSON.stringify(true))
    //   } else {
    //     alert("User not found")
    //   }
    // })
    // setLoading(false)
    router.push(`/user/dashboard`)
  };

  // load the custodians from the backend
  useEffect(() => {
    const fetchCustodians = async () => {
      const newCustodians = await axios.get(GET_CUSTODIANS_URL)
      setCustodians(newCustodians.data.exchanges)
    }
    fetchCustodians()
  }, [])

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
                  {custodians.map((custodian, index) => (
                    <div
                      key={custodian.name}
                      className={`p-4 border rounded-lg cursor-pointer ${selectedCustodians.includes(custodian)
                        ? "border-orange-mina"
                        : "border-gray-300"
                        }`}
                      onClick={() => handleCustodianSelect(index)}
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
