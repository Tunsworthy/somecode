//Main page Drop down
function productdropdown() {
	////console.log("in Productdropdown",ProductAPIURL)
	let dropdown = document.getElementById('product-dropdown');
	dropdown.length = 0;

	let defaultOption = document.createElement('option');
	defaultOption.text = 'Select Product';
	dropdown.add(defaultOption);
	dropdown.selectedIndex = 0;
	////console.log(productlist)
	//const url = ProductAPIURL +'/product/list';
	const url = '/product/list'
	fetch(url)
		.then(
			function(response) {
				if (response.status !== 200) {
					console.warn('Looks like there was a problem. Status Code: ' +
						response.status);
					return;
				}

				// Examine the text in the response  
				response.json().then(function(data) {
					let option;
					//console.log(data)
					//if(data.type.toString() !== "addon"){
					for (let i = 0; i < data.length; i++) {
						if (typeof data[i].type != "undefined") {
							if (data[i].type.toString() === "main") {
								////console.log(data[i]._id);
								option = document.createElement('option');
								option.text = data[i].name;
								option.value = data[i].name;
								option.dataset.lookup = data[i]._id
								dropdown.add(option);
							}
						}
					}
					//}    
				});
			}
		)
		.catch(function(err) {
			console.error('Fetch Error -', err);
		});
};
//function that is called to add a product to the page
function addproduct(productid) {
	console.log(productid)
	if(typeof productid === "undefined"){
		var sproduct = document.getElementById("product-dropdown");
			var productid = sproduct.options[sproduct.selectedIndex].dataset.lookup
	}
	
	//console.log(rprocut)
	if (productid.toString() != "Select Product") {
		const url = '/product/id/?id=' + productid;
		fetch(url)
			.then(
				function(response) {
					response.json().then(function(data) {
						var info = document.getElementById("info");
						var id = generate_random_string(5)
						//var id = Math.random().toString(36).substring(7);
						//console.log(data)
						if (+data.layout === 1) {
							layout1(data, id)
								.then((layout) => {
									console.log(data)
										info.appendChild(layout);
									if (typeof data.details.alert !== "undefined") {
										alertbox(data.details.alert.message, data.details.alert.type)
									}
									if (typeof data.addons.list !== "undefined") {
										for (let i = 0; i < data.addons.list.length; i++) {
											if (typeof data.addons.list[i].autoadd !== "undefined") {
												if (data.addons.list[i].autoadd == true) {
													//console.log('found an auto add addon',data.addons.list[i].name)
													createaddon(data.addons.list[i].name, id)
												}
											}
										};
									}
								})
						}

					})

				})
	}
};

function removerow() {
	//console.log("Remove Row",event.target.dataset.parentid)
	var removerow = document.getElementById(event.target.dataset.parentid)
	removerow.parentNode.removeChild(removerow);
	grandtotals();

};

