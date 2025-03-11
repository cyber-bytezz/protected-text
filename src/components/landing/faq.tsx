"use client"

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

// FAQ data
const faqs = [
  {
    question: "What is zero knowledge app?",
    answer: "A Zero-Knowledge (ZK) App leverages zero-knowledge proofs (ZKPs) to ensure data privacy and security while enabling verifiable interactions. We don't store any of your personal information or your password. We only encrypt text which never leaves your browser."
  },
  {
    question: "How can I recover my site if I forget my password?",
    answer: "Since this is a ZK app. There is no way for us to know which text belongs to what user. So unfortunately it is not possible to recover the notes without the password. Even if they are recovered it is not possible to decrypt them."
  },
  {
    question: "How can I backup my notes?",
    answer: "Currently you cannot backup your notes. I am working on that feature."
  },
  {
    question: "How can I share my notes?",
    answer: "As of now you will need to share both the name and password for your notepad. In future I am planning to allow users to create public notepads that can be shared without a password."
  },
  {
    question: "How do you verify the password if it is never sent to the server?",
    answer: "We use your password to encrypt your text on the client side. The encrypted text is then sent to the server. When you access your page, we retrieve the encrypted text from the server and decrypt it using your password. If the password is correct, the text is successfully decrypted; otherwise, it remains encrypted."
  }
]

export default function FAQ() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (value: string) => {
    setOpenItems(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    )
  }

  return (
    <div className="mt-15 max-w-[1000px] mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-3 text-2xl sm:text-3xl md:text-4xl lg:text-3xl font-bold max-w-3xl py-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white">
              FAQs
        </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
            <button
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex justify-between items-center"
              onClick={() => toggleItem(`item-${index}`)}
            >
              <span className="text-left text-gray-700 font-medium">{faq.question}</span>
              <ChevronDown 
                className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                  openItems.includes(`item-${index}`) ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            {openItems.includes(`item-${index}`) && (
              <div className="px-4 py-3 bg-white">
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

