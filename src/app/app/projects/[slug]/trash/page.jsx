export default async function TrashPage({ params }) {
  const { slug } = await params;

  return (
    <div>
      <h1>Trash for {slug}</h1>
    </div>
  );
}