//Layout1
function layout1(data, id, pid, resolve) {
	//console.log("in layout", data.details)
	//console.log(pid)
	////console.log(data)
	var elements = []
	//card creation
	//console.log(data.layout)

	if (data.existing == null) {
		var mainrow = true
		var rowdiv = document.createElement('div')
		rowdiv.setAttribute('class', 'mt-2 col col-12')
		rowdiv.setAttribute('id', id + '-' + data.name + '-topdiv')
		//rowdiv.setAttribute('class','row')

		var card = document.createElement('div')
		card.setAttribute('class', 'card mb-3')

		if (+data.layout !== 2) {
			var cardheader = document.createElement('h5')
			cardheader.setAttribute('class', "card-header")
			cardheadertext = document.createTextNode(data.name)
			cardheader.appendChild(cardheadertext);

			//close header button
			var button = document.createElement("button")
			button.setAttribute('class', 'close')
			var spanbutton = document.createElement("span")
			spanbutton.setAttribute('aria-hidden', 'true')
			var spanbuttontext = document.createTextNode("\u00d7")
			spanbutton.appendChild(spanbuttontext)
			button.appendChild(spanbutton)
			spanbutton.setAttribute('data-parentid', id + '-' + data.name + '-topdiv');
			button.addEventListener("click", function() { removerow() }, true);


			cardheader.appendChild(button)
			card.appendChild(cardheader)
		}
		//card body
		var cardbody = document.createElement('div')
		cardbody.setAttribute('class', "card-body")
		cardbody.setAttribute('id', id + '-' + data.name + '-cardbody')
		
		// Add allocation
	///This Section deals with the 'Left to Allocate' code
		if (typeof data.details !== "undefined" && typeof data.details.allocation !== "undefined") {
			//console.log("checking for data allocation",data.deails.allocation)
			//if (typeof data.details.allocation !== "undefined") {
				var allocationrow = document.createElement('div')
				allocationrow.setAttribute('class', 'row border-bottom')
				allocationrow.setAttribute('id', id +"-allocationrow-"+ idnospace(data.name) + "-allocationrow")

				var allocationcol = document.createElement('div')
				allocationcol.setAttribute('class', 'col')

				//Create Header Text
				var allocationtextrow = document.createElement('div')
				allocationtextrow.setAttribute('class', 'row')

				var allocationtextcol = document.createElement('div')
				allocationtextcol.setAttribute('class', 'col-12')

				var allocationspan = document.createElement('span')
				var allocationtext = document.createTextNode("Left to Allocate")
				//text inside Span
				allocationspan.appendChild(allocationtext)
				//span isde col
				allocationtextcol.appendChild(allocationspan)
				//col inside row
				allocationtextrow.appendChild(allocationtextcol)
				//row inside row
				allocationcol.appendChild(allocationtextrow)
				allocationrow.appendChild(allocationcol)

				//work out how many rows we need - we can have 7 items per row
				let noofrows = Math.ceil(data.details.allocation.length / 7)
				//console.log(data.details.allocation)
				console.log("Allocation length "+ data.details.allocation.length + "number of rows" + noofrows)
				let irows = []
					for (let i = 0; i < noofrows; i++) {
						var allocationinputrow = document.createElement('div')
						allocationinputrow.setAttribute('class', 'row')
					 irows.push(allocationinputrow)
					}

				for (let i = 0; i < data.details.allocation.length; i++) {
					if (data.details.allocation[i].type.toString() === "input" || data.details.allocation[i].type.toString() === "textinput" ) {
						elements.push(input(data.details.allocation[i], id, data.name, pid))
					}
				}
				//Put elements into allocation input row
				let a = 0
				let b = 0
				for (let i = 0; i < elements.length; i++) {
					irows[a].appendChild(elements[i])
					if(b == 6){
						a++
						b = 0
					}
					b++
					//allocationinputrow.appendChild(elements[i])
				};

				allocationcol.appendChild(allocationinputrow)
				allocationrow.appendChild(allocationcol)
				cardbody.appendChild(allocationrow)
				var elements = []
			//}
		}
	}//End of the left to allocate section

	console.log(data.details)
	///Create the rows items are going to go into
	if(typeof data.details !==  "undefined"){
		var noofrows = Math.ceil(data.details.item.length/ 7)
	}
	else{
		var noofrows = 1
	}
	console.log(noofrows)
		//console.log(data.details.item)
		//console.log("Allocation length "+ data.details.item.length + " number of rows" + noofrows)
		var irows = []
			for (let i = 0; i < noofrows; i++) {
				var cardrow = document.createElement('div')
				cardrow.setAttribute('class', 'form-row pt-2')
				var rowid = id + "-" + idnospace(data.name) + "-row-"+[i]
				cardrow.setAttribute('id', rowid)
				//allocationinputrow.setAttribute('class', 'row')
			irows.push(cardrow)
			}
	
/*
	var cardrow = document.createElement('div')
	cardrow.setAttribute('class', 'form-row pt-2')
	let rowid = id + "-" + idnospace(data.name) + "-row"
	cardrow.setAttribute('id', id + "-" + idnospace(data.name) + "-row")
*/	
	

	//get the list of items and see what they need to be
	if (typeof data.details !==  "undefined") {
		var items = data.details.item
		console.log(items.length)
		for (let i = 0; i < items.length; i++) {
			//console.log(items[i].type)
			//creates dropdowns
			if (items[i].type.toString() === "dropdown") {
				elements.push(dropdown(items[i], id, data.name, pid))
			}
			if (items[i].type.toString() === "input" || items[i].type.toString() === "textinput") {
				elements.push(input(items[i], id, data.name, pid))
			}
			if (items[i].type.toString() === "inputdisplay") {
				//console.log("going to displayinput", items[i].type)
				elements.push(inputdisplay(items[i], id, data.name, pid))
			}
			if(items[i].type.toString() === "checkbox"){
				elements.push(checkbox(items[i], id, data.name, pid));
			}

		};

		//create the total row
		var totalrow = { name: "Monthly Total" };
		elements.push(input(totalrow, id, data.name, pid));
		var uptotalrow = { name: "Upfront" };
		elements.push(input(uptotalrow, id, data.name, pid));

		//add remove button
		if (data.existing !== null && typeof mainrow === "undefined") {
			elements.push(removebutton(rowid));
		}

//add elements to the row[s]
		//Put elements into allocation input row
		
		let a = 0
		let b = 0
		console.log(elements)
		for (let i = 0; i < elements.length; i++) {
			console.log("a:"+a+ "b:"+ b +" i:"+ i)
			irows[a].appendChild(elements[i])
			if(b == 7){
				a++
				b = 0
			}
			b++
			//allocationinputrow.appendChild(elements[i])
		};
/*
		for (let i = 0; i < elements.length; i++) {
			cardrow.appendChild(elements[i])
		};
*/
	}
	return new Promise((resolve, reject) => {
		console.log(data.existing)
		console.log(cardrow)
		console.log(irows)
		if (data.existing == null) {
			for (let i = 0; i < irows.length; i++) {
				cardbody.appendChild(irows[i])
			}
			//cardbody.appendChild(cardrow)
			var parent = data.name
			//console.log(data.addons)
			if (data.addons) {
				cardbody.appendChild(addons(data, id, parent))
			}
			card.appendChild(cardbody)
			rowdiv.appendChild(card)
			resolve(rowdiv)
		} else {
			console.log("cardrow")
			//card.appendChild(cardrow)
			//rowdiv.appendChild(cardrow)
			resolve(cardrow)
		}

	})
};

//creates a close/remove button
function removebutton(rowid) {
	var button = document.createElement("button")
	button.setAttribute('class', 'close')
	var spanbutton = document.createElement("span")
	spanbutton.setAttribute('aria-hidden', 'true')
	var spanbuttontext = document.createTextNode("\u00d7")
	spanbutton.appendChild(spanbuttontext)
	button.appendChild(spanbutton)
	spanbutton.setAttribute('data-parentid', rowid);
	button.addEventListener("click", function() { removerow() }, true);
	return (button)

}




//Creates Optional Services Dropdown
function addons(data, id, parent) {
//console.log(data.addons)

let div = document.createElement('div')
	div.setAttribute("class", "row border-top")
	div.setAttribute('id', id + "-divaddon")

let divselection = document.createElement('div')
	divselection.setAttribute("class", "col col-12 ")
	
let fromdiv = document.createElement('form')	
	fromdiv.setAttribute('class', "form-inline")
	

//optional services
let title = document.createElement('span')
	let titletext = document.createTextNode('Optional Services ')
	title.appendChild(titletext)

let titlediv = document.createElement('div')
	titlediv.setAttribute("class", "row")
	titlediv.appendChild(title)

let dropdowndiv = document.createElement('div')
	dropdowndiv.setAttribute("class", "input-group mb-3 col-4")

let divaddbutton = document.createElement('div')
	divaddbutton.setAttribute("class", "input-group-append")

let button = document.createElement('button')
	button.setAttribute("onclick", "createaddon(this.type,this.dataset.id)")
	button.setAttribute("type", "button")
	button.setAttribute("class", "btn btn-primary")
	button.setAttribute("value", data.name)
	button.setAttribute("data-id", id)

let buttontext = document.createTextNode("Add")
	button.appendChild(buttontext)
	divaddbutton.appendChild(button)


//create qty
	let coldiv = document.createElement("div");
		coldiv.setAttribute('class', 'input-group mb-3')
	
	let divqtylabel = document.createElement('div')
		divqtylabel.setAttribute("class", "input-group-prepend")

	let inputlabel = document.createElement("div");
		inputlabel.setAttribute("class", "input-group-text")

	let inputlabelname = document.createTextNode("QTY")
		inputlabel.appendChild(inputlabelname);
	
	divqtylabel.appendChild(inputlabel)
	//coldiv.appendChild(inputlabel)

	let input = document.createElement("input");
		input.setAttribute('id', id + "-addon-qty")
		input.setAttribute('min', 0)
		input.setAttribute('class', 'form-control')
		input.setAttribute('type', 'number')
		input.setAttribute('inputmode', 'numeric')
		input.setAttribute('pattern', '[0-9]*')
		input.setAttribute('placeholder', 1)
		input.setAttribute('value', 1)


	coldiv.appendChild(divqtylabel)
	coldiv.appendChild(input)	
	

dropdowndiv.appendChild(dropdown(data.addons, id, parent))
dropdowndiv.appendChild(divaddbutton)
fromdiv.appendChild(dropdowndiv)
fromdiv.appendChild(coldiv)

divselection.appendChild(titlediv)
divselection.appendChild(fromdiv)

div.appendChild(divselection)


//console.log(div)
return (div)
}









