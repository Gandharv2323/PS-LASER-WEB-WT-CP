import "bootstrap/dist/css/bootstrap.min.css";
import "boxicons/css/boxicons.min.css";
import "aos/dist/aos.css";
import "owl.carousel/dist/assets/owl.carousel.min.css";
import "../(classic)/kakadelaser.css";

/**
 * Legacy page (/advanced) keeps their original Bootstrap-era CSS here so it
 * never loads on the new site. The root layout owns <html>/<body>.
 */
export default function LegacyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* React 19 hoists this stylesheet into <head>. kakadelaser.css expects "Roboto" by name. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap"
        precedence="default"
      />
      {children}
    </>
  );
}
