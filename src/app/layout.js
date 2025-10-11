import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProjectProvider } from "./script/Project.context";
import { AlertProvider } from "./script/Alert.context";
import { ConfirmProvider } from "./script/Confirm.context";
import { LoaderProvider } from "./script/Loader.context";
import { TestTypeProvider } from "./script/TestType.context";
import { TooltipProvider } from "./script/Tooltip.context";
import { ContentProvider } from "./script/Content.context";
import Tooltip from "./components/utils/Tooltip";
import Context from "./components/utils/Content";
import RouteProgressBar from "./components/utils/Fab";
import Script from "next/script";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-WH3CSJJNFM"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-WH3CSJJNFM');
            `,
          }}
        />

        <TooltipProvider>
          <ContentProvider>
            <ProjectProvider>
              <TestTypeProvider>
                <AlertProvider>
                  <ConfirmProvider>
                    <LoaderProvider>
                      {children}
                      <RouteProgressBar />
                      <Tooltip />
                      <Context />
                    </LoaderProvider>
                  </ConfirmProvider>
                </AlertProvider>
              </TestTypeProvider>
            </ProjectProvider>
          </ContentProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}