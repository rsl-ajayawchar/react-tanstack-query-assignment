const delay = (ms = 650) => new Promise((resolve) => setTimeout(resolve, ms));
const products = [
  {
    id: 1,
    name: "Studio Headphones",
    category: "Electronics",
    price: 12900,
    description: "Immersive sound for focus, travel, and everyday listening.",
    icon: "🎧",
    stock: 18,
  },
  {
    id: 2,
    name: "Everyday Backpack",
    category: "Accessories",
    price: 8400,
    description: "A lightweight carry-all for your daily essentials.",
    icon: "🎒",
    stock: 24,
  },
  {
    id: 3,
    name: "Ceramic Pour-over",
    category: "Home",
    price: 3600,
    description: "A simple ritual for a better cup of morning coffee.",
    icon: "☕",
    stock: 12,
  },
  {
    id: 4,
    name: "Desk Lamp",
    category: "Home",
    price: 7200,
    description: "Warm, focused light for late-night projects and reading.",
    icon: "💡",
    stock: 9,
  },
  {
    id: 5,
    name: "Canvas Sneakers",
    category: "Style",
    price: 6400,
    description: "Comfortable everyday sneakers with a timeless silhouette.",
    icon: "👟",
    stock: 31,
  },
  {
    id: 6,
    name: "Insulated Bottle",
    category: "Accessories",
    price: 2800,
    description: "Keep your drink cold or hot while on the move.",
    icon: "🧴",
    stock: 42,
  },
  {
    id: 7,
    name: "Mechanical Keyboard",
    category: "Electronics",
    price: 10900,
    description: "Tactile keys and a compact layout for your desk.",
    icon: "⌨️",
    stock: 14,
  },
  {
    id: 8,
    name: "Linen Notebook",
    category: "Stationery",
    price: 1800,
    description: "A cloth-bound notebook for plans, notes, and ideas.",
    icon: "📓",
    stock: 55,
  },
];
const initialUsers = [
  { id: 101, name: "Akshay", email: "akshay@example.com", role: "Admin" },
  { id: 102, name: "Vinay", email: "vinay@example.com", role: "Editor" },
  { id: 103, name: "Vijay Jha", email: "vijay@example.com", role: "Viewer" },
];
function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
export const getUsers = () => read("ql-users", initialUsers);
export async function fetchProducts(search = "") {
  await delay(700);
  if (read("ql-fail-products", false))
    throw Error(
      "Product service is unavailable. Turn off the failure switch and retry.",
    );
  const term = search.trim().toLowerCase();
  return products.filter(
    (p) =>
      !term ||
      [p.name, p.category, p.description].some((s) =>
        s.toLowerCase().includes(term),
      ),
  );
}
export async function fetchUsers() {
  await delay(600);
  if (read("ql-fail-users", false))
    throw Error("Could not load users. Turn off the failure switch and retry.");
  return getUsers();
}
export async function createUser(input) {
  await delay(850);
  if (read("ql-fail-create", false))
    throw Error(
      "Create request failed (demo). Turn off the failure switch and retry.",
    );
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase()))
    throw Error("A user with this email already exists.");
  const created = { ...input, id: Date.now() };
  write("ql-users", [created, ...users]);
  return created;
}
export async function deleteUser(id) {
  await delay(1000);
  if (read("ql-fail-delete", false))
    throw Error(
      "Delete request failed (demo). The cached user list will be restored.",
    );
  write(
    "ql-users",
    getUsers().filter((u) => u.id !== id),
  );
  return id;
}
export async function resetDemo() {
  await delay(250);
  write("ql-users", initialUsers);
  [
    "ql-fail-products",
    "ql-fail-users",
    "ql-fail-create",
    "ql-fail-delete",
  ].forEach((k) => localStorage.removeItem(k));
}
