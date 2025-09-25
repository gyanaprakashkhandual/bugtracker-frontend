const CalfFolder = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H7.5L6.5 3.5H1.75z"
        fill="#54aeff"
      />
      <path
        d="M1.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H7.5L6.5 3.5H1.75z"
        stroke="#4285f4"
        strokeWidth="0.5"
      />
    </svg>
  );
};
const GoogleArrowDown = () => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 7l5 5 5-5z" fill="currentColor" />
    </svg>

  )
}
const GoogleArrowUp = () => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 13l5-5 5 5z" fill="currentColor" />
    </svg>
  )
}

const GoogleArrowRight = () => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M7 5l5 5-5 5z" fill="currentColor" />
    </svg>
  )
}

const GoogleArrowLeft = () => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M13 5l-5 5 5 5z" fill="currentColor" />
    </svg>
  )
}

const CalfFolderOpen = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Folder back */}
      <path
        d="M1.75 3.5a.25.25 0 0 0-.25.25v1.75h13v-1.5a.25.25 0 0 0-.25-.25H7.5L6.5 3.5H1.75z"
        fill="#54aeff"
      />
      <path
        d="M1.75 3.5a.25.25 0 0 0-.25.25v1.75h13v-1.5a.25.25 0 0 0-.25-.25H7.5L6.5 3.5H1.75z"
        stroke="#4285f4"
        strokeWidth="0.5"
      />

      {/* Folder front (flap open) */}
      <path
        d="M1.5 6.25A.25.25 0 0 1 1.75 6h12.5a.25.25 0 0 1 .24.31l-1.5 6a.25.25 0 0 1-.24.19H3a.25.25 0 0 1-.24-.19l-1.5-6a.25.25 0 0 1 .24-.31z"
        fill="#54aeff"
      />
      <path
        d="M1.5 6.25A.25.25 0 0 1 1.75 6h12.5a.25.25 0 0 1 .24.31l-1.5 6a.25.25 0 0 1-.24.19H3a.25.25 0 0 1-.24-.19l-1.5-6a.25.25 0 0 1 .24-.31z"
        stroke="#4285f4"
        strokeWidth="0.5"
      />
    </svg>
  );
};

// Use ES6 export syntax instead of module.exports
export { CalfFolder, CalfFolderOpen, GoogleArrowDown, GoogleArrowLeft, GoogleArrowUp, GoogleArrowRight };