//actually creates the new addon when the addon button is press
function createaddon(call, id) {
	//console.log(call)
	console.log(id)
	let addonqty = document.getElementById(id + '-addon-qty').value
	var pid = id
	var parent2 = document.getElementById(id + '-divaddon')
	//console.log(parent2,parent2.childNodes)
	var addonselect = document.getElementById(id + "-Addons");
	//Addon can be a called from AutoAddon or using the button. if its called from the button get the value from the dropdown list, if not the vaule comes in as call.
	if (call === "button") {
		var selection = addonselect.options[addonselect.selectedIndex].value;
	} else {
		var selection = call
	}
	var idn = generate_random_string(5)
	//console.log(selection,parent2.childNodes.length)
	//check for existing addon's in parent	

	for (let i = 0; i < parent2.childNodes.length; i++) {
		console.log(i,parent2.childNodes[i].id.toString().split('-')[1])
		if (typeof parent2.childNodes[i].id !== 'undefined' && parent2.childNodes[i].id.toString().split('-')[1] === selection.split('-')[0]) {
			console.log("found matching childNodes",parent2.childNodes[i])
			var existing = parent2.childNodes[i].childNodes[0].childNodes[1];
		}
	};
	
	for (let i = 0; i < addonqty; i++) {
		const url = '/product/name/?name=' + selection;
		fetch(url)
			.then(
				function(response) {
					response.json().then(function(data) {
						var info = document.getElementById(id + "-divaddon");
						//console.log(data)
						//send to layout
						if (existing) {
							data.existing = existing.id
						} else {
							data.existing = null
						}
						layout1(data, idn, pid)
							.then((data) => {
								//console.log("got data from server", data)
								if (existing) {
									existing.appendChild(data)
								} else {
									info.appendChild(data)
								}
							})
					})
				})
	}
};

//make dropdown   
function dropdown(data, id, parent, pid) {

	//console.log(data)
	//console.log(parent)

	var dropdowndiv = document.createElement("div");

	dropdowndiv.setAttribute('class', 'form-group col')
	dropdowndiv.setAttribute('id', 'formgroup-' + idnospace(data.name))
	let dropdown = document.createElement("select");
	dropdown.setAttribute('id', id + "-" + idnospace(data.name))
	dropdown.setAttribute('class', 'custom-select')
	dropdown.setAttribute('data-label', data.name)
	if (typeof pid !== 'undefined') {
		dropdown.setAttribute('data-belong', pid)
	}
	if (typeof parent !== 'undefined') {
		dropdown.setAttribute('data-group', parent)
	}
	if (data.calculate != null) {
		//console.log(data.calculate)
		if (typeof data.calculate === "object") {
			if (data.calculate.type == "lookup") {
				//console.log("found a lookup",data.calculate)
				dropdown.setAttribute('data-calculate', data.calculate.type)
				dropdown.setAttribute('data-calculatefrom', data.calculate.from)
			}
		} else {
			dropdown.setAttribute('data-calculate', data.calculate)
		}
	}
	if (data.updates != null) {
		var data_str = encodeURIComponent(JSON.stringify(data.updates));
		dropdown.setAttribute('data-updates', data_str)
	}

	if (data.required == true) {
		dropdown.setAttribute('required', 'true')
	}
	let defaultOption = document.createElement('option');
	defaultOption.setAttribute('data-sell', 0)

	if (data.name.toString() !== "Addons") {
		defaultOption.text = 'Select ' + data.name;
	}
	if (data.name.toString() === "Addons") {
		defaultOption.text = 'Select Service';
	}


	dropdown.add(defaultOption);
	dropdown.selectedIndex = 0;

	let option;

	for (let i = 0; i < data.list.length; i++) {
		option = document.createElement('option');
		option.text = data.list[i].name;
		console.log(data.list[i])
		if (data.list[i].sell != null) {
			option.setAttribute('data-sell', data.list[i].sell)
		}
		if (data.list[i].Standard != null) {
			option.setAttribute('data-Standard', data.list[i].Standard)
		}
		if (data.list[i].Advance != null) {
			option.setAttribute('data-Advance', data.list[i].Advance)
		}
		option.setAttribute('data-parent', parent)
		option.value = data.list[i].name;
		if (data.sell != null) {
			option.setAttribute('data-sell', data.sell)
		}
		if (typeof data.list[i].values === 'object'){
		//if (data.list[i].name === "Yes") {
			console.log("found Yes",data.list[i].values)

			for (let a = 0; a < data.list[i].values.length; a++) {
				//console.log("looking at values",data.list[i].values[a])
				option.setAttribute('data-' + data.list[i].values[a].name, data.list[i].values[a].sell)
			}
		//}
	}
		//option.setAttribute('data-'+, data.list[i].Standard)

		dropdown.add(option);
	}

	if (data.name.toString() !== "Addons") {

		var dropdownlabel = document.createElement("label");
		dropdownlabel.setAttribute("class", "mb-1")
		var dropdownlabelname = document.createTextNode(data.name)
		dropdownlabel.appendChild(dropdownlabelname);
		if (typeof data.info != 'undefined') {
			dropdownlabel.appendChild(addpopover(data))
		}
		dropdowndiv.appendChild(dropdownlabel)
	}
	dropdown.addEventListener("focusout", function() { calculate(), dependencycheck(), updateval() }, true);
	dropdowndiv.appendChild(dropdown)



	////console.log(dropdowndiv)
	if (data.name.toString() !== "Addons") {
		return (dropdowndiv)
	}
	if (data.name.toString() === "Addons") {
		return (dropdown)
	}
};


