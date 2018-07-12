

export default class Spreadsheet {

    constructor(parent) {
        this.parent = parent;
        this.tableJson = {"table":[]};              //This array serves as a data model for the table
        //this.tableArr = [];
    }

    
    readTabletoJson(){                              //To read the table in html to table data model
        var tbl = document.getElementById("myTable");
        for(var i =0; i< tbl.rows.length; i++){
            var key = "r"+(i);
            //this.tableJson.table[i] = [];
            for(var j=0;j<tbl.rows[i].cells.length;j++){
                var cellKey = key + "c"+(j);
                if(document.getElementById(cellKey).innerHTML === ""){
                    this.tableJson.table.push({id:cellKey,value:"empty"});      // Set id and value to the cell in table data model
                }else{
                    var valueInCell = document.getElementById(cellKey).innerHTML;
                    this.tableJson.table.push({id:cellKey,value:valueInCell});  // Set id and value to the cell in table data model
                    //this.tableJson.key.push({[key+cellKey]:document.getElementById(cellKey).innerHTML});
                }
            }
        }
        console.log(this.tableJson);
        //return this.tableJson;
    }

    checkingCell(input){                            // Fired on input in a table cell
        var cell = this.getCellFromTableArr(input.id);
        if(cell.formula == null){                   // if the cell has no formula
            this.processFormula(input.innerHTML);   // look if the user typing a formula
            if(cell.link != null){                  // if the cell is linked to other cells by formula
                for(var i=0; i<cell.link.length;i++){
                    this.processFormula(this.getCellFromTableArr(cell.link[i]).formula,cell.link[i]); // process formulae on all the linked cells
                }
            }
            this.updateCellValue(input.id,input.innerHTML);     //update the data model with what the user typed
        }else{
            this.processFormula(cell.formula);      // if the cell already has a formula, process it
        }        
    }

    updateCellValue(cellId, newValue){              //Function to update a cell in table data model by refering to the id
        for(var i=0; i<this.tableJson.table.length;i++){
            if(this.tableJson.table[i].id === cellId){
                this.tableJson.table[i].value = newValue;
            }
        }
    }

