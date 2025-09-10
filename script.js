const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");  // Contains the list of premises
const conclusionBox = document.querySelector(".editable-conclusion"); // The conclusion box
const proofContainer = document.getElementById("proof-container"); // Contains the proof lines

// Function to add a new premise to the list
function addPremise(text) {
    let li = document.createElement("li");
    let editableSpan = document.createElement("div");
    editableSpan.classList.add("editable");
    editableSpan.setAttribute("contenteditable", "true");
    editableSpan.textContent = text === undefined ? inputBox.value : text;
    let closeSpan = document.createElement("div");
    closeSpan.classList.add("close");
    closeSpan.innerHTML = "\u00d7";
    closeSpan.style.cursor = "cursor";
    closeSpan.onclick = function() {
        li.remove();
    };
    li.appendChild(editableSpan);
    li.appendChild(closeSpan);
    listContainer.appendChild(li);
    inputBox.value = "";
}
inputBox.addEventListener('keydown', function(e) {
    if (inputBox.value != '' && e.key === 'Enter') {
        e.preventDefault();
        addPremise(inputBox.value);
    }
});
listContainer.addEventListener('keydown', function(e) {
    if (e.target.isContentEditable && e.key === 'Enter') {
        e.preventDefault();
        addPremise('');
        let li = listContainer.lastElementChild;
        li.firstElementChild.focus();   // Focus the new editable span
    }
});
conclusionBox.addEventListener('keydown', function(e) {
    if (e.target.isContentEditable && e.key === 'Enter') {
        e.preventDefault();
        submit();
    }
});
// Called upon pressing Enter in a proof line
proofContainer.addEventListener('keydown', function(e) {
    if (e.target.isContentEditable && e.key === 'Enter') {
        e.preventDefault();
        let proofFormula = checkProofLine(e.target.textContent);
        if (!proofFormula) return;  // Invalid proof line, do nothing
        syntaxTrees.push(parse(proofFormula));  // Add the new proof line's syntax tree to syntaxTrees
        console.log("All syntax trees:", syntaxTrees);
        // Proof line is valid, add a new proof line
        e.target.textContent = e.target.textContent.trim();
        e.target.textContent = e.target.textContent.replace(/\s+/g, ' ');
        e.target.textContent = `${proofFormula}ㅤㅤㅤㅤ(${e.target.textContent})`
        e.target.setAttribute("contenteditable", "false");   // Make the current line not editable
         if (proofFormula === conclusionStr){
            e.target.style.backgroundColor = "#c9f9c5ff"
            alert("🎉Congratulations! You have derived the conclusion!🎉");
        }else{
            e.target.style.backgroundColor = "#cbedf7ff"; // Change background color to indicate non-editable
            }
        
        addProofLine('');
        let li = proofContainer.lastElementChild;
        li.firstElementChild.focus();   // Focus the new editable span
    }
});

addPremise();

function countPremises(){
    return listContainer.children.length;
}

/* SUBMIT */

function submit(){
    // Clear previous proof lines
    proofContainer.innerHTML = "";
    syntaxTrees = []; // Clear previous syntax trees
    conclusionSyntaxTree = null;
    conclusionStr = "";
    // Replace ASCII characters with logical symbols
    replaceLogicalSymbols();
    if (!parseAllFormulas()) return;
    /*
    // Make premise not editable
    for (let premise of listContainer.children){
        premise.firstElementChild.setAttribute("contenteditable", "false");
    }
    // Make conclusion not editable
    document.querySelector(".editable-conclusion").setAttribute("contenteditable", "false");
    // Disable submit button and Add Premise button
    document.getElementById("add-btn").disabled = true;
    document.getElementById("submit-btn").disabled = true; */
    // Set proof line numbering to start after the last premise
    proofContainer.setAttribute("start", countPremises() + 1);
    addProofLine("");
    console.log(syntaxTrees);
}

