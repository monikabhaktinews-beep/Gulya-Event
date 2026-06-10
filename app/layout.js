import './globals.css'

export const metadata = {
  title: 'Premium Reward Hub',
  description: 'Earn rewards securely',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#060913] text-gray-100 min-h-screen antialiased select-none">
        {children}
      </body>
    </html>
  )
}