//create checkbox
function checkbox(data, id, parent, pid){
let elements = []

	let coldiv = document.createElement("div");
		coldiv.setAttribute('class', 'form-group col')
		coldiv.setAttribute('id', idnospace(data.name) + '-formgroup')
	
	let inputlabel = document.createElement("label");
		inputlabel.setAttribute("class", "mb-1")
	//create label
	let inputlabelname = document.createTextNode(data.name)
		inputlabel.appendChild(inputlabelname)

	//Add info popover
	if (typeof data.info != 'undefined') {
		inputlabel.appendChild(addpopover(data))
	}
	//add label to div
	coldiv.appendChild(inputlabel)

	//Create list of checkboxes
	for (let i = 0; i < data.list.length; i++) {
		console.log(data.list[i])
		let checkboxdiv = document.createElement("div");
			checkboxdiv.setAttribute('class', 'form-check')

		let checkbox = document.createElement("input")
			checkbox.setAttribute('class', 'form-check-input')	
			checkbox.setAttribute('type', 'checkbox')
			checkbox.setAttribute('id', id + "-" + idnospace(data.list[i].name))
			checkbox.setAttribute('data-label', data.list[i].name)
			if (typeof pid !== 'undefined') {
				checkbox.setAttribute('data-belong', pid)
			}
			if (typeof parent !== 'undefined') {
				checkbox.setAttribute('data-group', parent)
			}
			checkbox.setAttribute('value', 'no')
			checkbox.addEventListener('change',function() { updatecheckbox(id + "-" + idnospace(data.list[i].name)),calculate() },true);
			//coldiv.addEventListener("focusout", function() { calculate(), capacitycheck(), dependencycheck() }, true);
			checkboxdiv.appendChild(checkbox)

		let checkboxlabel = document.createElement("label")
			checkboxlabel.setAttribute('class', 'form-check-label')
			checkboxlabel.setAttribute('for', id + "-" + idnospace(data.list[i].name))
			
		if (data.list[i].calculate != null) {
			checkbox.setAttribute('data-calculate', data.list[i].calculate)
		}
		if (data.list[i].sell != null) {
			checkbox.setAttribute('data-sell', data.list[i].sell)
		}

			//create label
			let checkboxlabelname = document.createTextNode(data.list[i].name)
				checkboxlabel.appendChild(checkboxlabelname)
			
		checkboxdiv.appendChild(checkboxlabel)
		//add to div
		coldiv.appendChild(checkboxdiv)	
	}

	return(coldiv)
	
}

//make input
function input(data, id, parent, pid) {
	//////console.log("parent in input", parent)
	////console.log("Data",data)
	//console.log("id",id)
	//console.log("parent",parent)
	//console.log("pid",pid)
	//create the div to house everthing
	var coldiv = document.createElement("div");
	coldiv.setAttribute('class', 'form-group col')
	coldiv.setAttribute('id', idnospace(data.name) + '-formgroup')
	var inputlabel = document.createElement("label");
	inputlabel.setAttribute("class", "mb-1")
	//inputlabel.setAttribute("style","width:100%")
	//inputlabel.style.display = 'inline-block';
	var inputlabelname = document.createTextNode(data.name)
	inputlabel.appendChild(inputlabelname);
	if (typeof data.info != 'undefined') {
		inputlabel.appendChild(addpopover(data))
	}
	//inputlabeldiv.appendChild(inputlabel);
	if (data.sell > 0) {
		var sellprice = document.createElement("span")
		sellprice.setAttribute("class", "badge badge-primary ml-1")
		var sellpricetext = document.createTextNode('$' + Number(data.sell).toFixed(2))
		sellprice.appendChild(sellpricetext)
		inputlabel.appendChild(sellprice)
	}

	coldiv.appendChild(inputlabel)

	let input = document.createElement("input");
	input.setAttribute('min', 0)
	input.setAttribute('data-label', data.name)
	if (typeof pid !== 'undefined') {
		input.setAttribute('data-belong', pid)
	}
	if (typeof parent !== 'undefined') {
		input.setAttribute('data-group', parent)
	}
	//create the inputfeild
	if (data.name === "Monthly Total" || data.name === "Upfront") {
		//create topdiv
		let topdiv = document.createElement("div");
		topdiv.setAttribute('class', 'input-group')

		let middiv = document.createElement("div");
		middiv.setAttribute('class', 'input-group-prepend')

		//span
		let prependspan = document.createElement("span");
		prependspan.setAttribute('class', 'input-group-text')
		prependspan.setAttribute('id', 'inputGroupPrepend')
		var prependspantext = document.createTextNode("$")
		prependspan.appendChild(prependspantext)
		//place span inside middiv
		middiv.appendChild(prependspan)
		//place middiv into top div
		topdiv.appendChild(middiv)
		//create input
		//let input = document.createElement("input");
		input.setAttribute('class', 'form-control')
		input.setAttribute('type', 'number')
		input.setAttribute('placeholder', 0)
		input.setAttribute('readonly', 'true')


		if (typeof data.calculate != "undefined" && data.calculate === "remaining") {
			input.setAttribute('id', id + "-" + idnospace(data.name) + '-remaining')
			input.removeAttribute('min')
		} else {
			input.setAttribute('id', id + "-" + idnospace(data.name))
		}

		//place input into top div
		topdiv.appendChild(input)
		coldiv.appendChild(topdiv)

	} else {
		//let input = document.createElement("input");
		input.setAttribute('class', 'form-control')
		if(data.type === "input"){
			input.setAttribute('type', 'number')
			input.setAttribute('inputmode', 'numeric')
			input.setAttribute('pattern', '[0-9]*')
			input.setAttribute('placeholder', 0)
		}
		if(data.type === "textinput"){
			input.setAttribute('type', 'text')
			input.setAttribute('inputmode', 'text')
			input.setAttribute('placeholder', "Address")

		}
		if (data.name === "upfront") {
			input.setAttribute('value', 1)
		}
		if (data.sell != null) {
			input.setAttribute('data-sell', data.sell)
		}
		if (data.calculate != null) {
			input.setAttribute('data-calculate', data.calculate)
		}
		if (data.list != null) {
			var data_str = encodeURIComponent(JSON.stringify(data.list));
			input.setAttribute('data-list', data_str)
		}
		if (data.cost != null) {
			input.setAttribute('data-cost', data.cost)
		}
		if (data.min != null) {
			input.setAttribute('data-min', data.min)
		}
		if (data.alert != null) {
			input.setAttribute('data-alert', data.alert)
		}
		if (data.dependency != null) {
			input.setAttribute('data-dependency', data.dependency)
		}
		if (data.readonly === 0) {
			input.setAttribute('readonly', 'true')
		}
		if (data.parent != null) {
			input.setAttribute('data-parent', pid + '-' + idnospace(data.parent))
			input.setAttribute('data-parentcard', id + '-' + idnospace(parent) + '-cardbody')
		}
		if (data.child != null) {
			input.setAttribute('data-child', idnospace(data.child))
		}
		if (data.required == true) {
			input.setAttribute('required', 'true')
		}



		if (typeof data.calculate != "undefined" && data.calculate === "remaining") {
			input.setAttribute('id', id + "-" + idnospace(data.name) + '-remaining')
			input.removeAttribute('min')
		} else {
			input.setAttribute('id', id + "-" + idnospace(data.name))
		}

		coldiv.appendChild(input)
	}
	//bring it all together
	coldiv.addEventListener("focusout", function() { calculate(), capacitycheck(), dependencycheck() }, true);
	return (coldiv)
}

