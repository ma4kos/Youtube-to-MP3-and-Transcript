// Global layout for the application
// This provides the base HTML structure and global styles

import './globals.css';

export const metadata = {
  title: 'YouTube to MP3 and Transcript Converter',
  description: 'Convert YouTube videos to MP3 audio files and generate text transcripts',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      </head>
      <body>
        {children}
        <footer className="mt-8 py-4 text-center text-gray-500 text-sm">
          <p>YouTube to MP3 and Transcript Converter &copy; {new Date().getFullYear()}</p>
        </footer>
      </body>
    </html>
  );
}
