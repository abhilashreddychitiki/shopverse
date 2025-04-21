"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

interface GoogleSignInButtonProps {
  callbackUrl?: string;
}

const GoogleSignInButton = ({ callbackUrl = "/" }: GoogleSignInButtonProps) => {
  const handleClick = async () => {
    await signIn("google", { callbackUrl });
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
    >
      <FcGoogle className="h-5 w-5" />
      <span>Sign in with Google</span>
    </Button>
  );
};

export default GoogleSignInButton;
