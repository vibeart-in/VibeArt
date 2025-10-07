import Image from "next/image";

// Replace with your actual brand logos
// It's best to use SVGs for logos for scalability and clarity.
const brands = [
  {
    name: "Zoho",
    src: "https://upload.wikimedia.org/wikipedia/commons/9/96/Zoho-logo.png",
    alt: "zoho Logo",
  },
  {
    name: "Google",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png",
    alt: "Innovate Inc. Logo",
  },
  {
    name: "Quantum Solutions",
    src: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b5/Trent_Limited.svg/330px-Trent_Limited.svg.png",
    alt: "Quantum Solutions Logo",
  },
  {
    name: "Apex Dynamics",
    src: "https://upload.wikimedia.org/wikipedia/en/thumb/e/ea/General_Motors_%28logo_with_wordmark%2C_horizontal%29.svg/500px-General_Motors_%28logo_with_wordmark%2C_horizontal%29.svg.png",
    alt: "Apex Dynamics Logo",
  },
  {
    name: "Stellar Ventures",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Shein_Logo_2017.svg/500px-Shein_Logo_2017.svg.png",
    alt: "Stellar Ventures Logo",
  },
  {
    name: "Nexus Systems",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Temu_logo.svg/330px-Temu_logo.svg.png",
    alt: "Nexus Systems Logo",
  },
  {
    name: "Fusion Enterprises",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/NVIDIA_logo.svg/500px-NVIDIA_logo.svg.png",
    alt: "Fusion Enterprises Logo",
  },
];

const TrustedBy = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-xl font-medium text-white/60">
          Trusted by the world s most innovative teams
        </h2>

        {/* 
          The 'mask' div hides the overflow and creates the fade effect.
          The inner div 'scroller' is what we animate.
        */}
        <div className="relative w-full overflow-hidden before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-20 before:bg-gradient-to-r before:from-black before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-20 after:bg-gradient-to-l after:from-black after:to-transparent">
          {/* We render the logos twice for the seamless loop */}
          <div className="flex w-max animate-scroll">
            {/* First set of logos */}
            {brands.map((brand) => (
              <div key={brand.name} className="mx-6 flex h-20 w-48 items-center justify-center">
                <Image
                  src={brand.src}
                  alt={brand.alt}
                  width={140}
                  height={50}
                  className="object-contain opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
                />
              </div>
            ))}

            {/* Second, duplicated set of logos (this is the trick) */}
            {brands.map((brand) => (
              <div
                key={`${brand.name}-duplicate`}
                className="mx-6 flex h-20 w-48 items-center justify-center"
              >
                <Image
                  src={brand.src}
                  alt={brand.alt}
                  width={140}
                  height={50}
                  className="object-contain opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
