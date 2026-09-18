/**
 * Client testimonials used on the homepage and the testimonials page.
 * NOTE: these are illustrative placeholders pending real client words.
 */
export type Testimonial = {
  name: string;
  location: string;
  package: string;
  quote: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Sarah M.",
    location: "London",
    package: "Maternal Continuity",
    quote: "The support I received was incredible. I felt so much more confident going into birth knowing I had that support behind me. The online format meant I could attend from home with my newborn.",
  },
  {
    name: "Emma & James",
    location: "Manchester",
    package: "Maternal Extended",
    quote: "As first-time parents, we were nervous about everything. The one-to-one sessions gave us personalised guidance that made all the difference. Highly recommend!",
  },
  {
    name: "Priya K.",
    location: "Birmingham",
    package: "Maternal Foundation",
    quote: "The group programme was so welcoming. I made friends with other parents at the same stage, and the WhatsApp support between sessions was a lifeline.",
  },
  {
    name: "Rachel T.",
    location: "Norfolk",
    package: "Maternal Continuity",
    quote: "Having my husband involved throughout made such a difference — he finally understood how to support me during labour. We felt like a real team afterwards.",
  },
  {
    name: "Aisha B.",
    location: "Leeds",
    package: "Maternal Foundation",
    quote: "Being a migrant mum in a new country, I felt isolated. Nurtured & Nourished made me feel seen and supported. The cultural sensitivity was appreciated.",
  },
];
