/** Stand-in for admin screens built in later stories (AD-02 … AD-05). */
export default function PlaceholderPage({ title, story, description }) {
  return (
    <>
      <title>{`${title} | Rifa International Admin`}</title>
      <h1 className="text-2xl">{title}</h1>
      <div className="mt-5 rounded-card border border-dashed border-line-strong bg-white p-8 text-center">
        <p className="text-base font-semibold text-ink">Coming soon</p>
        <p className="mx-auto mt-1 max-w-md text-body">
          {description ?? `This screen is built in ${story}.`}
        </p>
        <p className="mt-3 text-xs font-semibold tracking-wide text-muted uppercase">{story}</p>
      </div>
    </>
  )
}
