import { useState, useMemo, useEffect, useRef } from "react";

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
type Lang = "kr" | "en";
type Route = "dashboard" | "orders" | "chat";
type Period = "today" | "7d" | "30d";

// ── Hash Router ──
function useHashRoute(): [Route, (r: Route) => void] {
  const get = (): Route => {
    const h = window.location.hash.replace("#/", "");
    return h === "orders" ? "orders" : h === "chat" ? "chat" : "dashboard";
  };
  const [route, set] = useState<Route>(get);
  useEffect(() => {
    const fn = () => set(get());
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  return [route, (r: Route) => { window.location.hash = `#/${r}`; }];
}

// ────────────────────────────────────────────
// Shared Components & Nav
// ────────────────────────────────────────────
const ChevDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
);

type NavChild = { id: string; kr: string; en: string; active?: boolean; phase?: number };
type NavItem = { id: string; kr?: string; en?: string; icon?: JSX.Element; route?: Route; children?: NavChild[]; tag?: string };

const NAV: NavItem[] = [
  // ── 메인 ──
  { id: "dashboard", kr: "대시보드", en: "Dashboard", route: "dashboard", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  )},
  { id: "orders", kr: "주문 관리", en: "Orders", route: "orders", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
  ), children: [
    { id: "order-list", kr: "주문 목록", en: "Order List" },
    { id: "order-needs", kr: "응대필요 탭", en: "Needs Response" },
    { id: "order-panel", kr: "상담 슬라이드 패널", en: "Chat Slide Panel" },
  ]},
  { id: "chat", kr: "상담 (번개톡)", en: "Chat Support", route: "chat", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
  )},
  { id: "divider" },
  // ── 설정 ──
  { id: "accounts", kr: "계정관리", en: "Accounts", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
  ), children: [
    { id: "account-list", kr: "하위계정 목록", en: "Sub-Account List" },
    { id: "account-crud", kr: "하위계정 생성/수정/삭제", en: "Create / Edit / Delete" },
  ]},
  { id: "api", kr: "API 설정", en: "API Settings", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
  ), children: [
    { id: "api-key", kr: "API Key 관리", en: "API Key Management" },
  ]},
  { id: "notices", kr: "공지사항", en: "Notices", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
  ), children: [
    { id: "notice-list", kr: "공지 목록 / 상세", en: "Notice List / Detail" },
  ]},
  { id: "divider2" },
  // ── 마이페이지 ──
  { id: "mypage", kr: "마이페이지", en: "My Page", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ), children: [
    { id: "profile", kr: "프로필 조회 / 수정", en: "Profile" },
    { id: "addresses", kr: "배송지 관리", en: "Shipping Addresses" },
  ]},
  { id: "divider3" },
  // ── 어드민 ──
  { id: "admin-partners", kr: "파트너 관리", en: "Partner Mgmt", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ), children: [
    { id: "partner-list", kr: "파트너 계정 목록", en: "Partner Account List" },
  ]},
  { id: "admin-notices", kr: "공지사항 관리", en: "Notice Mgmt", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  ), children: [
    { id: "notice-crud", kr: "공지사항 CRUD", en: "Notice CRUD" },
  ]},
];

// ────────────────────────────────────────────
// Dashboard Mock Data
// ────────────────────────────────────────────
function genDailyData(days: number) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(2025, 1, 11 - i);
    const orders = Math.floor(Math.random() * 15) + 3;
    const revenue = orders * (Math.floor(Math.random() * 40000) + 10000);
    data.push({ date: d, orders, revenue });
  }
  return data;
}
const DAILY_DATA = genDailyData(30);

const DASH_STATUSES_KR: Record<string, string> = {
  PAYMENT_RECEIVED: "결제완료", SHIP_READY: "배송준비중", IN_TRANSIT: "배송중",
  DELIVERY_COMPLETED: "배송완료", PURCHASE_CONFIRM: "구매확정",
  CANCEL_REQUESTED_BEFORE_SHIPPING: "배송전취소", REFUNDED: "환불완료", RETURNING: "반품진행중",
};
const DASH_STATUSES_EN: Record<string, string> = {
  PAYMENT_RECEIVED: "Payment Received", SHIP_READY: "Ship Ready", IN_TRANSIT: "In Transit",
  DELIVERY_COMPLETED: "Delivered", PURCHASE_CONFIRM: "Confirmed",
  CANCEL_REQUESTED_BEFORE_SHIPPING: "Cancel Requested", REFUNDED: "Refunded", RETURNING: "Returning",
};
const DASH_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PAYMENT_RECEIVED: { bg: "#d1fae5", text: "#065f46" }, SHIP_READY: { bg: "#dbeafe", text: "#1e40af" },
  IN_TRANSIT: { bg: "#fef9c3", text: "#854d0e" }, DELIVERY_COMPLETED: { bg: "#d1fae5", text: "#065f46" },
  PURCHASE_CONFIRM: { bg: "#bbf7d0", text: "#166534" }, CANCEL_REQUESTED_BEFORE_SHIPPING: { bg: "#fee2e2", text: "#991b1b" },
  REFUNDED: { bg: "#fee2e2", text: "#991b1b" }, RETURNING: { bg: "#ffedd5", text: "#9a3412" },
};

const dashShops = ["LuRuby", "TangShirley", "ChanChloe", "SerwinShadi", "KimGrace", "HeJoanna", "VoHien", "SamPriya"];
const dashStatKeys = Object.keys(DASH_STATUSES_KR);

function genRecentOrders(n: number) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(2025, 1, 11, Math.floor(Math.random() * 12) + 6, Math.floor(Math.random() * 60));
    const st = dashStatKeys[Math.floor(Math.random() * dashStatKeys.length)];
    const price = (Math.floor(Math.random() * 800) + 50) * 100;
    arr.push({ id: `#${1186 - i}A`, date: d, shop: dashShops[Math.floor(Math.random() * dashShops.length)], status: st, price, items: Math.floor(Math.random() * 3) + 1 });
  }
  return arr;
}
const RECENT_ORDERS = genRecentOrders(8);

const NOTICES = [
  { id: 1, kr: "2025년 2월 정산 일정 안내", en: "February 2025 Settlement Schedule", date: "2025-02-10", tag: { kr: "정산", en: "Settlement" } },
  { id: 2, kr: "API v2.3 업데이트 안내 (배송 상태 필드 추가)", en: "API v2.3 Update (Delivery Status Field)", date: "2025-02-08", tag: { kr: "API", en: "API" } },
  { id: 3, kr: "설 연휴 기간 고객 상담 운영 안내", en: "Lunar New Year Holiday Support Schedule", date: "2025-02-05", tag: { kr: "운영", en: "Operations" } },
];

// ────────────────────────────────────────────
// Orders Mock Data
// ────────────────────────────────────────────
type StatusKey = keyof typeof ORDER_STATUSES;
type DeliveryKey = keyof typeof DELIVERY;
type Seller = { id: number; shopName: string };
type Order = {
  id: string; numId: number; date: Date; seller: Seller;
  totalPrice: number; productPrice: number; deliveryPrice: number;
  status: StatusKey; deliveryStatus: DeliveryKey; items: number; method: string;
};

const ORDER_STATUSES = {
  PAYMENT_RECEIVED: { kr: "결제완료", en: "Payment Received", color: "#d1fae5", text: "#065f46" },
  SHIP_READY: { kr: "배송준비중", en: "Ship Ready", color: "#dbeafe", text: "#1e40af" },
  IN_TRANSIT: { kr: "배송중", en: "In Transit", color: "#fef9c3", text: "#854d0e" },
  DELIVERY_COMPLETED: { kr: "배송완료", en: "Delivered", color: "#d1fae5", text: "#065f46" },
  PURCHASE_CONFIRM: { kr: "구매확정", en: "Confirmed", color: "#bbf7d0", text: "#166534" },
  CANCEL_REQUESTED_BEFORE_SHIPPING: { kr: "배송전취소", en: "Cancel Requested", color: "#fee2e2", text: "#991b1b" },
  WAITING_REFUND: { kr: "환불대기", en: "Waiting Refund", color: "#ffedd5", text: "#9a3412" },
  REFUNDING: { kr: "환불진행중", en: "Refunding", color: "#ffedd5", text: "#9a3412" },
  REFUNDED: { kr: "환불완료", en: "Refunded", color: "#fee2e2", text: "#991b1b" },
  REFUND_ERROR: { kr: "환불오류", en: "Refund Error", color: "#fecaca", text: "#991b1b" },
  RETURN_REQUESTED: { kr: "반품요청", en: "Return Requested", color: "#ffedd5", text: "#9a3412" },
  RETURN_BEFORE_SHIPPING: { kr: "반품배송전", en: "Return Before Ship", color: "#ffedd5", text: "#9a3412" },
  RETURNING: { kr: "반품진행중", en: "Returning", color: "#ffedd5", text: "#9a3412" },
  RETURNED: { kr: "반품완료", en: "Returned", color: "#fed7aa", text: "#9a3412" },
  ON_HOLD_RETURN_REFUND: { kr: "반품환불보류", en: "Return On Hold", color: "#fecaca", text: "#991b1b" },
} as const;

const DELIVERY = {
  pending: { kr: "배송전", en: "Pending", dot: "#9ca3af" },
  in_transit: { kr: "배송중", en: "In Transit", dot: "#eab308" },
  delivered: { kr: "배송완료", en: "Delivered", dot: "#22c55e" },
  returning: { kr: "반품배송중", en: "Returning", dot: "#f97316" },
} as const;

const TABS = [
  { id: "all", kr: "전체", en: "All" },
  { id: "needs_response", kr: "응대필요", en: "Needs Response" },
  { id: "approved", kr: "판매승인", en: "Approved" },
  { id: "shipping", kr: "배송중", en: "Shipping" },
  { id: "delivered", kr: "배송완료", en: "Delivered" },
  { id: "cancelled", kr: "취소", en: "Cancelled" },
  { id: "returns", kr: "반품", en: "Returns" },
  { id: "operations", kr: "운영", en: "Operations" },
  { id: "archived", kr: "보관", en: "Archived" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TAB_MAP: Record<TabId, StatusKey[] | null> = {
  all: null,
  needs_response: null, // special: filtered by delay logic, not by status
  approved: ["PAYMENT_RECEIVED", "SHIP_READY"],
  shipping: ["IN_TRANSIT"],
  delivered: ["DELIVERY_COMPLETED", "PURCHASE_CONFIRM"],
  cancelled: ["CANCEL_REQUESTED_BEFORE_SHIPPING", "WAITING_REFUND", "REFUNDING", "REFUNDED"],
  returns: ["RETURN_REQUESTED", "RETURN_BEFORE_SHIPPING", "RETURNING", "RETURNED", "ON_HOLD_RETURN_REFUND"],
  operations: ["ON_HOLD_RETURN_REFUND", "REFUND_ERROR"],
  archived: null, // special: filtered by archived state
};

const sellers: Seller[] = [
  { id: 2000002836, shopName: "LuRuby" }, { id: 2000002837, shopName: "TangShirley" },
  { id: 2000002838, shopName: "ChanChloe" }, { id: 2000002839, shopName: "SerwinShadi" },
  { id: 2000002840, shopName: "KangIssac" }, { id: 2000002841, shopName: "YouWenlin" },
  { id: 2000002842, shopName: "FernandezValme" }, { id: 2000002843, shopName: "HeJoanna" },
  { id: 2000002844, shopName: "PhamQuynh" }, { id: 2000002845, shopName: "GaiserNatalia" },
  { id: 2000002846, shopName: "VoHien" }, { id: 2000002847, shopName: "SamPriya" },
  { id: 2000002848, shopName: "KimGrace" }, { id: 2000002849, shopName: "LeeAlexander" },
  { id: 2000002850, shopName: "DurantIsabel" },
];

const methods = ["CJ대한통운", "GS택배", "우체국택배"];
const orderStatKeys = Object.keys(ORDER_STATUSES) as StatusKey[];
const delKeys = Object.keys(DELIVERY) as DeliveryKey[];

function genOrders(n: number): Order[] {
  const arr: Order[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(2025, 1, 11 - Math.floor(i * 0.5), 6 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));
    const s = sellers[Math.floor(Math.random() * sellers.length)];
    const st = orderStatKeys[Math.floor(Math.random() * orderStatKeys.length)];
    const ds: DeliveryKey = st === "PAYMENT_RECEIVED" || st === "SHIP_READY" ? "pending" : st === "IN_TRANSIT" ? "in_transit" : st === "DELIVERY_COMPLETED" || st === "PURCHASE_CONFIRM" ? "delivered" : st.startsWith("RETURN") || st === "ON_HOLD_RETURN_REFUND" ? "returning" : delKeys[Math.floor(Math.random() * delKeys.length)];
    const items = Math.floor(Math.random() * 3) + 1;
    const price = (Math.floor(Math.random() * 950) + 50) * 100;
    const del = (Math.floor(Math.random() * 30) + 5) * 100;
    arr.push({ id: `#${1186 - i}A`, numId: 1186 - i, date: d, seller: s, totalPrice: price + del, productPrice: price, deliveryPrice: del, status: st, deliveryStatus: ds, items, method: methods[Math.floor(Math.random() * methods.length)] });
  }
  return arr;
}
const ALL_ORDERS = genOrders(120);

const Badge = ({ status, lang }: { status: StatusKey; lang: Lang }) => {
  const s = ORDER_STATUSES[status];
  return <span style={{ background: s.color, color: s.text, padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 500, whiteSpace: "nowrap" }}>{lang === "kr" ? s.kr : s.en}</span>;
};

const DeliveryDot = ({ status, lang }: { status: DeliveryKey; lang: Lang }) => {
  const d = DELIVERY[status];
  if (!d) return <span style={{ color: "#9ca3af", fontSize: 12 }}>-</span>;
  return <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: d.dot, display: "inline-block" }} />{lang === "kr" ? d.kr : d.en}</span>;
};

