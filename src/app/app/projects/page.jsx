import { cookies } from 'next/headers';

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = params;
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  try {
    const res = await fetch(`http://localhost:5000/api/v1/project/${id}`, {
      cache: "no-store",
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const project = await res.json();
      return {
        title: `${project.projectName} - Caffetest Dashboard`,
      };
    }
  } catch (error) {
    console.error("Failed to fetch metadata:", error);
  }

  return {
    title: 'Project - Caffetest Dashboard',
  };
}

async function getProjectById(id) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  const res = await fetch(`http://localhost:5000/api/v1/project/${id}`, {
    cache: "no-store",
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized: Please log in");
    }
    throw new Error("Failed to fetch project");
  }

  return res.json();
}

export default async function ProjectPage({ params }) {
  const { id } = params;

  try {
    const project = await getProjectById(id);

    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">{project.projectName}</h1>
        <p className="mt-4 text-gray-700">{project.projectDesc}</p>
        <p className="mt-2 text-sm text-gray-500">
          Created At: {new Date(project.createdAt).toLocaleString()}
        </p>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-red-600">Error</h1>
        <p className="mt-4 text-gray-700">{error.message}</p>
        {error.message.includes("Unauthorized") && (
          <p className="mt-2 text-sm text-blue-600">
            <a href="/login">Please log in to continue</a>
          </p>
        )}
      </div>
    );
  }
}