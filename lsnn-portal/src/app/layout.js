import './globals.css';

export const metadata = {
  title: 'LSNN - Los Santos News Network',
  description: 'Portal de noticias LSNN en San Andreas.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
