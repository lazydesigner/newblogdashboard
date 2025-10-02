// app/layout.js
import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: 'Blog Dashboard',
  description: 'Manage your blog with ease',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}