//make inputdisplay this is for things that have a price but you only want to display Text
//Runs off an item type of "inputdisplay"
function inputdisplay(data, id, parent, pid) {
	//create the div to house everthing
	var coldiv = document.createElement("div");
	coldiv.setAttribute('class', 'form-group align-self-center col')
	//create the labelname
	var inputlabel = document.createElement("label");
	inputlabel.setAttribute("class", "mb-1 mr-1")
	var inputlabelname = document.createTextNode(data.name)
	inputlabel.appendChild(inputlabelname);
	if (typeof data.info != 'undefined') {
		inputlabel.appendChild(addpopover(data))
	}
	inputlabel.setAttribute('data-label', data.name)
	if (typeof pid !== 'undefined') {
		inputlabel.setAttribute('data-belong', pid)
	}
	if (typeof parent !== 'undefined') {
		inputlabel.setAttribute('data-group', parent)
	}
	if (data.cost != null) {
		inputlabel.setAttribute('data-cost', data.cost)
	}
	if (data.calculate != null) {
		//console.log(data.calculate)
		if (typeof data.calculate === "object") {
			if (data.calculate.type == "lookup") {
				//console.log("found a lookup",data.calculate)
				inputlabel.setAttribute('data-calculate', data.calculate.type)
				inputlabel.setAttribute('data-calculatefrom', data.calculate.from)
			}
		} else {
			inputlabel.setAttribute('data-calculate', data.calculate)
		}
	}
	if (data.min != null) {
		inputlabel.setAttribute('data-min', data.min)
	}
	if (data.alert != null) {
		inputlabel.setAttribute('data-alert', data.alert)
	}
	if (data.dependency != null) {
		inputlabel.setAttribute('data-dependency', data.dependency)
	}
	coldiv.appendChild(inputlabel)
	if (data.sell != null) {
		console.log('data sell '+ data.sell.type)
		if (typeof data.sell === "object") {
			for (let i = 0; i < data.sell[i].length; a++) {
				//console.log("looking at values",data.list[i].values[a])
				inputlabel.setAttribute('data-' + data.name, data.sell[i])
			}
		}
	else{
		inputlabel.setAttribute('data-sell', data.sell)
		//create badge with Sell Price
		var sellprice = document.createElement("span")
		sellprice.setAttribute("class", "badge badge-primary mb-1 ml-1")

		var sellpricetext = document.createTextNode('$' + Number(data.sell).toFixed(2))
		sellprice.appendChild(sellpricetext)
		coldiv.appendChild(sellprice)
		//inputlabel.appendChild(sellprice)
	}	

	}

	inputlabel.setAttribute('id', id + "-" + idnospace(data.name))



	//bring it all together
	return (coldiv)
}
//info box/popover
function addpopover(data) {
	//console.log("addpopover")
	//<button type="button" data-trigger="hover" class="btn btn-secondary" data-container="body" data-toggle="popover" data-placement="top" data-content="Vivamus sagittis lacus vel augue laoreet rutrum faucibus.">
	var infobutton = document.createElement('i')
	infobutton.setAttribute("class", "fas fa-info-circle")
	infobutton.setAttribute('data-toggle', "popover")
	infobutton.setAttribute('data-trigger', "hover")
	infobutton.setAttribute('data-placement', "top")
	infobutton.setAttribute('data-content', data.info)
	//console.log(infobutton)
	infobutton.addEventListener("mouseenter", function() { $('[data-toggle="popover"]').popover() }, true);
	//infobutton.addEventListener("focusout", function() { $().popover('hide') }, true);
	return (infobutton)
}


function updateval() {
	//console.log("updateval Trigged by", event.target.id)
	id = event.target.id.toString().split('-')[0];
	//console.log(event.target.value)
	if (typeof event.target.dataset.updates != "undefined") {
		var updatelist = JSON.parse(decodeURIComponent(event.target.dataset.updates));

		//console.log("found something to update", updatelist)
		for (var i = 0; i < updatelist.length; i++) {
			//console.log(updatelist[i])
			var updateid = id + '-' + idnospace(updatelist[i].name);
			//console.log(updateid)
			//gets the element that needs updating 
			var element = document.getElementById(updateid)
			//console.log("got element to update", element)
			var eventselection = event.target.value
			var elementlist = element.dataset.list
			var elementlist = JSON.parse(decodeURIComponent(element.dataset.list));
			//console.log(elementlist)
			for (var i = 0; i < elementlist.length; i++) {
				//console.log("starting item", elementlist[i].name)
				if (+event.target.value === +elementlist[i].name) {
					//console.log("Match made", event.target.value, elementlist[i].name)
					var value = elementlist[i].sell
					element.setAttribute("value", value)
				}
			}
		}
	}
}


