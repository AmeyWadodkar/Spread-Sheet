Spreadsheet

#How to run the application?
Step 1 - cd to project folder, open terminal - npm install
Step 2 - npm run build
Step 3 - npm run start

This should open up your browser, if it does not, go to localhost:3000 on your browser.

Directions to use the Spreadsheet application :

1. By default, the spreadsheet has 2 rows and 3 columns. You may add or delete rows using the buttons located at the top-right control panel. 
2. Similarly, columns can also be manipulated. Note that, rows and columns are added and deleted only at the ends of the spreadsheet.
3. Operations can be performed on two or more cells.

Formula can be added at the desired cell -
Format - In a cell, type the desired formula 
  "=Operation(r1c1,r2c2,.....,rncm)" where operation can be one of - SUM, SUB, MUL, DIV
  For example, to add values in three cells, type "=SUM(r1c1,r1c2,r4c3)" without the "",
  Once the last character is typed, the cell will immediately get updated with the calculated result.
  
You can also chain multiple cells and operations. 
For example, say r5c5 contains the sum of two cells. Now any other cell can have a formula that involves r5c5.
 
Also, an operation can be performed through a series of cells, provided that the start and end cells fall either in the same row or same column. i.e.,
 "=SUM(r1c1:r1c6)" and "=SUM(r4c1:r4c8)" are valid but "=SUM(r1c1, r3c3)" isn't.
All four operations can be performed for "through" ":" operator as well.

The table can be exported into a csv file using the "Export to Csv" link in the nav bar.

After the computation has been done, you may notice that the cell is uneditable. You can reuse the cell by clicking on the "Remove function" link provided in the nav bar at the top. Once you click on the remove function link, a prompt pops up asking for cell ID which should be given in the format "rmcn". After you enter the cell ID, the cell will be editable for new input. 

