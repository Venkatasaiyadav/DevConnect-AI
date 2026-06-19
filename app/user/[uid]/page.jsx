"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import { db } from "../../../lib/firebase";
import {
  doc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";

// ── Preset platforms ──────────────────────────────────────────────────────────
const LINK_PRESETS = [
  { key: "github",    label: "GitHub",    icon: "🐙" },
  { key: "twitter",   label: "Twitter/X", icon: "🐦" },
  { key: "linkedin",  label: "LinkedIn",  icon: "💼" },
  { key: "website",   label: "Website",   icon: "🌐" },
  { key: "youtube",   label: "YouTube",   icon: "▶️" },
  { key: "devto",     label: "Dev.to",    icon: "👩‍💻" },
  { key: "hashnode",  label: "Hashnode",  icon: "📝" },
  { key: "instagram", label: "Instagram", icon: "📸" },
];
const getPreset = (key) => LINK_PRESETS.find((p) => p.key === key) || { icon: "🔗", label: key };

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: { minHeight: "100vh", background: "var(--bg-primary)" },
  navbar: {
    position: "fixed", top: 0, left: 0, width: "100%", height: 64,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", background: "var(--bg-secondary)",
    borderBottom: "1px solid var(--border-color)", zIndex: 100,
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    boxSizing: "border-box",
  },
  brand: {
    fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)",
    textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
  },
  navActions: { display: "flex", alignItems: "center", gap: 10 },
  btnBack: {
    padding: "6px 14px", background: "transparent",
    border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)", fontWeight: 500, cursor: "pointer",
    textDecoration: "none", fontSize: "0.85rem", fontFamily: "inherit",
  },
  container: {
    maxWidth: 800, margin: "0 auto", padding: "88px 24px 48px",
  },
  containerMobile: {
    maxWidth: "100%", margin: "0 auto", padding: "76px 14px 40px",
  },

  // ── Hero card ──
  heroCard: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: 28,
    marginBottom: 20,
    boxShadow: "var(--shadow-sm)",
  },
  heroCardMobile: { padding: 18 },
  heroTop: { display: "flex", alignItems: "flex-start", gap: 22 },
  heroTopMobile: { flexDirection: "column", alignItems: "center", textAlign: "center" },
  avatar: (size) => ({
    width: size, height: size,
    borderRadius: "var(--radius-full)",
    background: "linear-gradient(135deg, #0284c7, #38bdf8)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#000", fontWeight: 700, fontSize: size * 0.3,
    border: "3px solid var(--border-color)",
    flexShrink: 0, overflow: "hidden",
  }),
  heroInfo: { flex: 1, minWidth: 0 },
  heroName: {
    color: "var(--text-primary)", fontWeight: 700,
    fontSize: "1.5rem", margin: "0 0 4px 0",
  },
  heroNameMobile: { fontSize: "1.25rem" },
  heroEmail: { color: "var(--text-muted)", fontSize: "0.88rem", margin: "0 0 10px 0" },
  heroBio: {
    color: "var(--text-secondary)", fontSize: "0.9rem",
    lineHeight: 1.6, margin: "0 0 14px 0", maxWidth: 520,
  },
  heroBioMobile: { maxWidth: "100%", textAlign: "center" },
  linksRow: { display: "flex", flexWrap: "wrap", gap: 12 },
  linkItem: {
    color: "var(--accent-primary)", fontSize: "0.85rem",
    textDecoration: "none", display: "flex", alignItems: "center", gap: 5,
  },

  // ── Stats row ──
  statsRow: {
    display: "flex", gap: 24, marginTop: 20,
    paddingTop: 18, borderTop: "1px solid var(--border-color)",
    flexWrap: "wrap",
  },
  statsRowMobile: { justifyContent: "center", gap: 16 },
  statItem: { textAlign: "center" },
  statValue: { color: "var(--accent-primary)", fontWeight: 700, fontSize: "1.3rem", lineHeight: 1 },
  statLabel: { color: "var(--text-muted)", fontSize: "0.72rem", marginTop: 3 },

  // ── Follow button ──
  btnFollow: {
    marginTop: 18,
    padding: "9px 24px",
    backgroundColor: "var(--accent-primary)",
    border: "none",
    borderRadius: "var(--radius-md)",
    color: "#000", fontWeight: 700, fontSize: "0.9rem",
    cursor: "pointer", fontFamily: "inherit",
    transition: "opacity 0.15s",
  },
  btnUnfollow: {
    marginTop: 18,
    padding: "9px 24px",
    backgroundColor: "transparent",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.9rem",
    cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.15s",
  },

  // ── Tabs ──
  tabsBar: {
    display: "flex", gap: 4,
    borderBottom: "1px solid var(--border-color)",
    marginBottom: 18,
  },
  tab: (active) => ({
    padding: "9px 18px",
    border: "none",
    borderBottom: active ? "2px solid var(--accent-primary)" : "2px solid transparent",
    background: "transparent",
    color: active ? "var(--accent-primary)" : "var(--text-muted)",
    fontWeight: active ? 700 : 500,
    fontSize: "0.88rem",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "color 0.15s",
  }),

  // ── Post card ──
  postCard: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: 18,
    marginBottom: 14,
    boxShadow: "var(--shadow-sm)",
    display: "flex", flexDirection: "column", gap: 10,
  },
  postMeta: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: 8,
  },
  postTypeTag: (type) => ({
    display: "inline-flex", alignItems: "center",
    padding: "2px 9px",
    backgroundColor: type === "question" ? "rgba(251,146,60,0.12)" : type === "collaboration" ? "rgba(52,211,153,0.12)" : "var(--bg-primary)",
    border: `1px solid ${type === "question" ? "rgba(251,146,60,0.4)" : type === "collaboration" ? "rgba(52,211,153,0.4)" : "var(--border-color)"}`,
    color: type === "question" ? "#fb923c" : type === "collaboration" ? "#34d399" : "var(--text-secondary)",
    borderRadius: "var(--radius-sm)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase",
  }),
  postTs: { fontSize: "0.75rem", color: "var(--text-muted)" },
  postBody: { fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 },
  postTags: { display: "flex", flexWrap: "wrap", gap: 6 },
  postTag: { color: "var(--accent-primary)", fontSize: "0.8rem", fontWeight: 500 },
  postStats: { display: "flex", gap: 14, fontSize: "0.8rem", color: "var(--text-muted)", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 8 },

  // ── Empty / loading ──
  empty: {
    textAlign: "center", padding: "48px 24px",
    color: "var(--text-muted)", fontSize: "0.9rem",
  },
  loading: {
    minHeight: "100vh", display: "flex",
    alignItems: "center", justifyContent: "center",
    background: "var(--bg-primary)", color: "var(--text-muted)",
    fontSize: "0.9rem",
  },
  notFound: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    background: "var(--bg-primary)", gap: 12,
  },
  card: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: 20, marginBottom: 14,
    boxShadow: "var(--shadow-sm)",
  },
  cardTitle: {
    color: "var(--text-primary)", fontWeight: 700,
    fontSize: "0.95rem", margin: "0 0 14px 0",
  },
  badge: {
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px",
    backgroundColor: "var(--accent-primary-alpha)",
    color: "var(--accent-primary)",
    borderRadius: "var(--radius-full)",
    fontSize: "0.72rem", fontWeight: 600,
  },
};

