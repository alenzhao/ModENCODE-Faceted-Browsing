//Function iterates through a JSON object property and counts how many objects there are. objectName is the field/property that it iterates through
function getLength (information, objectName) {
	var count = 0;
	while (information[objectName][count]) {
			count++;
	}	
	return (count);
}

//This function takes in a size in bytes, formats it and adds in a suffix if needed
function formatSize (filesize) {
	//Default suffix is bytes (I know it says prefix)	
	var prefix = 'bytes';
	if (filesize > 1073741824) {
		filesize =  parseFloat(filesize/1073741824);
		filesize = (filesize.toFixed(2));				
		prefix = 'Gb';
	} else if (filesize > 1048576) {
		filesize =  parseFloat(filesize/1048576);
		filesize = (filesize.toFixed(2));				
		prefix = 'Mb';
	} else if (filesize > 1024) {
		filesize =  parseFloat(filesize/1024);
		filesize = (filesize.toFixed(2));
		prefix = 'kb';
	} 
	//Returning everything as a string	
	return ('' + filesize + ' ' + prefix);
}

//This function iterates through all the files in a particular accessionID and checks if it contains particular type of files e.g raw, signal, interpreted
function hasType (information, objectName, size, type) {
	for (var count = 0; count < size; count++) {
		if (information[objectName][count].type == type) {
			return (true);
		}
	}
	return (false);
}

//This function toggles the selection for a <tr>/file. It takes in the accessionID, the current class and a flag for determining which table the file is
//under e.g. signal, raw etc... (0 is the deselect all flag under a particular accessionID, i.e it delselects/selects ALL files under that ID)
function selectAll (id, classtoRemove, whichTable) {

    // NOTE: logic is hard to follow here, and the code is redundant; need to fix LS 2 Sep 2011

    //Iterating through the table and removing the class if it has it (which changes the css) for each row/file
    var tableID = id + '-rawTable';	
    if ((tableID) && ((whichTable == "1") || (whichTable == "0")))  {	
	$("#" + tableID + " tr").each(function () { 
		if ($(this).hasClass(classtoRemove))
		    selected(this);
	    });
    }

    //Selecting all the signal files
    var tableID = id + '-signalTable';
    if ((tableID) && ((whichTable == "2") || (whichTable == "0")))  {	
	$("#" + tableID + " tr").each(function () { 
		if ($(this).hasClass(classtoRemove))
		    selected(this);
	    });
    }
    if ((tableID) && ((whichTable == "3") || (whichTable == "0")))  {	
	//Selecting all the interpreted data files
	var tableID = id + '-interpretedTable';
	$("#" + tableID + " tr").each(function () { 
		if ($(this).hasClass(classtoRemove))
		    selected(this);
	    });
    }
}

//This function takes in a JSON object and an accessionID and creates a header and Select/Deselect all buttons for the ID
function makeHeader (information, objectName) {
	//Creating the title	
	var title = '<b>Accession #: <font color="#ff0000">' + objectName + '</font></b>   ';
	var id = information[objectName][0].id;
	//Creating the Select/Deselect links	
	title += '&nbsp;&nbsp;<a class="mainLinks" onclick="selectAll(' + id + ', \'notSelected\',0)">Select All</a>';	
	title += '&nbsp;&nbsp;&nbsp;<a class="mainLinks" onclick="selectAll(' + id + ', \'selected\',0)">Deselect All</a><p><p>';	

	//Before the links there were buttons, keeping this here incase design changes in the future	
	//title += '<button type="button" style="position:relative; cursor:pointer;" onclick="selectAll(' + id + ', \'notSelected\',0)"';
	//title += '>Select All</button>';			
	//title += '<button type="button" style="position:relative; cursor:pointer;" onclick="selectAll(' + id + ', \'selected\',0)"';
	//title += '>Deselect All</button><p><p>';		
	
	//Appending the html to the div which contains the title e.g. 23-title
	$("#" + id + "-title").append(title);
}

//This function takes in an "id" and hides/shows the entire div containing a particular table
//The table is enclosed inside a div because jQuery was not doing a smooth job at the animation
function toggleView (id) {
	//Toggling the view using jQuery	
	$('#' + id + 'Div').slideToggle ('slow');
	//Changing the plus/minus image depending on which one was displayed at the time
	if ($('#moreless-'  + id).attr('src') == "/images/minus.png") {
		$('#moreless-'  + id).attr('src','/images/plus.png');
	} else {
		$('#moreless-'  + id).attr('src','/images/minus.png')
	}
}