function addProofLine(text){
    let lastLi = proofContainer.lastElementChild;
    if (lastLi !== null){

    }
    let li = document.createElement("li");
    let editableSpan = document.createElement("div");
    editableSpan.classList.add("editable");
    editableSpan.setAttribute("contenteditable", "true");
    editableSpan.textContent = text === undefined ? "" : text;
    let closeSpan = document.createElement("div");
    closeSpan.classList.add("close");
    closeSpan.innerHTML = "\u00d7";
    closeSpan.style.cursor = "pointer";
    closeSpan.onclick = function() {
        // Also remove the corresponding syntax tree
        const parent = li.parentNode;
        const index = Array.prototype.indexOf.call(parent.children, li);
        syntaxTrees.splice(index + countPremises(), 1); // Adjust index for premises
        console.log("All syntax trees after deletion:", syntaxTrees);
        li.remove();
    };
    li.appendChild(editableSpan);
    li.appendChild(closeSpan);
    proofContainer.appendChild(li);
    li.firstElementChild.focus();   // Focus the new editable span
    inputBox.value = "";
}

// Replace ASCII charcters with logical symbols
function replaceLogicalSymbols(){
    for (let premise of listContainer.children){
        formula = premise.firstElementChild.textContent;
        formula = formula.replace(/&/g, "∧");
        formula = formula.replace(/\|/g, "∨");
        formula = formula.replace(/~/g, "¬");
        formula = formula.replace(/<->/g, "↔");
        formula = formula.replace(/->/g, "→");
        premise.firstElementChild.textContent = formula;
    }
    let conclusion = document.querySelector(".editable-conclusion");
    formula = conclusion.textContent;
    formula = formula.replace(/&/g, "∧");
    formula = formula.replace(/\|/g, "∨");
    formula = formula.replace(/~/g, "¬");
    formula = formula.replace(/<->/g, "↔");
    formula = formula.replace(/->/g, "→");
    conclusion.textContent = formula;
}

// Check if all premises and conclusion are well-formed
function parseAllFormulas(){
    for (let li of listContainer.children){
        // Trim whitespace from the formula
        li.firstElementChild.textContent = li.firstElementChild.textContent.trim()
        li.firstElementChild.textContent = li.firstElementChild.textContent.replace(/\s+/g, '');
        let formula = li.firstElementChild.textContent;

        console.log(formula);
        if (formula.trim() === ""){
            alert("One of the premises is empty!");
            return false;
        }
        let syntaxTree = parse(formula); 
        if (!syntaxTree){
            alert(`The premise "${formula}" is not well-formed!`);
            return false;
        };
        syntaxTrees.push(syntaxTree);  // Add the syntax tree to the syntaxTrees array
    }
    // Trim whitespace from the conclusion
    document.querySelector(".editable-conclusion").textContent = document.querySelector(".editable-conclusion").textContent.trim();
    document.querySelector(".editable-conclusion").textContent = document.querySelector(".editable-conclusion").textContent.replace(/\s+/g, ' ');
    formula = document.querySelector(".editable-conclusion").textContent;
     if (formula.trim() === ""){
            alert("The conclusion is empty!");
            return false;
        }   
    let syntaxTree = parse(formula)
    if (!syntaxTree){
        alert(`The conclusion "${formula}" is not well-formed!`);
        return false;
    }
    conclusionSyntaxTree = syntaxTree;  // Let conclusionSyntaxTree be the conclusion syntax tree
    conclusionStr = syntaxTreeToString(conclusionSyntaxTree);
    return true;
}
 // UNUSED: Check if the formula is well-formed
function isWellFormed(formula){
    // Check if formula contains characters other than legal characters. If so, return false
    regex = new RegExp("[^A-Za-z\-<>~∧∨¬↔→ ]");
    if (regex.test(formula) == true){
        console.log("Illegal characters");
        return false
    }
    let syntaxTree = parse(formula);
    if (syntaxTree == false){
        console.log("Not well-formed");
        return false;
    }
    return true;
}


/* PROOFS */
let syntaxTrees = [];   // Store syntax trees of all premises and conclusion
let conclusionSyntaxTree = null;
let conclusionStr = "";  // The conclusion formula string from conclusionSyntaxTree

