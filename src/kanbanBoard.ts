const loadKanbanBoard = (bootstrap) => {
    return `
    <html>
        <head>
            <link rel="stylesheet" href="${bootstrap}" />
        </head>
        <body>
            <h3>Kanban Board</h3>
        </body>
    </html>
    `;
};

module.exports.loadKanbanBoard = loadKanbanBoard;