import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Menu, X, ChevronRight, MapPin, Building2, TrendingUp, 
  User, Phone, CheckCircle2, BarChart3, Quote, Calendar, 
  ArrowRight, Star, Home, Pen, Save, RotateCcw, ImageIcon, XCircle, Upload
} from 'lucide-react';

// --- Types ---
type Page = 'main' | 'analysis' | 'investment' | 'profile' | 'contact';
type EditType = 'text' | 'image';

// --- Edit Context ---
interface EditContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  content: Record<string, string>;
  updateContent: (key: string, value: string) => void;
  resetContent: () => void;
  openEditor: (id: string, initialValue: string, type: EditType) => void;
}

const EditContext = createContext<EditContextType>({
  isEditMode: false,
  toggleEditMode: () => {},
  content: {},
  updateContent: () => {},
  resetContent: () => {},
  openEditor: () => {},
});

const useEdit = () => useContext(EditContext);

// --- Assets (Defaults) ---
const DEFAULT_IMAGES = {
  hero: "https://loremflickr.com/1600/900/architect,man",
  exterior: "https://loremflickr.com/1600/900/apartment,building",
  chart: "https://loremflickr.com/1600/900/chart,finance",
  profile: "https://loremflickr.com/1600/900/portrait,business",
  consulting: "https://loremflickr.com/1600/900/meeting,consulting"
};

// --- Custom Modal Component ---
const EditModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialValue, 
  type 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (value: string) => void; 
  initialValue: string; 
  type: EditType;
}) => {
  const [value, setValue] = useState(initialValue);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden transform transition-all scale-100">
        <div className="bg-[#0F172A] text-white px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            {type === 'text' ? <Pen size={18} /> : <ImageIcon size={18} />}
            {type === 'text' ? '텍스트 수정' : '이미지 변경'}
          </h3>
          <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === 'text' ? '내용을 입력하세요' : '이미지 주소 입력 또는 파일 업로드'}
            </label>
            
            {type === 'text' ? (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full h-32 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none resize-none bg-slate-50"
              />
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none bg-slate-50 text-sm"
                      placeholder="https://..."
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium whitespace-nowrap text-sm"
                    >
                        <Upload size={16} /> 내 PC
                    </button>
                </div>

                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                  <img 
                    src={value || 'about:blank'} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image+URL'; }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center">
                    미리보기
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 justify-end pt-2">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
            >
              취소
            </button>
            <button 
              onClick={() => onSave(value)}
              className="px-5 py-2.5 rounded-lg bg-[#0F172A] text-white hover:bg-[#D4AF37] font-bold shadow-lg transition-colors flex items-center gap-2"
            >
              <Save size={18} />
              저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Editable Components ---

const EditableText = ({ 
  id, 
  defaultText, 
  className = '', 
  tag: Tag = 'div'
}: { 
  id: string, 
  defaultText: string, 
  className?: string, 
  tag?: any
}) => {
  const { isEditMode, content, openEditor } = useEdit();
  const currentText = content[id] || defaultText;

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    openEditor(id, currentText, 'text');
  };

  return (
    <Tag 
      onClick={handleClick}
      className={`${className} ${isEditMode ? 'cursor-pointer hover:bg-yellow-50 hover:outline hover:outline-2 hover:outline-dashed hover:outline-[#D4AF37] rounded px-1 -mx-1 transition-all relative' : ''}`}
      title={isEditMode ? "클릭하여 텍스트 수정" : ""}
    >
      {currentText.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < currentText.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))}
    </Tag>
  );
};

const EditableImage = ({ 
  id, 
  defaultSrc, 
  alt, 
  className = '' 
}: { 
  id: string, 
  defaultSrc: string, 
  alt: string, 
  className?: string 
}) => {
  const { isEditMode, content, openEditor } = useEdit();
  const currentSrc = content[id] || defaultSrc;

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    openEditor(id, currentSrc, 'image');
  };

  return (
    <div 
      className={`relative group ${className} ${isEditMode ? 'cursor-pointer hover:outline hover:outline-4 hover:outline-dashed hover:outline-[#D4AF37] rounded-lg overflow-hidden' : ''}`}
      onClick={handleClick}
    >
      <img src={currentSrc} alt={alt} className={`w-full h-full object-cover ${className}`} />
      {isEditMode && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white text-[#0F172A] px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-xl transform scale-105">
            <ImageIcon size={18} /> 이미지 변경
          </div>
        </div>
      )}
    </div>
  );
};

// --- Reusable UI Components ---

