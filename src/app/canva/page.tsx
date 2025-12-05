'use client';
import CanvaEditorClient from "@/src/components/canva/CanvaEditorClient";
import InputBox from "@/src/components/inputBox/InputBox";

const Page = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-between overflow-x-hidden bg-black">
      <CanvaEditorClient  />

        {/* Hero Section */}
        <div className="z-10 my-8 mt-32 flex flex-col items-center justify-center">
          

          <div className="w-full px-4 md:px-0">
            <InputBox />
          </div>
        </div>

        
      </div>
    </section>
  );
};

export default Page;
