import Link from 'next/link';
export function Brand({ small = false }: { small?: boolean }) {
  return (
    <Link className={`brand ${small ? 'brand-small' : ''}`} href="/" aria-label="OwnPilot home">
      <img src="/logo-mark.svg" alt="" width="34" height="38" />
      <span>
        Own<span className="brand-light">Pilot</span>
        <span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
