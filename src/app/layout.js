import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProjectProvider } from "./script/Project.context";
import { AlertProvider } from "./script/Alert.context"; // ⬅️ import your AlertProvider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Caffetest - To do all your manual work in testing",
  description: "This is complete auto generated manual tech stack",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ProjectProvider>
          <AlertProvider>
            {children}
          </AlertProvider>
        </ProjectProvider>
      </body>
    </html>
  );
}