//This function creates the subheader under an accessionID for different file types e.g signal, raw and interpreted files
function makeTypeHeader (fileType, divid, type) {
	var whichTable;
	//Setting the whichTable flag, used in the toggleView function which shows/hides the table	
	if (type == "-raw") {
		whichTable = "1";
	} else if (type == "-signal") {
		whichTable = "2";
	} else {
		whichTable = "3";
	}
	//Adding the hide/minus button, which calls toggleView func when clicked	
	var typeHeader = '<img src="/images/minus.png" alt="Hide" class="smallButton" id="moreless-'+divid+type+'" onclick="toggleView(\'' + divid +  type + '\')"';
	typeHeader += '/>   ';
	typeHeader += '<b>' + fileType + '</b>';

	//If the Select/Deselect links need to be changed to buttons or checkboxes
	//typeHeader += '<input type="checkbox" class="checkbox" onclick="selectAll('+ divid + ', \'notSelected\',' + whichTable + ')">Select All</checkbox>';	
	//typeHeader += '<button type="button" style="position:relative; cursor:pointer;" onclick="selectAll(' + divid + ', \'notSelected\',' + whichTable + ')"';
	//typeHeader += '>Select All</button>';
	//typeHeader += '<button type="button" style="position:relative; cursor:pointer;" onclick="selectAll(' + divid + ', \'selected\',' + whichTable + ')"';
	//typeHeader += '>Deselect All</button><p>';

	//Adding the select/deselect all buttons for the particular table
	typeHeader += '&nbsp;&nbsp;<a class="links" onclick="selectAll(' + divid + ', \'notSelected\',' + whichTable + ')">Select All</a>';
	typeHeader += '&nbsp;&nbsp;&nbsp;<a class="links" onclick="selectAll(' + divid + ', \'selected\',' + whichTable + ')">Deselect All</a><p>';
	//Appending the HTML
	$("#" + divid + type).append(typeHeader);
}

//This function toggles selection/deselection for a <tr>/file and updates the filesize accordingly. The variable sent in is the id of the div
function selected(element){
	var totalSize;
	var row       = $(element);
	var checkbox  = $(row.find('input')[0]);

	//If the size != -1 i.e. the file exists then (Disabling selection/deselection for non-existant files)	
	if (!(parseFloat(row.attr('name')) == -1)) {
		//Deselecting if the <tr>/file was selected and updating the total size 
		if (row.hasClass('selected')){
		    checkbox.prop("checked", false);		
		    row.removeClass('selected');
		    row.addClass('notSelected');
		    totalSize = parseFloat($('#totalSize').attr('name')) - parseFloat(row.attr('name'));
		    if (row.hasClass('even')) {
			row.addClass ('eClr');
		    } else {
			row.addClass ('oClr');
		    }
		    //Selecting if the <tr>/file was deselected and updating the total size		
		} else {
		    row.removeClass('notSelected');
		    if (row.hasClass('even')) {
			row.removeClass ('eClr');
		    } else {
			row.removeClass ('oClr');
		    }
		    row.addClass('selected');
		    checkbox.prop("checked", true);				
		    totalSize = parseFloat($('#totalSize').attr('name')) + parseFloat(row.attr('name'));
		}
		//Updating the totalsize and changing the HTML to display the new size		
		var checkoutButton = 'Total Size: ' + formatSize(totalSize) + '  <button type="button" style="position:relative; cursor:pointer; bottom:2px;"'; 	
		checkoutButton += 'onclick="checkout()">';
		checkoutButton += 'Download</button>';
		$('#totalSize').attr('name', totalSize);
		$("#checkout").html (checkoutButton);
	}
}

