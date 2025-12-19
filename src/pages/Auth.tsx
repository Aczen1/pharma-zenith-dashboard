import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";
import { Package } from "lucide-react";

const Auth = () => {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 sidebar-gradient items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-sidebar-foreground/10 backdrop-blur-sm">
              <Package className="h-10 w-10 text-sidebar-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-sidebar-foreground mb-4">
            Pharma Zenith
          </h1>
          <p className="text-lg text-sidebar-foreground/80">
            Modern pharmaceutical inventory management. Track stock, monitor expiry dates, and optimize your supply chain.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="rounded-xl bg-sidebar-foreground/10 p-4">
              <p className="text-2xl font-bold text-sidebar-foreground">12K+</p>
              <p className="text-sm text-sidebar-foreground/60">Medicines</p>
            </div>
            <div className="rounded-xl bg-sidebar-foreground/10 p-4">
              <p className="text-2xl font-bold text-sidebar-foreground">98%</p>
              <p className="text-sm text-sidebar-foreground/60">Accuracy</p>
            </div>
            <div className="rounded-xl bg-sidebar-foreground/10 p-4">
              <p className="text-2xl font-bold text-sidebar-foreground">24/7</p>
              <p className="text-sm text-sidebar-foreground/60">Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
                <Package className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Pharma Zenith</h1>
          </div>

          {/* Clerk Auth Component */}
          <div className="flex justify-center">
            {mode === "signIn" ? (
              <SignIn
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none border border-border rounded-xl",
                    headerTitle: "text-foreground",
                    headerSubtitle: "text-muted-foreground",
                    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                    formFieldInput: "border-input bg-background",
                    footerActionLink: "text-primary hover:text-primary/80",
                  },
                }}
                routing="hash"
                signUpUrl="#/sign-up"
                afterSignInUrl="/dashboard"
              />
            ) : (
              <SignUp
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none border border-border rounded-xl",
                    headerTitle: "text-foreground",
                    headerSubtitle: "text-muted-foreground",
                    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                    formFieldInput: "border-input bg-background",
                    footerActionLink: "text-primary hover:text-primary/80",
                  },
                }}
                routing="hash"
                signInUrl="#/sign-in"
                afterSignUpUrl="/dashboard"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