// ── Avatar component ──────────────────────────────────────────────────────────
function Avatar({ photoURL, displayName, size = 80 }) {
  return (
    <div style={S.avatar(size)}>
      {photoURL
        ? <img src={photoURL} alt={displayName || "avatar"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : (displayName?.charAt(0)?.toUpperCase() || "U")}
    </div>
  );
}

// ── Post card ─────────────────────────────────────────────────────────────────
function PostCard({ post, isMobile }) {
  const [expanded, setExpanded] = useState(false);
  const type = post.postType || "discussion";
  const typeLabel = type === "question" ? "Question" : type === "collaboration" ? "Collaborate" : "Discussion";
  const ts = post.timestamp?.toDate
    ? post.timestamp.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Recently";

  return (
    <article style={S.postCard}>
      <div style={S.postMeta}>
        <span style={S.postTypeTag(type)}>{typeLabel}</span>
        <span style={S.postTs}>{ts}{post.edited ? " (edited)" : ""}</span>
      </div>

      <div style={{ ...S.postBody, ...((!expanded && post.content?.length > 300) ? { maxHeight: 120, overflow: "hidden", maskImage: "linear-gradient(to bottom, black 60%, transparent)" } : {}) }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
          code({ className, children, ...props }) {
            const isInline = !className;
            return isInline
              ? <code style={{ background: "var(--bg-primary)", padding: "2px 6px", borderRadius: 4, fontSize: "0.82em" }} {...props}>{children}</code>
              : <pre style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 8, padding: 12, overflowX: "auto", fontSize: "0.82em" }}><code className={className} {...props}>{children}</code></pre>;
          },
          p({ children }) { return <p style={{ margin: "0 0 8px 0", lineHeight: 1.6 }}>{children}</p>; },
          ul({ children }) { return <ul style={{ paddingLeft: 20, margin: "0 0 8px 0" }}>{children}</ul>; },
          ol({ children }) { return <ol style={{ paddingLeft: 20, margin: "0 0 8px 0" }}>{children}</ol>; },
          li({ children }) { return <li style={{ marginBottom: 3 }}>{children}</li>; },
        }}>{post.content}</ReactMarkdown>
      </div>

      {post.content?.length > 300 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "inherit", textAlign: "left" }}
        >
          {expanded ? "Show less ↑" : "Read more ↓"}
        </button>
      )}

      {post.tags?.length > 0 && (
        <div style={S.postTags}>
          {post.tags.map((t) => <span key={t} style={S.postTag}>{t}</span>)}
        </div>
      )}

      <div style={S.postStats}>
        <span>♡ {post.likes || 0} likes</span>
        <span>💬 {post.comments?.length || 0} comments</span>
      </div>
    </article>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function UserProfilePage() {
  const { uid } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [following, setFollowing] = useState([]); // currentUser's following list
  const [followLoading, setFollowLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Redirect to own profile page if viewing yourself
  useEffect(() => {
    if (currentUser && uid === currentUser.uid) {
      router.replace("/profile");
    }
  }, [currentUser, uid, router]);

  // ── Load target user's profile doc ───────────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
      if (!snap.exists()) { setNotFound(true); setPageLoading(false); return; }
      setProfileUser({ uid, ...snap.data() });
      setPageLoading(false);
    });
    return () => unsub();
  }, [uid]);

  // ── Load target user's posts ──────────────────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, "posts"),
      where("uid", "==", uid),
      orderBy("timestamp", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setUserPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [uid]);

  // ── Track currentUser's following list live ───────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, "users", currentUser.uid), (snap) => {
      setFollowing(snap.data()?.following || []);
    });
    return () => unsub();
  }, [currentUser]);

  // ── Follow / Unfollow ─────────────────────────────────────────────────────
  const handleFollowToggle = async () => {
    if (!currentUser || followLoading) return;
    const isFollowing = following.includes(uid);
    setFollowLoading(true);
    try {
      await setDoc(doc(db, "users", currentUser.uid), {
        following: isFollowing ? arrayRemove(uid) : arrayUnion(uid),
      }, { merge: true });
      await setDoc(doc(db, "users", uid), {
        followers: isFollowing ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
      }, { merge: true });
    } catch (err) {
      console.error("Follow toggle failed:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const isFollowing = following.includes(uid);
  const followers = profileUser?.followers || [];
  const followingList = profileUser?.following || [];
  const joinedDate = profileUser?.createdAt?.toDate
    ? profileUser.createdAt.toDate().toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";

  // Build links object from Firestore doc
  const links = {};
  if (profileUser) {
    LINK_PRESETS.forEach(({ key }) => { if (profileUser[key]) links[key] = profileUser[key]; });
    Object.keys(profileUser).forEach((k) => {
      if (k.startsWith("custom_") && !k.endsWith("_label") && profileUser[k]) links[k] = profileUser[k];
    });
  }

  // Tab content
  const tabs = [
    { id: "posts", label: `Posts (${userPosts.length})` },
    { id: "questions", label: `Questions (${userPosts.filter((p) => p.postType === "question").length})` },
    { id: "collaborations", label: `Collabs (${userPosts.filter((p) => p.postType === "collaboration").length})` },
  ];

  const visiblePosts = activeTab === "posts"
    ? userPosts
    : activeTab === "questions"
    ? userPosts.filter((p) => p.postType === "question")
    : userPosts.filter((p) => p.postType === "collaboration");

  if (pageLoading) return <div style={S.loading}>Loading profile…</div>;

  if (notFound) return (
    <div style={S.notFound}>
      <div style={{ fontSize: "3rem" }}>👤</div>
      <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem" }}>User not found</div>
      <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>This profile doesn't exist or was removed.</div>
      <Link href="/dashboard" style={{ marginTop: 8, padding: "8px 20px", backgroundColor: "var(--accent-primary)", color: "#000", fontWeight: 600, borderRadius: "var(--radius-md)", textDecoration: "none", fontSize: "0.9rem" }}>
        Back to Dashboard
      </Link>
    </div>
  );

  const ctr = isMobile ? S.containerMobile : S.container;
  const heroCardStyle = isMobile ? { ...S.heroCard, ...S.heroCardMobile } : S.heroCard;
  const heroTopStyle = isMobile ? { ...S.heroTop, ...S.heroTopMobile } : S.heroTop;
  const isSelf = currentUser?.uid === uid;

  return (
    <div style={S.page}>
      {/* ── Navbar ── */}
      <header style={S.navbar}>
        <Link href="/dashboard" style={S.brand}>🧠 {isMobile ? "DevConnect" : "DevConnect AI"}</Link>
        <div style={S.navActions}>
          <button
            onClick={toggleTheme}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, background: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--radius-full)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1rem", flexShrink: 0 }}
            title="Toggle theme"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          <button onClick={() => router.back()} style={S.btnBack}>← Back</button>
        </div>
      </header>

      <div style={ctr}>
        {/* ── Hero card ── */}
        <div style={heroCardStyle}>
          <div style={heroTopStyle}>
            {/* Avatar */}
            <Avatar photoURL={profileUser?.photoURL} displayName={profileUser?.displayName} size={isMobile ? 72 : 96} />

            {/* Info */}
            <div style={S.heroInfo}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start" }}>
                <h1 style={{ ...(isMobile ? { ...S.heroName, ...S.heroNameMobile } : S.heroName) }}>
                  {profileUser?.displayName || "Anonymous User"}
                </h1>
                <span style={S.badge}>Community Member</span>
              </div>

              {profileUser?.email && (
                <p style={S.heroEmail}>{profileUser.email}</p>
              )}

              {profileUser?.bio && (
                <p style={{ ...S.heroBio, ...(isMobile ? S.heroBioMobile : {}) }}>
                  {profileUser.bio}
                </p>
              )}

              {/* Social links */}
              {Object.keys(links).length > 0 && (
                <div style={{ ...S.linksRow, justifyContent: isMobile ? "center" : "flex-start" }}>
                  {Object.entries(links).map(([key, url]) => {
                    const p = getPreset(key);
                    return (
                      <a key={key} href={url} target="_blank" rel="noreferrer" style={S.linkItem}>
                        <span>{p.icon}</span>
                        <span>{key.startsWith("custom_") ? url : p.label}</span>
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Follow / Unfollow button — hidden if viewing own profile */}
              {!isSelf && currentUser && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  style={{
                    ...(isFollowing ? S.btnUnfollow : S.btnFollow),
                    opacity: followLoading ? 0.6 : 1,
                  }}
                >
                  {followLoading ? "…" : isFollowing ? "✓ Following" : "+ Follow"}
                </button>
              )}

              {/* Joined date */}
              <div style={{ marginTop: 12, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                📅 Joined {joinedDate}
              </div>
            </div>
          </div>

          {/* ── Stats row ── */}
          <div style={{ ...S.statsRow, ...(isMobile ? S.statsRowMobile : {}) }}>
            {[
              { label: "Posts", value: userPosts.length },
              { label: "Followers", value: followers.length },
              { label: "Following", value: followingList.length },
              { label: "Questions", value: userPosts.filter((p) => p.postType === "question").length },
              { label: "Collabs", value: userPosts.filter((p) => p.postType === "collaboration").length },
            ].map(({ label, value }) => (
              <div key={label} style={S.statItem}>
                <div style={S.statValue}>{value}</div>
                <div style={S.statLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Posts section ── */}
        <div>
          {/* Tab bar */}
          <div style={S.tabsBar}>
            {tabs.map(({ id, label }) => (
              <button key={id} style={S.tab(activeTab === id)} onClick={() => setActiveTab(id)}>
                {label}
              </button>
            ))}
          </div>

          {/* Posts */}
          {visiblePosts.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>
                {activeTab === "questions" ? "🙋" : activeTab === "collaborations" ? "🤝" : "📝"}
              </div>
              <div style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                No {activeTab} yet
              </div>
              <div>{profileUser?.displayName || "This user"} hasn't posted any {activeTab} yet.</div>
            </div>
          ) : (
            visiblePosts.map((post) => (
              <PostCard key={post.id} post={post} isMobile={isMobile} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}