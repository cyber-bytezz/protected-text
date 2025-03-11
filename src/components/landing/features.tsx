import { LockKeyhole, IdCard, Github, GlobeLock, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { motion } from 'framer-motion'
import { useState } from 'react'

type FeatureProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
};

export default function Features() {
  const features: FeatureProps[] = [
    {
      icon: LockKeyhole,
      title: "Set a password for your notes",
      description: "We never store your password. Instead, your password is used as a key to encrypt your notepad. The encrypted output is then stored in our database, and without the password, it is essentially just a random set of characters.",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: GlobeLock,
      title: "Hashed Site names",
      description: "Your site or notepad names are hashed before being stored in our database. This ensures that even if your password is compromised, it is impossible for anyone to determine your site name.",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: IdCard,
      title: "No login" ,
      description: "Since we only need a password to encrypt your notes, there's no need for you to log in or provide your email or any other personal information.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Github,
      title: "Fully open-source",
      description: "We are fully open-source on Github. You can feel free to fork the repo and self-deploy or make some customized changes for yourself.",
      color: "from-amber-500 to-orange-600"
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  return (
    <div className='flex justify-center items-center my-10'>
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className="relative"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 dark:opacity-10"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.div 
            className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 dark:opacity-10"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -30, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
          />
        </div>

        <Card className="overflow-hidden w-[1000px] backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-500 relative z-10">
          <div className="flex flex-col lg:flex-row">
            <CardContent className="flex-1 p-6 lg:p-8">
              <motion.div 
                className="space-y-6"
                variants={cardVariants}
              >
                <div>
                  <motion.h3 
                    className="text-sm font-medium text-zinc-500"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    Encrypted Notepad
                  </motion.h3>
                  <motion.h2 
                    className="mt-2 text-2xl lg:text-3xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                    viewport={{ once: true }}
                  >
                    Protect your notes with a secure password.
                  </motion.h2>
                </div>
                <div className="space-y-5 mb-10">
                  {features.map((feature, index) => (
                    <Feature 
                      key={index} 
                      icon={feature.icon} 
                      title={feature.title} 
                      description={feature.description} 
                      color={feature.color}
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>
            </CardContent>
            <motion.div 
              className="flex-1 bg-zinc-100 min-h-[300px] lg:min-h-0 hidden lg:block relative overflow-hidden"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 50 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 z-10"
                animate={{
                  background: [
                    'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%)',
                    'linear-gradient(135deg, rgba(147,51,234,0.1) 0%, rgba(59,130,246,0.1) 100%)',
                    'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%)'
                  ]
                }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <motion.img 
                src="/editor.png" 
                alt="Password manager interface" 
                className="h-full w-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

function Feature({ icon: Icon, title, description, color, index }: FeatureProps & { index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div 
      className="flex items-start gap-3 group hover:bg-white/50 dark:hover:bg-gray-800/50 p-2 rounded-lg transition-all duration-300 relative"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            delay: index * 0.1 + 0.4,
            type: "spring",
            stiffness: 100,
            damping: 10
          }
        }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ x: 5 }}
    >
      <motion.div 
        className={`mt-1 rounded-lg border border-black/10 p-2 flex-shrink-0 bg-white dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 relative overflow-hidden`}
        animate={isHovered ? {
          boxShadow: `0 0 20px 2px rgba(${color === "from-blue-500 to-indigo-600" ? "59, 130, 246" : 
                      color === "from-purple-500 to-pink-600" ? "139, 92, 246" :
                      color === "from-green-500 to-emerald-600" ? "16, 185, 129" :
                      "245, 158, 11"}, 0.3)`
        } : {}}
      >
        <Icon className={`h-5 w-5 bg-gradient-to-br ${color} bg-clip-text text-transparent relative z-10`} />
        
        {/* Animated background for icon */}
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10`}
          animate={isHovered ? {
            scale: [1, 1.5, 1],
            opacity: [0, 0.2, 0],
            rotate: [0, 90, 0]
          } : {}}
          transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
        />
      </motion.div>
      
      <div>
        <motion.h3 
          className={`font-medium transition-all duration-300 ${isHovered ? "text-transparent bg-clip-text bg-gradient-to-r " + color : ""}`}
          animate={isHovered ? { y: -2 } : { y: 0 }}
        >
          {title}
        </motion.h3>
        <motion.p 
          className="text-sm text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-all duration-300"
          animate={isHovered ? { opacity: 0.9 } : { opacity: 0.7 }}
        >
          {description}
        </motion.p>
      </div>
      
      {/* Decorative particles that appear on hover */}
      {isHovered && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full bg-gradient-to-br ${color}`}
              initial={{ 
                opacity: 0.7,
                scale: 0,
                x: 20,
                y: 20
              }}
              animate={{ 
                opacity: 0,
                scale: Math.random() * 2 + 1,
                x: Math.random() * 80 - 40,
                y: Math.random() * 80 - 40
              }}
              transition={{ 
                duration: Math.random() * 1 + 0.5, 
                repeat: Infinity,
                repeatType: "loop",
                delay: Math.random() * 0.2
              }}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  )
}
