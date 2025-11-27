import BackgroundImage from "@/src/components/home/BackgroundImage";
import ExampleGenerations from "@/src/components/home/ExampleGenerations";
import HeroText from "@/src/components/home/HeroText";
import InputBox from "@/src/components/inputBox/InputBox";
import { ConversationType } from "@/src/types/BaseType";

const Page = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-between overflow-x-hidden bg-black">
        {/* Background Image */}
        <BackgroundImage
          className="mt-48"
          src="https://i.pinimg.com/736x/af/4a/4f/af4a4f086d3acdb0e40a7c88554d5fcf.jpg"
          width={600}
          height={600}
          rotation={10}
        />

        {/* Hero Section */}
        <div className="z-10 my-8 mt-32 flex flex-col items-center justify-center">
          <HeroText />

          <div className="w-full px-4 md:px-0">
            <InputBox />
          </div>
        </div>

        <ExampleGenerations
          limit={8}
          showcaseFor={ConversationType.GENERATE}
          className="!mt-44 origin-bottom scale-95 !pb-0 md:scale-100"
        />
      </div>
    </section>
  );
};

export default Page;
