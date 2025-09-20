import ContactUs from "../../components/landing/ContactUs";
import EditBranding from "../../components/landing/EditBranding";
import EditSection from "../../components/landing/EditSection";
import EditShowcase from "../../components/landing/EditShowcase";
import EndSection from "../../components/landing/EndSection";
import Hero from "../../components/landing/Hero";
import PrivacySection from "../../components/landing/PrivacySection";
import Takecontrol from "../../components/landing/Takecontrol";
import UpscaleSection from "../../components/landing/UpscaleSection";
import { RaycastComponent } from "../../components/ui/RaycastBackground";

const page = () => {
  return (
    <main>
      <div className="relative smooth-scroll overflow-hidden">
        <Hero />
        <div className="relative">
          <div className="w-screen h-56 bg-gradient-to-t from-black to-transparent z-10"></div>
          <RaycastComponent />
          <div className="w-screen h-56 bg-gradient-to-t from-[#0a0b08] to-black z-10"></div>
        </div>
        <PrivacySection />
        <EditSection />
        <EditBranding />
        <EditShowcase />
        <Takecontrol />
        <UpscaleSection />
        <ContactUs />
        <EndSection />
      </div>
    </main>
  );
};

export default page;
