export default class CsvExport{

    constructor(table){
        this.table = table;
    }

    
    downloadCSV(csv,filename){
        var csvFile;
        var downloadLink;

        csvFile = new Blob([csv],{type:"text/csv"});

        downloadLink = document.createElement("a");
        downloadLink.download = filename;
        downloadLink.href = window.URL.createObjectURL(csvFile);        //create a new link
        downloadLink.style.display="none";
        document.body.appendChild(downloadLink);        // append link to document

        downloadLink.click();   // go to the link
    }

    exportTableToCSV(filename){
        var csv = [];
        var rows = document.querySelectorAll("table tr");

        for(var i=1;i<rows.length;i++){
            var row = [], cols =rows[i].querySelectorAll("td");
            for(var j =1; j<cols.length ;j++){
                row.push(cols[j].innerText);        // push cell to row
            }
            csv.push(row.join(","));        // join cells by ","
        }

        this.downloadCSV(csv.join("\n"),filename); // join rows by "\n"
    }
}
