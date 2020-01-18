var budgetController = (function () {
    
    
    //Store the incoming data
    class Expenses {
        
        constructor (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
        }
        
        calcPercentage (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
        }
    };
    
    class Incomes {
        
        constructor (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        }
    };
    
    var calcTotal = function (type) {
        let sum = 0;
        
        data.allItems[type].forEach(current => sum += current.value);
        
        data.totals[type] = sum;
    };
    
    //Keep track of data in one big data structure
    const data = {
        
        //Keep track of expenses and incomes
        allItems: {
            exp: [],
            inc: []
        },
        
        
        //Total of expenses and incomes
        totals: {
            exp: 0,
            inc: 0
        },
        
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function (type, des, val) {
            let currentItem, ID;
            
            
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            if (type === 'inc') {
                currentItem = new Incomes(ID, des, val);
            } else if (type === 'exp') {
                currentItem = new Expenses(ID, des, val);
            }
            
            data.allItems[type].push(currentItem);
            
            return currentItem;
            
        },
        
        deleteItem: function (type, id) {
            let ids, index;
            
            ids = data.allItems[type].map(current => current.id);
            
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calcBudget: function () {
            //1. calculate total incomes and expenses
            calcTotal('inc');
            calcTotal('exp');
            
            //2. calculate the budget (incomes - expenses)
            data.budget = data.totals.inc - data.totals.exp;
            
            //3. calculate the precentage
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        
        calculatePercentage: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },
        
        
        getPercentage: function () {
            let allPercentages;
            
            allPercentages = data.allItems.exp.map(cur => cur.percentage);
            
            return allPercentages;
        },
        
        getBudget: function () {
            return {
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                budget: data.budget,
                percentage: data.percentage
            };
        },
    };
    
})();


var UIController = (function() {
    const domStrings = {
        typeSelector: '.add__type',
        descriptionSelector: '.add__description',
        valueSelector: '.add__value',
        btnSelector: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLable: '.budget__value',
        incomeLable: '.budget__income--value',
        expenseLable: '.budget__expenses--value',
        percentageLable: '.budget__expenses--percentage',
        container: '.container',
        expPercLabel: '.item__percentage',
        dateLable: '.budget__title--month'
    };
    
    
    const formatingNumber = function(num, type) {
        let splitNum, int, dec;
        //exactly 2 dec nums
        //the comma
        //sign
        
        num = Math.abs(num);
        num = num.toFixed(2);
        splitNum = num.split('.');
        int = splitNum[0];
        dec = splitNum[1];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        
        return (type === 'inc' ? '+ ' : '- ') + int + '.' + dec;
    };
    
    
    var nodeListForEach = function(list, callback) {
              var i;
              for (i = 0; i < list.length; i++) {
                        callback(list[i], i);
                    }
    };
    
    return {
        getInput: function() {
            return {
                btn: document.querySelector(domStrings.typeSelector).value,
                description: document.querySelector(domStrings.descriptionSelector).value,
                val: parseFloat(document.querySelector(domStrings.valueSelector).value)
            };
        },
        
        domSelectors: function() {
            return domStrings;
        },
        
        addListItem: function(obj, type) {
            let html, newHtml, element;
            //create html string with placeholder text
            if (type === 'inc') {
                element = domStrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = domStrings.expenseContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            }
            
            //replace placeholder text with some data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatingNumber(obj.value, type));
            
            //insert items
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorID) {
            let el;
            
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        clearInputField: function() {
            document.querySelector(domStrings.descriptionSelector).value = '';
            document.querySelector(domStrings.valueSelector).value = '';
            
            document.querySelector(domStrings.descriptionSelector).focus();

        },
        
        
        changeStyle: function() {
           let fields;
            
           fields = document.querySelectorAll(domStrings.typeSelector + ',' + domStrings.descriptionSelector + ',' + domStrings.valueSelector);
            
           nodeListForEach(fields, function(current) {
               current.classList.toggle('red-focus');
           });
            
           document.querySelector(domStrings.btnSelector).classList.toggle('red');
        },
        
        displayBudget: function(obj) {
            
            
            const type = obj.budget > 0 ? 'inc' : 'exp';
            
            document.querySelector(domStrings.budgetLable).textContent = formatingNumber(obj.budget, type);
            document.querySelector(domStrings.incomeLable).textContent = formatingNumber(obj.totalInc, 'inc');
            document.querySelector(domStrings.expenseLable).textContent = formatingNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(domStrings.percentageLable).textContent = obj.percentage + '%';
            } else {
                document.querySelector(domStrings.percentageLable).textContent = '---';
            }
        },
        
        displayPercentage: function(percentage) {
            let fields;
            
            fields = document.querySelectorAll(domStrings.expPercLabel);
            
            nodeListForEach(fields, function (current, index) {
                
                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },
        
        displayDate: function () {
            let now, months, month, year;
            
            now = new Date();
            
            months =['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            month = now.getMonth();
            year = now.getFullYear();
            
            document.querySelector(domStrings.dateLable).textContent = months[month] + ' ' + year;
            
        }
    };
})();


var controller = (function (budgetCtrl, UICtrl) {
    
        const setupEventListner = function () {
            const dom = UICtrl.domSelectors();
            document.querySelector(dom.btnSelector).addEventListener('click', ctrlAddItem);
            document.addEventListener('keypress', function(event) {

                if(event.keyCode === 13 || event.which === 13) {
                    ctrlAddItem();
                }
            });
            
            document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);
            
            document.querySelector(dom.typeSelector).addEventListener('change', UICtrl.changeStyle);
        }
        
        const updateBudget = function() {
            
            //1 - Calculate the budget
            budgetCtrl.calcBudget();
            
            //2 - return the budget
            const budget = budgetCtrl.getBudget();
            
            //3 - Display the budget in UI 
            UICtrl.displayBudget(budget)
            
        };
    
    
        const updatePercentage = function() {
            
            //1 - Calculate the percentage
            budgetCtrl.calculatePercentage();
            
            //2 - return the percentage
            const percentage = budgetCtrl.getPercentage();
            
            //3 - Display the percentage in UI 
            UICtrl.displayPercentage(percentage);
        };

        const ctrlAddItem = function() {
            
            //1 - Get the field input data
            const inputGetter = UICtrl.getInput();

            if(inputGetter.description && !isNaN(inputGetter.val) && inputGetter.val > 0) {

                //2 - Add to the budget controller
                const getItem = budgetCtrl.addItem(inputGetter.btn, inputGetter.description, inputGetter.val);
                
                //3 - Add to the UI controller
                UICtrl.addListItem(getItem, inputGetter.btn);

                //4 - clear input field
                UICtrl.clearInputField();
                
                //5 - Update the budget
                updateBudget();
                
                //6 - calc and update the percentage
                updatePercentage();

            }
        };
        
        const ctrlDeleteItem = function(event) {
            let itemID, splitID, type, ID;
            
            itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
            
            if (itemID) {
                splitID = itemID.split('-');
                type = splitID[0];
                ID = parseInt(splitID[1]);
                
                //Delete the item from the data structure
                budgetCtrl.deleteItem(type, ID);
                
                //Delete the item from the UI
                UICtrl.deleteListItem(itemID);
                
                //update the budget
                updateBudget();
                
                //calc and update the percentage
                updatePercentage();
            }
            
        };
    
        return {
            init: function () {
                console.log('init the game');
                setupEventListner();
                UICtrl.displayDate();
                UICtrl.displayBudget({
                    totalInc: 0,
                    totalExp: 0,
                    budget: 0,
                    percentage: -1
            })
            }
            
        }
})(budgetController, UIController);


controller.init();