//This function looks at the remaing
function remaining(data) {
	console.log("in remaining")
	console.log(data)

	var parentvalue = +document.getElementById(data.dataset.parent).value
	var parentcard = document.getElementById(data.dataset.parentcard.toString())
	var values = []
	//console.log(parentcard)
	console.log(parentcard.childNodes.length)
	for (var i = 1; i < parentcard.childNodes.length; i++) {
		console.log("in loop")
		console.log(parentcard.childNodes[i].id.toString().split('-')[1])
		console.log(parentcard.childNodes[i].id.toString().split('-')[1] +" " +data.dataset.parentcard.toString().split('-')[1])
		
		if (parentcard.childNodes[i].id.toString().split('-')[1] != "allocationrow" && parentcard.childNodes[i].id.toString().split('-')[1] == data.dataset.parentcard.toString().split('-')[1]) {
			console.log("in if")
			//console.log("found and ID that matches the Parent Product",parentcard.childNodes[i].id)
			//Get the value of the child input, this will be added to a total and used to subtract from the parent.
			//console.log(parentcard.childNodes[i].id.toString().split('-')[0])
			//console.log(data.dataset.child)
			let inputvalue = document.getElementById(parentcard.childNodes[i].id.toString().split('-')[0] + '-' + data.dataset.child).value
			console.log(inputvalue.length)
			console.log('input value ' + inputvalue)
			console.log(isNaN(inputvalue))
			if (isNaN(inputvalue) && inputvalue.length >= 1) {
				 inputvalue = 1
				console.log("found NAN - " + inputvalue)
			}
			if (isNaN(inputvalue) && inputvalue.length == 0) {
				inputvalue = 0
			}

			console.log(values.push(inputvalue))
			//values.push(inputvalue)
		}
	}
	var childvalue = values.reduce(getSum, 0)
	console.log("parentvalue", parentvalue, "childvalue", childvalue)
	var remaining = parentvalue - childvalue
	console.log(remaining)
	if (remaining < 0) {
		alertbox("Did you mean to over allocate " + data.dataset.label + "?")
	}
	data.setAttribute("value", remaining)
}




//Calcuate totals
function calculate() {
	console.log("Cal Trigged by", event.target.id)
	var totals = [];
	var list = document.querySelectorAll('[data-calculate]:not([data-calculate=upfront])[id*=' + event.target.id.toString().split('-')[0]);
	//document.querySelectorAll('div[data-value]:not([data-value="0"])')
	//[data-calculate=upfront]
	//querySelectorAll("[id*=-total]")
	console.log(list)
	//new code
	for (var i = 0; i < list.length; i++) {
		//console.log("looking at", list[i].id, list[i].dataset)
		var id = list[i].id.toString().split('-')[0]
		//If calculate is set to none, this means the field already has the required value in it
		if (list[i].dataset.calculate.toString() === "none") {
			console.log("Found a none cal")
			if(list[i].type === "checkbox"){
				totals.push(+list[i].dataset.sell)
				console.log(totals)
			}
			else{
			totals.push(+list[i].value)	
			}
			
			continue
			//return
		}

		//check to see how the calculation should be done
		if (list[i].dataset.calculate.toString() === "self") {
			//console.log("This items is calculate based on the sell quantity in the input field")
			console.log(list[i])

			if(list[i].type === "checkbox"){
				console.log('checkbox',list[i].dataset.sell)
				totals.push(+list[i].dataset.sell)
				console.log(totals)
			}
			if (typeof list[i].type != "undefined" && list[i].type === "select-one" && typeof list[i].options[list[i].selectedIndex].dataset.sell != 'undefined') {
				totals.push(+list[i].options[list[i].selectedIndex].dataset.sell)
			} else {
				var total = +list[i].value * +list[i].dataset.sell
				totals.push(+total)
			}
			continue
		}
		if (list[i].dataset.calculate.toString() === "remaining") {
			remaining(list[i])
		}
		if (list[i].dataset.calculate === "lookup") {
			totals.push(+callookup(list[i]))
			continue
		}
		//currently only supports bring in one number (maybe can do more in the future)
		if (typeof list[i].dataset.calculate != "undefined" && list[i].dataset.calculate != "self" && list[i].dataset.calculate != "none" && list[i].dataset.calculate != "upfront" && list[i].dataset.calculate != "remaining") {
			//console.log("this item uses another field for the sell price", list[i].name)
			//var namea = list[i].dataset.calculate.toString()
			//console.log(id + "-" + idnospace(list[i].dataset.calculate))
			var select = document.getElementById(id + "-" + idnospace(list[i].dataset.calculate.toString()))
			//console.log("Is there a select Type?(if undefined that means no)", select.type)

			if (typeof select.type != "undefined" && select.type === "select-one") {
				var selection = select.options[select.selectedIndex].dataset.sell;
			}
			if (typeof select.type === 'undefined') {
				//console.log("in undefined select type", select.dataset.sell)

				var selection = select.dataset.sell
			}

			//Get the sell price from a drop down that is used as a calculation if it has a sell price
			if (typeof list[i].type != "undefined" && list[i].type === "select-one") {
				//console.log(list[i].type, list[i].options[list[i].selectedIndex].dataset.sell)
			}
			if (typeof list[i].type != "undefined" && list[i].type === "select-one" && typeof list[i].options[list[i].selectedIndex].dataset.sell != 'undefined') {
				//console.log("in if about dropdown with sell price")
				var value1 = list[i].options[list[i].selectedIndex].dataset.sell
			} else {
				//console.log("in else about dropdown with sell price")
				var value1 = list[i].value
			}


			//console.log(select, selection)
			//console.log("values to be mutipled", value1, selection)
			var total = +value1 * +selection

			totals.push(total)
			continue
		}
	}

	//doing some Math!      
	function getSum(total, num) {
		return total + Math.round(num * 100) / 100;
	}
	//console.log(totals)

	totalf = document.getElementById(id + "-MonthlyTotal")
	if(totalf !== null){
		console.log(totalf)
		var addtotals = totals.reduce(getSum, 0);
		//var n = Number(addtotals).toFixed(2)
		if (addtotals >= 0) {
				totalf.setAttribute('value', Number(addtotals).toFixed(2))
		}

		//do upfromts 
		totalrupfrom = document.getElementById(id + "-Upfront")
		
		var upfrontlist = document.querySelectorAll('[data-calculate=upfront][id*=' + event.target.id.toString().split('-')[0]);
		var upfrontvalues = []
		console.log(upfrontlist)
		for (var i = 0; i < upfrontlist.length; i++) {
			var value = 0
			console.log(upfrontlist[i])
			console.log(upfrontlist[i].type + upfrontlist[i].dataset.sell)
			if (upfrontlist[i].type === "select-one") {
				////console.log(list[i].options[list[i].selectedIndex].dataset.sell)
				value = +upfrontlist[i].options[upfrontlist[i].selectedIndex].dataset.sell
			}
			//calculate upfront based on sell + value
			if (upfrontlist[i].type === "number") {
				value = +upfrontlist[i].dataset.sell * +upfrontlist[i].value
			}
			if (upfrontlist[i].type === "checkbox" && upfrontlist[i].checked === true) {
				console.log('in checkbox')
				value = +upfrontlist[i].dataset.sell
			}
			if (typeof upfrontlist[i].type === "undefined") {
				console.log('in undefined')
				value = +upfrontlist[i].dataset.sell
			}
			//get the value from sell
			console.log(value)
			upfrontvalues.push(Number(value))
		}
		var addtotals = upfrontvalues.reduce(getSum, 0);
		if (addtotals >= 0) {
			totalrupfrom.setAttribute('value', Number(addtotals).toFixed(2))
		}
		////console.log(addtotals)
		//calls function for grandtotals
		grandtotals()
	}
};

