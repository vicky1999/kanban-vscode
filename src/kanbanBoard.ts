const loadKanbanBoard = (bootstrap,data,sortablejs) => {
    data = JSON.parse(data);

    return `
    <html>
        <head>
            <link rel="stylesheet" href="${bootstrap}" />
            <script src="${sortablejs}"></script>
            <style>
                .ghost {
                    opacity: 0.4;
                }
                .header-container {
                    margin-top: 10px;
                    display: flex;
                }
            </style>
        </head>
        <body>
            <div class="header-container">
                <div class="col-10">
                    <center class="fs-2">Kanban Board</center>
                </div>
                <div class="col-2">
                    <button type="button" class="btn btn-outline-success btn-lg" onclick="addTask();">+</button>
                </div>
            </div>
            <hr />
            <div class="container">
                <div class="row row-cols-4">
                    <div id="todo-container" class="panel col-3">
                        ${displayData(data.todo,"todo", "To Do")}
                    </div>
                    <div id="in-progress-container" class="panel col-3">
                        ${displayData(data.inprogress,"inprogress","In Progress")}
                    </div>
                    <div id="testing-container" class="panel col-3">
                        ${displayData(data.testing,"testing", "Testing")}
                    </div>
                    <div id="completed-container" class="panel col-3">
                        ${displayData(data.completed,"completed","Completed")}
                    </div>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();

                function addTask() {
                    vscode.postMessage({
                        command: 'addTask'
                    });
                }

                function deleteTask() {
                    console.log("Delete Task");
                }

                Sortable.create(todo,{
                    group: {
                        name: "kanban",
                        pull: (to,from) => {
                            console.log("From "+from.el.id+" to "+to.el.id);
                        }
                    },
                    onEnd: function(event) {
                        console.log(event.to);
                        console.log(event.from);
                        let from = event.from;
                        let to = event.to;
                        let fromId = from.id;
                        let toId = to.id;

                        let fromChildren = from.childNodes;
                        let toChildren = to.childNodes;

                        let fromArr = [];
                        let toArr = [];

                        for(let i=1;i<fromChildren.length;i++) {
                            fromArr.push({"name":fromChildren[i].innerText});
                        }
                        for(let i=1;i<toChildren.length;i++) {
                            toArr.push({"name":toChildren[i].innerText});
                        }
                        vscode.postMessage({
                            command: 'changes',
                            text: {
                                fromId: fromId,
                                toId: toId,
                                from: fromArr,
                                to: toArr
                            }
                        })
                    },
                    animation: 150,
                    ghostClass: 'ghost'
                })
                Sortable.create(inprogress,{
                    group: {
                        name: "kanban"        
                    },
                    onEnd: function(event) {
                        console.log(event.to);
                        console.log(event.from);
                        let from = event.from;
                        let to = event.to;
                        let fromId = from.id;
                        let toId = to.id;

                        let fromChildren = from.childNodes;
                        let toChildren = to.childNodes;

                        let fromArr = [];
                        let toArr = [];

                        for(let i=1;i<fromChildren.length;i++) {
                            fromArr.push({"name":fromChildren[i].innerText});
                        }
                        for(let i=1;i<toChildren.length;i++) {
                            toArr.push({"name":toChildren[i].innerText});
                        }
                        vscode.postMessage({
                            command: 'changes',
                            text: {
                                fromId: fromId,
                                toId: toId,
                                from: fromArr,
                                to: toArr
                            }
                        })
                    },
                    animation: 150,
                    ghostClass: 'ghost'
                })
                Sortable.create(testing,{
                    group: {
                        name: "kanban",
                        pull: function (to,from) {
                            console.log("From "+from.el.id+" to "+to.el.id);
                        }                        
                    },
                    onEnd: function(event) {
                        console.log(event.to);
                        console.log(event.from);
                        let from = event.from;
                        let to = event.to;
                        let fromId = from.id;
                        let toId = to.id;

                        let fromChildren = from.childNodes;
                        let toChildren = to.childNodes;

                        let fromArr = [];
                        let toArr = [];

                        for(let i=1;i<fromChildren.length;i++) {
                            fromArr.push({"name":fromChildren[i].innerText});
                        }
                        for(let i=1;i<toChildren.length;i++) {
                            toArr.push({"name":toChildren[i].innerText});
                        }
                        vscode.postMessage({
                            command: 'changes',
                            text: {
                                fromId: fromId,
                                toId: toId,
                                from: fromArr,
                                to: toArr
                            }
                        })
                    },
                    animation: 150,
                    ghostClass: 'ghost'
                })
                Sortable.create(completed,{
                    group: {
                        name: "kanban",
                        pull: function (from, to) {
                            console.log("From "+from.el.id+" to "+to.el.id);
                        }
                    },
                    onEnd: function(event) {
                        console.log(event.to);
                        console.log(event.from);
                        let from = event.from;
                        let to = event.to;
                        let fromId = from.id;
                        let toId = to.id;

                        let fromChildren = from.childNodes;
                        let toChildren = to.childNodes;

                        let fromArr = [];
                        let toArr = [];

                        for(let i=1;i<fromChildren.length;i++) {
                            fromArr.push({"name":fromChildren[i].innerText});
                        }
                        for(let i=1;i<toChildren.length;i++) {
                            toArr.push({"name":toChildren[i].innerText});
                        }
                        console.log(toArr);
                        // vscode.postMessage({
                        //     command: 'changes',
                        //     text: {
                        //         fromId: fromId,
                        //         toId: toId,
                        //         from: fromArr,
                        //         to: toArr
                        //     }
                        // })
                    },
                    animation: 150,
                    ghostClass: 'ghost'
                })
            </script>
        </body>
    </html>
    `;
};

const displayData = (data,key,name) => {
    let res=`
            <div class="card">
                <div class="card-header">
                    ${name}
                </div>
                <ul id="${key}" class="list-group list-group-flush">
            `;
    for(let i=0;i<data.length;i++) {
        res+=`
        <li class="list-group-item">
            ${data[i].name}
            <button type="button" class="btn btn-outline-danger" onclick="deleteTask();" style="float: right;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                </svg>
            </button>
        </li>`;
    }
    res+=`</ul></div>`;

    return res;
};

module.exports.loadKanbanBoard = loadKanbanBoard;