// For syntax tree
class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}
function printTree(node,prefix="",isLeft)
    {
        if(node===null)
        {
            return
        }
        console.log(prefix+(isLeft?'|-':'|_')+node.value)
        let newprefix=prefix+(isLeft?'|  ':'   ')
        printTree(node.left,newprefix,true)
        printTree(node.right,newprefix,false)
        
    }
// Helper function to create a new syntax tree node
function newSyntaxTree(value, left=null, right=null){
    let node = new TreeNode(value);
    node.left = left;
    node.right = right;
    return node;
}
// Parse a formula string into a syntax tree. Return false if not well-formed
function parse(formula){
    // Remove whitespace
    formula = formula.replace(/\s+/g, ''); 
    let isWellFormed = true;  //  Assume well-formed until proven otherwise
    // Use Pratt's algorithm to parse the formula into a syntax tree
    function getBindingPower(operator) {
        switch (operator) {
            case '¬': return [null, 4]; // Right associative
            case '∧': return [3, 3.1];
            case '∨': return [2, 2.1];
            case '→': return [1.1, 1];
            case '↔': return [0, 0.1];
            default: return [0, 0];
        }
    }
    cur_index = -1;
    previous_token = null;

    function getNextToken() {
        if (cur_index + 1 >= formula.length) return false;
        return formula[cur_index + 1];
    }

    function parseFormula(min_binding_power = -100) { // The resurive algorithm doing the work
        cur_index += 1;
        let left = formula[cur_index];
        if (/^[A-Za-z]+$/.test(left)) {   // If the token is an atom
            left = new TreeNode(left);
        } else if (left === '(') {
            left = parseFormula(-100);
        } else if (left === '¬') {
            operator = left;
            left = parseFormula(getBindingPower(operator)[1])
            let node = new TreeNode(operator);
            node.left = left;
            left = node;
        }else{ console.log(`Non primary LHS ${left} in formula!`); 
            isWellFormed = false;
            return null;}

        while (true){
            let operator = getNextToken();
            if (operator === false || operator === ')')   // Index out of range or closing parenthesis
                break;
            else if (! ['∧','∨','→','↔'].includes(operator))  
                { console.log(`Non middle token ${operator} in formula!`); 
                isWellFormed = false;
                return null;}
            left_binding_power = getBindingPower(operator)[0];
            right_binding_power = getBindingPower(operator)[1];
            if (left_binding_power < min_binding_power)
                break;
            cur_index += 1; // Move on to operator
            operator = formula[cur_index];
            right = parseFormula(right_binding_power);
            let node = new TreeNode(operator);
            node.left = left;
            node.right = right;
            left = node;
        }
        if (min_binding_power === -100 && getNextToken() === ')') { //  ending parseFormula() called by parenthesis
            cur_index += 1; // Move past ')'
        }
        return left;
    }
    let syntaxTree = parseFormula();
    if (isWellFormed === false) return false;
    return syntaxTree;
}

// Convert syntax tree back to a formal string with outermost parentheses
function syntaxTreeToFormalString(node) {
    if (node === null) return "";
    if (node.left === null && node.right === null) {
        return node.value;   // Leaf node (atom)
    }
    let leftStr = syntaxTreeToFormalString(node.left);
    let rightStr = syntaxTreeToFormalString(node.right);
    if (node.value === '¬') {
        return `¬${leftStr}`;
    } else {
        return `(${leftStr}${node.value}${rightStr})`;   // Add parentheses around binary operators
    }   
}
// Remove outermost parentheses from the formal string
function syntaxTreeToString(node) {
    if (node === null) return "";
    let result = syntaxTreeToFormalString(node);
    if (result[0] !== '(' || result[result.length - 1] !== ')') {
        return result; // No outermost parentheses to remove
    }
    return result.slice(1, -1); 
}
/* Test parsing example */
let formula = "¬(P ∧ Q ∨ ¬S ) ↔ ¬T → U";
let syntaxTree = parse(formula);
if (syntaxTree != false)
    printTree(syntaxTree);
