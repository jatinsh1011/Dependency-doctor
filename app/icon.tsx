export default function icon() {
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="14" fill="#09090b"/>
      <path d="M32 14a18 18 0 0 0-18 18c0 8.8 8 16 18 20 10-4 18-11.2 18-20a18 18 0 0 0-18-18Z" fill="none" stroke="#f4f4f5" stroke-width="3"/>
      <path d="M32 24v14M25 31h14" stroke="#f4f4f5" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { headers: { "Content-Type": "image/svg+xml" } }
  );
}
