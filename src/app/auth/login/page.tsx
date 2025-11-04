import { LoginForm } from "@/src/components/auth/login-form";
import BackgroundImage from "@/src/components/home/BackgroundImage";

export default function Page() {
  return (
    <div className="max-w-screen relative h-screen overflow-hidden">
      <BackgroundImage
        className="left-1/2"
        src="https://i.pinimg.com/736x/98/9c/d6/989cd659a29fe7c9a1d3e189fb69f290.jpg"
        width={800}
        height={800}
      />
      <LoginForm />
    </div>
  );
}
