const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const loadKanbanBoard = (bootstrap, data, sortablejs) => {
    data = JSON.parse(data);

    return `
    <html>
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="stylesheet" href="${bootstrap}" />
            <script src="${sortablejs}"></script>
            <style>
                .ghost { opacity: 0.4; }
                .header-container { margin-top: 10px; display: flex; }
                .task-title { overflow-wrap: anywhere; }
                .task-description-modal {
                    display: none;
                    position: fixed;
                    inset: 0;
                    z-index: 1000;
                    padding: 24px;
                    background: rgba(0, 0, 0, 0.55);
                    align-items: center;
                    justify-content: center;
                }
                .task-description-modal.is-open { display: flex; }
                .task-description-dialog {
                    width: min(520px, 100%);
                    max-height: 80vh;
                    overflow-y: auto;
                    padding: 20px;
                    border-radius: 6px;
                    background: var(--vscode-editor-background, #fff);
                    color: var(--vscode-editor-foreground, #222);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
                }
                .task-description-text { white-space: pre-wrap; overflow-wrap: anywhere; }
                .task-actions { display: flex; gap: 8px; align-items: center; }
            </style>
        </head>
        <body>
            <div class="header-container">
                <div class="col-10">
                    <center class="fs-2">Kanban Board</center>
                </div>
                <div class="col-2">
                    <button type="button" class="btn btn-outline-success btn-lg" id="add-task">+</button>
                </div>
            </div>
            <hr />
            <div class="container">
                <div class="row row-cols-4">
                    <div id="todo-container" class="panel col-3">
                        ${displayData(data.todo || [], "todo", "To Do")}
                    </div>
                    <div id="in-progress-container" class="panel col-3">
                        ${displayData(data.inprogress || [], "inprogress", "In Progress")}
                    </div>
                    <div id="testing-container" class="panel col-3">
                        ${displayData(data.testing || [], "testing", "Testing")}
                    </div>
                    <div id="completed-container" class="panel col-3">
                        ${displayData(data.completed || [], "completed", "Completed")}
                    </div>
                </div>
            </div>

            <div id="task-description-modal" class="task-description-modal" aria-hidden="true">
                <section class="task-description-dialog" role="dialog" aria-modal="true" aria-labelledby="task-description-title">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h2 id="task-description-title" class="h4 mb-0"></h2>
                        <button type="button" class="btn-close" id="close-description" aria-label="Close"></button>
                    </div>
                    <p id="task-description-text" class="task-description-text mb-4"></p>
                    <div class="text-end">
                        <button type="button" class="btn btn-secondary" id="dismiss-description">Close</button>
                    </div>
                </section>
            </div>

            <script>
                const vscode = acquireVsCodeApi();

                document.getElementById('add-task').addEventListener('click', () => {
                    vscode.postMessage({ command: 'addTask' });
                });

                function decodeTask(element) {
                    return JSON.parse(decodeURIComponent(element.dataset.task));
                }

                function openDescription(task) {
                    document.getElementById('task-description-title').textContent = task.name || 'Task';
                    document.getElementById('task-description-text').textContent = task.description || 'No description provided.';
                    const modal = document.getElementById('task-description-modal');
                    modal.classList.add('is-open');
                    modal.setAttribute('aria-hidden', 'false');
                    document.getElementById('close-description').focus();
                }

                function closeDescription() {
                    const modal = document.getElementById('task-description-modal');
                    modal.classList.remove('is-open');
                    modal.setAttribute('aria-hidden', 'true');
                }

                document.querySelectorAll('.task-title').forEach((element) => {
                    element.addEventListener('click', () => openDescription(decodeTask(element)));
                });

                document.querySelectorAll('.edit-task').forEach((button) => {
                    button.addEventListener('click', () => {
                        const task = decodeTask(button);
                        vscode.postMessage({
                            command: 'edit',
                            text: { name: task.name, description: task.description, status: button.dataset.status }
                        });
                    });
                });

                document.querySelectorAll('.delete-task').forEach((button) => {
                    button.addEventListener('click', () => {
                        vscode.postMessage({
                            command: 'delete',
                            text: { name: button.dataset.name, key: button.dataset.key }
                        });
                    });
                });

                document.getElementById('close-description').addEventListener('click', closeDescription);
                document.getElementById('dismiss-description').addEventListener('click', closeDescription);
                document.getElementById('task-description-modal').addEventListener('click', (event) => {
                    if (event.target.id === 'task-description-modal') closeDescription();
                });
                document.addEventListener('keydown', (event) => {
                    if (event.key === 'Escape') closeDescription();
                });

                ['todo', 'inprogress', 'testing', 'completed'].forEach((listId) => {
                    Sortable.create(document.getElementById(listId), {
                        group: { name: 'kanban' },
                        animation: 150,
                        ghostClass: 'ghost',
                        onEnd: (event) => {
                            const readTasks = (list) => Array.from(list.querySelectorAll('li[data-task]')).map(decodeTask);
                            vscode.postMessage({
                                command: 'changes',
                                text: {
                                    fromId: event.from.id,
                                    toId: event.to.id,
                                    from: readTasks(event.from),
                                    to: readTasks(event.to)
                                }
                            });
                        }
                    });
                });
            </script>
        </body>
    </html>
    `;
};

const displayData = (data, key, name) => {
    let res = `
        <div class="card">
            <div class="card-header">${escapeHtml(name)}</div>
            <ul id="${key}" class="list-group">
    `;
    for (let i = 0; i < data.length; i++) {
        const task = data[i] || {};
        const encodedTask = escapeHtml(encodeURIComponent(JSON.stringify(task)));
        res += `
            <li class="list-group-item d-flex justify-content-between align-items-center" data-task="${encodedTask}">
                <button type="button" class="btn btn-link task-title text-start p-0" data-task="${encodedTask}">${escapeHtml(task.name || '')}</button>
                <div class="task-actions">
                    <button type="button" class="btn btn-outline-secondary edit-task" data-task="${encodedTask}" data-status="${escapeHtml(name)}" aria-label="Edit ${escapeHtml(task.name || 'task')}" title="Edit task">Edit</button>
                    <button type="button" class="btn btn-outline-danger delete-task" data-name="${escapeHtml(task.name || '')}" data-key="${key}" aria-label="Delete ${escapeHtml(task.name || 'task')}" title="Delete task">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                            <path d="M2.5 1a1 1 0 0 1 1-1H6a1 1 0 0 1 1 1h2a1 1 0 0 1 1 1h1v1H3V2h1a1 1 0 0 1 1-1h2zM4 4h8l-.6 10.2A2 2 0 0 1 9.4 16H6.6a2 2 0 0 1-2-1.8L4 4z"/>
                        </svg>
                    </button>
                </div>
            </li>`;
    }
    res += `</ul></div>`;
    return res;
};

module.exports.loadKanbanBoard = loadKanbanBoard;
