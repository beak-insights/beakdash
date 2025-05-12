export function HeaderContainer({ children }: { children: React.ReactNode }) {
    return (
        <div className="px-4 h-14 sticky top-0 z-10 bg-gray-100 border-b flex items-center justify-between">
            {children}
        </div>
    )
}

// header title and description
export function HeaderTitle({ title, description }: { title: string, description: string }) {
    return (
        <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
            )}
        </div>
    )
}


// Header
export function Header({ children, title, description }: { children?: React.ReactNode, title: string, description: string }) {
    return (
        <HeaderContainer>
            <HeaderTitle title={title} description={description} />
            <div className="flex items-center gap-2">
            <div id="beakdash-controls" className="flex items-center gap-2"></div>
            {children}
          </div>
        </HeaderContainer>
    )
}