console.log(syntaxTreeToString(syntaxTree));  // Should return the original formula (with extra parentheses)

/*  Reasons */

const REASONS = [null, "MP", "MT", "HS", "DS", "CD", "Abs", "Simp", "Conj", "Add",
    "DM", "Com", "Assoc", "Dist", "DN", "Trans", "Impl", "Equiv", "Exp", "Taut"
];

function checkProofLine(text){
    // Trim whitespace from the formula
    text = text.trim()
    text = text.replace(/\s+/g, ' '); // Replace multiple spaces with single space
    let parts = text.split(" "); // Split proof line by space
    if (parts.length < 2){
        alert("Each proof line must contain a reason and at least one line number!");
        return false;
    }
    let reason = parts[0]; // First part is the reason
    parts.shift(); // Remove the reason from parts
    if (!REASONS.includes(reason)){
        alert(`The reason "${reason}" is not recognized!`);
        return false;
    }  
    // Store the line number arguments
    let arguments = [];
    // For "Add", the second argument can be an atom (e.g., "Add 3 Q")
    if (reason === "Add" ){
        arguments = [parseInt(parts[0])]; // First argument is line number
        arguments.push(parts[1] === undefined ? 'Q' : parts[1]); // Second argument is atom, default to 'Q'
        if (isNaN(arguments[0]) || arguments[0] < 1 || arguments[0] > syntaxTrees.length){
            alert(`The line number "${parts[0]}" is not valid!`);
            return null;
        }
    }else if ( reason === "Simp"){
        arguments = [parseInt(parts[0])]; // First argument is line number
        arguments.push(parts[1] === undefined ? 'L' : parts[1]); // Second argument is L/R, default to 'L'
        if (isNaN(arguments[0]) || arguments[0] < 1 || arguments[0] > syntaxTrees.length){
            alert(`The line number "${parts[0]}" is not valid!`);
            return null;
        }
        if (arguments[1] !== 'L' && arguments[1] !== 'R'){
            alert(`The second argument "${arguments[1]}" is not valid! It must be "L" or "R".`);
            return null;
        }
    }else if (reason == "DM"){  // DeMorgan's Law
        arguments = [parseInt(parts[0])]; // First argument is line number
        arguments.push(parts[1]); // Second argument is AF/AB/OF/OB or undefined
        arguments.push(parts[2] === undefined ? 1 : parts[2]);  // nth
        if (isNaN(arguments[0]) || arguments[0] < 1 || arguments[0] > syntaxTrees.length){
            alert(`The line number "${parts[0]}" is not valid!`);
            return null;
        }
        if (!['AF','AB','OF','OB'].includes(parts[1]) && parts[1] !== undefined){
            alert(`The second argument "${parts[1]}" is not valid! It must be "AF"/"AB"/"OF"/"OB".`);
            return null;
        }
    }
    else{   // The Default for the rest of reasons
        arguments = parts.map(numStr => {
        let lineNum = parseInt(numStr); // Convert to integer
        if (isNaN(lineNum) || lineNum < 1 || lineNum > syntaxTrees.length){
            alert(`The line number "${numStr}" is not valid!`);
            return null;
        }
        return lineNum;
    });
    }
    // console.log("Arguments:", arguments);

    // Apply the rule corresponding to the reason
    let result = null;
    switch (reason) { 
        case "MP":
            result = MP(...arguments);
            break;
        case "MT":
            result = MT(...arguments);
            break;
        case "HS":
            result = HS(...arguments);
            break;
        case "DS":
            result = DS(...arguments);
            break;
        case "CD":
            result = CD(...arguments);
            break;
        case "Abs":
            result = Abs(...arguments);
            break;
        case "Simp":
            result = Simp(...arguments);
            break;
        case "Conj":
            result = Conj(...arguments);
            break;
        case "Add":
            result = Add(...arguments);
            break;
        case "DM":
            result = DM(...arguments);
            break;
        case "Com":
            result = Com(...arguments);
            break;
        case "Assoc":
            result = Assoc(...arguments);
            break;
        case "Dist":
            result = Dist(...arguments);
            break;
        case "DN":
            result = DN(...arguments);
            break;
        case "Trans":
            result = Trans(...arguments);
            break;
        case "Impl":
            result = Impl(...arguments);
            break;
        case "Equiv":
            result = Equiv(...arguments);
            break;
        case "Exp":
            result = Exp(...arguments);
            break;
        case "Taut":
            result = Taut(...arguments);
            break;
        // Add other rules here...
        default:
            alert(`The reason "${reason}" is not yet implemented!`);
            return false;
    }
    if (result===-1) return false; // Error in arguments, skip alert
    console.log("RESULT:", result);
    if (!result){
        alert(`${reason} could not be applied with the given lines!`);
        return false;
        }
    // let formulaStr = syntaxTreeToString(syntaxTree);
    return result;
}

