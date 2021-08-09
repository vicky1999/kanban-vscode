const loadKanbanBoard = (bootstrap,data,sortablejs) => {
    data = JSON.parse(data);
    // console.log(data);
    console.log("Html called!");
    console.log(data);
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
                    <button type="button" class="btn btn-outline-success btn-lg">+</button>
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
                Sortable.create(todo,{
                    group: {
                        name: "kanban",
                        pull: (to,from) => {
                            console.log("From "+from.el.id+" to "+to.el.id);
                        }
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
                            fromArr.push(fromChildren[i].innerText);
                        }
                        for(let i=1;i<toChildren.length;i++) {
                            toArr.push(toChildren[i].innerText);
                        }
                        vscode.postMessage({
                            command: 'changes',
                            text: {
                                id: fromId,
                                data: fromArr
                            }
                        })
                        console.log(toArr);
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
        res+=`<li class="list-group-item">${data[i].name}</li>`;
    }
    res+=`</ul></div>`;

    return res;
};

module.exports.loadKanbanBoard = loadKanbanBoard;