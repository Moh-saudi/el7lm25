/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Cairo everywhere - default font
        'sans': ['var(--font-cairo)', 'Cairo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'cairo': ['var(--font-cairo)', 'Cairo', 'sans-serif'],
        // All other fonts point to Cairo
        'noto-arabic': ['var(--font-cairo)', 'Cairo', 'sans-serif'],
        'ibm-arabic': ['var(--font-cairo)', 'Cairo', 'sans-serif'],
        'poppins': ['var(--font-cairo)', 'Cairo', 'sans-serif'],
        'inter': ['var(--font-cairo)', 'Cairo', 'sans-serif'],
        'tajawal': ['var(--font-cairo)', 'Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}