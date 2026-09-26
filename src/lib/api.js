import { PRESERVED_STUDIO_DATA } from "@/data/seedData";

/*
 * GitHub Pages tidak menjalankan Express/server.ts.
 * Jadi website publik membaca data langsung dari seedData.ts.
 */

const BASE_URL = import.meta.env.BASE_URL || "/";

const withBase = (url) => {
  if (!url) return url;

  // Jangan ubah URL eksternal / data URL / blob
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  // Hindari base path dobel
  if (url.startsWith(BASE_URL)) {
    return url;
  }

  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;

  return `${BASE_URL}${cleanUrl}`;
};

const STATIC_PROJECTS = (PRESERVED_STUDIO_DATA.projects || []).map(
  (project) => ({
    ...project,

    cover: withBase(project.cover),

    images: (project.images || []).map((image) => ({
      ...image,
      url: withBase(image.url),
    })),
  }),
);

export const WORLDS = {
  anomaly: {
    key: "anomaly",
    index: "01",
    title: "Design Anomaly",
    titleLines: ["Design", "Anomaly"],
    path: "/anomaly",
    description:
      "Experimental architecture and spatial research. Structures, installations and fragments produced by subtraction, displacement, folding and collision.",
  },

  furniture: {
    key: "furniture",
    index: "02",
    title: "Design Furniture",
    titleLines: ["Design", "Furniture"],
    path: "/furniture",
    description:
      "Objects and furniture understood as small architecture. Each piece records a single design operation — peeling, compression, splitting — made legible in material.",
  },

  work: {
    key: "work",
    index: "03",
    title: "Work",
    titleLines: ["Design", "Work"],
    path: "/work",
    description:
      "Applied practice across supervision, building design and competition entries — where architectural ideas meet real briefs, sites and constraints.",
    categories: ["Supervisor", "Building Design", "Competition Design"],
  },
};

/*
 * PUBLIC WEBSITE
 */

export const fetchPublished = async (world) => {
  return STATIC_PROJECTS
    .filter((project) => project.published)
    .filter((project) => !world || project.world === world)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

export const fetchProject = async (slug) => {
  const project = STATIC_PROJECTS.find(
    (project) => project.slug === slug && project.published,
  );

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};

export const fetchAbout = async () => {
  return PRESERVED_STUDIO_DATA.about;
};

export const fetchHomeIntro = async () => {
  const data = PRESERVED_STUDIO_DATA.home_intro || {};

  return {
    ...data,
    bg_image: withBase(data.bg_image),
  };
};

/*
 * ADMIN / EDITOR
 *
 * GitHub Pages adalah static hosting.
 * Fitur admin membutuhkan Node/Express backend, sehingga sengaja
 * dinonaktifkan pada versi GitHub Pages.
 */

const ADMIN_ERROR =
  "Admin features require the Node/Express backend and are not available on GitHub Pages.";

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("editor_token");
};

export const setToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("editor_token", token);
  }
};

export const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("editor_token");
  }
};

export const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

const adminUnavailable = async () => {
  throw new Error(ADMIN_ERROR);
};

export const adminLogin = adminUnavailable;

export const adminVerify = adminUnavailable;

export const adminFetchAll = adminUnavailable;

export const adminFetchBySlug = adminUnavailable;

export const adminCreate = adminUnavailable;

export const adminUpdate = adminUnavailable;

export const adminDelete = adminUnavailable;

export const adminReorder = adminUnavailable;

export const adminUpload = adminUnavailable;

export const adminUpdateAbout = adminUnavailable;

export const adminChangePasscode = adminUnavailable;

export const adminUpdateHomeIntro = adminUnavailable;

export const adminSyncToCode = adminUnavailable;

/*
 * HELPERS
 */

export const pad = (n) => String(n + 1).padStart(2, "0");
