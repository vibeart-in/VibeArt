import { motion } from "motion/react";

import { TestimonialsColumn } from "../ui/TestimonialsColumn";
const testimonials = [
  {
    text: "VibeArt completely changed how our creative team works. The node-based workflow gives us insane creative control while still moving at AI speed.",
    image: "https://randomuser.me/api/portraits/men/12.jpg",
    name: "Rahul Mehta",
    role: "Creative Director, Media Studio",
  },
  {
    text: "We used to spend hours generating variations with different tools. With VibeArt we build once and generate dozens of creative outputs instantly.",
    image: "https://randomuser.me/api/portraits/women/22.jpg",
    name: "Priya Kapoor",
    role: "Content Lead",
  },
  {
    text: "The node workflow is a game changer. Finally an AI tool where artists actually control the process instead of just writing prompts.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "Arjun Nair",
    role: "Motion Designer",
  },
  {
    text: "Our production team now generates thumbnails, posters, and concept art in minutes. VibeArt helped us scale creative output massively.",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    name: "Sneha Iyer",
    role: "Content Producer",
  },
  {
    text: "The ability to visually connect models, prompts, and styles through nodes makes experimentation incredibly fast and intuitive.",
    image: "https://randomuser.me/api/portraits/men/56.jpg",
    name: "Karan Shah",
    role: "AI Artist",
  },
  {
    text: "We integrated VibeArt into our social media production workflow and now create high-quality visuals 10x faster.",
    image: "https://randomuser.me/api/portraits/women/63.jpg",
    name: "Meera Verma",
    role: "Social Media Manager",
  },
  {
    text: "What impressed me most is the flexibility. You can build complex AI pipelines visually without writing code.",
    image: "https://randomuser.me/api/portraits/men/70.jpg",
    name: "Rohit Gupta",
    role: "Tech Lead",
  },
  {
    text: "VibeArt feels like Photoshop for AI generation. The level of creative control is something we haven't seen in other AI tools.",
    image: "https://randomuser.me/api/portraits/women/71.jpg",
    name: "Ananya Singh",
    role: "Digital Artist",
  },
  {
    text: "Our YouTube production team now generates thumbnails, concept art, and backgrounds inside one workflow.",
    image: "https://randomuser.me/api/portraits/men/85.jpg",
    name: "Vikram Joshi",
    role: "YouTube Content Producer",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export default function Testimonials() {
  return (
    <section className="relative my-20 bg-background">
      <div className="container z-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-[540px] flex-col items-center justify-center"
        >
          <div className="flex justify-center">
            <div className="rounded-lg border px-4 py-1">Testimonials</div>
          </div>

          <h2 className="mt-5 font-satoshi text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
            What our users say
          </h2>
          <p className="mt-5 text-center opacity-75">
            See what our customers have to say about us.
          </p>
        </motion.div>

        <div className="mt-10 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  );
}