/* INFERENCE RULES IMPLEMENTATION */

// Rule 1: Modus Ponens:
// P → Q  (Premise1's form)
// P      (Premise2's form)
// Therefore, Q
// premise1 and premise2 are syntax trees; Line1 and Line2 are line numbers (1-based)
// Return the conclusion formula string if successful, otherwise return false
function MP(line1, line2){
    if (arguments.length < 2){
        alert("MP Error: Not enough arguments!");
        return -1;
    }
    let premise1 = syntaxTrees[line1 - 1];
    let premise2 = syntaxTrees[line2 - 1];
    let operator = premise1.value;
    if (operator !== '→'){
        console.log(`MP Error: Premise 1 is not an implication!`);
        return false;
    }
    let str1_left = syntaxTreeToString(premise1.left);
    let str2 = syntaxTreeToString(premise2);
    if (str1_left !== str2){
        console.log(`MP Error: Premise 2 does not match the antecedent of Premise 1!`);
        return false;
    }
    return syntaxTreeToString(premise1.right); // Return the consequent as the conclusion
}

// Rule 2: Modus Tollens:
// P → Q  (Premise1's form)
// ¬Q      (Premise2's form)
// Therefore, ¬P
function MT(line1, line2){
    if (arguments.length < 2){
        alert("MT Error: Not enough arguments!");
        return -1;
    }
    let premise1 = syntaxTrees[line1 - 1];
    let premise2 = syntaxTrees[line2 - 1];
    let operator1 = premise1.value;
    if (operator1 !== '→'){
        console.log(`MT Error: Premise 1 is not an implication!`);
        return false;
    }
    let operator2 = premise2.value;
    if (operator2 !== '¬'){
        console.log(`MT Error: Premise 2 is not a negation!`);
        return false;
    }
    let str1_right = syntaxTreeToString(premise1.right);  // Q
    let str2_left = syntaxTreeToString(premise2.left); // ¬Q
    if (str1_right !== str2_left){
        console.log(`MT Error: Premise 2 does not match the consequent of Premise 1!`);
        return false;
    }
    let resultNode = newSyntaxTree('¬', premise1.left); // ¬P
    return syntaxTreeToString(resultNode); // Return the consequent as the conclusion
}

// Rule 3: Hypothetical Syllogism:
// 1. P → Q
// 2. Q → R
// ∴ P → R
function HS(line1, line2){
    if (arguments.length < 2){
        alert("HS Error: Not enough arguments!");
        return -1;
    }
    let premise1 = syntaxTrees[line1 - 1];
    let premise2 = syntaxTrees[line2 - 1];
    let operator1 = premise1.value;
    if (operator1 !== '→'){
        console.log(`HS Error: Premise 1 is not an implication!`);
        return false;
    }
    let operator2 = premise2.value;
    if (operator2 !== '→'){
        console.log(`HS Error: Premise 2 is not a negation!`);
        return false;
    }
    let str1_right = syntaxTreeToString(premise1.right);  // Q
    let str2_left = syntaxTreeToString(premise2.left); // Q
    if (str1_right !== str2_left){
        console.log(`HS Error: Antecedent of premise 2 does not match the consequent of Premise 1!`);
        return false;
    }
    let resultNode = newSyntaxTree('→', premise1.left, premise2.right); // P → R
    return syntaxTreeToString(resultNode);    // Return the implication as the conclusion
}