// ────────────────────────────────────────────
// Dashboard Charts
// ────────────────────────────────────────────
const MiniChart = ({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={height} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
};

const BarChart = ({ data, lang, view }: { data: typeof DAILY_DATA; lang: Lang; view: "revenue" | "orders" }) => {
  const max = Math.max(...data.map(d => view === "revenue" ? d.revenue : d.orders));
  const barW = Math.max(Math.floor(600 / data.length) - 4, 8);
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 180, padding: "0 4px", minWidth: data.length * (barW + 4) }}>
        {data.map((d, i) => {
          const val = view === "revenue" ? d.revenue : d.orders;
          const h = max > 0 ? (val / max) * 160 : 0;
          const label = `${d.date.getMonth() + 1}/${d.date.getDate()}`;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
              <div style={{ fontSize: 9, color: "#9ca3af", marginBottom: 2 }}>
                {view === "revenue" ? `${(val / 10000).toFixed(0)}${lang === "kr" ? "만" : "k"}` : val}
              </div>
              <div style={{ width: barW, height: h, background: i === data.length - 1 ? "#111" : "#e5e7eb", borderRadius: "3px 3px 0 0", transition: "height 0.3s" }} />
              <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 3 }}>{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────
// Sidebar Component
// ────────────────────────────────────────────
function Sidebar({ route, setRoute, lang, t }: { route: Route; setRoute: (r: Route) => void; lang: Lang; t: (kr: string, en: string) => string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>(route === "orders" ? ["orders"] : []);
  const toggleMenu = (id: string) => setOpenMenus(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const sw = collapsed ? 56 : 230;

  return (
    <div style={{ width: sw, background: "#1a1a1a", color: "#a0a0a0", paddingTop: 12, flexShrink: 0, transition: "width 0.2s", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: collapsed ? "8px 0" : "8px 14px 16px", display: "flex", alignItems: "center", gap: 8, justifyContent: collapsed ? "center" : "flex-start", cursor: "pointer" }} onClick={() => setCollapsed(!collapsed)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        {!collapsed && <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{t("번개장터 파트너", "Bunjang Partner")}</span>}
      </div>
      <div style={{ flex: 1, paddingTop: 4, overflowY: "auto" }}>
        {NAV.map((item, i) => {
          if (item.id.startsWith("divider")) return <div key={i} style={{ height: 1, background: "#333", margin: "8px 12px" }} />;
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = openMenus.includes(item.id);
          const isActive = item.route === route;
          return (
            <div key={item.id}>
              <div
                style={{ padding: collapsed ? "9px 0" : "9px 14px", display: "flex", alignItems: "center", gap: 10, background: isActive && !hasChildren ? "#2d2d2d" : "transparent", color: isActive ? "#fff" : "#a0a0a0", cursor: "pointer", borderLeft: isActive && !hasChildren ? "3px solid #f59e0b" : "3px solid transparent", justifyContent: collapsed ? "center" : "flex-start", fontSize: 13 }}
                onClick={() => { if (item.route) setRoute(item.route); if (hasChildren) toggleMenu(item.id); }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#252525"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = isActive && !hasChildren ? "#2d2d2d" : "transparent"; }}
              >
                <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
                {!collapsed && <span style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>{t(item.kr || "", item.en || "")}{item.tag && <span style={{ background: item.tag === "제거예정" ? "#4a2020" : "#3b3b3b", color: item.tag === "제거예정" ? "#f87171" : "#9ca3af", fontSize: 9, fontWeight: 600, padding: "0 4px", borderRadius: 3, lineHeight: "16px", flexShrink: 0 }}>{item.tag}</span>}</span>}
                {!collapsed && hasChildren && <span style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s", display: "flex" }}><ChevDown /></span>}
              </div>
              {!collapsed && hasChildren && isOpen && (
                <div style={{ paddingLeft: 38 }}>
                  {item.children!.map(child => (
                    <div key={child.id}
                      style={{ padding: "7px 10px", fontSize: 12, color: child.active ? "#fff" : "#777", cursor: "pointer", borderLeft: child.active ? "2px solid #f59e0b" : "2px solid transparent", background: child.active ? "#2d2d2d" : "transparent", borderRadius: "0 4px 4px 0" }}
                      onMouseEnter={(e) => { if (!child.active) (e.currentTarget as HTMLDivElement).style.color = "#ccc"; }}
                      onMouseLeave={(e) => { if (!child.active) (e.currentTarget as HTMLDivElement).style.color = "#777"; }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {t(child.kr, child.en)}
                        {child.phase === 2 && <span style={{ background: "#3b3b3b", color: "#9ca3af", fontSize: 9, fontWeight: 600, padding: "0 4px", borderRadius: 3, lineHeight: "16px", flexShrink: 0 }}>P2</span>}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!collapsed && <div style={{ padding: "12px 14px", borderTop: "1px solid #333", fontSize: 11, color: "#666" }}>Bunjang Partner Center v1.0</div>}
    </div>
  );
}

// ────────────────────────────────────────────
// Dashboard Page
// ────────────────────────────────────────────
function DashboardPage({ lang, t, setRoute }: { lang: Lang; t: (kr: string, en: string) => string; setRoute: (r: Route) => void }) {
  const [period, setPeriod] = useState<Period>("30d");
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [chartView, setChartView] = useState<"revenue" | "orders">("revenue");

  const periodLabel = period === "today" ? t("오늘", "Today") : period === "7d" ? t("지난 7일", "Last 7 days") : t("지난 30일", "Last 30 days");
  const periodDays = period === "today" ? 1 : period === "7d" ? 7 : 30;
  const chartData = DAILY_DATA.slice(-periodDays);

  const totalOrders = chartData.reduce((s, d) => s + d.orders, 0);
  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
  const prevData = DAILY_DATA.slice(-periodDays * 2, -periodDays);
  const prevOrders = prevData.reduce((s, d) => s + d.orders, 0);
  const prevRevenue = prevData.reduce((s, d) => s + d.revenue, 0);
  const ordChange = prevOrders > 0 ? Math.round(((totalOrders - prevOrders) / prevOrders) * 100) : 0;
  const revChange = prevRevenue > 0 ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("좋은 오전입니다", "Good morning") : hour < 18 ? t("좋은 오후입니다", "Good afternoon") : t("좋은 저녁입니다", "Good evening");

  return (
    <div style={{ flex: 1, padding: "20px 28px", overflow: "auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t("대시보드", "Dashboard")}</h1>
      </div>

      {/* Period Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, position: "relative" }}>
        <button onClick={() => setShowPeriodPicker(!showPeriodPicker)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {periodLabel}
          <ChevDown />
        </button>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>
          {period === "today" ? t("어제 데이터와 비교", "Compared to yesterday") : period === "7d" ? t("이전 7일과 비교", "Compared to previous 7 days") : t("이전 30일과 비교", "Compared to previous 30 days")}
        </span>
        {showPeriodPicker && (
          <div style={{ position: "absolute", top: 36, left: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, width: 260, overflow: "hidden" }}>
            {([
              { id: "today" as Period, kr: "오늘", en: "Today", desc: { kr: "어제 데이터와 비교", en: "Compared to yesterday" } },
              { id: "7d" as Period, kr: "지난 7일", en: "Last 7 days", desc: { kr: "이전 7일과 비교", en: "Compared to previous 7 days" } },
              { id: "30d" as Period, kr: "지난 30일", en: "Last 30 days", desc: { kr: "이전 30일과 비교", en: "Compared to previous 30 days" } },
            ]).map(p => (
              <div key={p.id} onClick={() => { setPeriod(p.id); setShowPeriodPicker(false); }}
                style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 10, borderBottom: "1px solid #f3f4f6" }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#f9fafb"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", border: period === p.id ? "5px solid #111" : "2px solid #d1d5db", display: "inline-block", flexShrink: 0, marginTop: 1, boxSizing: "border-box" }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t(p.kr, p.en)}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{t(p.desc.kr, p.desc.en)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { kr: "주문 건수", en: "Orders", val: totalOrders, change: ordChange, mini: chartData.map(d => d.orders), color: "#6366f1" },
          { kr: "총 매출", en: "Revenue", val: `${(totalRevenue / 10000).toFixed(0)}${t("만원", "만원")}`, change: revChange, mini: chartData.map(d => d.revenue), color: "#22c55e" },
          { kr: "처리할 상담", en: "Pending Chats", val: 5, change: null, mini: null, color: "#eab308" },
          { kr: "상담 응대 리드타임 (P50)", en: "Chat Response P50", val: t("6분 05초", "6m 05s"), change: null, mini: null, color: "#8b5cf6" },
        ].map((c, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>{t(c.kr, c.en)}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: 22, fontWeight: 700 }}>{c.val}</span>
                {c.change !== null && (
                  <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 500, color: c.change >= 0 ? "#16a34a" : "#dc2626" }}>
                    {c.change >= 0 ? "↑" : "↓"} {Math.abs(c.change)}%
                  </span>
                )}
              </div>
              {c.mini && <MiniChart data={c.mini} color={c.color} />}
            </div>
          </div>
        ))}
      </div>

      {/* Action Card */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#f9fafb"}
          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "#fff"}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{t("처리할 상담 5건", "5 chats to process")}</span>
        </div>
      </div>

      {/* Greeting */}
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
        {greeting}. {t("시작해 볼까요?", "Let's get started.")}
      </div>

      {/* Notices */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{t("공지사항", "Notices")}</span>
          <span style={{ fontSize: 12, color: "#6366f1", cursor: "pointer" }}>{t("전체보기", "View all")}</span>
        </div>
        {NOTICES.map(n => (
          <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}>
            <span style={{ background: "#f3f4f6", color: "#6b7280", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 500, flexShrink: 0 }}>{t(n.tag.kr, n.tag.en)}</span>
            <span style={{ fontSize: 13, flex: 1 }}>{t(n.kr, n.en)}</span>
            <span style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>{n.date}</span>
          </div>
        ))}
      </div>

      {/* Chart + Recent Orders */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Revenue Chart */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{t("매출 추이", "Revenue Trend")}</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setChartView("revenue")}
                style={{ padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: 5, background: chartView === "revenue" ? "#111" : "#fff", color: chartView === "revenue" ? "#fff" : "#6b7280", cursor: "pointer", fontSize: 11, fontWeight: 500 }}>
                {t("매출", "Revenue")}
              </button>
              <button onClick={() => setChartView("orders")}
                style={{ padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: 5, background: chartView === "orders" ? "#111" : "#fff", color: chartView === "orders" ? "#fff" : "#6b7280", cursor: "pointer", fontSize: 11, fontWeight: 500 }}>
                {t("주문수", "Orders")}
              </button>
            </div>
          </div>
          <BarChart data={chartData} lang={lang} view={chartView} />
        </div>

        {/* Recent Orders */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{t("최근 주문", "Recent Orders")}</span>
            <span style={{ fontSize: 12, color: "#6366f1", cursor: "pointer" }} onClick={() => setRoute("orders")}>{t("전체보기", "View all")}</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "6px 0", textAlign: "left", fontWeight: 600, color: "#6b7280" }}>{t("주문번호", "Order")}</th>
                <th style={{ padding: "6px 0", textAlign: "left", fontWeight: 600, color: "#6b7280" }}>{t("상점", "Shop")}</th>
                <th style={{ padding: "6px 0", textAlign: "right", fontWeight: 600, color: "#6b7280" }}>{t("금액", "Amount")}</th>
                <th style={{ padding: "6px 0", textAlign: "center", fontWeight: 600, color: "#6b7280" }}>{t("상태", "Status")}</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map(o => {
                const sc = DASH_STATUS_COLORS[o.status] || { bg: "#f3f4f6", text: "#374151" };
                return (
                  <tr key={o.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "8px 0", color: "#2563eb", fontWeight: 500 }}>{o.id}</td>
                    <td style={{ padding: "8px 0" }}>{o.shop}</td>
                    <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 600 }}>{o.price.toLocaleString()}원</td>
                    <td style={{ padding: "8px 0", textAlign: "center" }}>
                      <span style={{ background: sc.bg, color: sc.text, padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 500, whiteSpace: "nowrap" }}>
                        {lang === "kr" ? DASH_STATUSES_KR[o.status] : DASH_STATUSES_EN[o.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Orders Page — Sort Helpers
// ────────────────────────────────────────────
const STATUS_PRIORITY: Record<StatusKey, number> = {
  CANCEL_REQUESTED_BEFORE_SHIPPING: 0,
  RETURN_REQUESTED: 1,
  REFUND_ERROR: 2,
  ON_HOLD_RETURN_REFUND: 3,
  RETURNING: 4,
  RETURN_BEFORE_SHIPPING: 5,
  WAITING_REFUND: 6,
  REFUNDING: 7,
  RETURNED: 8,
  REFUNDED: 9,
  PAYMENT_RECEIVED: 10,
  SHIP_READY: 11,
  IN_TRANSIT: 12,
  DELIVERY_COMPLETED: 13,
  PURCHASE_CONFIRM: 14,
};

type SortKey = "date" | "status" | "response" | "price";
type SortDir = "asc" | "desc";

const SortTh = ({ label, active, dir, onClick, align = "left" }: { label: string; active: boolean; dir: SortDir; onClick: () => void; align?: "left" | "right" | "center" }) => (
  <th onClick={onClick} style={{ padding: "9px 10px", textAlign: align, fontWeight: 600, color: "#374151", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      {label}
      <span style={{ fontSize: 10, color: active ? "#111" : "#d1d5db" }}>{active ? (dir === "asc" ? "▲" : "▼") : "⇅"}</span>
    </span>
  </th>
);

// ────────────────────────────────────────────
// Orders Page
// ────────────────────────────────────────────
function OrdersPage({ lang, t, conversations, setConversations }: { lang: Lang; t: (kr: string, en: string) => string; conversations: Conversation[]; setConversations: React.Dispatch<React.SetStateAction<Conversation[]>> }) {
  const [tab, setTab] = useState<TabId>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [checked, setChecked] = useState<number[]>([]);
  const [allChecked, setAllChecked] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [archivedOrders, setArchivedOrders] = useState<Set<number>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [chatPanelSellerId, setChatPanelSellerId] = useState<number | null>(null);
  const [chatPanelInput, setChatPanelInput] = useState("");
  const [chatPanelMode, setChatPanelMode] = useState<"message" | "internal_note">("message");
  const [chatPanelShowEmoji, setChatPanelShowEmoji] = useState(false);
  const chatPanelMsgRef = useRef<HTMLDivElement | null>(null);

  const findConvBySeller = (sellerId: number) => conversations.find(c => c.seller.id === sellerId) || null;
  const chatPanelConv = chatPanelSellerId ? findConvBySeller(chatPanelSellerId) : null;

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) { setSortKey(key); setSortDir("desc"); }
    else if (sortDir === "desc") { setSortDir("asc"); }
    else { setSortKey(null); setSortDir("desc"); }
    setPage(0);
  };

  const archiveChecked = () => {
    setArchivedOrders(prev => { const next = new Set(prev); checked.forEach(id => next.add(id)); return next; });
    setChecked([]); setAllChecked(false);
  };
  const unarchiveChecked = () => {
    setArchivedOrders(prev => { const next = new Set(prev); checked.forEach(id => next.delete(id)); return next; });
    setChecked([]); setAllChecked(false);
  };

  useEffect(() => {
    if (chatPanelSellerId && chatPanelMsgRef.current) {
      setTimeout(() => { if (chatPanelMsgRef.current) chatPanelMsgRef.current.scrollTop = chatPanelMsgRef.current.scrollHeight; }, 100);
    }
  }, [chatPanelSellerId]);
  const [exportRange, setExportRange] = useState<"current" | "all" | "date">("current");
  const [exportDateStart, setExportDateStart] = useState("");
  const [exportDateEnd, setExportDateEnd] = useState("");
  const [summaryPeriod, setSummaryPeriod] = useState<"today" | "7d" | "30d">("30d");
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const ps = 50;

  const needsResponseSellerIds = useMemo(() => {
    const ids = new Set<number>();
    conversations.forEach((c: Conversation) => {
      if (!c.blocked && getDelayInfo(c).level > 0) ids.add(c.seller.id);
    });
    return ids;
  }, [conversations]);

  const currentAgent = AGENTS[0]; // 현재 로그인된 상담사

  const filtered = useMemo(() => {
    let list = ALL_ORDERS;
    // 보관 탭이면 보관된 것만, 그 외 탭은 보관 제외
    if (tab === "archived") {
      list = list.filter((o) => archivedOrders.has(o.numId));
    } else {
      list = list.filter((o) => !archivedOrders.has(o.numId));
    }
    if (tab === "needs_response") {
      list = list.filter((o) => needsResponseSellerIds.has(o.seller.id));
      // 지연 심한 순(level 3→2→1), 같은 level이면 본인→미배정→타 상담사
      list = [...list].sort((a, b) => {
        const convA = findConvBySeller(a.seller.id);
        const convB = findConvBySeller(b.seller.id);
        const delayA = convA ? getDelayInfo(convA) : { level: 0, hours: 0 };
        const delayB = convB ? getDelayInfo(convB) : { level: 0, hours: 0 };
        if (delayA.level !== delayB.level) return delayB.level - delayA.level;
        if (delayA.hours !== delayB.hours) return delayB.hours - delayA.hours;
        const rankOf = (conv: Conversation | null) =>
          conv?.assignee === currentAgent ? 0 : !conv?.assignee ? 1 : 2;
        return rankOf(convA) - rankOf(convB);
      });
    } else {
      const map = TAB_MAP[tab];
      if (map) list = list.filter((o) => map.includes(o.status));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o => o.id.toLowerCase().includes(q) || o.seller.shopName.toLowerCase().includes(q) || String(o.seller.id).includes(q) || o.method.toLowerCase().includes(q));
    }
    if (sortKey) {
      const dir = sortDir === "asc" ? 1 : -1;
      list = [...list].sort((a, b) => {
        if (sortKey === "date") return dir * (a.date.getTime() - b.date.getTime());
        if (sortKey === "status") return dir * ((STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99));
        if (sortKey === "price") return dir * (a.totalPrice - b.totalPrice);
        if (sortKey === "response") {
          const convA = findConvBySeller(a.seller.id);
          const convB = findConvBySeller(b.seller.id);
          const levelA = convA ? getDelayInfo(convA).level : 0;
          const levelB = convB ? getDelayInfo(convB).level : 0;
          return dir * (levelA - levelB);
        }
        return 0;
      });
    }
    return list;
  }, [tab, search, needsResponseSellerIds, sortKey, sortDir, conversations, archivedOrders]);

  const tabCounts = useMemo(() => {
    const c: Record<string, number> = {};
    const active = ALL_ORDERS.filter(o => !archivedOrders.has(o.numId));
    TABS.forEach((tb) => {
      if (tb.id === "archived") {
        c[tb.id] = archivedOrders.size;
      } else if (tb.id === "needs_response") {
        c[tb.id] = active.filter((o) => needsResponseSellerIds.has(o.seller.id)).length;
      } else {
        const map = TAB_MAP[tb.id as TabId];
        c[tb.id] = !map ? active.length : active.filter((o) => map.includes(o.status)).length;
      }
    });
    return c;
  }, [needsResponseSellerIds, archivedOrders]);

  const now = new Date(2025, 1, 11);
  const periodLabel = summaryPeriod === "today" ? t("오늘", "Today") : summaryPeriod === "7d" ? t("지난 7일", "Last 7 days") : t("지난 30일", "Last 30 days");
  const periodDays = summaryPeriod === "today" ? 0 : summaryPeriod === "7d" ? 7 : 30;

  const periodOrders = useMemo(() => {
    if (summaryPeriod === "today") return ALL_ORDERS.filter(o => o.date.toDateString() === now.toDateString());
    const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - periodDays);
    return ALL_ORDERS.filter(o => o.date >= cutoff);
  }, [summaryPeriod]);

  const prevPeriodOrders = useMemo(() => {
    if (summaryPeriod === "today") { const y = new Date(now); y.setDate(y.getDate() - 1); return ALL_ORDERS.filter(o => o.date.toDateString() === y.toDateString()); }
    const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - periodDays);
    const prev = new Date(cutoff); prev.setDate(prev.getDate() - periodDays);
    return ALL_ORDERS.filter(o => o.date >= prev && o.date < cutoff);
  }, [summaryPeriod]);

  const calcChange = (curr: number, prev: number) => { if (prev === 0) return curr > 0 ? 100 : 0; return Math.round(((curr - prev) / prev) * 100); };

  const summaryCards = useMemo(() => {
    const curr = periodOrders; const prev = prevPeriodOrders;
    return [
      { kr: "전체 주문", en: "Total", curr: curr.length, prev: prev.length },
      { kr: "결제완료", en: "Paid", curr: curr.filter(o => o.status === "PAYMENT_RECEIVED").length, prev: prev.filter(o => o.status === "PAYMENT_RECEIVED").length },
      { kr: "배송중", en: "Shipping", curr: curr.filter(o => o.status === "IN_TRANSIT").length, prev: prev.filter(o => o.status === "IN_TRANSIT").length },
      { kr: "취소/환불", en: "Cancelled", curr: curr.filter(o => ["CANCEL_REQUESTED_BEFORE_SHIPPING", "WAITING_REFUND", "REFUNDING", "REFUNDED"].includes(o.status)).length, prev: prev.filter(o => ["CANCEL_REQUESTED_BEFORE_SHIPPING", "WAITING_REFUND", "REFUNDING", "REFUNDED"].includes(o.status)).length },
      { kr: "반품", en: "Returns", curr: curr.filter(o => o.status.startsWith("RETURN") || o.status === "ON_HOLD_RETURN_REFUND").length, prev: prev.filter(o => o.status.startsWith("RETURN") || o.status === "ON_HOLD_RETURN_REFUND").length },
    ];
  }, [periodOrders, prevPeriodOrders]);

  const tp = Math.ceil(filtered.length / ps);
  const pd = filtered.slice(page * ps, (page + 1) * ps);
  const toggleAll = () => { if (allChecked) { setChecked([]); setAllChecked(false); } else { setChecked(pd.map(o => o.numId)); setAllChecked(true); } };
  const toggleOne = (id: number) => setChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const fmtDate = (d: Date) => {
    const m = d.getMonth() + 1, day = d.getDate(), h = d.getHours(), min = d.getMinutes();
    if (lang === "kr") return `${m}월 ${day}일 ${h >= 12 ? "오후" : "오전"} ${h > 12 ? h - 12 : h}:${String(min).padStart(2, "0")}`;
    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  };

  return (
    <div style={{ flex: 1, padding: "20px 28px", overflow: "auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t("주문 관리", "Order Management")}</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>{t("주문 목록 조회 및 검색", "Order list and search")}</p>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {checked.length > 0 && tab !== "archived" && (
            <button onClick={archiveChecked} style={{ padding: "5px 12px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4, color: "#6b7280" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>
              {t(`${checked.length}건 보관`, `Archive ${checked.length}`)}
            </button>
          )}
          {checked.length > 0 && tab === "archived" && (
            <button onClick={unarchiveChecked} style={{ padding: "5px 12px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4, color: "#6b7280" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>
              {t(`${checked.length}건 보관 해제`, `Unarchive ${checked.length}`)}
            </button>
          )}
          <button onClick={() => setShowExport(true)} style={{ padding: "5px 12px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {t("CSV 다운로드", "Export CSV")}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, position: "relative" }}>
          <button onClick={() => setShowPeriodPicker(!showPeriodPicker)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {periodLabel}
            <ChevDown />
          </button>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            {summaryPeriod === "today" ? t("현재 시간까지의 어제 데이터와 비교", "Compared to yesterday") : summaryPeriod === "7d" ? t("이전 7일과 비교", "Compared to previous 7 days") : t("이전 30일과 비교", "Compared to previous 30 days")}
          </span>
          {showPeriodPicker && (
            <div style={{ position: "absolute", top: 36, left: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, width: 260, overflow: "hidden" }}>
              {([
                { id: "today" as const, kr: "오늘", en: "Today", desc: { kr: "현재 시간까지의 어제 데이터와 비교", en: "Compared to yesterday" } },
                { id: "7d" as const, kr: "지난 7일", en: "Last 7 days", desc: { kr: "이전 7일과 비교", en: "Compared to previous 7 days" } },
                { id: "30d" as const, kr: "지난 30일", en: "Last 30 days", desc: { kr: "이전 30일과 비교", en: "Compared to previous 30 days" } },
              ]).map(p => (
                <div key={p.id} onClick={() => { setSummaryPeriod(p.id); setShowPeriodPicker(false); }}
                  style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 10, borderBottom: "1px solid #f3f4f6" }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#f9fafb"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", border: summaryPeriod === p.id ? "5px solid #111" : "2px solid #d1d5db", display: "inline-block", flexShrink: 0, marginTop: 1, boxSizing: "border-box" }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{t(p.kr, p.en)}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{t(p.desc.kr, p.desc.en)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          {summaryCards.map((c, i) => {
            const change = calcChange(c.curr, c.prev);
            return (
              <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>{t(c.kr, c.en)}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 20, fontWeight: 700 }}>{c.curr}</span>
                  {change !== 0 && <span style={{ fontSize: 11, fontWeight: 500, color: change > 0 ? "#16a34a" : "#dc2626" }}>{change > 0 ? "↑" : "↓"} {Math.abs(change)}%</span>}
                  {change === 0 && <span style={{ fontSize: 11, color: "#9ca3af" }}>-</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 14, position: "relative" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position: "absolute", left: 12, top: 10 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder={t("주문번호, 상점명, UID, 배송방식으로 검색", "Search by shop name")}
          style={{ width: "100%", padding: "8px 12px 8px 36px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, background: "#fff", boxSizing: "border-box" }} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e5e7eb", marginBottom: 0 }}>
        {TABS.map((tb) => (
          <button key={tb.id} onClick={() => { setTab(tb.id as TabId); setPage(0); }}
            style={{ padding: "9px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: tab === tb.id ? 600 : 400, color: tab === tb.id ? "#111" : "#6b7280", borderBottom: tab === tb.id ? "2px solid #111" : "2px solid transparent", marginBottom: -1 }}>
            {t(tb.kr, tb.en)}
            <span style={{ marginLeft: 5, background: tb.id === "needs_response" && tabCounts[tb.id] > 0 ? "#ef4444" : tab === tb.id ? "#111" : "#e5e7eb", color: tb.id === "needs_response" && tabCounts[tb.id] > 0 ? "#fff" : tab === tb.id ? "#fff" : "#6b7280", padding: "1px 6px", borderRadius: 8, fontSize: 10 }}>{tabCounts[tb.id]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "9px 10px", textAlign: "left", width: 28 }}><input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ cursor: "pointer" }} /></th>
                <th style={{ padding: "9px 10px", textAlign: "left", fontWeight: 600, color: "#374151" }}>{t("주문번호", "Order No.")}</th>
                <SortTh label={t("주문일자", "Date")} active={sortKey === "date"} dir={sortDir} onClick={() => toggleSort("date")} />
                <th style={{ padding: "9px 10px", textAlign: "left", fontWeight: 600, color: "#374151" }}>{t("상점명", "Shop")}</th>
                <th style={{ padding: "9px 10px", textAlign: "left", fontWeight: 600, color: "#374151" }}>UID</th>
                <SortTh label={t("총계", "Total")} active={sortKey === "price"} dir={sortDir} onClick={() => toggleSort("price")} align="right" />
                <SortTh label={t("주문 상태", "Status")} active={sortKey === "status"} dir={sortDir} onClick={() => toggleSort("status")} align="center" />
                <th style={{ padding: "9px 10px", textAlign: "left", fontWeight: 600, color: "#374151" }}>{t("배송상태", "Delivery")}</th>
                <th style={{ padding: "9px 10px", textAlign: "left", fontWeight: 600, color: "#374151" }}>{t("배송방법", "Method")}</th>
                <th style={{ padding: "9px 10px", textAlign: "center", fontWeight: 600, color: "#374151" }}>{t("담당자", "Assignee")}</th>
                <SortTh label={t("응대 상태", "Response")} active={sortKey === "response"} dir={sortDir} onClick={() => toggleSort("response")} align="center" />
                <th style={{ padding: "9px 10px", textAlign: "center", width: 36 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></th>
              </tr>
            </thead>
            <tbody>
              {pd.length === 0 ? (
                <tr><td colSpan={12} style={{ padding: 36, textAlign: "center", color: "#9ca3af" }}>{t("조회된 주문이 없습니다", "No orders found")}</td></tr>
              ) : pd.map((o) => (
                <tr key={o.numId} style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer", background: checked.includes(o.numId) ? "#f0f4ff" : "transparent" }}
                  onMouseEnter={(e) => { if (!checked.includes(o.numId)) (e.currentTarget as HTMLTableRowElement).style.background = "#fafafa"; }}
                  onMouseLeave={(e) => { if (!checked.includes(o.numId)) (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}>
                  <td style={{ padding: "8px 10px" }}><input type="checkbox" checked={checked.includes(o.numId)} onChange={() => toggleOne(o.numId)} style={{ cursor: "pointer" }} /></td>
                  <td style={{ padding: "8px 10px", color: "#2563eb", fontWeight: 500 }}>{o.id}</td>
                  <td style={{ padding: "8px 10px", color: "#6b7280", whiteSpace: "nowrap" }}>{fmtDate(o.date)}</td>
                  <td style={{ padding: "8px 10px", fontWeight: 500 }}>{o.seller.shopName}</td>
                  <td style={{ padding: "8px 10px", color: "#6b7280", fontFamily: "monospace", fontSize: 11 }}>{o.seller.id}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600 }}>{o.totalPrice.toLocaleString()}원</td>
                  <td style={{ padding: "8px 10px", textAlign: "center" }}><Badge status={o.status} lang={lang} /></td>
                  <td style={{ padding: "8px 10px" }}><DeliveryDot status={o.deliveryStatus} lang={lang} /></td>
                  <td style={{ padding: "8px 10px", color: "#6b7280", fontSize: 11, whiteSpace: "nowrap" }}>{o.method}</td>
                  <td style={{ padding: "8px 10px", textAlign: "center", fontSize: 11 }}>{(() => {
                    const conv = findConvBySeller(o.seller.id);
                    const assignee = conv?.assignee;
                    return assignee ? <span style={{ fontWeight: 500, color: "#374151" }}>{assignee}</span> : <span style={{ color: "#d1d5db" }}>{t("미배정", "Unassigned")}</span>;
                  })()}</td>
                  {(() => {
                    const conv = findConvBySeller(o.seller.id);
                    if (!conv) return (
                      <>
                        <td style={{ padding: "8px 10px", textAlign: "center" }}><span style={{ color: "#9ca3af", fontSize: 11 }}>-</span></td>
                        <td style={{ padding: "8px 10px", textAlign: "center" }}><span style={{ color: "#d1d5db", cursor: "default", display: "inline-flex" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></span></td>
                      </>
                    );
                    const delay = getDelayInfo(conv);
                    const unread = conv.unreadCount;
                    const delayBadge = delay.level === 0
                      ? { bg: "#d1fae5", color: "#065f46", label: t("정상", "Normal"), bold: false }
                      : delay.level === 1
                      ? { bg: "#fef3c7", color: "#92400e", label: `${delay.hours}${t("시간 지연", "h delayed")}`, bold: false }
                      : delay.level === 2
                      ? { bg: "#fee2e2", color: "#991b1b", label: `${delay.hours}${t("시간 지연", "h delayed")}`, bold: false }
                      : { bg: "#fecaca", color: "#991b1b", label: t("24시간+ 지연", "24h+ delayed"), bold: true };
                    const iconColor = delay.level === 0 ? "#111" : delay.level === 1 ? "#f59e0b" : delay.level === 2 ? "#ef4444" : "#dc2626";
                    return (
                      <>
                        <td style={{ padding: "8px 10px", textAlign: "center" }}>
                          <span style={{ background: delayBadge.bg, color: delayBadge.color, padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: delayBadge.bold ? 700 : 500, whiteSpace: "nowrap" }}>{delayBadge.label}</span>
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "center" }}>
                          <span onClick={(e) => {
                              e.stopPropagation();
                              setChatPanelSellerId(o.seller.id);
                              // 클레임 방식 자동 배정: 미배정이면 현재 상담사 자동 배정
                              const targetConv = findConvBySeller(o.seller.id);
                              if (targetConv && !targetConv.assignee) {
                                const agent = AGENTS[0];
                                const sysMsg: ChatMessage = { id: `sys-auto-assign-${Date.now()}`, type: "system", sender: "System", content: `${t("상담사가", "Agent")} ${agent}${t("(으)로 배정되었습니다", " has been assigned")}`, createdAt: new Date() };
                                setConversations((prev: Conversation[]) => prev.map((c: Conversation) => c.id === targetConv.id ? { ...c, assignee: agent, messages: [...c.messages, sysMsg] } : c));
                              }
                            }}
                            style={{ cursor: "pointer", display: "inline-flex", position: "relative", color: iconColor }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                            {unread > 0 && <span style={{ position: "absolute", top: -3, right: -3, width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />}
                          </span>
                        </td>
                      </>
                    );
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, fontSize: 12, color: "#6b7280" }}>
        <span>{t(`총 ${filtered.length}건`, `${filtered.length} orders`)}</span>
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
            style={{ padding: "5px 10px", border: "1px solid #d1d5db", borderRadius: 5, background: page === 0 ? "#f3f4f6" : "#fff", cursor: page === 0 ? "default" : "pointer", color: page === 0 ? "#d1d5db" : "#374151", fontSize: 12 }}>
            {t("이전", "Prev")}
          </button>
          {Array.from({ length: Math.min(tp, 5) }, (_, i) => {
            const start = Math.max(0, Math.min(page - 2, tp - 5));
            const p = start + i;
            return (
              <button key={p} onClick={() => setPage(p)}
                style={{ padding: "5px 9px", border: "1px solid", borderColor: p === page ? "#111" : "#d1d5db", borderRadius: 5, background: p === page ? "#111" : "#fff", color: p === page ? "#fff" : "#374151", cursor: "pointer", fontWeight: p === page ? 600 : 400, minWidth: 30, fontSize: 12 }}>
                {p + 1}
              </button>
            );
          })}
          <button disabled={page >= tp - 1} onClick={() => setPage(p => p + 1)}
            style={{ padding: "5px 10px", border: "1px solid #d1d5db", borderRadius: 5, background: page >= tp - 1 ? "#f3f4f6" : "#fff", cursor: page >= tp - 1 ? "default" : "pointer", color: page >= tp - 1 ? "#d1d5db" : "#374151", fontSize: 12 }}>
            {t("다음", "Next")}
          </button>
        </div>
        <span>{t(`${page + 1} / ${tp} 페이지`, `Page ${page + 1} of ${tp}`)}</span>
      </div>

      {/* Export Modal */}
      {showExport && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowExport(false)}>
          <div style={{ background: "#fff", borderRadius: 12, width: 480, maxWidth: "90vw", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{t("주문 내보내기", "Export Orders")}</span>
              <span style={{ cursor: "pointer", color: "#9ca3af", fontSize: 18 }} onClick={() => setShowExport(false)}>✕</span>
            </div>
            <div style={{ padding: "20px 20px 24px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>{t("내보내기 범위", "Export Range")}</div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer", fontSize: 13 }}>
                <input type="radio" name="range" checked={exportRange === "current"} onChange={() => setExportRange("current")} style={{ accentColor: "#111" }} />
                <div>
                  <div style={{ fontWeight: 500 }}>{t("현재 페이지", "Current Page")}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{t(`현재 보고 있는 ${pd.length}건`, `${pd.length} orders on this page`)}</div>
                </div>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer", fontSize: 13 }}>
                <input type="radio" name="range" checked={exportRange === "all"} onChange={() => setExportRange("all")} style={{ accentColor: "#111" }} />
                <div>
                  <div style={{ fontWeight: 500 }}>{t("전체 주문", "All Orders")}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{t(`필터 적용된 전체 ${filtered.length}건`, `All ${filtered.length} filtered orders`)}</div>
                </div>
              </label>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", cursor: "pointer", fontSize: 13 }}>
                <input type="radio" name="range" checked={exportRange === "date"} onChange={() => setExportRange("date")} style={{ accentColor: "#111", marginTop: 3 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{t("날짜별 주문", "Orders by Date")}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}>{t("기간을 지정하여 다운로드", "Download orders within a date range")}</div>
                  {exportRange === "date" && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="date" value={exportDateStart} onChange={e => setExportDateStart(e.target.value)} style={{ padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 12, flex: 1 }} />
                      <span style={{ color: "#9ca3af", fontSize: 12 }}>~</span>
                      <input type="date" value={exportDateEnd} onChange={e => setExportDateEnd(e.target.value)} style={{ padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 12, flex: 1 }} />
                    </div>
                  )}
                </div>
              </label>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginTop: 20, marginBottom: 10 }}>{t("내보내기 형식", "File Format")}</div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 13, color: "#374151" }}>
                <input type="radio" name="format" checked readOnly style={{ accentColor: "#111" }} />
                CSV (.csv)
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "14px 20px", borderTop: "1px solid #e5e7eb", background: "#f9fafb" }}>
              <button onClick={() => setShowExport(false)} style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>{t("취소", "Cancel")}</button>
              <button onClick={() => setShowExport(false)} style={{ padding: "8px 16px", border: "none", borderRadius: 6, background: "#111", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {t("주문 내보내기", "Export Orders")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Slide Panel */}
      {(() => {
        const panelOpen = chatPanelSellerId !== null;
        const conv = chatPanelConv;
        const delay = conv ? getDelayInfo(conv) : null;
        const panelOrder = panelOpen ? ALL_ORDERS.find(o => o.seller.id === chatPanelSellerId) : null;

        const fmtTimePanel = (d: Date) => {
          const h = d.getHours(), m = d.getMinutes();
          if (lang === "kr") return `${h >= 12 ? "오후" : "오전"} ${h > 12 ? h - 12 : h === 0 ? 12 : h}:${String(m).padStart(2, "0")}`;
          return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        };

        const sendPanelMessage = () => {
          if (!chatPanelInput.trim() || !conv) return;
          const isPanelAgent = chatPanelMode !== "internal_note";
          const newMsg: ChatMessage = {
            id: `panel-msg-${Date.now()}`,
            type: isPanelAgent ? "agent" : "internal_note",
            sender: conv.assignee || AGENTS[0],
            content: chatPanelInput.trim(),
            createdAt: new Date(),
            ...(isPanelAgent ? { readBySeller: false } : {}),
          };
          setConversations((prev: Conversation[]) => prev.map((c: Conversation) => c.id === conv.id ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.content, lastMessageAt: newMsg.createdAt } : c));
          setChatPanelInput("");
          setTimeout(() => { if (chatPanelMsgRef.current) chatPanelMsgRef.current.scrollTop = chatPanelMsgRef.current.scrollHeight; }, 50);
        };

        return (
          <>
            {/* Dim overlay */}
            <div onClick={() => setChatPanelSellerId(null)}
              style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 900, opacity: panelOpen ? 1 : 0, pointerEvents: panelOpen ? "auto" : "none", transition: "opacity 0.3s ease" }} />
            {/* Slide panel */}
            <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 420, background: "#fff", zIndex: 901, boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", transform: panelOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s ease", display: "flex", flexDirection: "column" }}>
              {conv ? (
                <>
                  {/* Panel Header */}
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{conv.seller.shopName}</span>
                      <Badge status={conv.orderStatus} lang={lang} />
                      {delay && delay.level > 0 && (
                        <span style={{ background: delay.level === 1 ? "#fef3c7" : delay.level === 2 ? "#fee2e2" : "#fecaca", color: delay.level === 1 ? "#92400e" : "#991b1b", padding: "1px 5px", borderRadius: 4, fontSize: 9, fontWeight: delay.level === 3 ? 700 : 500 }}>
                          {delay.hours >= 24 ? t("24시간+ 지연", "24h+ delayed") : `${delay.hours}${t("시간 지연", "h delayed")}`}
                        </span>
                      )}
                    </div>
                    <span onClick={() => setChatPanelSellerId(null)} style={{ cursor: "pointer", color: "#9ca3af", fontSize: 18, lineHeight: 1, padding: "2px 4px" }}>✕</span>
                  </div>
                  {/* Order summary */}
                  {panelOrder && (
                    <div style={{ padding: "8px 16px", borderBottom: "1px solid #f3f4f6", fontSize: 11, color: "#6b7280", display: "flex", gap: 12, flexShrink: 0 }}>
                      <span>{panelOrder.id}</span>
                      <span style={{ fontWeight: 600, color: "#374151" }}>{panelOrder.totalPrice.toLocaleString()}{t("원", "₩")}</span>
                      <span>{panelOrder.items}{t("건", " items")}</span>
                    </div>
                  )}
                  {/* Past Order History (Spec 2.4) */}
                  {conv.orders && conv.orders.length > 0 && (
                    <div style={{ padding: "8px 16px", borderBottom: "1px solid #f3f4f6", flexShrink: 0, maxHeight: 140, overflowY: "auto" }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{t("주문 내역", "Order History")}</div>
                      {conv.orders.map((oh: OrderHistory) => (
                        <div key={oh.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid #f9fafb", fontSize: 11 }}>
                          <span style={{ color: "#2563eb", fontWeight: 500 }}>{oh.id}</span>
                          <span style={{ color: "#6b7280" }}>{`${oh.date.getMonth() + 1}/${oh.date.getDate()}`}</span>
                          <Badge status={oh.status} lang={lang} />
                          <span style={{ fontWeight: 600, color: "#374151" }}>{oh.totalPrice.toLocaleString()}{t("원", "₩")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Messages */}
                  <div ref={chatPanelMsgRef} style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6, background: "#f9fafb" }}>
                    {conv.messages.map((msg: ChatMessage) => {
                      if (msg.type === "system") {
                        return (
                          <div key={msg.id} style={{ display: "flex", justifyContent: "center", margin: "3px 0" }}>
                            <span style={{ background: "#e5e7eb", color: "#6b7280", padding: "2px 10px", borderRadius: 10, fontSize: 10 }}>{msg.content}</span>
                          </div>
                        );
                      }
                      if (msg.type === "internal_note") {
                        return (
                          <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end", margin: "1px 0" }}>
                            <div style={{ maxWidth: "75%" }}>
                              <div style={{ fontSize: 9, color: "#92400e", textAlign: "right", marginBottom: 1 }}>{msg.sender} · {t("내부 메모", "Note")}</div>
                              <div style={{ background: "#fef3c7", border: "1px solid #fde68a", color: "#92400e", padding: "6px 10px", borderRadius: "10px 10px 2px 10px", fontSize: 12, lineHeight: 1.4 }}>{msg.content}</div>
                              <div style={{ fontSize: 9, color: "#9ca3af", textAlign: "right", marginTop: 1 }}>{fmtTimePanel(msg.createdAt)}</div>
                            </div>
                          </div>
                        );
                      }
                      if (msg.type === "seller") {
                        return (
                          <div key={msg.id} style={{ display: "flex", justifyContent: "flex-start", margin: "1px 0" }}>
                            <div style={{ maxWidth: "75%" }}>
                              <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 1 }}>{msg.sender}</div>
                              {msg.image ? <img src={msg.image} alt={msg.content} style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 2 }} /> : <div style={{ background: "#f3f4f6", color: "#111827", padding: "6px 10px", borderRadius: "10px 10px 10px 2px", fontSize: 12, lineHeight: 1.4 }}>{msg.content}</div>}
                              <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 1 }}>{fmtTimePanel(msg.createdAt)}</div>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end", margin: "1px 0" }}>
                          <div style={{ maxWidth: "75%" }}>
                            <div style={{ fontSize: 9, color: "#6b7280", textAlign: "right", marginBottom: 1 }}>{msg.sender}</div>
                            {msg.image ? <img src={msg.image} alt={msg.content} style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 2 }} /> : <div style={{ background: "#111827", color: "#fff", padding: "6px 10px", borderRadius: "10px 10px 2px 10px", fontSize: 12, lineHeight: 1.4 }}>{msg.content}</div>}
                            <div style={{ fontSize: 9, color: "#9ca3af", textAlign: "right", marginTop: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3 }}>
                              {msg.readBySeller === false && <span style={{ color: "#f59e0b", fontSize: 8, fontWeight: 500 }}>{t("안읽음", "Unread")}</span>}
                              {fmtTimePanel(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Input */}
                  <div style={{ borderTop: "1px solid #e5e7eb", background: "#fff", padding: "8px 14px", flexShrink: 0 }}>
                    {conv.blocked ? (
                      <div style={{ padding: "10px 0", textAlign: "center", fontSize: 12, color: "#ef4444", background: "#fef2f2", borderRadius: 6 }}>
                        {t("차단된 사용자입니다. 메시지를 보낼 수 없습니다.", "This user is blocked. You cannot send messages.")}
                      </div>
                    ) : <>
                    <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                      <button onClick={() => setChatPanelMode("message")}
                        style={{ padding: "2px 8px", border: "1px solid", borderColor: chatPanelMode === "message" ? "#111" : "#d1d5db", borderRadius: 4, background: chatPanelMode === "message" ? "#111" : "#fff", color: chatPanelMode === "message" ? "#fff" : "#6b7280", cursor: "pointer", fontSize: 10, fontWeight: 500 }}>
                        {t("메시지", "Message")}
                      </button>
                      <button onClick={() => setChatPanelMode("internal_note")}
                        style={{ padding: "2px 8px", border: "1px solid", borderColor: chatPanelMode === "internal_note" ? "#92400e" : "#d1d5db", borderRadius: 4, background: chatPanelMode === "internal_note" ? "#fef3c7" : "#fff", color: chatPanelMode === "internal_note" ? "#92400e" : "#6b7280", cursor: "pointer", fontSize: 10, fontWeight: 500 }}>
                        {t("내부 메모", "Note")}
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <label style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", padding: "6px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file || !conv) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            const newMsg: ChatMessage = { id: `panel-img-${Date.now()}`, type: "agent", sender: conv.assignee || AGENTS[0], content: file.name, createdAt: new Date(), image: reader.result as string };
                            setConversations((prev: Conversation[]) => prev.map((c: Conversation) => c.id === conv.id ? { ...c, messages: [...c.messages, newMsg], lastMessage: `[${t("이미지", "Image")}] ${file.name}`, lastMessageAt: newMsg.createdAt } : c));
                            setTimeout(() => { if (chatPanelMsgRef.current) chatPanelMsgRef.current.scrollTop = chatPanelMsgRef.current.scrollHeight; }, 50);
                          };
                          reader.readAsDataURL(file);
                          e.target.value = "";
                        }} />
                      </label>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <button onClick={() => setChatPanelShowEmoji(!chatPanelShowEmoji)}
                          style={{ padding: "6px", border: "1px solid #d1d5db", borderRadius: 6, background: chatPanelShowEmoji ? "#f3f4f6" : "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                        </button>
                        {chatPanelShowEmoji && (
                          <div style={{ position: "absolute", bottom: 32, left: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", zIndex: 50, padding: "6px", width: 200 }}>
                            <div style={{ fontSize: 9, color: "#9ca3af", marginBottom: 4, fontWeight: 500 }}>{t("번개장터 이모지", "Bungae Emojis")}</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 1 }}>
                              {BUNGAE_EMOJIS.map((emoji, i) => (
                                <button key={i} onClick={() => { setChatPanelInput(prev => prev + emoji); setChatPanelShowEmoji(false); }}
                                  style={{ padding: 3, border: "none", background: "transparent", cursor: "pointer", fontSize: 16, borderRadius: 4, lineHeight: 1 }}
                                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6"}
                                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}>
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <input value={chatPanelInput} onChange={e => setChatPanelInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendPanelMessage(); } }}
                        placeholder={chatPanelMode === "internal_note" ? t("내부 메모...", "Internal note...") : t("메시지 입력...", "Type message...")}
                        style={{ flex: 1, padding: "7px 10px", border: "1px solid", borderColor: chatPanelMode === "internal_note" ? "#fde68a" : "#d1d5db", borderRadius: 6, fontSize: 12, background: chatPanelMode === "internal_note" ? "#fffbeb" : "#fff", boxSizing: "border-box" }} />
                      <button onClick={sendPanelMessage}
                        style={{ padding: "7px 12px", border: "none", borderRadius: 6, background: chatPanelMode === "internal_note" ? "#92400e" : "#111", color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                        {t("전송", "Send")}
                      </button>
                    </div>
                    </>}
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{t("번개톡", "Bungae Talk")}</span>
                    <span onClick={() => setChatPanelSellerId(null)} style={{ cursor: "pointer", color: "#9ca3af", fontSize: 18, lineHeight: 1 }}>✕</span>
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>
                    {t("대화 내역이 없습니다", "No conversation found")}
                  </div>
                </div>
              )}
            </div>
          </>
        );
      })()}
    </div>
  );
}

// ────────────────────────────────────────────
// Chat Page — 번개톡 상담 관리
// ────────────────────────────────────────────
const AGENTS = ["김민수", "이지은", "박서연", "최준호"];

// 번개장터 이모지 (Bungae Emojis)
const BUNGAE_EMOJIS = [
  "⚡", "👍", "🙏", "😊", "😅", "🤔", "❤️", "🎉",
  "📦", "🚚", "✅", "❌", "💰", "🏷️", "📱", "🔔",
  "👋", "💬", "🙇", "😢", "🤝", "⭐", "🎁", "📝",
];

type ChatMessage = {
  id: string;
  type: "seller" | "agent" | "system" | "internal_note";
  sender: string;
  content: string;
  createdAt: Date;
  image?: string; // data URL or image URL for image attachments
  readBySeller?: boolean; // agent 메시지에만 사용, false = 안읽음
};
type OrderHistory = { id: string; date: Date; status: StatusKey; totalPrice: number };
type Conversation = {
  id: string;
  seller: { id: number; shopName: string; shopUrl: string; isPro?: boolean };
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  orderStatus: StatusKey;
  assignee: string | null;
  messages: ChatMessage[];
  orders: OrderHistory[];
  lastActive: string;
  archived: boolean;
  blocked: boolean;
  product?: { name: string; price: number; deliveryFee: number; image?: string };
  lastAgentActionAt?: Date;
};

type ChatFilterId = "all" | "approved" | "shipping" | "cancel_refund" | "returns" | "operations";
const CHAT_FILTERS: { id: ChatFilterId; kr: string; en: string; statuses: StatusKey[] | null }[] = [
  { id: "all", kr: "전체", en: "All", statuses: null },
  { id: "approved", kr: "판매승인", en: "Approved", statuses: ["PAYMENT_RECEIVED", "SHIP_READY"] },
  { id: "shipping", kr: "배송", en: "Shipping", statuses: ["IN_TRANSIT", "DELIVERY_COMPLETED", "PURCHASE_CONFIRM"] },
  { id: "cancel_refund", kr: "취소/환불", en: "Cancel/Refund", statuses: ["CANCEL_REQUESTED_BEFORE_SHIPPING", "WAITING_REFUND", "REFUNDING", "REFUNDED"] },
  { id: "returns", kr: "반품", en: "Returns", statuses: ["RETURN_REQUESTED", "RETURN_BEFORE_SHIPPING", "RETURNING", "RETURNED", "ON_HOLD_RETURN_REFUND"] },
  { id: "operations", kr: "운영", en: "Operations", statuses: ["ON_HOLD_RETURN_REFUND", "REFUND_ERROR"] },
];

function generateConversations(): Conversation[] {
  const chatSellers = [
    { id: 2000002836, shopName: "LuRuby", shopUrl: "bunjang.co.kr/shop/luruby", isPro: true },
    { id: 2000002837, shopName: "TangShirley", shopUrl: "bunjang.co.kr/shop/tangshirley", isPro: false },
    { id: 2000002838, shopName: "ChanChloe", shopUrl: "bunjang.co.kr/shop/chanchloe", isPro: true },
    { id: 2000002839, shopName: "SerwinShadi", shopUrl: "bunjang.co.kr/shop/serwinshadi", isPro: false },
    { id: 2000002840, shopName: "KangIssac", shopUrl: "bunjang.co.kr/shop/kangissac", isPro: true },
    { id: 2000002841, shopName: "YouWenlin", shopUrl: "bunjang.co.kr/shop/youwenlin", isPro: false },
    { id: 2000002842, shopName: "FernandezValme", shopUrl: "bunjang.co.kr/shop/fernandezvalme", isPro: true },
    { id: 2000002843, shopName: "HeJoanna", shopUrl: "bunjang.co.kr/shop/hejoanna", isPro: false },
    { id: 2000002844, shopName: "PhamQuynh", shopUrl: "bunjang.co.kr/shop/phamquynh", isPro: true },
    { id: 2000002845, shopName: "GaiserNatalia", shopUrl: "bunjang.co.kr/shop/gaisernatalia", isPro: false },
    { id: 2000002846, shopName: "VoHien", shopUrl: "bunjang.co.kr/shop/vohien", isPro: true },
    { id: 2000002847, shopName: "SamPriya", shopUrl: "bunjang.co.kr/shop/sampriya", isPro: false },
    { id: 2000002848, shopName: "KimGrace", shopUrl: "bunjang.co.kr/shop/kimgrace", isPro: true },
    { id: 2000002849, shopName: "LeeAlexander", shopUrl: "bunjang.co.kr/shop/leealexander", isPro: false },
    { id: 2000002850, shopName: "DurantIsabel", shopUrl: "bunjang.co.kr/shop/durantisabel", isPro: true },
    { id: 2000002851, shopName: "OhYuna", shopUrl: "bunjang.co.kr/shop/ohyuna", isPro: false },
    { id: 2000002852, shopName: "ChoiDaniel", shopUrl: "bunjang.co.kr/shop/choidaniel", isPro: true },
    { id: 2000002853, shopName: "HanSoyeon", shopUrl: "bunjang.co.kr/shop/hansoyeon", isPro: false },
    { id: 2000002854, shopName: "JungMinwoo", shopUrl: "bunjang.co.kr/shop/jungminwoo", isPro: true },
    { id: 2000002855, shopName: "YangEunji", shopUrl: "bunjang.co.kr/shop/yangeunji", isPro: false },
    { id: 2000002856, shopName: "ShinHyejin", shopUrl: "bunjang.co.kr/shop/shinhyejin", isPro: true },
    { id: 2000002857, shopName: "BaekJihoon", shopUrl: "bunjang.co.kr/shop/baekjihoon", isPro: false },
  ];

  const lastActiveOptions = ["방금 전 접속", "5분 전 접속", "30분 전 접속", "1시간 전 접속", "2시간 전 접속", "3시간 전 접속", "오늘 접속", "1일 전 접속", "3일 전 접속"];
  const lastActiveOptionsEn = ["Just now", "5m ago", "30m ago", "1h ago", "2h ago", "3h ago", "Today", "1d ago", "3d ago"];

  const productNames = [
    "베베양 아기물티슈 라이트 캡형 100매 10팩",
    "나이키 에어맥스 97 실버불릿 270",
    "삼성 갤럭시 버즈3 프로 블랙",
    "무인양품 리넨 셔츠 M 네이비",
    "다이슨 V15 디텍트 무선청소기",
    "아이패드 프로 11인치 256GB Wi-Fi",
    "뉴발란스 993 그레이 275",
    "스타벅스 텀블러 리유저블 500ml",
    "레고 테크닉 포르쉐 911 GT3",
    "파타고니아 레트로 X 자켓 L",
  ];

  const sellerMessages = [
    "안녕하세요, 오늘 중으로 발송 예정입니다.",
    "확인했습니다. 송장번호 등록해 드릴게요.",
    "죄송합니다, 해당 상품은 현재 재고가 소진되었습니다.",
    "네, 취소 처리 도와드리겠습니다.",
    "반품 수거 요청 넣었습니다. 내일 택배 방문 예정이에요.",
    "정산 관련해서 문의드립니다. 이번 달 정산 일정이 어떻게 되나요?",
    "상품 등록 시 카테고리 선택이 안 되는 오류가 있습니다.",
    "교환 상품 오늘 바로 재발송 처리하겠습니다.",
    "해당 주문건 확인했는데, 배송지가 도서산간 지역이라 1~2일 추가 소요됩니다.",
    "사진 첨부합니다. 포장 상태 확인해 주세요.",
    "API 연동 관련해서 기술 지원 요청드립니다.",
    "이번 주 프로모션 참여 신청하고 싶습니다.",
  ];
  const agentMessages = [
    "안녕하세요, 번개장터 파트너센터입니다. 주문 건 확인 요청드립니다.",
    "주문하신 상품 배송이 아직 안 되었는데 확인 부탁드립니다.",
    "배송 조회가 안 되고 있어요. 송장번호 확인해 주시겠어요?",
    "주문 취소 요청드립니다. 처리 가능할까요?",
    "상품이 파손되어 도착했습니다. 반품 처리 부탁드립니다.",
    "환불 진행 상황이 어떻게 되나요?",
    "배송지 변경 요청이 들어왔는데, 아직 발송 전이면 변경 가능할까요?",
    "다른 사이즈로 교환 요청드립니다. 재고 확인 부탁해요.",
    "포장이 많이 찌그러져서 도착했다고 합니다. 확인 부탁드립니다.",
    "정산은 매월 15일, 말일에 처리됩니다. 참고 부탁드려요.",
    "네, 기술팀에 전달하겠습니다. 빠르게 확인 후 안내드릴게요.",
    "프로모션 참여 승인되었습니다. 상세 조건 안내드리겠습니다.",
  ];
  const systemMessages = [
    "주문이 결제 완료되었습니다.",
    "배송이 시작되었습니다.",
    "배송이 완료되었습니다.",
    "구매가 확정되었습니다.",
    "취소 요청이 접수되었습니다.",
    "환불이 완료되었습니다.",
    "반품 요청이 접수되었습니다.",
    "반품 배송이 시작되었습니다.",
    "상담사가 배정되었습니다.",
  ];
  const internalNotes = [
    "이 건은 내일 오전에 처리 예정",
    "판매자에게 연락 시도했으나 부재, 재연락 필요",
    "파손 사진 확인 완료, 판매자에게 반품 요청함",
    "우수 판매자, 우선 처리 요망",
    "CS팀에 에스컬레이션 완료",
  ];

  const convs: Conversation[] = [];
  for (let i = 0; i < chatSellers.length; i++) {
    const seller = chatSellers[i];
    const status = orderStatKeys[i % orderStatKeys.length];
    const assignee = i < 3 ? null : AGENTS[i % AGENTS.length];
    const msgCount = 5 + Math.floor(Math.random() * 11);
    const msgs: ChatMessage[] = [];
    const baseTime = new Date(2025, 1, 11, 9, 0);

    for (let j = 0; j < msgCount; j++) {
      const minuteOffset = j * (5 + Math.floor(Math.random() * 20));
      const time = new Date(baseTime.getTime() + minuteOffset * 60000);
      const roll = Math.random();
      if (j === 0) {
        msgs.push({ id: `${i}-sys-${j}`, type: "system", sender: "System", content: systemMessages[i % systemMessages.length], createdAt: time });
      } else if (roll < 0.1 && j > 2) {
        msgs.push({ id: `${i}-note-${j}`, type: "internal_note", sender: assignee || AGENTS[0], content: internalNotes[j % internalNotes.length], createdAt: time });
      } else if (roll < 0.15 && j > 1) {
        msgs.push({ id: `${i}-sys2-${j}`, type: "system", sender: "System", content: systemMessages[(i + j) % systemMessages.length], createdAt: time });
      } else if (j % 2 === 1) {
        msgs.push({ id: `${i}-sell-${j}`, type: "seller", sender: seller.shopName, content: sellerMessages[(i + j) % sellerMessages.length], createdAt: time });
      } else {
        msgs.push({ id: `${i}-agt-${j}`, type: "agent", sender: assignee || AGENTS[0], content: agentMessages[(i + j) % agentMessages.length], createdAt: time, readBySeller: true });
      }
    }

    const orderCount = 1 + Math.floor(Math.random() * 5);
    const orders: OrderHistory[] = [];
    for (let k = 0; k < orderCount; k++) {
      orders.push({
        id: `#${1200 - i * 5 - k}A`,
        date: new Date(2025, 1, 11 - k * 3, 10 + k, 30),
        status: orderStatKeys[(i + k) % orderStatKeys.length],
        totalPrice: (Math.floor(Math.random() * 900) + 100) * 100,
      });
    }

    const lastMsg = msgs[msgs.length - 1];
    const unread = i < 5 ? Math.floor(Math.random() * 8) + 1 : i < 10 ? Math.floor(Math.random() * 3) : 0;

    const product = {
      name: productNames[i % productNames.length],
      price: (Math.floor(Math.random() * 900) + 100) * 100,
      deliveryFee: Math.random() > 0.3 ? 3000 : 0,
    };

    convs.push({
      id: `conv-${i}`,
      seller,
      lastMessage: lastMsg.content,
      lastMessageAt: lastMsg.createdAt,
      unreadCount: unread,
      orderStatus: status,
      assignee,
      messages: msgs,
      orders,
      lastActive: lastActiveOptions[i % lastActiveOptions.length],
      archived: i >= 18,
      blocked: i === 16 || i === 20, // demo: some sellers are blocked
      product,
    });
  }
  // 대화 0~7번: 마지막 1~3개 agent 메시지를 readBySeller: false로 설정
  for (let ci = 0; ci < Math.min(8, convs.length); ci++) {
    const conv = convs[ci];
    const agentMsgs = conv.messages.filter(m => m.type === "agent");
    const unreadCount = 1 + (ci % 3); // 1~3개
    for (let k = 0; k < Math.min(unreadCount, agentMsgs.length); k++) {
      agentMsgs[agentMsgs.length - 1 - k].readBySeller = false;
    }
  }

  // Add delayed seller messages for demo (각 지연 단계별 2개씩)
  const now = new Date();
  const delayConfigs = [
    { idx: 0, hoursAgo: 1.2, msg: "혹시 이 상품 다른 색상도 가능한가요?" },
    { idx: 2, hoursAgo: 2.5, msg: "송장번호 언제 등록되나요? 기다리고 있습니다." },
    { idx: 4, hoursAgo: 3.5, msg: "아직 답변을 못 받았는데 확인 부탁드립니다." },
    { idx: 6, hoursAgo: 5, msg: "환불 언제 되나요? 빨리 처리해 주세요." },
    { idx: 8, hoursAgo: 10, msg: "배송 관련해서 재문의드립니다. 확인 부탁요." },
    { idx: 10, hoursAgo: 18, msg: "아직도 처리가 안 되고 있어요. 빨리 확인 부탁드립니다." },
    { idx: 12, hoursAgo: 26, msg: "하루 넘게 답이 없는데 확인해 주세요." },
    { idx: 14, hoursAgo: 50, msg: "여러 번 문의했는데 답변이 없습니다. 빠른 처리 부탁드립니다." },
  ];
  for (const dc of delayConfigs) {
    if (dc.idx < convs.length) {
      const conv = convs[dc.idx];
      const sellerMsg: ChatMessage = {
        id: `${dc.idx}-delay`,
        type: "seller",
        sender: conv.seller.shopName,
        content: dc.msg,
        createdAt: new Date(now.getTime() - dc.hoursAgo * 3600000),
      };
      conv.messages.push(sellerMsg);
      conv.lastMessage = sellerMsg.content;
      conv.lastMessageAt = sellerMsg.createdAt;
    }
  }

  return convs.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
}

const CHAT_CONVERSATIONS = generateConversations();

function getDelayInfo(conv: Conversation): { hours: number; level: 0 | 1 | 2 | 3 } {
  if (conv.blocked) return { hours: 0, level: 0 }; // 차단된 경우 응대필요 제외
  const now = Date.now();
  let lastSellerIdx = -1;
  for (let i = conv.messages.length - 1; i >= 0; i--) {
    if (conv.messages[i].type === "seller") { lastSellerIdx = i; break; }
  }
  if (lastSellerIdx === -1) return { hours: 0, level: 0 };
  const lastSellerTime = conv.messages[lastSellerIdx].createdAt.getTime();
  for (let i = lastSellerIdx + 1; i < conv.messages.length; i++) {
    if (conv.messages[i].type === "agent") return { hours: 0, level: 0 };
  }
  if (conv.lastAgentActionAt && conv.lastAgentActionAt.getTime() > lastSellerTime) return { hours: 0, level: 0 };
  const hours = Math.floor((now - lastSellerTime) / 3600000);
  if (hours < 1) return { hours: 0, level: 0 };
  if (hours < 3) return { hours, level: 1 };
  if (hours < 24) return { hours, level: 2 };
  return { hours: 24, level: 3 };
}

function ChatPage({ lang, t, conversations, setConversations }: { lang: Lang; t: (kr: string, en: string) => string; conversations: Conversation[]; setConversations: React.Dispatch<React.SetStateAction<Conversation[]>> }) {
  const [selectedId, setSelectedId] = useState<string | null>(CHAT_CONVERSATIONS[0]?.id || null);
  const [filter, setFilter] = useState<ChatFilterId>("all");
  const [search, setSearch] = useState("");
  const [prevFilter, setPrevFilter] = useState<ChatFilterId>("all");
  const [inputText, setInputText] = useState("");
  const [inputMode, setInputMode] = useState<"message" | "internal_note">("message");
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [muteSystemNotif, setMuteSystemNotif] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState<string | null>(null);
  const [delayFilter, setDelayFilter] = useState(false);
  const msgContainerRef = useRef<HTMLDivElement | null>(null);
  const prevMsgCount = useRef<number>(0);

  const filtered = useMemo(() => {
    let list = conversations;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c: Conversation) =>
        c.seller.shopName.toLowerCase().includes(q) ||
        String(c.seller.id).includes(q) ||
        c.orders.some((o: OrderHistory) => o.id.toLowerCase().includes(q))
      );
    } else {
      const f = CHAT_FILTERS.find(cf => cf.id === filter);
      if (f && f.statuses) list = list.filter((c: Conversation) => f.statuses!.includes(c.orderStatus));
    }
    if (delayFilter) list = list.filter((c: Conversation) => getDelayInfo(c).level > 0);
    return list;
  }, [conversations, filter, search, delayFilter]);

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CHAT_FILTERS.forEach(f => {
      counts[f.id] = !f.statuses ? conversations.length : conversations.filter((c: Conversation) => f.statuses!.includes(c.orderStatus)).length;
    });
    return counts;
  }, [conversations]);

  const delayCount = useMemo(() => conversations.filter((c: Conversation) => getDelayInfo(c).level > 0).length, [conversations]);

  const selected = conversations.find((c: Conversation) => c.id === selectedId) || null;

  const getDisplayUnread = (c: Conversation) => {
    if (!muteSystemNotif || c.unreadCount === 0) return c.unreadCount;
    const lastN = c.messages.slice(-c.unreadCount);
    const sysCount = lastN.filter((m: ChatMessage) => m.type === "system").length;
    return Math.max(0, c.unreadCount - sysCount);
  };

  // Scroll to bottom only on conversation switch or new message
  const selectedMsgLen = selected?.messages.length || 0;
  useEffect(() => {
    if (msgContainerRef.current) {
      msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight;
    }
    prevMsgCount.current = selectedMsgLen;
  }, [selectedId, selectedMsgLen]);

  const selectConversation = (id: string) => {
    setSelectedId(id);
    setShowMoreMenu(false);
    setShowOrderDetail(null);
    setConversations((prev: Conversation[]) => prev.map((c: Conversation) => c.id === id ? { ...c, unreadCount: 0, lastAgentActionAt: new Date() } : c));
  };

  // 읽음 시뮬레이션: 대화 선택 5초 후 해당 대화의 agent 메시지 readBySeller → true
  useEffect(() => {
    if (!selectedId) return;
    const timer = setTimeout(() => {
      setConversations((prev: Conversation[]) => prev.map((c: Conversation) =>
        c.id === selectedId
          ? { ...c, messages: c.messages.map((m: ChatMessage) => m.type === "agent" && m.readBySeller === false ? { ...m, readBySeller: true } : m) }
          : c
      ));
    }, 5000);
    return () => clearTimeout(timer);
  }, [selectedId]);

  const handleSearchChange = (val: string) => {
    if (val && !search) setPrevFilter(filter);
    setSearch(val);
    if (!val) setFilter(prevFilter);
  };

  const clearSearch = () => {
    setSearch("");
    setFilter(prevFilter);
  };

  const sendMessage = () => {
    if (!inputText.trim() || !selectedId) return;
    const isAgent = inputMode !== "internal_note";
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: isAgent ? "agent" : "internal_note",
      sender: selected?.assignee || AGENTS[0],
      content: inputText.trim(),
      createdAt: new Date(),
      ...(isAgent ? { readBySeller: false } : {}),
    };
    setConversations((prev: Conversation[]) => prev.map((c: Conversation) => c.id === selectedId ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.content, lastMessageAt: newMsg.createdAt } : c));
    setInputText("");
  };

  const changeAssignee = (agent: string) => {
    if (!selectedId) return;
    const sysMsg: ChatMessage = { id: `sys-assign-${Date.now()}`, type: "system", sender: "System", content: `${t("상담사가", "Agent")} ${agent}${t("(으)로 변경되었습니다", " has been assigned")}`, createdAt: new Date() };
    setConversations((prev: Conversation[]) => prev.map((c: Conversation) => c.id === selectedId ? { ...c, assignee: agent, messages: [...c.messages, sysMsg] } : c));
    setShowAssignDropdown(false);
  };

  const fmtTime = (d: Date) => {
    const h = d.getHours(), m = d.getMinutes();
    if (lang === "kr") return `${h >= 12 ? "오후" : "오전"} ${h > 12 ? h - 12 : h === 0 ? 12 : h}:${String(m).padStart(2, "0")}`;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const fmtDateShort = (d: Date) => {
    if (lang === "kr") return `${d.getMonth() + 1}/${d.getDate()}`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const totalUnread = useMemo(() => {
    return conversations.reduce((s: number, c: Conversation) => s + getDisplayUnread(c), 0);
  }, [conversations, muteSystemNotif]);

  return (
    <div style={{ flex: 1, display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left Panel — Conversation List */}
      <div style={{ width: 320, borderRight: "1px solid #e5e7eb", background: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Header */}
        <div style={{ padding: "14px 14px 8px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{t("번개톡", "Bungae Talk")}</span>
              {totalUnread > 0 && <span style={{ background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 8 }}>{totalUnread}</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#9ca3af", cursor: "pointer" }}>
                <input type="checkbox" checked={muteSystemNotif} onChange={e => setMuteSystemNotif(e.target.checked)} style={{ width: 12, height: 12 }} />
                {t("시스템 알림 끄기", "Mute system")}
              </label>
            </div>
          </div>
          {/* Search */}
          <div style={{ position: "relative", marginBottom: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position: "absolute", left: 8, top: 8 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => handleSearchChange(e.target.value)}
              placeholder={t("주문번호, 상점명, UID, 송장번호 검색", "Search by order no., shop name, UID, invoice no.")}
              style={{ width: "100%", padding: "6px 28px 6px 28px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, boxSizing: "border-box", background: "#f9fafb" }} />
            {search && (
              <span onClick={clearSearch} style={{ position: "absolute", right: 8, top: 6, cursor: "pointer", color: "#9ca3af", fontSize: 14, lineHeight: 1 }}>✕</span>
            )}
          </div>
          {/* Filters */}
          {!search && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {CHAT_FILTERS.map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  style={{ padding: "3px 8px", border: "1px solid", borderColor: filter === f.id ? "#111" : "#e5e7eb", borderRadius: 12, background: filter === f.id ? "#111" : "#fff", color: filter === f.id ? "#fff" : "#6b7280", cursor: "pointer", fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                  {t(f.kr, f.en)}
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{filterCounts[f.id]}</span>
                </button>
              ))}
            </div>
          )}
          {/* Delay Filter — 별도 영역, 상태 필터와 AND 조건 */}
          <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
            <button onClick={() => setDelayFilter(!delayFilter)}
              style={{ padding: "3px 8px", border: "1px solid", borderColor: delayFilter ? "#ef4444" : "#e5e7eb", borderRadius: 12, background: delayFilter ? "#fef2f2" : "#fff", color: delayFilter ? "#ef4444" : "#6b7280", cursor: "pointer", fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {t("응대 지연", "Delayed")}
              {delayCount > 0 && <span style={{ background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 600, padding: "0 5px", borderRadius: 6, minWidth: 14, textAlign: "center" }}>{delayCount}</span>}
            </button>
          </div>
        </div>
        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 12 }}>{t("대화가 없습니다", "No conversations")}</div>
          ) : filtered.map((c: Conversation) => {
            const isSelected = c.id === selectedId;
            const statusInfo = ORDER_STATUSES[c.orderStatus];
            const delay = getDelayInfo(c);
            const delayBg = delay.level === 1 ? "#fffbeb" : delay.level === 2 ? "#fef2f2" : delay.level === 3 ? "#fee2e2" : undefined;
            const delayTagColor = delay.level === 1 ? "#f59e0b" : delay.level === 2 ? "#ef4444" : "#dc2626";
            const delayTagBg = delay.level === 1 ? "#fef3c7" : delay.level === 2 ? "#fee2e2" : "#fecaca";
            const unreadBg = delay.level >= 1 ? delayTagColor : "#ef4444";
            const rowBg = isSelected ? "#f0f4ff" : delayBg || "transparent";
            return (
              <div key={c.id} onClick={() => selectConversation(c.id)}
                style={{ padding: "10px 14px", borderBottom: "1px solid #f3f4f6", cursor: "pointer", background: rowBg, transition: "background 0.15s" }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = isSelected ? "#f0f4ff" : delayBg || "#fafafa"; }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = rowBg; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{c.seller.shopName}</span>
                    {c.blocked && <span style={{ background: "#fee2e2", color: "#991b1b", padding: "1px 5px", borderRadius: 4, fontSize: 9, fontWeight: 500 }}>{t("차단", "Blocked")}</span>}
                    <span style={{ background: statusInfo.color, color: statusInfo.text, padding: "1px 6px", borderRadius: 8, fontSize: 9, fontWeight: 500 }}>
                      {lang === "kr" ? statusInfo.kr : statusInfo.en}
                    </span>
                    {delay.level > 0 && (
                      <span style={{ background: delayTagBg, color: delayTagColor, padding: "1px 5px", borderRadius: 4, fontSize: 9, fontWeight: delay.level === 3 ? 700 : 500 }}>
                        {delay.hours >= 24 ? t("24시간+ 지연", "24h+ delayed") : `${delay.hours}${t("시간 지연", "h delayed")}`}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: "#9ca3af", flexShrink: 0 }}>{fmtTime(c.lastMessageAt)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 210 }}>{c.lastMessage}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {getDisplayUnread(c) > 0 && <span style={{ background: unreadBg, color: "#fff", fontSize: 10, fontWeight: 600, padding: "0 5px", borderRadius: 8, minWidth: 16, textAlign: "center" }}>{getDisplayUnread(c)}</span>}
                  </div>
                </div>
                {c.assignee && <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{t("담당", "Agent")}: {c.assignee}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Center — Messages */}
      {selected ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f9fafb", minWidth: 0 }}>
          {/* Chat Header */}
          <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
            {/* Top row: seller info + actions */}
            <div style={{ padding: "12px 18px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{selected.seller.shopName}</span>
                {selected.seller.isPro && <span style={{ background: "#8b5cf6", color: "#fff", fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 4 }}>PRO</span>}
                <span style={{ fontSize: 11, color: "#9ca3af" }}>{selected.lastActive}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <a href={`https://${selected.seller.shopUrl}`} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 8px", border: "1px solid #d1d5db", borderRadius: 5, background: "#fff", cursor: "pointer", fontSize: 11, color: "#6b7280", textDecoration: "none" }}>
                  {t("상점 보기", "View Shop")}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {selected.assignee ? <>{t("담당", "Agent")}: <span style={{ fontWeight: 500, color: "#374151" }}>{selected.assignee}</span></> : <span style={{ color: "#ef4444" }}>{t("미배정", "Unassigned")}</span>}
                </div>
                {/* More options */}
                <div style={{ position: "relative" }}>
                  <button onClick={() => setShowMoreMenu(!showMoreMenu)}
                    style={{ padding: "3px 6px", border: "1px solid #d1d5db", borderRadius: 5, background: "#fff", cursor: "pointer", fontSize: 14, color: "#6b7280", lineHeight: 1 }}>
                    ···
                  </button>
                  {showMoreMenu && (
                    <div style={{ position: "absolute", right: 0, top: 28, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 50, overflow: "hidden", width: 160 }}>
                      <div onClick={() => { setShowMoreMenu(false); }}
                        style={{ padding: "8px 12px", cursor: "pointer", fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 6 }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#f9fafb"}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        {t("상담 정보", "Chat Info")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Product card row */}
            {selected.product && (
              <div style={{ padding: "0 18px 10px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 6, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.product.name}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", display: "flex", gap: 8 }}>
                    <span>{selected.product.price.toLocaleString()}{t("원", "₩")}</span>
                    <span style={{ color: selected.product.deliveryFee === 0 ? "#10b981" : "#9ca3af" }}>
                      {selected.product.deliveryFee === 0 ? t("무료배송", "Free shipping") : `${t("배송비", "Delivery")} ${selected.product.deliveryFee.toLocaleString()}${t("원", "₩")}`}
                    </span>
                  </div>
                </div>
                <Badge status={selected.orderStatus} lang={lang} />
              </div>
            )}
          </div>
          {/* Messages */}
          <div ref={msgContainerRef} style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            {selected.messages.map((msg: ChatMessage) => {
              if (msg.type === "system") {
                const isPaymentMsg = msg.content.includes("결제") || msg.content.includes("payment") || msg.content.includes("구매") || msg.content.includes("주문");
                return (
                  <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "4px 0", gap: 4 }}>
                    <span style={{ background: "#e5e7eb", color: "#6b7280", padding: "3px 12px", borderRadius: 10, fontSize: 11 }}>{msg.content}</span>
                    {isPaymentMsg && selected.orders.length > 0 && (
                      <button onClick={() => setShowOrderDetail(selected.orders[0].id)}
                        style={{ background: "none", border: "1px solid #d1d5db", borderRadius: 6, padding: "3px 10px", fontSize: 10, color: "#2563eb", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                        {t("주문 상세 보기", "View Order Detail")}
                      </button>
                    )}
                  </div>
                );
              }
              if (msg.type === "internal_note") {
                return (
                  <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end", margin: "2px 0" }}>
                    <div style={{ maxWidth: "70%" }}>
                      <div style={{ fontSize: 10, color: "#92400e", textAlign: "right", marginBottom: 2 }}>{msg.sender} · {t("내부 메모", "Internal Note")}</div>
                      <div style={{ background: "#fef3c7", border: "1px solid #fde68a", color: "#92400e", padding: "8px 12px", borderRadius: "12px 12px 2px 12px", fontSize: 13, lineHeight: 1.5 }}>{msg.content}</div>
                      <div style={{ fontSize: 10, color: "#9ca3af", textAlign: "right", marginTop: 2 }}>{fmtTime(msg.createdAt)}</div>
                    </div>
                  </div>
                );
              }
              if (msg.type === "seller") {
                return (
                  <div key={msg.id} style={{ display: "flex", justifyContent: "flex-start", margin: "2px 0" }}>
                    <div style={{ maxWidth: "70%" }}>
                      <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>{msg.sender}</div>
                      {msg.image ? <img src={msg.image} alt={msg.content} style={{ maxWidth: "100%", borderRadius: 10, marginBottom: 2 }} /> : <div style={{ background: "#f3f4f6", color: "#111827", padding: "8px 12px", borderRadius: "12px 12px 12px 2px", fontSize: 13, lineHeight: 1.5 }}>{msg.content}</div>}
                      <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{fmtTime(msg.createdAt)}</div>
                    </div>
                  </div>
                );
              }
              // agent
              return (
                <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end", margin: "2px 0" }}>
                  <div style={{ maxWidth: "70%" }}>
                    <div style={{ fontSize: 10, color: "#6b7280", textAlign: "right", marginBottom: 2 }}>{msg.sender}</div>
                    {msg.image ? <img src={msg.image} alt={msg.content} style={{ maxWidth: "100%", borderRadius: 10, marginBottom: 2 }} /> : <div style={{ background: "#111827", color: "#fff", padding: "8px 12px", borderRadius: "12px 12px 2px 12px", fontSize: 13, lineHeight: 1.5 }}>{msg.content}</div>}
                    <div style={{ fontSize: 10, color: "#9ca3af", textAlign: "right", marginTop: 2, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                      {msg.readBySeller === false && <span style={{ color: "#f59e0b", fontSize: 9, fontWeight: 500 }}>{t("안읽음", "Unread")}</span>}
                      {fmtTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Input Area */}
          <div style={{ borderTop: "1px solid #e5e7eb", background: "#fff", padding: "10px 18px" }}>
            {selected.blocked ? (
              <div style={{ padding: "12px 0", textAlign: "center", fontSize: 13, color: "#ef4444", background: "#fef2f2", borderRadius: 6 }}>
                {t("차단된 사용자입니다. 메시지를 보낼 수 없습니다.", "This user is blocked. You cannot send messages.")}
              </div>
            ) : <>
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              <button onClick={() => setInputMode("message")}
                style={{ padding: "3px 10px", border: "1px solid", borderColor: inputMode === "message" ? "#111" : "#d1d5db", borderRadius: 5, background: inputMode === "message" ? "#111" : "#fff", color: inputMode === "message" ? "#fff" : "#6b7280", cursor: "pointer", fontSize: 11, fontWeight: 500 }}>
                {t("메시지", "Message")}
              </button>
              <button onClick={() => setInputMode("internal_note")}
                style={{ padding: "3px 10px", border: "1px solid", borderColor: inputMode === "internal_note" ? "#92400e" : "#d1d5db", borderRadius: 5, background: inputMode === "internal_note" ? "#fef3c7" : "#fff", color: inputMode === "internal_note" ? "#92400e" : "#6b7280", cursor: "pointer", fontSize: 11, fontWeight: 500 }}>
                {t("내부 메모", "Internal Note")}
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", padding: "7px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file || !selectedId || !selected) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const newMsg: ChatMessage = { id: `img-${Date.now()}`, type: "agent", sender: selected.assignee || AGENTS[0], content: file.name, createdAt: new Date(), image: reader.result as string };
                    setConversations((prev: Conversation[]) => prev.map((c: Conversation) => c.id === selectedId ? { ...c, messages: [...c.messages, newMsg], lastMessage: `[${t("이미지", "Image")}] ${file.name}`, lastMessageAt: newMsg.createdAt } : c));
                  };
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }} />
              </label>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  style={{ padding: "7px", border: "1px solid #d1d5db", borderRadius: 6, background: showEmojiPicker ? "#f3f4f6" : "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                </button>
                {showEmojiPicker && (
                  <div style={{ position: "absolute", bottom: 36, left: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", zIndex: 50, padding: "8px", width: 220 }}>
                    <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 6, fontWeight: 500 }}>{t("번개장터 이모지", "Bungae Emojis")}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 2 }}>
                      {BUNGAE_EMOJIS.map((emoji, i) => (
                        <button key={i} onClick={() => { setInputText(prev => prev + emoji); setShowEmojiPicker(false); }}
                          style={{ padding: 4, border: "none", background: "transparent", cursor: "pointer", fontSize: 18, borderRadius: 4, lineHeight: 1 }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6"}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}>
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <input value={inputText} onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={inputMode === "internal_note" ? t("내부 메모를 입력하세요...", "Type internal note...") : t("메시지를 입력하세요...", "Type a message...")}
                style={{ flex: 1, padding: "8px 12px", border: "1px solid", borderColor: inputMode === "internal_note" ? "#fde68a" : "#d1d5db", borderRadius: 6, fontSize: 13, background: inputMode === "internal_note" ? "#fffbeb" : "#fff", boxSizing: "border-box" }} />
              <button onClick={sendMessage}
                style={{ padding: "8px 16px", border: "none", borderRadius: 6, background: inputMode === "internal_note" ? "#92400e" : "#111", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                {t("전송", "Send")}
              </button>
            </div>
            </>}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14, background: "#f9fafb" }}>
          {t("대화를 선택하세요", "Select a conversation")}
        </div>
      )}

      {/* Right Panel — Info */}
      {selected && (
        <div style={{ width: 300, borderLeft: "1px solid #e5e7eb", background: "#fff", overflowY: "auto", flexShrink: 0 }}>
          {/* Seller Info */}
          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>{t("판매자 정보", "Seller Info")}</div>
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{selected.seller.shopName}</div>
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>UID: <span style={{ fontFamily: "monospace", fontSize: 11 }}>{selected.seller.id}</span></div>
            <div style={{ fontSize: 12 }}>
              <a href={`https://${selected.seller.shopUrl}`} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "none", fontSize: 11 }}>{selected.seller.shopUrl}</a>
            </div>
          </div>

          {/* Assignment */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>{t("상담 배정", "Assignment")}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{selected.assignee || t("미배정", "Unassigned")}</span>
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                  style={{ padding: "3px 8px", border: "1px solid #d1d5db", borderRadius: 5, background: "#fff", cursor: "pointer", fontSize: 11, color: "#6b7280" }}>
                  {t("배정 변경", "Reassign")}
                </button>
                {showAssignDropdown && (
                  <div style={{ position: "absolute", right: 0, top: 28, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 50, overflow: "hidden", width: 140 }}>
                    {AGENTS.map(a => (
                      <div key={a} onClick={() => changeAssignee(a)}
                        style={{ padding: "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: selected.assignee === a ? 600 : 400, color: selected.assignee === a ? "#111" : "#6b7280", background: selected.assignee === a ? "#f3f4f6" : "transparent" }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#f9fafb"}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = selected.assignee === a ? "#f3f4f6" : "transparent"}>
                        {a}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Assignment history */}
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
              <div>{t("배정 이력", "History")}:</div>
              {selected.messages.filter((m: ChatMessage) => m.type === "system" && m.content.includes(lang === "kr" ? "상담사" : "Agent")).slice(-3).map((m: ChatMessage, i: number) => (
                <div key={i} style={{ marginTop: 2, color: "#9ca3af" }}>· {fmtTime(m.createdAt)} — {m.content}</div>
              ))}
              {selected.messages.filter((m: ChatMessage) => m.type === "system" && m.content.includes(lang === "kr" ? "상담사" : "Agent")).length === 0 && (
                <div style={{ marginTop: 2, color: "#d1d5db" }}>{t("이력 없음", "No history")}</div>
              )}
            </div>
          </div>

          {/* Order History */}
          <div style={{ padding: "12px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>{t("주문 내역", "Order History")}</div>
            {selected.orders.length === 0 ? (
              <div style={{ fontSize: 12, color: "#d1d5db" }}>{t("주문 내역이 없습니다", "No order history")}</div>
            ) : selected.orders.map((o: OrderHistory) => {
              const isHighlighted = showOrderDetail === o.id;
              return (
                <div key={o.id} onClick={() => setShowOrderDetail(isHighlighted ? null : o.id)}
                  style={{ padding: "8px 10px", borderBottom: "1px solid #f3f4f6", cursor: "pointer", borderRadius: 6, background: isHighlighted ? "#eff6ff" : "transparent", border: isHighlighted ? "1px solid #bfdbfe" : "1px solid transparent", transition: "all 0.15s", marginBottom: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ color: "#2563eb", fontWeight: 500, fontSize: 12 }}>{o.id}</span>
                    <Badge status={o.status} lang={lang} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280" }}>
                    <span>{fmtDateShort(o.date)}</span>
                    <span style={{ fontWeight: 600, color: "#374151" }}>{o.totalPrice.toLocaleString()}{t("원", "₩")}</span>
                  </div>
                  {isHighlighted && (
                    <div style={{ marginTop: 8, padding: "8px 0", borderTop: "1px solid #e5e7eb", fontSize: 11, color: "#374151" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ color: "#6b7280" }}>{t("주문번호", "Order No.")}</span>
                        <span style={{ fontFamily: "monospace" }}>{o.id}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ color: "#6b7280" }}>{t("주문일시", "Order Date")}</span>
                        <span>{o.date.getFullYear()}.{String(o.date.getMonth() + 1).padStart(2, "0")}.{String(o.date.getDate()).padStart(2, "0")} {String(o.date.getHours()).padStart(2, "0")}:{String(o.date.getMinutes()).padStart(2, "0")}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ color: "#6b7280" }}>{t("상품명", "Product")}</span>
                        <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.product?.name || "-"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ color: "#6b7280" }}>{t("결제금액", "Amount")}</span>
                        <span style={{ fontWeight: 600 }}>{o.totalPrice.toLocaleString()}{t("원", "₩")}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#6b7280" }}>{t("배송비", "Delivery")}</span>
                        <span>{selected.product?.deliveryFee === 0 ? t("무료", "Free") : `${(selected.product?.deliveryFee || 0).toLocaleString()}${t("원", "₩")}`}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────
// Root App
// ────────────────────────────────────────────
export default function App() {
  const [route, setRoute] = useHashRoute();
  const [lang, setLang] = useState<Lang>("kr");
  const [conversations, setConversations] = useState<Conversation[]>(CHAT_CONVERSATIONS);
  const t = (kr: string, en: string) => (lang === "kr" ? kr : en);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f5f7", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: 13, color: "#111827" }}>
      <Sidebar route={route} setRoute={setRoute} lang={lang} t={t} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar with lang toggle */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, padding: "12px 28px 0" }}>
          <button onClick={() => setLang(lang === "kr" ? "en" : "kr")} style={{ padding: "5px 12px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            {lang === "kr" ? "EN" : "KR"}
          </button>
          <button onClick={() => alert(t("로그아웃 되었습니다.", "You have been logged out."))} style={{ padding: "5px 12px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, color: "#6b7280" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {t("로그아웃", "Logout")}
          </button>
        </div>
        {route === "dashboard" && <DashboardPage lang={lang} t={t} setRoute={setRoute} />}
        {route === "orders" && <OrdersPage lang={lang} t={t} conversations={conversations} setConversations={setConversations} />}
        {route === "chat" && <ChatPage lang={lang} t={t} conversations={conversations} setConversations={setConversations} />}
      </div>
    </div>
  );
}