const Button = ({ children, onClick, variant = 'primary', className = '' }: any) => {
  const baseStyle = "px-6 py-3 rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-[#0F172A] text-white hover:bg-[#D4AF37] hover:text-white shadow-lg",
    secondary: "bg-[#D4AF37] text-white hover:bg-[#b89628] shadow-md",
    outline: "border-2 border-[#0F172A] text-[#0F172A] hover:bg-[#0F172A] hover:text-white",
    ghost: "text-[#0F172A] hover:text-[#D4AF37]"
  };
  
  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}
    >
      {children}
    </button>
  );
};

const SectionHeading = ({ title, subtitle, align = 'center', idPrefix }: { title: string, subtitle?: string, align?: 'left' | 'center', idPrefix: string }) => (
  <div className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'}`}>
    {subtitle && (
      <EditableText 
        id={`${idPrefix}_subtitle`}
        defaultText={subtitle}
        className="block text-[#D4AF37] font-bold tracking-wider text-sm mb-2 uppercase"
        tag="span"
      />
    )}
    <EditableText
      id={`${idPrefix}_title`}
      defaultText={title}
      className="text-3xl md:text-4xl font-bold text-[#0F172A] leading-tight"
      tag="h2"
    />
    <div className={`h-1 w-20 bg-[#D4AF37] mt-6 ${align === 'center' ? 'mx-auto' : ''}`}></div>
  </div>
);

// --- Layout ---

