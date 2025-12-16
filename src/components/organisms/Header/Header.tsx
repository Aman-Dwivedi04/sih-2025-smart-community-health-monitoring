export const Header = () => {
    return (
        <>
            <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased transition-colors duration-200">
                <div className="relative flex min-h-screen w-full flex-col overflow-hidden mx-auto max-w-md shadow-xl">

                    {/* Status Bar Placeholder */}
                    <div className="h-12 w-full bg-transparent"></div>

                    {/* Header */}
                    <div className="flex items-center p-4 justify-center"></div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col px-6">

                        {/* Logo */}
                        <div className="flex flex-col items-center gap-6 pt-4 pb-8">
                            <div
                                className="bg-center bg-no-repeat bg-cover rounded-2xl h-24 w-24 shadow-lg flex items-center justify-center bg-white dark:bg-slate-800"
                                style={{
                                    backgroundImage:
                                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD5i6nRfa_uh8LwpS5gUW9nFPKSVc1oRTrU5doNevvt040hxs-MuFVE818ubw52a9XBUrPDfzGNZ8gYZ1Y5D8JuCcFIJDeKBN_bRO9xeItKDUxfP3-WI-UNDVo8tSYCwm_6C0vn-U4mjiWOkncY4lzKv9UHfgwxS06JHqM-ydM0FTmNPn9Jfnl-2XKuVvvGgu9rOMp4UIPB1KWOFhy3Ci-EqcSPcS0tYn4ohO9xQ6GfErtQFybFG7W50PRPbhVTasyDBWFPTAgQ8Na-")',
                                }}
                            ></div>

                            <h1 className="text-2xl font-bold text-center">
                                HealthGuard NER
                            </h1>

                            <p className="text-slate-500 text-sm text-center">
                                Early Detection, Rapid Response.
                            </p>
                        </div>

                        {/* Form */}
                        <form
                            className="flex flex-col gap-5 w-full"
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <input
                                className="h-14 rounded-xl px-4 border"
                                placeholder="officer@health.gov.in"
                            />

                            <input
                                type="password"
                                className="h-14 rounded-xl px-4 border"
                                placeholder="••••••••"
                            />

                            <button className="bg-primary text-white h-14 rounded-xl">
                                Sign In
                            </button>
                        </form>

                    </div>
                </div>
            </div>
        </>
    );
};
