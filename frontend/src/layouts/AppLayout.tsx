import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../components/ThemeProvider';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const AppLayout = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
            <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 shadow-lg">
                <div className="flex items-center justify-center h-16 bg-gray-900 dark:bg-black">
                    <Link to="/bids" className="text-white font-bold text-xl">나라장터</Link>
                </div>
                <nav className="mt-4">
                    <Link to="/bids" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">공고 리스트</Link>
                    <Link to="/favorites" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">즐겨찾기</Link>
                    <Link to="/admin/users" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">사용자 관리</Link>
                </nav>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-end items-center h-16 px-6 bg-white dark:bg-gray-800 shadow-md">
                    <button 
                        onClick={toggleTheme} 
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </button>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
