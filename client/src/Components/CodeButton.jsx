import React from 'react';

const CodeButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className="fixed bottom-4 right-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:shadow-outline"
    >
        Code
    </button>
);

export default CodeButton;