//this finction is called when a caluciation uses another to lookup
//Lookup is used to match a string from the lookup fied to a string in the other dropdown (FWaaS speed)
function callookup(data) {
	//console.log("in calllookup",data)
	let id = data.id.toString().split('-')[0]
	let from = data.dataset.calculatefrom
	//console.log(from)
	let lookupele = document.getElementById(id + "-" + idnospace(from))
	let lookupselect = lookupele.options[lookupele.selectedIndex].value.toLowerCase().toString()
	let currnetselected = data.options[data.selectedIndex]
	//console.log(lookupselect)
	//console.log(currnetselected.dataset[lookupselect])
	if (isNaN(currnetselected.dataset[lookupselect])) {
		return (0)
	}
	return (currnetselected.dataset[lookupselect])
}


//Call alert if alert level is set
function capacitycheck() {
	id = event.target.id.toString().split('-')[0];
	item = idnospace(event.target.id.toString().split('-')[1]);
	var alerts = document.getElementById("alerts");
	if (+event.target.value >= +event.target.dataset.alert && !document.getElementById(id + "-" + item + "-alert")) {

		//This section builds the message
		var coldiv = document.createElement("div");
		coldiv.setAttribute('class', 'alert alert-warning alert-dismissible fade show')
		coldiv.setAttribute('id', id + "-" + item + "-alert")
		var titlemessage = document.createElement("strong")
		var titlemessagetext = document.createTextNode("Capacity Check " + item)
		var messagetext = document.createTextNode(' Please contact the Cloud Services manager to ensure there is enough capacity for this instalation')
		var button = document.createElement("button")
		button.setAttribute('class', 'close')
		button.setAttribute('data-dismiss', 'alert')
		button.setAttribute('aria-label', 'Close')
		var spanbutton = document.createElement("span")
		spanbutton.setAttribute('aria-hidden', 'true')
		var spanbuttontext = document.createTextNode("\u00d7")
		spanbutton.appendChild(spanbuttontext)
		button.appendChild(spanbutton)


		titlemessage.appendChild(titlemessagetext)
		coldiv.appendChild(titlemessage)
		coldiv.appendChild(messagetext)
		coldiv.appendChild(button)

		//console.log(coldiv)
		alerts.appendChild(coldiv)
	}
};