const Header = ({ currentPage, setPage, isScrolled }: { currentPage: Page, setPage: (p: Page) => void, isScrolled: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems: { id: Page; label: string }[] = [
    { id: 'main', label: '홈' },
    { id: 'analysis', label: '상세분석' },
    { id: 'investment', label: '가치분석' },
    { id: 'profile', label: '전문가소개' },
    { id: 'contact', label: '상담문의' },
  ];

  return (
    <header className={`fixed w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div 
          className={`text-2xl font-bold cursor-pointer flex items-center gap-1 ${isScrolled ? 'text-[#0F172A]' : 'text-[#0F172A] lg:text-white'}`}
          onClick={() => setPage('main')}
        >
          <EditableText id="brand_main" defaultText="CENTUM" tag="span" />
          <EditableText id="brand_sub" defaultText="SQUARE" className="text-[#D4AF37]" tag="span" />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`font-medium transition-colors ${
                currentPage === item.id 
                  ? 'text-[#D4AF37]' 
                  : isScrolled ? 'text-gray-600 hover:text-[#0F172A]' : 'text-white/90 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button className="lg:hidden text-[#0F172A]" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg lg:hidden flex flex-col p-6 gap-4 animate-fade-in-down">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setPage(item.id);
                setIsOpen(false);
              }}
              className={`text-left text-lg font-medium py-2 border-b border-gray-100 ${
                currentPage === item.id ? 'text-[#D4AF37]' : 'text-gray-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

const Footer = ({ setPage }: { setPage: (p: Page) => void }) => (
  <footer className="bg-[#0F172A] text-white py-12 border-t border-gray-800">
    <div className="container mx-auto px-6 grid md:grid-cols-4 gap-8">
      <div className="col-span-1 md:col-span-2">
        <h3 className="text-2xl font-bold mb-4">CENTUM<span className="text-[#D4AF37]">SQUARE</span></h3>
        <EditableText 
          id="footer_desc"
          defaultText={"동대구역의 미래 가치를 가장 먼저 선점하세요.\n전문가와 함께하는 안전하고 확실한 부동산 투자."}
          className="text-gray-400 max-w-sm mb-6 block"
          tag="p"
        />
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#D4AF37] transition-colors cursor-pointer">
            <Phone size={18} />
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#D4AF37] transition-colors cursor-pointer">
            <User size={18} />
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 inline-block">바로가기</h4>
        <ul className="space-y-2 text-gray-400">
          <li><button onClick={() => setPage('analysis')} className="hover:text-[#D4AF37]">상세분석</button></li>
          <li><button onClick={() => setPage('investment')} className="hover:text-[#D4AF37]">가치분석</button></li>
          <li><button onClick={() => setPage('profile')} className="hover:text-[#D4AF37]">전문가 소개</button></li>
          <li><button onClick={() => setPage('contact')} className="hover:text-[#D4AF37]">상담 문의</button></li>
        </ul>
      </div>

      <div>
        <h4 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 inline-block">문의하기</h4>
        <address className="not-italic text-gray-400 space-y-2">
          <EditableText id="footer_addr" defaultText="대구광역시 동구 신천동 325-1" tag="p" />
          <EditableText id="footer_tel" defaultText="Tel: 053-247-9599" tag="p" />
          <EditableText id="footer_email" defaultText="Email: nice7458@hanmail.net" tag="p" />
          <p className="text-xs text-gray-500 mt-4">※ 본 사이트는 포트폴리오용 예시입니다.</p>
        </address>
      </div>
    </div>
  </footer>
);

// --- Pages ---

const MainPage = ({ setPage }: { setPage: (p: Page) => void }) => {
  const { content, openEditor, isEditMode } = useEdit();
  
  return (
    <>
      {/* Hero */}
      <section className="relative h-screen min-h-[600px] flex items-center">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url('${content['hero_img'] || DEFAULT_IMAGES.hero}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 to-[#0F172A]/30"></div>
        </div>
        
        {isEditMode && (
           <button 
            onClick={() => openEditor('hero_img', content['hero_img'] || DEFAULT_IMAGES.hero, 'image')}
            className="absolute top-24 right-6 z-30 bg-white/20 hover:bg-white text-white hover:text-black p-3 rounded-full backdrop-blur-sm transition-all shadow-lg flex items-center gap-2"
            title="배경 이미지 변경"
           >
             <ImageIcon size={20} />
             <span className="text-sm font-bold">배경 변경</span>
           </button>
        )}
        
        <div className="container mx-auto px-6 relative z-10 text-white">
          <div className="max-w-3xl animate-fade-in-up">
            <EditableText 
              id="hero_tag" 
              defaultText="프리미엄 부동산 컨설팅" 
              className="bg-[#D4AF37] text-white px-3 py-1 text-sm font-bold uppercase tracking-wider mb-4 inline-block"
              tag="span"
            />
            <EditableText 
              id="hero_title"
              defaultText={"동대구의 미래,\n전문가의 시선으로 선택하다"}
              className="text-4xl md:text-6xl font-bold leading-tight mb-6 block drop-shadow-lg"
              tag="h1"
            />
            <EditableText 
              id="hero_desc"
              defaultText={"이편한세상 동대구역 센텀스퀘어.\n단순 주거를 넘어 자산 가치를 높이는 전략적인 선택을 제안합니다."}
              className="text-lg md:text-xl text-gray-100 mb-10 font-light block leading-relaxed max-w-2xl"
              tag="p"
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => setPage('contact')} variant="secondary">
                <EditableText id="hero_cta_1" defaultText="무료 상담 신청하기" tag="span" /> <ArrowRight size={18} />
              </Button>
              <Button onClick={() => setPage('analysis')} variant="outline" className="border-white text-white hover:bg-white hover:text-[#0F172A]">
                <EditableText id="hero_cta_2" defaultText="상세 정보 보기" tag="span" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <SectionHeading idPrefix="main_sec1" title="왜 지금, 동대구역인가?" subtitle="투자 핵심 포인트" />
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              {
                id: 'benefit_1',
                icon: <TrendingUp className="w-10 h-10 text-[#D4AF37]" />,
                title: "급부상하는 교통 허브",
                desc: "KTX/SRT 동대구역, 엑스코선(4호선) 등 대구 경북 통합 신공항 연결의 중심지입니다."
              },
              {
                id: 'benefit_2',
                icon: <Building2 className="w-10 h-10 text-[#D4AF37]" />,
                title: "신주거타운 형성",
                desc: "신암뉴타운 개발과 함께 1만여 세대 브랜드 타운이 형성되어 주거 환경이 획기적으로 개선됩니다."
              },
              {
                id: 'benefit_3',
                icon: <BarChart3 className="w-10 h-10 text-[#D4AF37]" />,
                title: "확실한 미래 가치",
                desc: "현재의 가치보다 미래의 상승 여력이 더 큰, 지금이 가장 합리적인 진입 타이밍입니다."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-8 rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2">
                <div className="mb-6 bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ring-1 ring-gray-100">
                  {item.icon}
                </div>
                <EditableText 
                  id={`${item.id}_title`} 
                  defaultText={item.title} 
                  className="text-xl font-bold mb-4 text-[#0F172A] block" 
                  tag="h3"
                />
                <EditableText 
                  id={`${item.id}_desc`} 
                  defaultText={item.desc} 
                  className="text-gray-600 leading-relaxed block" 
                  tag="p"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlight */}
      <section className="py-24 bg-[#0F172A] text-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
            <EditableImage
              id="exterior_img"
              defaultSrc={DEFAULT_IMAGES.exterior}
              alt="센텀스퀘어 조감도"
              className="rounded-lg shadow-2xl border-4 border-[#ffffff10]"
            />
          </div>
          <div className="w-full md:w-1/2">
            <div className="text-[#D4AF37] font-bold mb-2 tracking-widest text-sm">DL E&C PREMIUM</div>
            <EditableText 
              id="highlight_title"
              defaultText={"이편한세상 센텀스퀘어\n핵심 프리미엄"}
              className="text-3xl md:text-4xl font-bold mb-8 block leading-tight"
              tag="h2"
            />
            <ul className="space-y-6">
              {[
                "대구 최초 C2 HOUSE 특화 설계 적용",
                "동대구역 도보권 역세권 프리미엄",
                "초품아(초등학교를 품은 아파트) 교육 환경",
                "신세계백화점 등 풍부한 생활 인프라"
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-4">
                  <CheckCircle2 className="text-[#D4AF37] w-6 h-6 flex-shrink-0 mt-1" />
                  <EditableText 
                    id={`highlight_item_${i}`}
                    defaultText={text}
                    className="text-lg text-gray-300 font-light"
                    tag="span"
                  />
                </li>
              ))}
            </ul>
            <div className="mt-12">
              <Button onClick={() => setPage('analysis')} variant="secondary">
                자세히 알아보기
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Insight */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <Quote className="w-12 h-12 text-[#D4AF37] mx-auto mb-8 opacity-40" />
          <h3 className="text-2xl md:text-3xl font-medium text-gray-800 leading-relaxed mb-10 font-serif italic">
            <EditableText 
              id="expert_quote"
              defaultText={`"부동산은 '사는 것(Buying)'이 아니라 '사는 곳(Living)'이자\n가장 중요한 '자산(Asset)'이어야 합니다.\n센텀스퀘어는 이 두 가지 조건을 모두 충족하는 유일한 해답입니다."`}
              tag="span"
            />
          </h3>
          <div className="flex items-center justify-center gap-5">
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-2 border-white">
              <EditableImage 
                id="expert_thumb"
                defaultSrc={DEFAULT_IMAGES.profile}
                alt="Expert"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <EditableText id="expert_name" defaultText="정세동 부장" className="font-bold text-[#0F172A] text-lg block" tag="div" />
              <EditableText id="expert_role" defaultText="부동산 투자 컨설턴트" className="text-sm text-[#D4AF37] block font-medium" tag="div" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#D4AF37] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-black/5"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <EditableText 
            id="cta_main_title"
            defaultText="망설이는 순간, 로얄동·로얄층은 사라집니다."
            className="text-3xl md:text-5xl font-bold text-white mb-6 block drop-shadow-md"
            tag="h2"
          />
          <EditableText 
            id="cta_main_desc"
            defaultText="지금 바로 전문가와 상담하고 특별한 혜택을 확인하세요."
            className="text-white/90 text-xl mb-12 block"
            tag="p"
          />
          <Button onClick={() => setPage('contact')} className="bg-red-600 text-white hover:bg-red-700 px-10 py-5 text-xl mx-auto shadow-2xl hover:scale-105 transform">
            VIP 무료 상담 예약하기
          </Button>
        </div>
      </section>
    </>
  );
};

const AnalysisPage = () => {
  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6">
        <SectionHeading idPrefix="analysis" title="상세 정보 분석" subtitle="심층 분석" />

        {/* Project Overview */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
          <div className="h-64 md:h-96 relative group">
             <EditableImage id="overview_img" defaultSrc={DEFAULT_IMAGES.exterior} alt="Overview" className="w-full h-full object-cover" />
             <div className="absolute bottom-0 left-0 bg-[#0F172A]/90 text-white p-6 px-8 rounded-tr-2xl backdrop-blur-sm">
               <h3 className="text-2xl font-bold">
                 <EditableText id="overview_label" defaultText="사업 개요 요약" tag="span" />
               </h3>
             </div>
          </div>
          <div className="p-8 md:p-12 grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h4 className="text-2xl font-bold text-[#0F172A] border-l-4 border-[#D4AF37] pl-4">
                 <EditableText id="overview_sec1_title" defaultText="사업 개요" tag="span" />
              </h4>
              <dl className="grid grid-cols-3 gap-y-6 gap-x-4 text-sm border-t border-gray-100 pt-6">
                <dt className="text-gray-500 font-medium self-center">사업명</dt>
                <dd className="col-span-2 text-gray-800 font-bold text-lg">이편한세상 동대구역 센텀스퀘어</dd>
                
                <dt className="text-gray-500 font-medium self-center">위치</dt>
                <dd className="col-span-2 text-gray-800">대구광역시 동구 신천동 일원</dd>

                <dt className="text-gray-500 font-medium self-center">규모</dt>
                <dd className="col-span-2 text-gray-800">지하 5층 ~ 지상 24층, 4개동</dd>

                <dt className="text-gray-500 font-medium self-center">세대수</dt>
                <dd className="col-span-2 text-gray-800">총 322세대 (아파트/오피스텔 포함)</dd>
              </dl>
            </div>
            <div className="space-y-6">
              <h4 className="text-2xl font-bold text-[#0F172A] border-l-4 border-[#D4AF37] pl-4">
                <EditableText id="overview_sec2_title" defaultText="특화 설계 (C2 HOUSE)" tag="span" />
              </h4>
              <div className="bg-slate-50 p-6 rounded-lg text-gray-600 leading-relaxed text-lg">
                <EditableText 
                  id="overview_sec2_desc"
                  defaultText={`라이프스타일 맞춤 주거 플랫폼 'C2 HOUSE'가 적용되어 내력벽을 최소화하고 가변형 벽체를 사용하여 입주자의 취향에 맞는 구조 변경이 가능합니다. 또한 세탁기와 건조기를 병렬 배치할 수 있는 원스톱 세탁존 등 실생활의 편의성을 극대화했습니다.`}
                  tag="p"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location & Map */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white p-8 rounded-xl shadow-lg">
            <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MapPin className="text-[#D4AF37]" /> <EditableText id="map_title" defaultText="입지 환경 지도" tag="span" />
            </h4>
            <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 relative overflow-hidden">
               <EditableImage 
                 id="map_img" 
                 defaultSrc="https://placehold.co/800x400/e2e8f0/94a3b8?text=Map+Location+Placeholder" 
                 alt="지도" 
                 className="absolute inset-0 w-full h-full object-cover"
               />
               <div className="absolute bottom-4 right-4 bg-white/80 px-4 py-2 rounded-lg text-xs font-bold text-gray-500">
                 지도 이미지를 등록해주세요
               </div>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { id: 'loc_1', title: "교통 환경", desc: "동대구역(KTX/SRT), 도시철도 1호선, 엑스코선(4호선)" },
              { id: 'loc_2', title: "교육 환경", desc: "신암초등학교 도보 통학, 인근 초/중/고 밀집" },
              { id: 'loc_3', title: "생활 인프라", desc: "신세계백화점, 파티마병원, 평화시장 등 풍부한 인프라" },
              { id: 'loc_4', title: "자연 환경", desc: "신암공원, 기상대기념공원 등 쾌적한 녹지 공간" }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#D4AF37] hover:shadow-lg transition-shadow">
                <h5 className="font-bold text-[#0F172A] text-lg mb-2">
                  <EditableText id={`${item.id}_title`} defaultText={item.title} tag="span" />
                </h5>
                <EditableText 
                  id={`${item.id}_desc`} 
                  defaultText={item.desc} 
                  className="text-gray-600 block leading-relaxed"
                  tag="p" 
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const InvestmentPage = () => {
  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6">
        <SectionHeading idPrefix="invest" title="가치 분석 리포트" subtitle="투자 가치 분석" />
        
        {/* Main Chart Section */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-12 border border-gray-100">
          <div className="relative h-[500px]">
            <EditableImage id="chart_bg" defaultSrc={DEFAULT_IMAGES.chart} alt="Market Analysis" className="w-full h-full object-cover opacity-10 absolute inset-0" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
              <h3 className="text-3xl font-bold text-[#0F172A] mb-4">
                 <EditableText id="chart_title" defaultText="동대구 역세권 시세 추이" tag="span" />
              </h3>
              <div className="text-gray-600 max-w-2xl mb-12 text-lg">
                <EditableText 
                  id="chart_desc"
                  defaultText={"최근 5년간 동대구역 인근 신축 아파트의 매매가는 지속적인 상승세를 보이고 있습니다.\n특히 센텀스퀘어는 분양가 상한제 적용 또는 합리적인 분양가로 책정되어\n입주 시점에는 상당한 시세 차익(Premium)이 기대됩니다."}
                  tag="p"
                />
              </div>
              
              {/* Chart Visual */}
              <div className="flex gap-4 sm:gap-12 items-end h-64 w-full max-w-3xl justify-center pb-8 border-b border-gray-200">
                <div className="w-20 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-gray-200 h-32 rounded-t-lg relative transition-all group-hover:bg-[#D4AF37]/50"></div>
                  <span className="text-sm font-bold text-gray-500">2021</span>
                </div>
                <div className="w-20 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-gray-300 h-40 rounded-t-lg relative transition-all group-hover:bg-[#D4AF37]/50"></div>
                  <span className="text-sm font-bold text-gray-500">2022</span>
                </div>
                <div className="w-20 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-gray-400 h-48 rounded-t-lg relative transition-all group-hover:bg-[#D4AF37]/50"></div>
                  <span className="text-sm font-bold text-gray-500">2023</span>
                </div>
                <div className="w-20 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-[#0F172A] h-56 rounded-t-lg relative shadow-lg transition-all group-hover:bg-[#0F172A]/80"></div>
                  <span className="text-sm font-bold text-[#0F172A]">2024</span>
                </div>
                <div className="w-20 flex flex-col items-center gap-2 group relative">
                  <div className="absolute -top-12 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-md animate-bounce">UP</div>
                  <div className="w-full bg-[#D4AF37] h-64 rounded-t-lg relative shadow-xl"></div>
                  <span className="text-sm font-bold text-[#D4AF37]">입주 시점</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Development Timeline */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-[#0F172A] mb-8 flex items-center gap-2">
              <Calendar className="text-[#D4AF37]" />
              <EditableText id="timeline_title" defaultText="주요 개발 호재 일정" tag="span" />
            </h3>
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-10 pl-8 py-2">
              {[
                { id: 'time_1', year: "현재", title: "동대구 벤처밸리 활성화", desc: "지식서비스산업 거점 조성 중" },
                { id: 'time_2', year: "2024", title: "대구권 광역철도 개통 예정", desc: "구미~대구~경산 40분대 연결로 광역 교통망 확충" },
                { id: 'time_3', year: "2028", title: "엑스코선(4호선) 개통 예정", desc: "수성구민운동장~동대구역~이시아폴리스 연결" },
                { id: 'time_4', year: "미래", title: "대구경북통합신공항", desc: "글로벌 물류 경제 공항으로 도약 및 배후 도시 성장" },
              ].map((item, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -left-[43px] top-0 w-7 h-7 rounded-full bg-white border-4 border-[#D4AF37] shadow-sm group-hover:scale-125 transition-transform"></div>
                  <span className="text-sm text-[#D4AF37] font-bold mb-1 block uppercase tracking-wider">
                    <EditableText id={`${item.id}_year`} defaultText={item.year} tag="span" />
                  </span>
                  <h4 className="text-lg font-bold text-gray-800 mb-1">
                    <EditableText id={`${item.id}_title`} defaultText={item.title} tag="span" />
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    <EditableText id={`${item.id}_desc`} defaultText={item.desc} tag="span" />
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-[#0F172A] p-10 rounded-xl text-white shadow-2xl sticky top-28">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 border-b border-gray-700 pb-4">
              <TrendingUp className="text-[#D4AF37]" /> <EditableText id="invest_point_title" defaultText="전문가 투자 코멘트" tag="span" />
            </h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <CheckCircle2 className="text-[#D4AF37] shrink-0 w-6 h-6 mt-1" />
                <span className="text-gray-200 text-lg"><EditableText id="invest_point_1" defaultText="동대구역 도보 역세권의 절대적인 희소가치 보유" tag="span" /></span>
              </li>
              <li className="flex gap-4">
                <CheckCircle2 className="text-[#D4AF37] shrink-0 w-6 h-6 mt-1" />
                <span className="text-gray-200 text-lg"><EditableText id="invest_point_2" defaultText="1만 세대 브랜드 타운 형성으로 인한 동반 시세 상승 효과" tag="span" /></span>
              </li>
              <li className="flex gap-4">
                <CheckCircle2 className="text-[#D4AF37] shrink-0 w-6 h-6 mt-1" />
                <span className="text-gray-200 text-lg"><EditableText id="invest_point_3" defaultText="초기 투자금 부담을 낮춘 특별 금융 혜택 제공 (상담 필수)" tag="span" /></span>
              </li>
            </ul>
            <div className="mt-10 bg-white/10 p-6 rounded-lg text-center backdrop-blur-sm">
              <p className="text-gray-300 mb-4 font-light">더 구체적인 수익률 분석이 필요하신가요?</p>
              <button className="text-[#D4AF37] font-bold text-lg underline hover:text-white transition-colors flex items-center justify-center gap-2 w-full">
                전문가 상담 신청하기 <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  return (
    <div className="pt-32 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          <div className="w-full md:w-1/3">
             <div className="sticky top-28">
               <EditableImage 
                id="profile_img_main" 
                defaultSrc={DEFAULT_IMAGES.profile} 
                alt="Profile" 
                className="w-full aspect-[3/4] object-cover rounded-2xl shadow-2xl mb-8"
               />
               <div className="text-center">
                 <h2 className="text-3xl font-bold text-[#0F172A] mb-2">
                   <EditableText id="profile_name" defaultText="정세동 부장" tag="span" />
                 </h2>
                 <p className="text-[#D4AF37] font-medium mb-6 text-lg">
                   <EditableText id="profile_role_en" defaultText="부동산 투자 컨설턴트" tag="span" />
                 </p>
                 <div className="flex justify-center gap-4">
                   <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#0F172A] hover:text-white transition-all cursor-pointer shadow-md"><Phone size={20} /></div>
                   <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#0F172A] hover:text-white transition-all cursor-pointer shadow-md"><User size={20} /></div>
                 </div>
               </div>
             </div>
          </div>
          
          <div className="w-full md:w-2/3">
             <SectionHeading idPrefix="profile" title="인사말" align="left" subtitle="전문가 프로필" />
             
             <div className="prose max-w-none text-gray-600 space-y-8 mb-16">
               <div className="text-2xl font-light leading-relaxed text-[#0F172A] border-l-4 border-[#D4AF37] pl-6 italic">
                 <EditableText 
                   id="profile_intro_1"
                   defaultText={`"안녕하세요. 동대구역 부동산 투자의 정석, 정세동 부장입니다.\n지난 10년간 대구/경북 지역의 부동산 시장 흐름을 현장에서 직접 경험하며\n수많은 고객님들의 내 집 마련과 자산 증식을 도왔습니다."`}
                   tag="p"
                 />
               </div>
               <EditableText 
                 id="profile_intro_2"
                 defaultText={`부동산은 단순히 건물을 사는 것이 아닙니다.\n그것은 고객님의 '삶의 질'을 결정하고, 가족의 '미래'를 설계하는 가장 중요한 과정입니다.`}
                 className="block text-lg leading-relaxed"
                 tag="p"
               />
               <EditableText 
                 id="profile_intro_3"
                 defaultText={`객관적인 데이터 분석과 냉철한 시장 판단, 그리고 무엇보다 고객의 입장에서 생각하는\n진정성 있는 컨설팅으로 성공적인 투자의 길잡이가 되어드리겠습니다.`}
                 className="block text-lg leading-relaxed"
                 tag="p"
               />
             </div>

             <div className="grid sm:grid-cols-2 gap-8">
               <div className="bg-slate-50 p-8 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
                 <h4 className="font-bold text-xl mb-6 text-[#0F172A] flex items-center gap-2">
                   <User size={20} className="text-[#D4AF37]" /> <EditableText id="career_title" defaultText="주요 경력" tag="span" />
                 </h4>
                 <ul className="space-y-3 text-gray-600">
                   <li>· <EditableText id="career_1" defaultText="(현) 센텀스퀘어 전문 분양 상담사" tag="span" /></li>
                   <li>· <EditableText id="career_2" defaultText="(현) 대구 수성구 A부동산 수석 팀장" tag="span" /></li>
                   <li>· <EditableText id="career_3" defaultText="공인중개사 자격 보유" tag="span" /></li>
                   <li>· <EditableText id="career_4" defaultText="부동산 자산관리 전문가 과정 수료" tag="span" /></li>
                 </ul>
               </div>
               <div className="bg-[#0F172A] p-8 rounded-xl text-white shadow-lg">
                 <h4 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
                   <Star size={20} className="text-[#D4AF37]" /> <EditableText id="field_title" defaultText="전문 분야" tag="span" />
                 </h4>
                 <ul className="space-y-3 text-gray-300">
                   <li>· <EditableText id="field_1" defaultText="아파트 청약 및 분양권 분석" tag="span" /></li>
                   <li>· <EditableText id="field_2" defaultText="역세권 개발 호재 및 시세 예측" tag="span" /></li>
                   <li>· <EditableText id="field_3" defaultText="실거주 vs 투자 목적 맞춤형 포트폴리오" tag="span" /></li>
                   <li>· <EditableText id="field_4" defaultText="세무/대출 연계 원스톱 서비스" tag="span" /></li>
                 </ul>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', time: '', type: '84A' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Logic to send data would go here
  };

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6">
        <SectionHeading idPrefix="contact" title="VIP 상담 예약" subtitle="상담 문의" />

        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 relative bg-[#0F172A] text-white p-12 md:p-16 flex flex-col justify-between">
            <EditableImage id="consulting_bg" defaultSrc={DEFAULT_IMAGES.consulting} alt="bg" className="absolute inset-0 w-full h-full object-cover opacity-20" />
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-6">
                <EditableText id="contact_info_title" defaultText="고객님을 위한 특별 혜택" tag="span" />
              </h3>
              <p className="text-gray-300 mb-12 text-lg leading-relaxed">
                <EditableText 
                  id="contact_info_desc" 
                  defaultText="온라인 예약을 통해 방문하시는 고객님께는 프리미엄 시장 분석 리포트와 소정의 사은품을 드립니다."
                  tag="span"
                />
              </p>
              <ul className="space-y-8">
                <li className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0F172A] shadow-lg"><Phone size={24}/></div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">대표 전화</div>
                    <div className="font-bold text-2xl"><EditableText id="contact_tel" defaultText="053-247-9599" tag="span" /></div>
                  </div>
                </li>
                <li className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0F172A] shadow-lg"><Calendar size={24}/></div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">상담 가능 시간</div>
                    <div className="font-bold text-xl"><EditableText id="contact_time" defaultText="10:00 ~ 18:00 (연중무휴)" tag="span" /></div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative z-10 mt-16">
               <div className="p-6 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                 <p className="text-lg font-light italic text-center">
                   <EditableText id="contact_quote" defaultText={'"고객님의 소중한 자산,\n확실한 분석으로 보답하겠습니다."'} tag="span" />
                 </p>
               </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-12 md:p-16 bg-white">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">성함</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">연락처</label>
                  <input 
                    type="tel" 
                    required
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                    placeholder="010-1234-5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-800 mb-2">관심 평형</label>
                   <div className="grid grid-cols-4 gap-3">
                     {['84A', '84B', '107','125'].map((type) => (
                       <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, type})}
                        className={`py-3 border rounded-xl text-sm font-bold transition-all ${
                          formData.type === type 
                            ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-md' 
                            : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200'
                        }`}
                       >
                         {type}
                       </button>
                     ))}
                   </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">희망 상담 시간</label>
                  <input 
                    type="datetime-local" 
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                  />
                </div>
                
                <div className="pt-6">
                  <Button className="w-full justify-center text-lg py-4" variant="primary">
                    상담 예약 신청하기
                  </Button>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  개인정보는 상담 목적으로만 활용되며 안전하게 관리됩니다.
                </p>
              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 shadow-inner">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-bold text-[#0F172A] mb-4">예약이 접수되었습니다</h3>
                <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                  전문 상담사가 확인 후<br/>빠른 시간 내에 연락드리겠습니다.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline">
                  다른 예약 작성하기
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- App Container with Edit Provider ---

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState<Page>('main');
  const [isScrolled, setIsScrolled] = useState(false);
  const { isEditMode, toggleEditMode, resetContent, openEditor } = useEdit();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'analysis': return <AnalysisPage />;
      case 'investment': return <InvestmentPage />;
      case 'profile': return <ProfilePage />;
      case 'contact': return <ContactPage />;
      default: return <MainPage setPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-[#0F172A] selection:bg-[#D4AF37] selection:text-white">
      <Header currentPage={currentPage} setPage={setCurrentPage} isScrolled={isScrolled || currentPage !== 'main'} />
      <main>
        {renderPage()}
      </main>
      <Footer setPage={setCurrentPage} />

      {/* Admin Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
         {isEditMode && (
           <button 
             onClick={resetContent}
             className="bg-red-500 text-white p-4 rounded-full shadow-xl hover:bg-red-600 transition-all hover:scale-110 flex items-center justify-center group"
             title="초기화"
           >
             <RotateCcw size={24} className="group-hover:rotate-180 transition-transform duration-500" />
           </button>
         )}
         <button 
           onClick={toggleEditMode}
           className={`${isEditMode ? 'bg-[#D4AF37] ring-4 ring-[#D4AF37]/30' : 'bg-[#0F172A]'} text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center`}
           title={isEditMode ? "편집 종료" : "페이지 편집"}
         >
           {isEditMode ? <Save size={28} /> : <Pen size={28} />}
         </button>
      </div>
      
      {/* Edit Mode Indicator */}
      {isEditMode && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-white px-8 py-3 rounded-full shadow-2xl z-50 animate-bounce font-bold flex items-center gap-2 border-2 border-white/20">
          <Pen size={16} /> 편집 모드 실행 중: 점선으로 표시된 영역을 클릭하여 수정하세요
        </div>
      )}
    </div>
  );
};

interface EditItem {
  id: string;
  value: string;
  type: EditType;
}

const App = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [content, setContent] = useState<Record<string, string>>({});
  const [editingItem, setEditingItem] = useState<EditItem | null>(null);

  const updateContent = (key: string, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const resetContent = () => {
    if(window.confirm('모든 수정사항을 초기화하시겠습니까?')) {
      setContent({});
    }
  };

  const openEditor = (id: string, initialValue: string, type: EditType) => {
    setEditingItem({ id, value: initialValue, type });
  };

  const handleSaveEdit = (value: string) => {
    if (editingItem) {
      updateContent(editingItem.id, value);
      setEditingItem(null);
    }
  };

  return (
    <EditContext.Provider value={{ 
      isEditMode, 
      toggleEditMode: () => setIsEditMode(!isEditMode), 
      content, 
      updateContent,
      resetContent,
      openEditor
    }}>
      <AppContent />
      {/* Modal is rendered at the top level */}
      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
        initialValue={editingItem?.value || ''}
        type={editingItem?.type || 'text'}
      />
    </EditContext.Provider>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);