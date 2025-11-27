import { SignUpForm } from "@/src/components/auth/sign-up-form";
import BackgroundImage from "@/src/components/home/BackgroundImage";

export default function Page() {
  return (
    <div className="max-w-screen relative h-screen overflow-hidden">
      <BackgroundImage
        className="left-1/2 hidden md:block"
        src="https://i.pinimg.com/1200x/07/5e/f0/075ef08bebfc0ba26559e6013e316847.jpg"
        width={800}
        height={800}
      />
      <img
        alt="bg"
        src="https://i.pinimg.com/736x/d8/d5/2d/d8d52df12700539c54ee365507d3233d.jpg"
        className="absolute inset-0 size-full object-cover md:hidden"
      />
      <SignUpForm />
    </div>
  );
}
