// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const fs = require('fs');
const path = require('path');

import { window } from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Load KanbanBoard file
	const KanbanBoard = require(context.extensionPath+"\\src\\kanbanBoard.ts");
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "kanban-vscode" is now active!');

	vscode.window.showInformationMessage('Extension Started!');

	let disposable = vscode.commands.registerCommand('kanban-vscode.main', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		
		if(vscode.workspace.rootPath === undefined) {
			vscode.window.showErrorMessage("No Workspace selected!");
			return;
		}
		vscode.window.showInformationMessage("Kanban Board for "+vscode.workspace.name+" is opened!");

		// let data = `{\n\t"completed": [],\n\t"inProgress": [],\n\t"testing": [],\n\t"toDo": []\n}`;
		let data = {
			"completed": [],
			"inprogress": [],	
			"testing": [],
			"todo": []
		};
		let folderPath = vscode.workspace.rootPath+"\\.vscode";
		let jsonPath = folderPath+"\\kanban.json";

		// create kanban json file
		if(!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath);
		}
		if(!fs.existsSync(jsonPath)) {
			fs.writeFile(jsonPath,JSON.stringify(data),(err: any) => {
				if(err) {
					vscode.window.showErrorMessage("Something went Wrong!");
				}
			});
		}

		//Load Kanban page
		const panel = vscode.window.createWebviewPanel(
			'kanbanBoard',
			'Kanban Board',
			vscode.ViewColumn.One,
			{
				enableScripts: true
			}
		);
		// add bootstrap to html file
		let bootstrapPath = vscode.Uri.file(
			path.join(context.extensionPath,'src','css','bootstrap.min.css')
		);
		let bootstrap = panel.webview.asWebviewUri(bootstrapPath);

		//add sortablejs file
		let sortablePath = vscode.Uri.file(
			path.join(context.extensionPath,'src','js','Sortable.js')
		);
		let sortablejs = panel.webview.asWebviewUri(sortablePath);

		let kanban = '';
		fs.readFile(jsonPath,"utf8",(err,data) => {
			if(err) {
				vscode.window.showErrorMessage("Error in loading kanban board.");
				return;
			}
			// Load the html page
			panel.webview.html = KanbanBoard.loadKanbanBoard(bootstrap,data,sortablejs);
		});			
		panel.webview.onDidReceiveMessage(
			message => {
				switch(message.command) {
					case 'changes':
						fs.readFile(jsonPath,"utf8",(err,data) => {
							if(err) {
								vscode.window.showErrorMessage("Error in Loading Kanban Board.");
								return;
							}
							
							data=JSON.parse(data);
							data[message.text.fromId] = message.text.from;
							data[message.text.toId] = message.text.to;
							fs.writeFile(jsonPath,JSON.stringify(data),(err: any) => {
								if(err) {
									vscode.window.showErrorMessage("Something went Wrong!");
								}
								panel.webview.html = KanbanBoard.loadKanbanBoard(bootstrap,JSON.stringify(data),sortablejs);
							});
						});
						return;
					case 'addTask':
						let items = ["todo","inprogress","testing","completed"];

						window.showInputBox({
							placeHolder: "Task Name",
							title: "Create Task"
						}).then((input) => {
							window.showQuickPick(items,{
								canPickMany: false,
								placeHolder: "Please select",
								title: "Task Status"
							}).then((value) => {
								// window.showInformationMessage(`Task Name: ${input}.  Task status: ${value}`);

								fs.readFile(jsonPath,"utf8",(err,data) => {
								if(err) {
									vscode.window.showErrorMessage("Error in Loading Kanban Board.");
									return;
								}
								
								data = JSON.parse(data);
								data[value].push({"name":input});
								
								fs.writeFile(jsonPath,JSON.stringify(data),(err: any) => {
									if(err) {
										vscode.window.showErrorMessage("Something went Wrong!");
									}
									panel.webview.html = KanbanBoard.loadKanbanBoard(bootstrap,JSON.stringify(data),sortablejs);
								});
							});
						});
						return;
				}
			}
		);

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
