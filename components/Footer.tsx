import React from 'react';

const footerLinks = [
    { name: "Fito Technology, LLC", href: "https://fitotechnology.com" },
    { name: "Fitochain", href: "https://fitochain.com" },
    { name: "X", href: "https://x.com/fitochain" },
    { name: "Telegram", href: "https://t.me/fitochain" }
];

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-100 border-t border-slate-200">
            <div className="container mx-auto px-6 py-8 text-center text-slate-500">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <img src="https://fitochain.com/wp-content/uploads/2025/07/DeFi-Fito.png" alt="Fitochain Logo" className="h-6 w-6" />
                    <span className="font-bold text-lg text-slate-800">Fitochain</span>
                </div>
                <p className="mb-6">The future of decentralized fitness is in your hands.</p>
                
                <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6">
                    {footerLinks.map(link => (
                        <a 
                            key={link.name} 
                            href={link.href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-slate-600 hover:text-green-600 font-medium transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                </nav>

                <p className="text-sm">&copy; {new Date().getFullYear()} Fitochain. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;