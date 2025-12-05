import { motion } from 'framer-motion';
import { Code, Video, DollarSign, MessageCircle, Sparkles, Zap } from 'lucide-react';

export function ProductShowcase() {
  const features = [
    {
      icon: Code,
      title: "AI Code Workspace",
      description: "Build apps in minutes with AI assistance",
      demo: "Monaco editor with live preview",
      color: "from-green-400 to-emerald-600"
    },
    {
      icon: Video,
      title: "TikTok-Style Feed",
      description: "Share videos & go viral",
      demo: "Vertical video feed with engagement",
      color: "from-purple-400 to-pink-600"
    },
    {
      icon: DollarSign,
      title: "Multiple Income Streams",
      description: "Earn from 5 different sources",
      demo: "Subscriptions, Sparks, Ads, Code, NFTs",
      color: "from-yellow-400 to-orange-600"
    },
    {
      icon: MessageCircle,
      title: "Real-Time Chat & Calls",
      description: "Connect with your audience instantly",
      demo: "Live video calling & messaging",
      color: "from-cyan-400 to-blue-600"
    }
  ];

  return (
    <div className="space-y-12">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Everything You Need in <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">One Platform</span>
        </motion.h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Stop juggling 10+ tools. PROFITHACK AI combines coding, content, community & cash flow.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="relative group"
          >
            {/* Glass card */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20" />
            
            {/* Animated gradient border */}
            <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20 rounded-3xl blur-xl transition-all duration-500`} />
            
            {/* Content */}
            <div className="relative p-8">
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              {/* Title */}
              <h3 className={`text-2xl font-bold mb-3 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-300 mb-4">{feature.description}</p>
              
              {/* Demo label */}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Sparkles className="w-4 h-4" />
                <span>{feature.demo}</span>
              </div>
              
              {/* Action indicator */}
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Zap className="w-4 h-4" />
                <span>Try it live →</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-lg text-gray-400 mb-4">
          See it in action. Join the beta today.
        </p>
      </div>
    </div>
  );
}
