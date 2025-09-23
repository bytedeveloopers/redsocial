export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-xl border border-transparent bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition-all duration-200 ease-in-out hover:from-violet-700 hover:to-purple-800 hover:shadow-lg hover:shadow-violet-500/25 focus:from-violet-700 focus:to-purple-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 active:from-violet-800 active:to-purple-900 transform hover:-translate-y-0.5 ${
                    disabled && 'opacity-50 cursor-not-allowed transform-none hover:shadow-none'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