//Check Dependencies to see if they have values in thme, if they do tell them to fill out the rest also
function dependencycheck() {
	//console.log(event.target)

	var currentelement = document.getElementById(event.target.id)

	//add is-valid class
	var id = event.target.id.toString().split('-')[0];
	var product = event.target.id.toString().split('-')[1];

	//Set Requirment
	function setrequirment(element, buildid) {
		var div = createrequireddiv(buildid);
		//console.log("Setting required")
		//console.log("Parent Class List",element.parentElement.classList)
		//console.log("Thing to be set",div)
		element.parentElement.appendChild(div)
		element.classList.add("is-invalid")
	}

	//Remove Requirment
	function removerequirment(element, buildid) {
		//console.log("Removing required",element,buildid)
		var required = document.getElementById(buildid + "-required")
		//console.log(required)
		if (required !== null) {
			required.parentNode.removeChild(required)
			//element.classList.replace("is-invalid","is-valid")
		}
	}

	function createrequireddiv(buildid) {
		//console.log("blank element value")
		//If there is no value in the depedancy - make sure it flags
		var div = document.createElement("div")
		div.setAttribute("class", "invalid-feedback")
		div.setAttribute("id", buildid + "-required")
		div.style.display = 'block';
		var divtext = document.createTextNode("This is a required field")
		div.appendChild(divtext)
		return div
	}

	function createmindiv(buildid) {
		//console.log("blank element value")
		//If there is no value in the depedancy - make sure it flags
		var div = document.createElement("div")
		div.setAttribute("class", "invalid-feedback")
		div.setAttribute("id", buildid + "-minrequirment")
		div.style.display = 'block';
		var divtext = document.createTextNode("Minimum is " + event.target.dataset.min)
		div.appendChild(divtext)
		return div
	}

	function mincheck(element, id) {
		//console.log("in min check",element,id)
		//if (typeof element.dataset.min != 'undefined') {
		//console.log("Found event with min",element.dataset.min,element.value)
		//If the Min isn't met and the min requird warning doesn't already exist
		if (+element.value <= +element.dataset.min && document.getElementById(element.id + "-minrequirment") === null) {
			var message = createmindiv(element.id)
			var valid = false
			//console.log("Set Valid",valid)
			////console.log(currentelement)
			element.parentElement.appendChild(message)
		}
		//If the vaule is equal to or greater than and there is a minrequirment remove the div and set valid
		if (+element.value >= +element.dataset.min && document.getElementById(element.id + "-minrequirment") !== null) {
			//console.log("Value is greater min and there is a -minrequirment, removing")
			var removediv = document.getElementById(element.id + "-minrequirment")
			removediv.parentNode.removeChild(removediv)
			var valid = true
			//console.log("Set Valid",valid)
		}
		//If the vuale is equal or greater than and there isn't a min, set valid to true
		if (+element.value >= +element.dataset.min && document.getElementById(element.id + "-minrequirment") === null) {
			//console.log("Value is greater min and there is no -minrequirment")
			var valid = true
			//console.log("Set Valid",valid)
		}
		//}
		return (valid)
	}



	var dependencylist = []
	var dependencylist = document.querySelectorAll('[required="true"][id*=' + event.target.id.toString().split('-')[0]);
	//console.log("dependencylist",dependencylist)
	//dependencylist.push(product)
	for (let i = 0; i < dependencylist.length; i++) {
		var valid = false
		//var buildid = id + "-" + idnospace(dependencylist[i].toString())
		////console.log("id", buildid)
		//var element = document.getElementById(buildid)
		var element = dependencylist[i]

		if (element !== null) {
			//console.log(element, element.value,element.type, document.getElementById(element.id + "-required"))
			//console.log(element.value.toString().startsWith("Select"))
			////console.log(document.getElementById(element.id + "-required"))
			//If Dropdown and doesn't already have required
			if (element.type.toString() === "select-one") {
				//console.log("Found a dropdown")
				//console.log(element.value.toString().startsWith("Select"))
				//If the dropdown is still on Select
				if (element.value.toString().startsWith("Select") === true && document.getElementById(element.id + "-required") === null) {
					//console.log("Dropdown starts with Select")
					setrequirment(element, element.id);
					valid = false
					//console.log("Set Valid",valid)
					//continue;
				}
				if (element.value.toString().startsWith("Select") === false && document.getElementById(element.id + "-required") !== null) {
					//console.log("Dropdown doesn't start with Select")
					removerequirment(element, element.id);
					valid = true
					//console.log("Set Valid",valid)
					//continue;
				}
				if (element.value.toString().startsWith("Select") === false && document.getElementById(element.id + "-required") === null) {
					//console.log("Dropdown doesn't start with Select and doesn't have required")
					valid = true
					//console.log("Set Valid",valid)
					//continue;
				}
			};
			if (element.type.toString() !== "select-one") {

				if (element.value === "" && document.getElementById(element.id + "-required") === null) {
					//console.log("blank element value")
					//If there is no value in the depedancy - make sure it flags
					setrequirment(element, element.id)
					valid = false
					//console.log("Set Valid",valid)
					//continue;
				}

				if (element.value > 0) {
					//console.log("not blank element value")
					removerequirment(element, element.id)
					if (typeof element.dataset.min != 'undefined') {
						//console.log("sending to mincheck")
						var valid = mincheck(element, id, product);
						//console.log("Valid came back as",valid)
					} else {
						valid = true
						//console.log("Set Valid",valid)
					}
					//continue;
				}

			}
		}
		//console.log("About to set Valid",valid);

		if (valid == false) {
			if (element.classList.contains("is-valid")) {
				element.classList.replace("is-valid", "is-invalid")
			} else {
				element.classList.add("is-invalid")
			}
		}
		if (valid == true) {
			if (element.classList.contains("is-invalid")) {
				element.classList.replace("is-invalid", "is-valid")
			} else {
				element.classList.add("is-valid")
			}
		}

	}

}


//Remove the space from names
function idnospace(name) {
	var nospace = name.replace(/\s+/g, '');
	return (nospace)
}

//Generate Random Number
function generate_random_string(string_length) {
	let random_string = '';
	let random_ascii;
	let ascii_low = 65;
	let ascii_high = 90
	for (let i = 0; i < string_length; i++) {
		random_ascii = Math.floor((Math.random() * (ascii_high - ascii_low)) + ascii_low);
		random_string += String.fromCharCode(random_ascii)
	}
	return random_string
}

//Calculate Grandtotls
function grandtotals() {
	var upfront = document.getElementById('upfronttotal')
	var monthly = document.getElementById('monthlytotal')
	var totalslist = document.querySelectorAll("[id$=-MonthlyTotal]")
	var upfrontlist = document.querySelectorAll("[id$=-Upfront]");
	//var upfrontlist = document.querySelectorAll("[data-calculate*=upfront]");
	//console.log(upfrontlist)
	//console.log(upfront,upfrontlist,monthly,totalslist)
	//alltotals stored in value
	//allupfront stored in sell
	var totalsnumber = gettotals(totalslist);
	var upfrontnumber = gettotals(upfrontlist);
	upfront.setAttribute("value", Number(upfrontnumber).toFixed(2));
	monthly.setAttribute("value", Number(totalsnumber).toFixed(2));

}

function getSum(total, num) {
	return total + Math.round(num * 100) / 100;
}

function gettotals(list) {
	var totals = []
	//console.log(list)
	for (let i = 0; i < list.length; i++) {
		//console.log(list[i].id,list[i].value)
		if (list[i].value !== "") {
			var value = Number(list[i].value)
			/*
			console.log("looking at",list[i].id)
			if (list[i].id.split('-')[1].toString() === "MonthlyTotal") {
				var value = +list[i].value
				//get the value from value
			}
			if (list[i].dataset.calculate === "upfront") {
				////console.log(list[i].type)
				if (list[i].type === "select-one") {
					//console.log(list[i].options[list[i].selectedIndex].dataset.sell)
					var value = +list[i].options[list[i].selectedIndex].dataset.sell
				}
				//calculate upfront based on sell + value
				if (list[i].type === "number") {
					var value = +list[i].dataset.sell * +list[i].value
				}
				if (typeof list[i].type === "undefined") {
					var value = +list[i].dataset.sell
				}
				//get the value from sell
			}
			*/
			//console.log(value)
			totals.push(value)
		}
	}
	//console.log("Totals",totals)
	var rtotals = totals.reduce(getSum, 0)
	//console.log("returned totals",rtotals)
	return (rtotals)
}
