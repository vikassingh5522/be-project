import React from 'react';

const KeyLogs = ({ keyLogs }) => (
    <div className="keylog-container mt-4 w-full">
        <h3 className="text-lg font-medium mb-2">Key Logs</h3>
        <textarea
            className="w-full h-48 p-2 border border-gray-300 rounded"
            value={keyLogs}
            readOnly
        />
    </div>
);

export default KeyLogs;