// Rule 4: Disjunctive Syllogism:
// P ∨ Q  (Premise1's form)
// ¬P      (Premise2's form)
// ∴ Q
function DS(line1, line2){
    if (arguments.length < 2){
        alert("DS Error: Not enough arguments!");
        return -1;
    }
    let premise1 = syntaxTrees[line1 - 1];
    let premise2 = syntaxTrees[line2 - 1];
    let operator1 = premise1.value;
    if (operator1 !== '∨'){
        console.log(`DS Error: Premise 1 is not a disjunction!`);
        return false;
    }
    let operator2 = premise2.value;
    if (operator2 !== '¬'){
        console.log(`DS Error: Premise 2 is not a negation!`);
        return false;
    }
    let str1_left = syntaxTreeToString(premise1.left);  // P
    let str2_left = syntaxTreeToString(premise2.left); // ¬P
    if (str1_left !== str2_left){
        console.log(`DS Error: Premise 2 does not match the left of Premise 1!`);
        return false;
    }
    console.log(syntaxTreeToString(premise1.right));
    return syntaxTreeToString(premise1.right); // Return premise1 right as the conclusion
}

// Rule 5: Conjunction Discharge:
// 1. (P → Q) ∧ (R → S)
// 2. P ∨ R
// ∴ Q ∨ S
function CD(line1, line2){
    if (arguments.length < 2){
        alert("CD Error: Not enough arguments!");
        return -1;
    }
    let premise1 = syntaxTrees[line1 - 1];
    let premise2 = syntaxTrees[line2 - 1];
    let operator1 = premise1.value;
    if (operator1 !== '∧'){
        console.log(`CD Error: Premise 1 is not a conjunction!`);
        return false;
    }
    if (premise1.left.value !== '→' || premise1.right.value !== '→'){
        console.log(`CD Error: Premise 1 is not in the form (P → Q) ∧ (R → S)!`);
        return false;
    }
    let operator2 = premise2.value;
    if (operator2 !== '∨'){
        console.log(`CD Error: Premise 2 is not a disjunction!`);
        return false;
    }
    let str1_left = syntaxTreeToString(premise1.left.left);  // P
    let str1_right = syntaxTreeToString(premise1.right.left);  // R
    let str2_left = syntaxTreeToString(premise2.left); // P
    let str2_right = syntaxTreeToString(premise2.right); // R
    if (str1_left !== str2_left || str1_right !== str2_right){
        console.log(`CD Error: Premise 2 does not match the components of Premise 1!`);
        return false;
    }
    let resultNode = newSyntaxTree('∨', premise1.left.right, premise1.right.right); // Q ∨ S
    return syntaxTreeToString(resultNode); // Return the consequent as the conclusion
}

// Rule 6: Absorption:
// P → Q
// ∴ P → (P ∧ Q)
function Abs(line1){
    if (arguments.length < 1){
        alert("Abs Error: Not enough arguments!");
        return -1;
    }
    let premise1 = syntaxTrees[line1 - 1];
    let operator = premise1.value;
    if (operator !== '→'){
        console.log(`Abs Error: Premise 1 is not an implication!`);
        return false;
    }
    let newRight = newSyntaxTree('∧', premise1.left, premise1.right); // P ∧ Q
    let resultNode = newSyntaxTree('→', premise1.left, newRight); // P → (P ∧ Q)
    return syntaxTreeToString(resultNode); // Return the consequent as the conclusion
}

