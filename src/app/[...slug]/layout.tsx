import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { Toaster } from "@/components/ui/toaster";

import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
      <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <div className="hidden">
        <ModeToggle/>
        </div>
        {children}
        <Toaster />
        </ThemeProvider>    
      </body>
    </html>
  );
}