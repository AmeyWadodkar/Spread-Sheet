import Spreadsheet from 'Root/js/spreadsheet.js';
import CsvExport from 'Root/js/csvExport.js';
import 'SCSS/main.scss';
let myTable = document.getElementById("myTable");

let spreadsheet = new Spreadsheet(myTable);// create a new object of spreadsheet

let addRow = document.getElementById("addRow");
addRow.addEventListener('click', ()=>spreadsheet.appendRow());    // event listener to add row button

let deleteRow = document.getElementById("deleteRow");
deleteRow.addEventListener('click',()=>spreadsheet.deleteRow());   //event listener to delete row button

let addColumn= document.getElementById("addColumn");
addColumn.addEventListener('click',()=>spreadsheet.appendColumn()); // event listener to add column button

let deleteColumn = document.getElementById("deleteColumn");
deleteColumn.addEventListener('click',()=>spreadsheet.deleteColumn()); // event listener to delete column button

var tableJson = spreadsheet.readTabletoJson(); // read exiting table to table data model (refer spreadsheet.js) 
console.log(tableJson);
spreadsheet.addEventListenerToExistingCell(); 

let csvExport = new CsvExport(myTable);   // exporting to csv
let exportToCsv = document.getElementById("exportToCsv");
exportToCsv.addEventListener('click',()=>csvExport.exportTableToCSV('data.csv'));
let remove = document.getElementById("remove");
remove.addEventListener('click',()=>spreadsheet.clickRemove());

