import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={title:'Focusflow — Make room for what matters',description:'Turn a busy mind into a thoughtful plan. Capture tasks, prioritize your work, and build a realistic day.',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