// Rule 7: Simplification:
// P ∧ Q
// ∴ P
function Simp(line1, side='L'){
    if (arguments.length < 1){
        alert("Simp Error: Not enough arguments!");
        return -1;
    }
    let premise1 = syntaxTrees[line1 - 1];
    let operator = premise1.value;
    if (operator !== '∧'){
        console.log(`Simp Error: Premise 1 is not an implication!`);
        return false;
    }
    if (side === 'L'){
        return syntaxTreeToString(premise1.left); // Return the left as the conclusion
    }else if (side === 'R'){
        return syntaxTreeToString(premise1.right); // Return the right as the conclusion
    }
}

// Rule 8: Conjunction:
// 1. P
// 2. Q
// ∴ P ∧ Q
function Conj(line1, line2){
    if (arguments.length < 2){
        alert("HS Error: Not enough arguments!");
        return -1;
    }
    let premise1 = syntaxTrees[line1 - 1];
    let premise2 = syntaxTrees[line2 - 1];
    let resultNode = newSyntaxTree('∧', premise1, premise2); // P ∧ Q
    return syntaxTreeToString(resultNode); // Return the conjunction as the conclusion
}

// Rule 9: Addition:
// P
// ∴ P ∨ Q
function Add(line1, atomQ='Q'){
    console.log("Add called with", line1, atomQ);
    if (arguments.length < 1){
        alert("Add Error: Not enough arguments!");
        return -1;
    }
    let premise1 = syntaxTrees[line1 - 1];
    // Check if atomQ is a valid atom (single uppercase letter)
    if (!/^[A-Za-z]+$/.test(atomQ) || atomQ.length > 1){
        alert(`Add Error: The second argument "${atomQ}" is not a valid atom!`);
        return -1;
    }
    let newRight = newSyntaxTree(atomQ); // Placeholder for Q
    let resultNode = newSyntaxTree('∨', premise1, newRight); // P ∨ Q
    return syntaxTreeToString(resultNode); // Return the disjunction as the conclusion
}

/* RULES OF REPLACEMENT IMPLMENTATION */

// Search for the n-th node matching targetValue in the syntax tree
function searchSyntaxTree(node, targetValue, nth=1) { // ith is current count
    let ith = 1; // Initialize current count
    function preOrderSearch(node) {  // Recursive pre-order search helper function
        if (node === null) return false;
        // console.log(`Visiting node: ${node.value}, ith=${ith}`);
        if (node.value === targetValue){   // Find a match
            if (ith === nth){
                return node;
            } else {
                ith += 1;   // Increment current count
            }
        }
        let leftResult = preOrderSearch(node.left);
        if (leftResult) return leftResult;
        let rightResult = preOrderSearch(node.right);
        if (rightResult) return rightResult;
        return false;  // Not found
    }
    return preOrderSearch(node);
}
// Search for the n-th subtree matching targetValues in the syntax tree
function searchSubTree(node, targetValueList, nth=1) { // ith is current count
    let ith = 1; // Initialize current count
    function preOrderSearch(node) {  // Recursive pre-order search helper function
        if (node === null) return false;
        //console.log(`Visiting node: ${node.value}, ith=${ith}`);
        //console.log("INFO:", node.left, node.right, targetValueList.length)
        if (targetValueList.length ===1 && node.value === targetValueList[0] ||
            targetValueList.length ===2 && node.value === targetValueList[0] && node.left.value === targetValueList[1] ||
            targetValueList.length ===3 && node.value === targetValueList[0] && node.left.value === targetValueList[1] && node.right.value === targetValueList[2]
        ){   // Find a match
            if (ith === nth){
                return node;
            } else {
                ith += 1;   // Increment current count
            }
        }
        let leftResult = preOrderSearch(node.left);
        if (leftResult) return leftResult;
        let rightResult = preOrderSearch(node.right);
        if (rightResult) return rightResult;
        return false;  // Not found
    }
    return preOrderSearch(node);
}

/* Test  
let formula1 = "¬(¬P ∧ ¬Q ∧ ¬(A ∧ ¬B) ) ↔ ¬T → U"
formula1 = "¬(A ∧ B)"
console.log("Testing searchSyntaxTree:");
let tree1 = parse(formula1);
printTree(tree1);
let searchResult = searchSubTree(tree1, ['¬', '∧'], 1);
console.log("Search result:", searchResult); // Should return "¬S"
*/