    processFormula(input,throughLink){             // Processing the formula
        let pattern = /=((SUM|MUL|DIV|SUB)\(([r\d{1,}c\d{1,}(,|:)]{2,})\))/gi;     //regex to catch formula pattern
        var outputArray = pattern.exec(input);
        if(outputArray!= null){
            if(outputArray[3].indexOf(",")>0 && outputArray[3].indexOf(":")>0)
            {
                console.log("invalid formula");
                return;
            }
            if(outputArray[2] === "SUM"){
                var operands = [];
                if(outputArray[3].indexOf(",")>0 ){
                    operands = outputArray[3].split(",");
                    var formula = input;
                    var sum = 0;
                    for(var i=0;i<operands.length; i++){
                        sum += parseFloat(document.getElementById(operands[i]).innerHTML); // if operation is sum, add all cells up
                    }
                    if(throughLink == undefined){           // if the processFormula is fired by the event
                        event.target.innerHTML = sum;       // update the event target with result
                        this.addFormulaToCell(event.target.id, formula);// add formula to event cell
                        for(var k=0; k<operands.length; k++){
                            this.addLinkToCell(operands[k],event.target.id); // add link to cells in the formula
                        }
                    }else{ // if the processformula is fired by checkingCell()
                        var c = this.getCellFromTableArr(throughLink); // get the linked cell
                        document.getElementById(c.id).innerHTML=sum; // update the linked cell with new value
                    }
                }else if(outputArray[3].indexOf(":")>0){
                    operands = outputArray[3].split(":");
                //operation(operands,":")
                    if(operands.length>2){
                        console.log("invalid formula");
                        return;
                        }
                    let start = operands[0], 
                        end = operands[1];
                    if(start.substring(start.indexOf("c")+1,start.length) == end.substring(end.indexOf("c")+1,end.length)){
                        var sum = 0;
                        for(var i=0; i<this.tableJson.table.length; i++){
                            var cID = this.tableJson.table[i].id;
                            if(parseInt(start.substring(start.indexOf("c")+1,start.length)) == parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) &&
                                parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) >= parseInt(start.substring(start.indexOf("r")+1,start.indexOf("c"))) &&
                                parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) <= parseInt(end.substring(end.indexOf("r")+1,end.indexOf("c")))){
                                sum+=parseFloat(document.getElementById(cID).innerHTML);
                            }
                        }
                        if(throughLink == undefined){           // if the processFormula is fired by the event
                            event.target.innerHTML = sum;       // update the event target with result
                            this.addFormulaToCell(event.target.id, input);// add formula to event cell
                            for(var i=0; i<this.tableJson.table.length; i++){
                                var cID = this.tableJson.table[i].id;
                                if(parseInt(start.substring(start.indexOf("c")+1,start.length)) == parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) &&
                                parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) >= parseInt(start.substring(start.indexOf("r")+1,start.indexOf("c"))) &&
                                parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) <= parseInt(end.substring(end.indexOf("r")+1,end.indexOf("c")))){
                                    this.addLinkToCell(cID,event.target.id);
                                    //sum+=parseFloat(cID.value);
                                }
                            }
                        }else{ // if the processformula is fired by checkingCell()
                            var c = this.getCellFromTableArr(throughLink); // get the linked cell
                            document.getElementById(c.id).innerHTML=sum; // update the linked cell with new value
                        }
                    }else if(start.substring(start.indexOf("r")+1,start.indexOf("c")) == end.substring(end.indexOf("r")+1,end.indexOf("c"))){
                        var sum = 0;
                        for(var i=0; i<this.tableJson.table.length; i++){
                            var cID = this.tableJson.table[i].id;
                            if(parseInt(start.substring(start.indexOf("r")+1,start.indexOf("c"))) == parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) &&
                                parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) >= parseInt(start.substring(start.indexOf("c")+1,start.length)) &&
                                parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) <= parseInt(end.substring(end.indexOf("c")+1,end.length))){
                                sum+=parseFloat(document.getElementById(cID).innerHTML);
                            }
                        }
                        if(throughLink == undefined){           // if the processFormula is fired by the event
                            event.target.innerHTML = sum;       // update the event target with result
                            this.addFormulaToCell(event.target.id, input);// add formula to event cell
                            for(var i=0; i<this.tableJson.table.length; i++){
                                var cID = this.tableJson.table[i].id;
                                if(parseInt(start.substring(start.indexOf("r")+1,start.indexOf("c"))) == parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) &&
                                parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) >= parseInt(start.substring(start.indexOf("c")+1,start.length)) &&
                                parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) <= parseInt(end.substring(end.indexOf("c")+1,end.length))){
                                    this.addLinkToCell(cID,event.target.id);
                                    //sum+=parseFloat(cID.value);
                                }
                            }
                        }else{ // if the processformula is fired by checkingCell()
                            var c = this.getCellFromTableArr(throughLink); // get the linked cell
                            document.getElementById(c.id).innerHTML=sum; // update the linked cell with new value
                        }
                    }    
                }
            }
            else if(outputArray[2] === "SUB"){
                var operands = [];
                if(outputArray[3].indexOf(",")>0 ){
                    operands = outputArray[3].split(",");
                    var formula = input;
                    var sum = 2 * parseFloat(document.getElementById(operands[0]).innerHTML);
                    for(var i=0;i<operands.length; i++){
                        sum -= parseFloat(document.getElementById(operands[i]).innerHTML);
                    }
                    if(throughLink == undefined){
                        event.target.innerHTML = sum;
                        this.addFormulaToCell(event.target.id, formula);
                        for(var k=0; k<operands.length; k++){
                            this.addLinkToCell(operands[k],event.target.id);
                        }
                    }else{
                        var c = this.getCellFromTableArr(throughLink);
                        document.getElementById(c.id).innerHTML=sum;
                    }
                }else if(outputArray[3].indexOf(":")>0){
                    operands = outputArray[3].split(":");
                //operation(operands,":")
                    if(operands.length>2){
                        console.log("invalid formula");
                        return;
                        }
                    let start = operands[0], 
                        end = operands[1];
                    if(start.substring(start.indexOf("c")+1,start.length) == end.substring(end.indexOf("c")+1,end.length)){
                        var prod = 2 * parseFloat(document.getElementById(operands[0]).innerHTML);
                        for(var i=0; i<this.tableJson.table.length; i++){
                            var cID = this.tableJson.table[i].id;
                            if(parseInt(start.substring(start.indexOf("c")+1,start.length)) == parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) &&
                                parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) >= parseInt(start.substring(start.indexOf("r")+1,start.indexOf("c"))) &&
                                parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) <= parseInt(end.substring(end.indexOf("r")+1,end.indexOf("c")))){
                                prod-=parseFloat(document.getElementById(cID).innerHTML);
                            }
                        }
                        if(throughLink == undefined){           // if the processFormula is fired by the event
                            event.target.innerHTML = prod;       // update the event target with result
                            this.addFormulaToCell(event.target.id, input);// add formula to event cell
                            for(var i=0; i<this.tableJson.table.length; i++){
                                var cID = this.tableJson.table[i].id;
                                if(parseInt(start.substring(start.indexOf("c")+1,start.length)) == parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) &&
                                parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) >= parseInt(start.substring(start.indexOf("r")+1,start.indexOf("c"))) &&
                                parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) <= parseInt(end.substring(end.indexOf("r")+1,end.indexOf("c")))){
                                    this.addLinkToCell(cID,event.target.id);
                                    //sum+=parseFloat(cID.value);
                                }
                            }
                        }else{ // if the processformula is fired by checkingCell()
                            var c = this.getCellFromTableArr(throughLink); // get the linked cell
                            document.getElementById(c.id).innerHTML=prod; // update the linked cell with new value
                        }
                    }else if(start.substring(start.indexOf("r")+1,start.indexOf("c")) == end.substring(end.indexOf("r")+1,end.indexOf("c"))){
                        var sum =  2 * parseFloat(document.getElementById(operands[0]).innerHTML);
                        for(var i=0; i<this.tableJson.table.length; i++){
                            var cID = this.tableJson.table[i].id;
                            if(parseInt(start.substring(start.indexOf("r")+1,start.indexOf("c"))) == parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) &&
                                parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) >= parseInt(start.substring(start.indexOf("c")+1,start.length)) &&
                                parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) <= parseInt(end.substring(end.indexOf("c")+1,end.length))){
                                sum-=parseFloat(document.getElementById(cID).innerHTML);
                            }
                        }
                        if(throughLink == undefined){           // if the processFormula is fired by the event
                            event.target.innerHTML = sum;       // update the event target with result
                            this.addFormulaToCell(event.target.id, input);// add formula to event cell
                            for(var i=0; i<this.tableJson.table.length; i++){
                                var cID = this.tableJson.table[i].id;
                                if(parseInt(start.substring(start.indexOf("r")+1,start.indexOf("c"))) == parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) &&
                                parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) >= parseInt(start.substring(start.indexOf("c")+1,start.length)) &&
                                parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) <= parseInt(end.substring(end.indexOf("c")+1,end.length))){
                                    this.addLinkToCell(cID,event.target.id);
                                    //sum+=parseFloat(cID.value);
                                }
                            }
                        }else{ // if the processformula is fired by checkingCell()
                            var c = this.getCellFromTableArr(throughLink); // get the linked cell
                            document.getElementById(c.id).innerHTML=sum; // update the linked cell with new value
                        }
                    }
                }
            }
            else if(outputArray[2] === "MUL"){
                var operands = [];
                if(outputArray[3].indexOf(",")>0 ){
                    operands = outputArray[3].split(",");
                    var formula = input;
                    var prod = 1;
                    for(var i=0;i<operands.length; i++){
                        prod *= parseFloat(document.getElementById(operands[i]).innerHTML);
                    }
                    if(throughLink == undefined){
                        event.target.innerHTML = prod;
                        this.addFormulaToCell(event.target.id, formula);
                        for(var k=0; k<operands.length; k++){
                            this.addLinkToCell(operands[k],event.target.id);
                        }
                    }else{
                        var c = this.getCellFromTableArr(throughLink);
                        document.getElementById(c.id).innerHTML=prod;
                    }
                }else if(outputArray[3].indexOf(":")>0){
                    operands = outputArray[3].split(":");
                //operation(operands,":")
                    if(operands.length>2){
                        console.log("invalid formula");
                        return;
                        }
                    let start = operands[0], 
                        end = operands[1];
                    if(start.substring(start.indexOf("c")+1,start.length) == end.substring(end.indexOf("c")+1,end.length)){
                        var prod = 1;
                        for(var i=0; i<this.tableJson.table.length; i++){
                            var cID = this.tableJson.table[i].id;
                            if(parseInt(start.substring(start.indexOf("c")+1,start.length)) == parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) &&
                                parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) >= parseInt(start.substring(start.indexOf("r")+1,start.indexOf("c"))) &&
                                parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) <= parseInt(end.substring(end.indexOf("r")+1,end.indexOf("c")))){
                                prod*=parseFloat(document.getElementById(cID).innerHTML);
                            }
                        }
                        if(throughLink == undefined){           // if the processFormula is fired by the event
                            event.target.innerHTML = prod;       // update the event target with result
                            this.addFormulaToCell(event.target.id, input);// add formula to event cell
                            for(var i=0; i<this.tableJson.table.length; i++){
                                var cID = this.tableJson.table[i].id;
                                if(parseInt(start.substring(start.indexOf("c")+1,start.length)) == parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) &&
                                parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) >= parseInt(start.substring(start.indexOf("r")+1,start.indexOf("c"))) &&
                                parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) <= parseInt(end.substring(end.indexOf("r")+1,end.indexOf("c")))){
                                    this.addLinkToCell(cID,event.target.id);
                                    //sum+=parseFloat(cID.value);
                                }
                            }
                        }else{ // if the processformula is fired by checkingCell()
                            var c = this.getCellFromTableArr(throughLink); // get the linked cell
                            document.getElementById(c.id).innerHTML=prod; // update the linked cell with new value
                        }
                    }else if(start.substring(start.indexOf("r")+1,start.indexOf("c")) == end.substring(end.indexOf("r")+1,end.indexOf("c"))){
                        var sum = 1;
                        for(var i=0; i<this.tableJson.table.length; i++){
                            var cID = this.tableJson.table[i].id;
                            if(parseInt(start.substring(start.indexOf("r")+1,start.indexOf("c"))) == parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) &&
                                parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) >= parseInt(start.substring(start.indexOf("c")+1,start.length)) &&
                                parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) <= parseInt(end.substring(end.indexOf("c")+1,end.length))){
                                sum*=parseFloat(document.getElementById(cID).innerHTML);
                            }
                        }
                        if(throughLink == undefined){           // if the processFormula is fired by the event
                            event.target.innerHTML = sum;       // update the event target with result
                            this.addFormulaToCell(event.target.id, input);// add formula to event cell
                            for(var i=0; i<this.tableJson.table.length; i++){
                                var cID = this.tableJson.table[i].id;
                                if(parseInt(start.substring(start.indexOf("r")+1,start.indexOf("c"))) == parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) &&
                                parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) >= parseInt(start.substring(start.indexOf("c")+1,start.length)) &&
                                parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) <= parseInt(end.substring(end.indexOf("c")+1,end.length))){
                                    this.addLinkToCell(cID,event.target.id);
                                    //sum+=parseFloat(cID.value);
                                }
                            }
                        }else{ // if the processformula is fired by checkingCell()
                            var c = this.getCellFromTableArr(throughLink); // get the linked cell
                            document.getElementById(c.id).innerHTML=sum; // update the linked cell with new value
                        }
                    }
                }
            }
            else if(outputArray[2] === "DIV"){
                var operands = [];
                if(outputArray[3].indexOf(",")>0 ){
                    operands = outputArray[3].split(",");
                    var formula = input;
                    var prod = (parseFloat(document.getElementById(operands[0]).innerHTML)) * (parseFloat(document.getElementById(operands[0]).innerHTML));
                    for(var i=0;i<operands.length; i++){
                        try{
                            prod /= parseFloat(document.getElementById(operands[i]).innerHTML);
                        }
                        catch(e){
                            alert("Cannot divide by zero");
                        }
                    }
                    if(throughLink == undefined){
                        event.target.innerHTML = prod;
                        this.addFormulaToCell(event.target.id, formula);
                        for(var k=0; k<operands.length; k++){
                            this.addLinkToCell(operands[k],event.target.id);
                        }
                    }else{
                        var c = this.getCellFromTableArr(throughLink);
                        document.getElementById(c.id).innerHTML=prod;
                    }
                }else if(outputArray[3].indexOf(":")>0){
                    operands = outputArray[3].split(":");
                //operation(operands,":")
                    if(operands.length>2){
                        console.log("invalid formula");
                        return;
                        }
                    let start = operands[0], 
                        end = operands[1];
                    if(start.substring(start.indexOf("c")+1,start.length) == end.substring(end.indexOf("c")+1,end.length)){
                        var prod = (parseFloat(document.getElementById(operands[0]).innerHTML)) * (parseFloat(document.getElementById(operands[0]).innerHTML));
                        for(var i=0; i<this.tableJson.table.length; i++){
                            var cID = this.tableJson.table[i].id;
                            if(parseInt(start.substring(start.indexOf("c")+1,start.length)) == parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) &&
                                parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) >= parseInt(start.substring(start.indexOf("r")+1,start.indexOf("c"))) &&
                                parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) <= parseInt(end.substring(end.indexOf("r")+1,end.indexOf("c")))){
                                prod/=parseFloat(document.getElementById(cID).innerHTML);
                            }
                        }
                        if(throughLink == undefined){           // if the processFormula is fired by the event
                            event.target.innerHTML = prod;       // update the event target with result
                            this.addFormulaToCell(event.target.id, input);// add formula to event cell
                            for(var i=0; i<this.tableJson.table.length; i++){
                                var cID = this.tableJson.table[i].id;
                                if(parseInt(start.substring(start.indexOf("c")+1,start.length)) == parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) &&
                                parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) >= parseInt(start.substring(start.indexOf("r")+1,start.indexOf("c"))) &&
                                parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) <= parseInt(end.substring(end.indexOf("r")+1,end.indexOf("c")))){
                                    this.addLinkToCell(cID,event.target.id);
                                    //sum+=parseFloat(cID.value);
                                }
                            }
                        }else{ // if the processformula is fired by checkingCell()
                            var c = this.getCellFromTableArr(throughLink); // get the linked cell
                            document.getElementById(c.id).innerHTML=prod; // update the linked cell with new value
                        }
                    }else if(start.substring(start.indexOf("r")+1,start.indexOf("c")) == end.substring(end.indexOf("r")+1,end.indexOf("c"))){
                        var sum = (parseFloat(document.getElementById(operands[0]).innerHTML)) * (parseFloat(document.getElementById(operands[0]).innerHTML));
                        for(var i=0; i<this.tableJson.table.length; i++){
                            var cID = this.tableJson.table[i].id;
                            if(parseInt(start.substring(start.indexOf("r")+1,start.indexOf("c"))) == parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) &&
                                parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) >= parseInt(start.substring(start.indexOf("c")+1,start.length)) &&
                                parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) <= parseInt(end.substring(end.indexOf("c")+1,end.length))){
                                sum/=parseFloat(document.getElementById(cID).innerHTML);
                            }
                        }
                        if(throughLink == undefined){           // if the processFormula is fired by the event
                            event.target.innerHTML = sum;       // update the event target with result
                            this.addFormulaToCell(event.target.id, input);// add formula to event cell
                            for(var i=0; i<this.tableJson.table.length; i++){
                                var cID = this.tableJson.table[i].id;
                                if(parseInt(start.substring(start.indexOf("r")+1,start.indexOf("c"))) == parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) &&
                                parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) >= parseInt(start.substring(start.indexOf("c")+1,start.length)) &&
                                parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) <= parseInt(end.substring(end.indexOf("c")+1,end.length))){
                                    this.addLinkToCell(cID,event.target.id);
                                    //sum+=parseFloat(cID.value);
                                }
                            }
                        }else{ // if the processformula is fired by checkingCell()
                            var c = this.getCellFromTableArr(throughLink); // get the linked cell
                            document.getElementById(c.id).innerHTML=sum; // update the linked cell with new value
                        }
                    }
                }
            }
        }
       
    }

    clickRemove(){
        var removeId = prompt("Enter cell id");
        this.removeFormulaFromCell(removeId);
        var cell = this.getCellFromTableArr(removeId);
        if( cell != null){
            let pattern = /=((SUM|MUL|DIV|SUB)\(([r\d{1,}c\d{1,}(,|:)]{2,})\))/gi; 
            var out = pattern.exec(cell.formula);
            if(out[3].indexOf(",")>0){
                var links = out[3].split(",");
                for(var i=0; i< links.length; i++){
                    this.removeLink(links[i],cell.id);
                }
            }else if(out[3].indexOf(":")>0){
                var operands = out[3].split(":");
                let start = operands[0], 
                end = operands[1];
                if(start.substring(start.indexOf("c")+1,start.length) == end.substring(end.indexOf("c")+1,end.length)){
                    for(var i=0; i<this.tableJson.table.length; i++){
                        var cID = this.tableJson.table[i].id;
                        if(parseInt(start.substring(start.indexOf("c")+1,start.length)) == parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) &&
                        parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) >= parseInt(start.substring(start.indexOf("r")+1,start.indexOf("c"))) &&
                        parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) <= parseInt(end.substring(end.indexOf("r")+1,end.indexOf("c")))){
                            this.removeLink(cID,cell.id);
                            //sum+=parseFloat(cID.value);
                        }
                    }
                }else if(start.substring(start.indexOf("r")+1,start.indexOf("c")) == end.substring(end.indexOf("r")+1,end.indexOf("c"))){
                    for(var i=0; i<this.tableJson.table.length; i++){
                        var cID = this.tableJson.table[i].id;
                        if(parseInt(start.substring(start.indexOf("r")+1,start.indexOf("c"))) == parseInt(cID.substring(cID.indexOf("r")+1,cID.indexOf("c"))) &&
                        parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) >= parseInt(start.substring(start.indexOf("c")+1,start.length)) &&
                        parseInt(cID.substring(cID.indexOf("c")+1,cID.length)) <= parseInt(end.substring(end.indexOf("c")+1,end.length))){
                            this.removeLink(cID,cell.id);
                            //sum+=parseFloat(cID.value);
                        }
                    }
                }
            }    
        }
    }
    removeFormulaFromCell(cellId){
        for(var i=0; i<this.tableJson.table.length;i++){
            if(this.tableJson.table[i].id === cellId){
                if(this.tableJson.table[i].formula == undefined){
                    alert("No formula on this cell");
                    return;
                }
                delete this.tableJson.table[i].formula;
                var match = true;
            }
        }
        if(match){alert("Formula removed")}
        else{alert("No such cell found")}
    }
    removeLink(cellID,link){
        for(var i=0; i<this.tableJson.table.length;i++){
            if(this.tableJson.table[i].id === cellId){
               for(var j=0; j<this.tableJson.table[i].link.length; j++){
                   if(this.tableJson.table[i].link[j]){
                    this.tableJson.table[i].link.splice(j);
                   }
               }
            }
        }
    }
    addEventListenerToExistingCell(){               // add the event listener to the cells written in html
        var tbl = document.getElementById("myTable");
        for(var i =0; i< tbl.rows.length; i++){
            for(var j=0;j<tbl.rows[i].cells.length;j++){
                var cellKey = "r"+(i) + "c"+(j);
                this.addEventListenetToCell(cellKey);
            }
        }
    }

    addEventListenetToCell(id){                     // get a cell by ID and add event listener to it
        document.getElementById(id).addEventListener("input",()=>{this.checkingCell(event.target)});
    }

    appendRow() {                                   // to append a row
        var tbl = document.getElementById("myTable"),
            row = tbl.insertRow(tbl.rows.length),   // inserting a new row to table html
            i;
        for (i = 0; i < tbl.rows[0].cells.length; i++) {
            let cell = row.insertCell(i);           // inserting cells to the new row
            cell.id = "r"+(tbl.rows.length-1)+"c"+(i); // create a cell id
            if(i==0){
                cell.innerHTML = "r"+(tbl.rows.length-1);   // add the content
                document.getElementById(cell.id).setAttribute("class","first-row"); // add necessary classes for first column
                this.tableJson.table.push({id:cell.id,value:"r"+(tbl.rows.length-1)}); // add the new cell to table data model
            }else{
                cell.setAttribute('contenteditable',true);
                this.addEventListenetToCell(cell.id);   // add event listener to new cell
                document.getElementById(cell.id).setAttribute("class","general-cell"); // add necessary classes
                this.tableJson.table.push({id:cell.id,value:"empty"}); // add new cell to data model
            }
        }
        console.log(this.tableJson);
        //this.readTabletoJson();
    }

    appendColumn() {
        var tbl = document.getElementById("myTable"),
            i;

        for (i = 0; i < tbl.rows.length; i++) {
            let cell = tbl.rows[i].insertCell(tbl.rows[i].cells.length);    // adding a column to all rows
            cell.id = "r"+(i)+"c"+(tbl.rows[i].cells.length-1);
            if(i==0){
                cell.innerHTML = "c"+(tbl.rows[i].cells.length-1);      // set content for first row
                document.getElementById(cell.id).setAttribute("class","first-column");  //set necessary classes
                this.tableJson.table.push({id:cell.id,value:"c"+(tbl.rows[i].cells.length-1)}); //push new cells to table data model
            }else{
                cell.setAttribute('contenteditable',true);
                this.addEventListenetToCell(cell.id);           // add event listeners to new cells
                this.tableJson.table.push({id:cell.id,value:"empty"});
                document.getElementById(cell.id).setAttribute("class","general-cell");  // set necessary classes
            }
            
        }
        console.log(this.tableJson);
       // this.readTabletoJson();
    }


    deleteRow() {
        var tbl = document.getElementById("myTable"),
            lastRow = tbl.rows.length - 1;
        tbl.deleteRow(lastRow);         //delete last row in the table
        for(var i=0; i<this.tableJson.table.length; i++){
            var cId = this.tableJson.table[i].id;
            var rowNum = cId.substring(cId.indexOf("r")+1,cId.indexOf("c"));
            if(parseInt(rowNum) == (tbl.rows.length)){
                this.deleteFromTableArr(cId);   // remove cells from data model
            }
        }
        console.log(this.tableJson);
    }

    addLinkToCell(cellId, linkd){               // to add link attribute to a cell if formula of r1c1 is =SUM(r2c2,r4c4), then r2c2,r4c4 will have [r1c1] in their link attribute
        for(var i=0; i<this.tableJson.table.length;i++){
            if(this.tableJson.table[i].id === cellId){
                if(this.tableJson.table[i].link != null){       // if link isnt null
                    this.tableJson.table[i].link.push(linkd);   // push linked cell id
                }else{
                    this.tableJson.table[i].link = [];          // if no link exists, create a new array
                    this.tableJson.table[i].link.push(linkd);   // push linked cell id
                }
            }
        }
    }

    getCellFromTableArr(cellId){                // return cell from table data model by using id to search 
        for(var i=0; i<this.tableJson.table.length;i++){
            if(this.tableJson.table[i].id === cellId){
                return this.tableJson.table[i];
            }
        }
        return null;
    }
    deleteFromTableArr(cellId){                 // delete a cell from table data model
        for(var i=0; i<this.tableJson.table.length;i++){
            if(this.tableJson.table[i].id === cellId){
                this.tableJson.table.splice(i);
            }
        }
    }

    addFormulaToCell(cellId, formula){          // add formula to a cell
        for(var i=0; i<this.tableJson.table.length;i++){
            if(this.tableJson.table[i].id === cellId){
                this.tableJson.table[i].formula = formula;
            }
        }
    }


    deleteColumn() {
        var tbl = document.getElementById("myTable"),
            lastCol = tbl.rows[0].cells.length - 1,
            i, j;

        for (i = 0; i < tbl.rows.length; i++) {
            tbl.rows[i].deleteCell(lastCol);    // delete last col of all rows
        }
        for(var i=0; i<this.tableJson.table.length; i++){ // update the table data model
            var cId = this.tableJson.table[i].id;
            var colNum = cId.substring(cId.indexOf("c")+1,cId.length);
            if(parseInt(colNum) == (tbl.rows[0].cells.length)){
                this.deleteFromTableArr(cId);
            }
        }
        console.log(this.tableJson);
    }

}
