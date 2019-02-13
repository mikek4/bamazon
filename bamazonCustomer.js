var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "yourRootPassword",
  database: "bamazon_DB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});

function start() {
  inquirer
    .prompt({
      name: "viewOrno",
      type: "list",
      message: "Would you like to view available items?",
      choices: ["Yes", "No"]
    })
    .then(function(answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.viewOrno === "Yes") {
        viewAuctions();
      } else {
        connection.end();
      }
    });
}


function viewAuctions() {

    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;
        
        inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].product_name);
            }
            return choiceArray;
          },
          message: "Which item would you like to buy?"
          },
        {
          name: "quantity",
          type: "input",
          message: "How many would you like to buy?"
        }
      ])
      .then(function(answer) {
        
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name === answer.choice) {
            chosenItem = results[i];
          }
        }

        if (chosenItem.stock_quantity > answer.quantity) {
          var newQuantity = chosenItem.stock_quantity - answer.quantity;
         
            connection.query(
              "UPDATE products SET ? WHERE ?",
              [
                {
                  stock_quantity: newQuantity
                },
                {
                  item_id: chosenItem.item_id
                }
              ],
              function(error,res) {
                if (error) throw err;
                console.log("Purchase Successful");
                console.log("Your purchase costs " + (chosenItem.price * answer.quantity));
                start();
              }
            );
          }
          else {
            
            console.log("Insufficient Quantity");
            start();
          }
   
   
    });


});
}