//This function is called when the user clicks the download button
function checkout () {
	//Making a string of all the selected files. It looks something like this
	// ,file1Name&DirectoryPath^typeofFile(e.g.raw),file2Name... [This information is then parsed in perl]

// TO DO: instead of encoding filenames & paths in this awkward way, convert to JSON -- LS 2 Sept 2011
	selectedFiles = "";
	$(".selected").each(function () {
		//Using jQuery to find all the attributes		
		var fileName = $(this).find("td:eq(1)").html();
		var dirPath = $(this).attr('title');
		//Cannot use jQuery's .parent() function because the table is not the direct parent of the <tr>! So we use ancestor to locate the closest table
		//get the table type and see what type of file it is e.g. (raw, signal...). 
		var parentname = ($(this).closest('table')).attr('id');
		parentname = parentname.replace(/Table/g, "");
		selectedFiles += "," + fileName + "&" + dirPath + "^" + parentname;
	});
	//Encoding special characters so that they can be passed	
	var info = encodeURIComponent(selectedFiles);
	var totalSize = formatSize ($('#totalSize').attr('name'));	
	//If the total size is 0 then no files were selected	
	if (parseFloat(totalSize) == 0)	 {
		alert ("You have not selected any files for download. Please make a selection and try again.");

	} else {
		//Confirming that the user wants to download the data		
		var confirmation = confirm ("Are you sure you want to download " + totalSize + " of data?");  	
		//Sending an ajax request to the perl script with the file IDs and everything. Using ajax because under https guidelines the length of the URL (including)
		//all parameters that are being passed in cannot exceed ~2000 characters. With our unique filenames and parameters we can easily exceed that when only a few 	
		//files are requested. So we do an ajax POST request to a perl script which creates symbolic links and a directory structure under a unique ID in the temp 			//folder e.g. /tmp/session849 	
		if (confirmation){
			$.ajax({
					type: "POST",
					url: "/cgi-bin/download2.cgi",
					data: 'selected=' + info,
					//Upon sucessful completion of the perl script we do a window relocate event, ajax requests cannot throw a MIME type for 
					//download because if something else is printed before the MIME type definition, it is rendered invalid under https guidelines
					//and if we do an ajax request then we need to print the headers being passed in 
					//Doing a window relocate event and passing in the unique sessionID					
					success: function(data){
						window.location = '/cgi-bin/makeDownload2.cgi?id=' + data;
						//This was used to hide everything. Leaving it here incase design changes						
						//$("#fileMenu").fadeOut (2000);
						//$("#finished").fadeIn (3000);
					}
			});			

		}
	}
}

//Logic for alternating color in zebra-striped table
function changeClr (clr) {
	if (clr == 'even') {
		return ('odd');
	} else {
		return ('even');
	} 
}


