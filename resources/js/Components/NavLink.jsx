import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition-all duration-200 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-violet-500 text-violet-700 bg-violet-50/50 rounded-t-lg px-3'
                    : 'border-transparent text-gray-600 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/30 rounded-t-lg px-3 focus:border-violet-300 focus:text-violet-600') +
                className
            }
        >
            {children}
        </Link>
    );
}
