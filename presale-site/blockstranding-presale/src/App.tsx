import { useState, useEffect } from "react";
import {
  Header,
  Hero,
  Testimonials,
  Tokenomics,
  Collaborations,
  FAQ,
  Footer,
} from "./components/PageSections";
import {
  VaultAirdropCard,
} from "./components/VaultAirdropSections";
import { AirdropAdminPage } from "./pages/AirdropAdmin";

function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // 监听路由变化
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // 如果是管理后台页面
  if (currentPath === '/admin' || currentPath === '/admin.html') {
    return <AirdropAdminPage />;
  }

  // 默认首页 - 空投领取页面（授权路由模式）
  return (
    <div className="min-h-screen bg-[#181818] text-[#c7dca9]">
      <Header />
      <main className="max-w-5xl mx-auto px-4 pb-20">
        <Hero />
        <VaultAirdropCard />
        <Testimonials />
        <Tokenomics />
        <Collaborations />
        <FAQ openFaq={openFaq} setOpenFaq={setOpenFaq} />
        <Footer />
      </main>
    </div>
  );
}

export default App;