//This function takes in the JSON object and and accessionID e.g. modEncode_23
//and creates a table for that accessionID
function makeObject (information, objectName) {
	var numberOfElements = getLength (information,objectName);
	var totalSize = 0;	
	//Making the header/title for the accessionID	
	makeHeader (information, objectName);
	//Checking if there are files with raw, signal or interpreted data if so then creating the variable which contains the html for the table for that data type
	if (hasType (information, objectName, numberOfElements, "raw")) {
		makeTypeHeader ('Raw Data Files', information[objectName][0].id, "-raw");
		 var rawTable ='<div id="'+information[objectName][0].id + '-rawDiv" ><table id="' +information[objectName][0].id + '-rawTable" border="1">';
	}
	if (hasType (information, objectName, numberOfElements, "signal")) {
		makeTypeHeader ('Signal Data Files', information[objectName][0].id, "-signal");
		var signalTable ='<div id="'+information[objectName][0].id + '-signalDiv" ><table id="' +information[objectName][0].id + '-signalTable" border="1">';
	}
	if (hasType (information, objectName, numberOfElements, "interpreted")) {
		makeTypeHeader ('Interpreted Data Files', information[objectName][0].id , "-interpreted");
		var interpretedTable='<div id="'+information[objectName][0].id + '-interpretedDiv" ><table id="' +information[objectName][0].id + '-interpretedTable"';
		interpretedTable += 'border="1">';
	}
	//Make the table like elements
	//The following variables are used to create the zebra-striped effect for the table, need three variables because there are three tables to keep track of!	
	// note that zebra striping does not seem to be working LS -- 2 september 2011
	var RawClr = 'even';
	var sigClr = 'even';
	var interClr = 'even';	
	var clr;
	//Iterating through all the files under a particular accessionID	
	for (var count = 0; count < numberOfElements; count ++) {
		var size = information[objectName][count].size;	
		//Have to decode the filename to account for special characters, the filename was encoded back in the perl script which sent in the JSON string		
		var fileName = decodeURIComponent (information[objectName][count].rname);
		//Seeing what type of element it is and setting the background color for that <tr> appropriately 
		if (information[objectName][count].type == "raw") {
			clr = RawClr;
		} else if (information[objectName][count].type == "signal") {
			clr = sigClr;
		} else {
			clr = interClr;
		}	
		//-1 size flag means that the file was not found 		
		if (size == -1) {
			formattedSize = "Not Found";
			var toAdd = '<tr class="notSelected badFiles" id="' + fileName + '" name="-1">';
			toAdd += '<td>' + fileName + '</td><td>' + formattedSize + '</td></tr>';			
		//Otherwise the file was found 		
		} else {
			//Updating the total size			
			totalSize = parseFloat (totalSize) + parseFloat (size);
			//Adding the appropirate suffix to the filesize
			var formattedSize = formatSize (size);
			//Creating the <tr>			
			//< classes -> selected/Deselected for toggling selection and class clr for zebra striping effect in tbale name = sizeOfTheFile in bytes 
			//title = filename onclick function "selected" toggles the selected/deselected property
			var toAdd = '<tr class="selected ' + clr + '" name="' + size +'" id="' + fileName + '"';
			toAdd += 'title="' + information[objectName][count].rpath + '"';
			toAdd += 'style="cursor:pointer;" onclick="selected(this)" >';
			toAdd += '<td class="checkbox"><input type="checkbox" id="' + fileName + 'checkBox" checked/></td>'
			toAdd += '<td>' + fileName + '</td><td>' + formattedSize + '</td></tr>';
		}
		//Looking at which table to add the <tr> to 		
		if (information[objectName][count].type == "raw") {
			rawTable += toAdd;
			RawClr = changeClr (RawClr);
		} else if (information[objectName][count].type == "signal") {
			signalTable += toAdd;
			sigClr = changeClr (sigClr);
		} else {
			interpretedTable += toAdd;
			interClr = changeClr (interClr);
		}		
	}
	//Closing all the tables and appending the HTML, if the table exists
	if (rawTable) {				
		rawTable += '</ table></div>';
		$("#" + information[objectName][0].id + "-raw").append(rawTable);
		$("#" + information[objectName][0].id + "-raw").append('<br></ br>');
	}
	if (signalTable) {
		signalTable += '</ table></div>';
		$("#" + information[objectName][0].id + "-signal").append(signalTable);
		$("#" + information[objectName][0].id + "-signal").append('<br></ br>');
	}
	if (interpretedTable) {
		interpretedTable += '</ table></div>';
		$("#" + information[objectName][0].id + "-interpreted").append(interpretedTable);
		$("#" + information[objectName][0].id + "-interpreted").append('<br></ br>');
	}
	return (totalSize);
}


//Perl code calls on this function
function startControl(informationObj){
	//Parsing the JSON string sent in into an object that
	//can be used by JavaScript 	
	var information = jQuery.parseJSON(informationObj);
	//Getting how many accessionIDs/Datasets there are	
	var size = getLength(information,"idList");
	var totalSize = 0;
	//Iterating through each accessionID and creating a table
	//for each one. 
	for (var count = 0; count < size; count ++) {
		//Making the accessionID e.g. modEncode_23		
		var objectName = "modEncode_";	
		objectName += information.idList[count].id;	
		//makeObject creates and populates the table and it returns the total size of the files
		//in that table		
		totalSize = parseFloat (totalSize) + parseFloat (makeObject (information, objectName));
	}
	//Checking the width of the page and determining where to put the "download" button alongside with the total size	
	var leftAttr = (((document.width)-700)/2)+710;
	leftAttr = Math.round (leftAttr);
	var checkoutButton = 'Total Size: ' + formatSize(totalSize) + '  <button type="button" style="position:relative; cursor:pointer; bottom:2px;"';
	checkoutButton += 'onclick="checkout()">Download</button>';
	//Updating the totalsize, the totalsize in bytes is contained within a div called totalSize	
	$('#totalSize').attr('name', totalSize);
	//Adding the download button and changin the css for the position 
	$('#checkout').html (checkoutButton);
	$('#checkout').css('left',leftAttr);
}
