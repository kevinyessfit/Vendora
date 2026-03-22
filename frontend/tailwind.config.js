/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f4ff',
                    100: '#e0eaff',
                    200: '#c7d9fe',
                    300: '#a5bdfd',
                    400: '#8196fa',
                    500: '#6472f5',
                    600: '#4f4fea',
                    700: '#4040d5',
                    800: '#3636ac',
                    900: '#303488',
                },
                accent: {
                    400: '#f472b6',
                    500: '#ec4899',
                    600: '#db2777',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
