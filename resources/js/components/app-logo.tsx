import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className=" text-white flex aspect-square size-9 items-center justify-center rounded-lg shadow-md">
                <AppLogoIcon className="size-6 fill-current text-white dark:text-white" />
            </div>
            <div className="ml-2 grid flex-1 text-left">
                <span className="font-heading text-base font-bold leading-none tracking-tight">EduTrack</span>
                <span className="text-xs text-muted-foreground">Course Management</span>
            </div>
        </>
    );
}
