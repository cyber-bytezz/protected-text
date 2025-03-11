import Link from 'next/link'


export function Footer() {
  return (
    <footer className="mt-28 py-12 text-center text-sm">
      <div className="container mx-auto px-4 relative">
        {/* Background gradient element */}
        <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        
        <div className="relative z-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm p-6 max-w-3xl mx-auto border border-blue-100 dark:border-blue-900">
          <p className="mb-4 text-base">
            Built by{' '}
            <Link 
              href="" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-800 transition-colors hover:underline"
            >
              @Aro
            </Link>{' '}
            and {' '}
            <Link 
              href="" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-800 transition-colors hover:underline"
            >
              @Trae Code Editor
            </Link>{' '}
          </p>
          <p className="text-base">
            Encrypt is open-source on{' '}
            <Link 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-800 transition-colors hover:underline"
            >
              Github
            </Link>{' '}
            and uses{' '}
            <Link 
              href="https://upstash.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-800 transition-colors hover:underline"
            >
              Upstash
            </Link>{' '}
            for storing encrypted data
          </p>
          <div className="mt-6 pt-4 border-t border-blue-100 dark:border-blue-900 text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Encrypt. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