// Rule 10: De Morgan's Laws:
// ¬(P ∧ Q) ≡ ¬P ∨ ¬Q
// ¬(P ∨ Q) ≡ ¬P ∧ ¬Q

function DMAF(line1, nth=1){   // And Forward
    if (arguments.length < 1){
        alert("Simp Error: Not enough arguments!");
        return -1;
    }
    let premise1 = syntaxTrees[line1 - 1];
    let matchingNode = searchSubTree(premise1, ['¬', '∧'], nth);
    if (!matchingNode){
        console.log(`DM Error: No matching ¬(P ∧ Q) found!`);
        return false;
    }
    let P = matchingNode.left.left; 
    let Q = matchingNode.left.right;
    let notP = newSyntaxTree('¬', P);
    let notQ = newSyntaxTree('¬', Q);
    let resultNode = newSyntaxTree('∨', notP, notQ);
    return syntaxTreeToString(resultNode); // Return the disjunction as the conclusion
}

function DM(line1, mode, nth=1){
    if (arguments.length < 1){
        alert("Simp Error: Not enough arguments!");
        return -1;
    }
    let premise1 = syntaxTrees[line1 - 1];
    printTree(premise1);
    
    let matchingNode = null;
    if (mode === undefined){   // Auto-detect mode
        if (searchSubTree(premise1, ['¬', '∧'], nth)) mode = 'AF';
        else if (searchSubTree(premise1, ['∨', '¬', '¬'], nth)) mode = 'AB'
        else if (searchSubTree(premise1, ['¬', '∨'], nth)) mode = 'OF';
        else if (searchSubTree(premise1, ['∧', '¬', '¬'], nth)) mode = 'OB';
    }
    if (mode === 'AF'){ // Forward And
        matchingNode = searchSubTree(premise1, ['¬', '∧'], nth);   // Shorten the name for convenience
        if (matchingNode){
            let P = matchingNode.left.left; 
            let Q = matchingNode.left.right;
            let notP = newSyntaxTree('¬', P);
            let notQ = newSyntaxTree('¬', Q);
            let resultNode = newSyntaxTree('∨', notP, notQ);
            return syntaxTreeToString(resultNode); // Return the disjunction as the conclusion
        }
    }else if (mode === 'AB'){ // Backward And
        matchingNode = searchSubTree(premise1, ['∨', '¬', '¬'], nth);
        if (matchingNode){
            let P = matchingNode.left.left; 
            let Q = matchingNode.right.left;
            let PAndQ = newSyntaxTree('∧', P, Q);
            let resultNode = newSyntaxTree('¬', PAndQ);
            return syntaxTreeToString(resultNode); // Return the not conjunction as the conclusion
        }
    }else if (mode === 'OF'){ // Forward Or
        matchingNode =  searchSubTree(premise1, ['¬', '∨'], nth);
        if (matchingNode){
            let P = matchingNode.left.left; 
            let Q = matchingNode.left.right;
            let notP = newSyntaxTree('¬', P);
            let notQ = newSyntaxTree('¬', Q);
            let resultNode = newSyntaxTree('∧', notP, notQ);
            return syntaxTreeToString(resultNode); // Return the conjunction as the conclusion
        }
    }else if (mode === 'OB'){ // Backward Or
        matchingNode = searchSubTree(premise1, ['∧', '¬', '¬'], nth);
        if (matchingNode){
            let P = matchingNode.left.left; 
            let Q = matchingNode.right.left;
            let PAndQ = newSyntaxTree('∨', P, Q);
            let resultNode = newSyntaxTree('¬', PAndQ);
            return syntaxTreeToString(resultNode); // Return the not disjunction as the conclusion
        }
    }
    if (!matchingNode){
        console.log(`DM Error: No matching ¬(P ∧ Q) or ¬P ∨ ¬Q or ¬(P ∨ Q) or ¬P ∧ ¬Q found!`);
        return false;
    }
    
}