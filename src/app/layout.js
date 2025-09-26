import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProjectProvider } from "./script/Project.context";
import { AlertProvider } from "./script/Alert.context";
import { ConfirmProvider } from "./script/Confirm.context";
import { LoaderProvider } from "./script/Loader.context";

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
            <ConfirmProvider>
              <LoaderProvider>
                {children}
              </LoaderProvider>
            </ConfirmProvider>
          </AlertProvider>
        </ProjectProvider>
      </body>
    </html>
  );
}
