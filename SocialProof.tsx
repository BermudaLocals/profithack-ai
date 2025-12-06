import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Creator",
    avatar: "SC",
    country: "🇸🇬 Singapore",
    quote: "Made my first $2,000 in 3 weeks. The AI tools are insane - I can create content 10x faster.",
    rating: 5,
    earnings: "$2,000"
  },
  {
    name: "Marcus Johnson",
    role: "Developer & Streamer",
    avatar: "MJ",
    country: "🇺🇸 USA",
    quote: "Built an app during my lunch break, deployed it instantly. Already have 50 paying users.",
    rating: 5,
    earnings: "$4,200"
  },
  {
    name: "Aisha Patel",
    role: "Digital Marketer",
    avatar: "AP",
    country: "🇮🇳 India",
    quote: "The global payment system changed everything. Finally getting paid without expensive fees!",
    rating: 5,
    earnings: "$1,750"
  },
  {
    name: "João Silva",
    role: "Music Producer",
    avatar: "JS",
    country: "🇧🇷 Brazil",
    quote: "Premium subscriptions + Sparks = passive income while I sleep. This platform is the future.",
    rating: 5,
    earnings: "$3,100"
  }
];

export function SocialProof() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-3">
          Real People. Real Results. 💰
        </h3>
        <p className="text-gray-400">
          Join thousands making money with PROFITHACK AI
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            {/* Glass background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20" />
            
            {/* Glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-purple-500/0 to-cyan-500/0 group-hover:from-green-500/10 group-hover:via-purple-500/10 group-hover:to-cyan-500/10 rounded-3xl transition-all duration-500 blur-xl" />
            
            {/* Content */}
            <div className="relative p-6">
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-purple-400/30 mb-4" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
              
              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center font-bold text-white">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                    <div className="text-xs text-gray-500">{testimonial.country}</div>
                  </div>
                </div>
                
                {/* Earnings badge */}
                <div className="bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1">
                  <div className="text-sm font-bold text-green-400">{testimonial.earnings}</div>
                  <div className="text-xs text-gray-400">earned</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust indicator */}
      <div className="text-center">
        <p className="text-sm text-gray-400">
          ⭐ Rated <span className="font-bold text-yellow-400">4.9/5</span> by 2,500+ beta users
        </p>
      </div>
    </div>
  );
}
