import { SignUpForm } from "@/src/components/auth/sign-up-form";
import BackgroundImage from "@/src/components/home/BackgroundImage";

export default function Page() {
  return (
    <div className="max-w-screen relative h-screen overflow-hidden">
      <BackgroundImage
        className="left-1/2"
        src="https://i.pinimg.com/1200x/07/5e/f0/075ef08bebfc0ba26559e6013e316847.jpg"
        width={800}
        height={800}
      />
      <SignUpForm />
    </div>
  );
}
