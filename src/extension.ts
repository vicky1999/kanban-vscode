// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const fs = require('fs');
const path = require('path');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Load KanbanBoard file
	const KanbanBoard = require(context.extensionPath+"\\src\\kanbanBoard.ts");
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "kanban-vscode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	vscode.window.showInformationMessage('Extension Started!');
	
	let disposable = vscode.commands.registerCommand('kanban-vscode.main', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		
		if(vscode.workspace.rootPath === undefined) {
			vscode.window.showErrorMessage("No Workspace selected!");
			return;
		}
		vscode.window.showInformationMessage("Kanban Board for "+vscode.workspace.name+" is opened!");

		let data = `{\n\t"completed": [],\n\t"inProgress": [],\n\t"testing": [],\n\t"toDo": []\n}`;
		let folderPath = vscode.workspace.rootPath+"\\.vscode";
		let jsonPath = folderPath+"\\kanban.json";

		// create kanban json file
		if(!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath);
		}

		fs.writeFile(jsonPath,data,(err: any) => {
			if(err) {
				vscode.window.showErrorMessage("Something went Wrong!");
			}
		});

		//Load Kanban page
		const panel = vscode.window.createWebviewPanel(
			'kanbanBoard',
			'Kanban Board',
			vscode.ViewColumn.One,
			{
				enableScripts: true
			}
		);
		let bootstrapPath = vscode.Uri.file(
			path.join(context.extensionPath,'src','css','bootstrap.min.css')
		);
		let bootstrap = panel.webview.asWebviewUri(bootstrapPath);
		// Load the html page
		panel.webview.html = KanbanBoard.loadKanbanBoard(bootstrap);
	

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
