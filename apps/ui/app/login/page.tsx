'use client';

import { Button } from "@/components/button";
import { Footer } from "@/components/footer";
import { Input } from "@/components/input";
import { Label } from "@radix-ui/react-label";

export default function Login() {
  return (
    <div className="flex w-full">
      <div className="flex flex-col justify-center items-center h-screen w-1/2">
        <div className="flex flex-col items-center justify-center h-screen gap-5 w-fit">
          <div className="flex flex-col justify-start items-start">
            <p className="text-5xl text-orange-mina">
              To Continue...
            </p>
            <p className="font-bold text-[#A0AEC0] px-2">Provide the credentials given by the Exchange</p>
          </div>
          <div className="flex flex-col w-full gap-5 px-2 py-4">
            <div className="w-full">
              <Label htmlFor="account-id"> AccountId </Label>
              <Input placeholder="Your exchange Account Id" id="accound-id" name="account-id" />
            </div>
            <div className="w-full">
              <Label htmlFor="account-id">Password</Label>
              <Input placeholder="Your Password" id="accound-id" name="account-id" type="password" />
            </div>
          </div>
          <Button className="bg-orange-mina w-[98%] font-semi-bold rounded-2xl" variant="secondary">Sign In</Button>
        </div>

        <Footer />
      </div>
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
