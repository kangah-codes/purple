/* eslint-disable @typescript-eslint/no-require-imports */
import type { Config } from 'tailwindcss';

export default {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
            },
            transitionDuration: {
                0: '0ms',
                5000: '5000ms',
            },
            animation: {
                'gradient-x': 'gradient-x 5s ease infinite',
                'gradient-x-1000': 'gradient-x 1000ms ease infinite',
                'gradient-x-2000': 'gradient-x 2000ms ease infinite',
                'gradient-x-5000': 'gradient-x 5000ms ease infinite',
                'gradient-y': 'gradient-y 5s ease infinite',
                'gradient-xy': 'gradient-xy 5s ease infinite',
                blob: 'blob 20s linear infinite',
                widen: 'widen 20s linear infinite',
                drop: 'drop 0.5s linear infinite',
                stem: 'stem 0.5s linear infinite',
                splat: 'splat 0.5s linear infinite',
                'spin-slow': 'spin 4s linear infinite',
                'spin-slower': 'spin 6s linear infinite',
                'spin-reverse': 'spin-reverse 1s linear infinite',
                'spin-reverse-slower': 'spin-reverse 6s linear infinite',
            },
            keyframes: {
                'spin-reverse': {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(-360deg)' },
                },
                drop: {
                    '0%': { transform: 'translateY(0vh)' },
                    '75%': { transform: 'translateY(90vh)' },
                    '100%': { transform: 'translateY(90vh)' },
                },
                stem: {
                    '0%': { opacity: '1' },
                    '65%': { opacity: '1' },
                    '75%': { opacity: '0' },
                    '100%': { opacity: '0' },
                },
                splat: {
                    '0%': { opacity: '1', transform: 'scale(0)' },
                    '80%': { opacity: '1', transform: 'scale(0)' },
                    '90%': { opacity: '0.5', transform: 'scale(1)' },
                    '100%': { opacity: '0', transform: 'scale(1.5)' },
                },
                'gradient-y': {
                    '0%, 100%': {
                        'background-size': '400% 400%',
                        'background-position': 'center top',
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'center center',
                    },
                },
                'gradient-x': {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center',
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center',
                    },
                },
                'gradient-xy': {
                    '0%, 100%': {
                        'background-size': '400% 400%',
                        'background-position': 'left center',
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center',
                    },
                },
                blob: {
                    '0%': {
                        transform: 'translate(0px, 0px) scale(1)',
                    },
                    '33%': { transform: 'translate(90px, -90px) scale(1.2)' },
                    '66%': { transform: 'translate(-60px, 60px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                widen: {
                    '0%': {
                        transform: 'scale(1)',
                    },
                    '33%': { transform: 'scale(1.5)' },
                    '66%': { transform: 'scale(0.5)' },
                    '100%': { transform: 'scale(1)' },
                },
            },
        },
    },
    plugins: [require('@tailwindcss/typography')],
} satisfies Config;
