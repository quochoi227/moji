import { SidebarInset, SidebarSeparator, SidebarTrigger } from '../ui/sidebar'

function ChatWellcomeScreen() {
  return (
    <SidebarInset className="flex w-full h-full bg-transparent">
      <header className="sticky top-0 z-10 px-4 py-2 flex items-center bg-background">
        <div className="flex items-center gap-2 w-full">
          <SidebarTrigger className="-ml-1 text-foreground" />
          <SidebarSeparator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        </div>
      </header>
      <div className="flex bg-primary-foreground rounded-2xl flex-1 items-center justify-center">
        <div className="text-center">
          <div className="size-24 mx-auto mb-6 bg-gradient-chat rounded-full flex items-center justify-center shadow-glow pulse-ring">
            <span className="text-3xl">💬</span>
          </div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-chat bg-clip-text text-transparent">
            Chào mừng bạn đến với Moji!
          </h2>
          <p className="text-muted-foreground">Chọn một cuộc hội thoại để bắt đầu chat</p>
        </div>
      </div>
    </SidebarInset>
  )
}

export default ChatWellcomeScreen
