export function BrandMark() {
  return (
    <>
      <img
        src={`${import.meta.env.BASE_URL}logo.png`}
        alt="HefestQueue Logo"
        className="h-5 w-5"
      />
      <span className="font-heading text-sm font-bold tracking-widest uppercase text-foreground">
        HefestQueue
      </span>
    </>
  );
}
